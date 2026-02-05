import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { seasonalTitlesQuerySchema } from '@/lib/validations/skill'
import {
  formatZodError,
  formatInternalError,
} from '@/lib/validations/helpers'
import { getRecentDayKeys } from '@/lib/date'
import { requireCategory, isCategoryFailure } from '@/lib/api/requireCategory'
import { requireUser, isUserFailure } from '@/lib/api/requireUser'

/**
 * GET /api/skills/seasonal-titles/current
 * 現在の週ランク称号を取得
 * クエリパラメータ:
 *   - categoryId: カテゴリID（必須）
 */
export async function GET(request: NextRequest) {
  try {
    const userResult = await requireUser()
    if (isUserFailure(userResult)) {
      return userResult.response
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId') ?? ''

    const result = seasonalTitlesQuerySchema.safeParse({ categoryId })
    if (!result.success) {
      return formatZodError(result.error)
    }

    // カテゴリ存在確認（rankWindowDaysも取得）
    const categoryResult = await requireCategory(
      userResult.userId,
      result.data.categoryId,
      {
      id: true,
      rankWindowDays: true,
      }
    )
    if (isCategoryFailure(categoryResult)) {
      return categoryResult.response
    }
    const category = categoryResult.category

    // 直近N日のdayKeyを取得
    const recentDayKeys = getRecentDayKeys(category.rankWindowDays)

    // 直近N日のSP合計と称号一覧を並列で取得
    const [categoryResults, titles] = await Promise.all([
      prisma.dailyCategoryResult.findMany({
        where: {
          userId: userResult.userId,
          categoryId: result.data.categoryId,
          dayKey: { in: recentDayKeys },
        },
        select: { spEarned: true },
      }),
      // 称号一覧を取得（minSpEarned降順で、最も高い称号から確認）
      prisma.seasonalTitle.findMany({
        where: { userId: userResult.userId, categoryId: result.data.categoryId },
        orderBy: [{ minSpEarned: 'desc' }, { order: 'desc' }],
      }),
    ])

    const totalSpEarned = categoryResults.reduce(
      (sum, r) => sum + r.spEarned,
      0
    )

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
            createdAt: currentTitle.createdAt,
            updatedAt: currentTitle.updatedAt,
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
