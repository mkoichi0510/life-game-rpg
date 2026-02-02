import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatInternalError } from '@/lib/validations/helpers'
import {
  formatDayKey,
  getNextDayKey,
  getRecentDayKeys,
  parseDayKey,
} from '@/lib/date'

type CategorySummary = {
  id: string
  name: string
  order: number
  rankWindowDays: number
}

type SeasonalTitleSummary = {
  categoryId: string
  label: string
  minSpEarned: number
}

function findTitleLabel(
  totalSpEarned: number,
  titles: SeasonalTitleSummary[]
): string | null {
  const title = titles.find((t) => totalSpEarned >= t.minSpEarned)
  return title?.label ?? null
}

/**
 * GET /api/highlights
 * 成果ハイライトを取得
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { visible: true },
      select: {
        id: true,
        name: true,
        order: true,
        rankWindowDays: true,
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    })

    const categoryIds = categories.map((category) => category.id)

    const weekDayKeys = getRecentDayKeys(7)
    const weekStartKey = weekDayKeys[weekDayKeys.length - 1]
    const weekEndKey = getNextDayKey(weekDayKeys[0])
    const weekStart = parseDayKey(weekStartKey)
    const weekEndExclusive = parseDayKey(weekEndKey)

    const [weekResults, unlockedNodesRaw] = await Promise.all([
      categoryIds.length === 0
        ? []
        : prisma.dailyCategoryResult.findMany({
            where: {
              dayKey: { in: weekDayKeys },
              categoryId: { in: categoryIds },
            },
            select: { xpEarned: true, spEarned: true },
          }),
      prisma.unlockedNode.findMany({
        where: {
          unlockedAt: { gte: weekStart, lt: weekEndExclusive },
          node: { tree: { category: { visible: true } } },
        },
        orderBy: { unlockedAt: 'desc' },
        select: {
          unlockedAt: true,
          node: {
            select: {
              id: true,
              title: true,
              tree: {
                select: {
                  category: {
                    select: {
                      id: true,
                      name: true,
                      visible: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ])

    const weekSummary = {
      totalSp: weekResults.reduce((sum, r) => sum + r.spEarned, 0),
      totalXp: weekResults.reduce((sum, r) => sum + r.xpEarned, 0),
    }

    const maxRankWindowDays = categories.reduce(
      (max, category) => Math.max(max, category.rankWindowDays),
      0
    )
    const rankWindowDayKeys =
      maxRankWindowDays > 0 ? getRecentDayKeys(maxRankWindowDays * 2) : []

    const [rankResults, seasonalTitles] = await Promise.all([
      categoryIds.length === 0 || rankWindowDayKeys.length === 0
        ? []
        : prisma.dailyCategoryResult.findMany({
            where: {
              dayKey: { in: rankWindowDayKeys },
              categoryId: { in: categoryIds },
            },
            select: { categoryId: true, dayKey: true, spEarned: true },
          }),
      categoryIds.length === 0
        ? []
        : prisma.seasonalTitle.findMany({
            where: { categoryId: { in: categoryIds } },
            orderBy: [
              { categoryId: 'asc' },
              { minSpEarned: 'desc' },
              { order: 'desc' },
              { id: 'asc' },
            ],
            select: {
              categoryId: true,
              label: true,
              minSpEarned: true,
            },
          }),
    ])

    const titlesByCategory = new Map<string, SeasonalTitleSummary[]>()
    for (const title of seasonalTitles) {
      const list = titlesByCategory.get(title.categoryId) ?? []
      list.push(title)
      titlesByCategory.set(title.categoryId, list)
    }

    const spByCategoryDayKey = new Map<string, Map<string, number>>()
    for (const result of rankResults) {
      const byDayKey = spByCategoryDayKey.get(result.categoryId) ?? new Map()
      byDayKey.set(
        result.dayKey,
        (byDayKey.get(result.dayKey) ?? 0) + result.spEarned
      )
      spByCategoryDayKey.set(result.categoryId, byDayKey)
    }

    const rankUps = categories.reduce<
      {
        categoryId: string
        categoryName: string
        fromRank: string | null
        toRank: string | null
      }[]
    >((acc, category) => {
      const rankWindowDays = category.rankWindowDays
      if (rankWindowDays <= 0 || rankWindowDayKeys.length === 0) {
        return acc
      }

      const currentKeys = rankWindowDayKeys.slice(0, rankWindowDays)
      const previousKeys = rankWindowDayKeys.slice(
        rankWindowDays,
        rankWindowDays * 2
      )

      const spByDayKey = spByCategoryDayKey.get(category.id)
      const sumSp = (keys: string[]) =>
        keys.reduce((sum, key) => sum + (spByDayKey?.get(key) ?? 0), 0)

      const currentTotal = sumSp(currentKeys)
      const previousTotal = sumSp(previousKeys)
      const titles = titlesByCategory.get(category.id) ?? []

      const fromRank = findTitleLabel(previousTotal, titles)
      const toRank = findTitleLabel(currentTotal, titles)

      if (fromRank !== toRank) {
        acc.push({
          categoryId: category.id,
          categoryName: category.name,
          fromRank,
          toRank,
        })
      }

      return acc
    }, [])

    const unlockedNodes = unlockedNodesRaw
      .filter((node) => node.node.tree.category.visible)
      .map((node) => ({
        id: node.node.id,
        name: node.node.title,
        unlockedAt: formatDayKey(node.unlockedAt),
        categoryName: node.node.tree.category.name,
      }))

    return NextResponse.json({
      unlockedNodes,
      rankUps,
      weekSummary,
    })
  } catch (error) {
    console.error('Failed to fetch highlights:', error)
    return formatInternalError('成果ハイライトの取得に失敗しました')
  }
}
