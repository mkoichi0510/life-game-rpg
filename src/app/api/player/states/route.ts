import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatInternalError } from '@/lib/validations/helpers'
import { requireUser, isUserFailure } from '@/lib/api/requireUser'

/**
 * GET /api/player/states
 * 全カテゴリのプレイヤー状態を取得
 */
export async function GET() {
  try {
    const userResult = await requireUser()
    if (isUserFailure(userResult)) {
      return userResult.response
    }

    const playerStates = await prisma.playerCategoryState.findMany({
      where: { userId: userResult.userId },
      orderBy: [{ category: { order: 'asc' } }, { categoryId: 'asc' }],
      select: {
        id: true,
        categoryId: true,
        xpTotal: true,
        spUnspent: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            order: true,
          },
        },
      },
    })

    return NextResponse.json({ playerStates })
  } catch (error) {
    console.error('Failed to fetch player states:', error)
    return formatInternalError('プレイヤー状態の取得に失敗しました')
  }
}
