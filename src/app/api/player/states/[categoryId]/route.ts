import { NextRequest, NextResponse } from 'next/server'
import { categoryIdParamSchema } from '@/lib/validations/player'
import {
  formatInternalError,
  formatZodError,
} from '@/lib/validations/helpers'
import { requireCategory } from '@/lib/api/requireCategory'

/**
 * GET /api/player/states/:categoryId
 * カテゴリ別のプレイヤー状態を取得
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ categoryId?: string }> }
) {
  try {
    const { categoryId } = await params
    const result = categoryIdParamSchema.safeParse({
      categoryId: categoryId ?? '',
    })

    if (!result.success) {
      return formatZodError(result.error)
    }

    const categoryResult = await requireCategory(result.data.categoryId, {
      id: true,
      name: true,
      order: true,
      playerState: {
        select: {
          id: true,
          categoryId: true,
          xpTotal: true,
          spUnspent: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    })
    if (!categoryResult.ok) {
      return categoryResult.response
    }
    const category = categoryResult.category

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        order: category.order,
      },
      playerState: category.playerState,
    })
  } catch (error) {
    console.error('Failed to fetch player state:', error)
    return formatInternalError('プレイヤー状態の取得に失敗しました')
  }
}
