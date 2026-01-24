import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { seasonalTitlesQuerySchema } from '@/lib/validations/seasonalTitle'
import {
  formatZodError,
  formatNotFoundError,
  formatInternalError,
} from '@/lib/validations/helpers'
import { getRecentDayKeys } from '@/lib/date'

/**
 * GET /api/skills/seasonal-titles/current
 * 現在の週ランク称号を取得
 * クエリパラメータ:
 *   - categoryId: カテゴリID（必須）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId') ?? ''

    const result = seasonalTitlesQuerySchema.safeParse({ categoryId })
    if (!result.success) {
      return formatZodError(result.error)
    }

    // カテゴリ存在確認（rankWindowDaysも取得）
    const category = await prisma.category.findUnique({
      where: { id: result.data.categoryId },
    })
    if (!category) {
      return formatNotFoundError('カテゴリ', result.data.categoryId)
    }

    // 直近N日のdayKeyを取得
    const recentDayKeys = getRecentDayKeys(category.rankWindowDays)

    // 直近N日のSP合計を計算
    const categoryResults = await prisma.dailyCategoryResult.findMany({
      where: {
        categoryId: result.data.categoryId,
        dayKey: { in: recentDayKeys },
      },
      select: {
        spEarned: true,
      },
    })

    const totalSpEarned = categoryResults.reduce(
      (sum, r) => sum + r.spEarned,
      0
    )

    // 称号一覧を取得（order降順で、minSpEarnedが高い順に確認）
    const titles = await prisma.seasonalTitle.findMany({
      where: { categoryId: result.data.categoryId },
      orderBy: [{ minSpEarned: 'desc' }, { order: 'desc' }],
    })

    // 現在のSP合計以下で最も高い称号を見つける
    const currentTitle =
      titles.find((t) => totalSpEarned >= t.minSpEarned) ?? null

    return NextResponse.json({
      currentTitle: currentTitle
        ? {
            id: currentTitle.id,
            categoryId: currentTitle.categoryId,
            label: currentTitle.label,
            minSpEarned: currentTitle.minSpEarned,
            order: currentTitle.order,
          }
        : null,
      totalSpEarned,
      rankWindowDays: category.rankWindowDays,
    })
  } catch (error) {
    console.error('Failed to fetch current seasonal title:', error)
    return formatInternalError('現在の週ランク称号の取得に失敗しました')
  }
}
