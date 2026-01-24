import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { categoryIdParamSchema } from '@/lib/validations/player'
import {
  formatInternalError,
  formatNotFoundError,
  formatZodError,
} from '@/lib/validations/helpers'

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

    const category = await prisma.category.findUnique({
      where: { id: result.data.categoryId },
      select: {
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
      },
    })

    if (!category) {
      return formatNotFoundError('カテゴリ', result.data.categoryId)
    }

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
