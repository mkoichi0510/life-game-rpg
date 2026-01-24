import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRecentDayKeys } from '@/lib/date'
import { seasonalTitlesQuerySchema } from '@/lib/validations/skill'
import {
  formatInternalError,
  formatNotFoundError,
  formatZodError,
} from '@/lib/validations/helpers'

/**
 * GET /api/skills/seasonal-titles/current
 * 現在の週ランク称号を取得
 * クエリパラメータ:
 *   - categoryId: 対象カテゴリID（必須）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = {
      categoryId: searchParams.get('categoryId') ?? '',
    }
    const result = seasonalTitlesQuerySchema.safeParse(query)

    if (!result.success) {
      return formatZodError(result.error)
    }

    const category = await prisma.category.findUnique({
      where: { id: result.data.categoryId },
      select: { id: true, rankWindowDays: true },
    })

    if (!category) {
      return formatNotFoundError('カテゴリ', result.data.categoryId)
    }

    const recentDayKeys = getRecentDayKeys(category.rankWindowDays)
    const recentSpAggregate = recentDayKeys.length
      ? await prisma.dailyCategoryResult.aggregate({
          where: {
            categoryId: result.data.categoryId,
            dayKey: { in: recentDayKeys },
          },
          _sum: { spEarned: true },
        })
      : { _sum: { spEarned: 0 } }

    const recentSp = recentSpAggregate._sum.spEarned ?? 0

    const seasonalTitles = await prisma.seasonalTitle.findMany({
      where: { categoryId: result.data.categoryId },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        categoryId: true,
        label: true,
        minSpEarned: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const currentTitle = seasonalTitles
      .filter((title) => title.minSpEarned <= recentSp)
      .sort((a, b) => b.order - a.order || b.minSpEarned - a.minSpEarned)[0]

    return NextResponse.json({
      currentTitle: currentTitle ?? null,
      recentSp,
      rankWindowDays: category.rankWindowDays,
    })
  } catch (error) {
    console.error('Failed to fetch current seasonal title:', error)
    return formatInternalError('現在の週ランク称号の取得に失敗しました')
  }
}
