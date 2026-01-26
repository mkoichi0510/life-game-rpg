import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { seasonalTitlesQuerySchema } from '@/lib/validations/skill'
import {
  formatZodError,
  formatInternalError,
} from '@/lib/validations/helpers'
import { requireCategory, isCategoryFailure } from '@/lib/api/requireCategory'

/**
 * GET /api/skills/seasonal-titles
 * 週ランク称号一覧を取得
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

    // カテゴリ存在確認
    const categoryResult = await requireCategory(result.data.categoryId)
    if (isCategoryFailure(categoryResult)) {
      return categoryResult.response
    }

    const titles = await prisma.seasonalTitle.findMany({
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

    return NextResponse.json({ titles })
  } catch (error) {
    console.error('Failed to fetch seasonal titles:', error)
    return formatInternalError('週ランク称号の取得に失敗しました')
  }
}
