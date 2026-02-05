import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { skillTreesQuerySchema } from '@/lib/validations/skill'
import {
  formatZodError,
  formatInternalError,
} from '@/lib/validations/helpers'
import { requireCategory, isCategoryFailure } from '@/lib/api/requireCategory'
import { requireUser, isUserFailure } from '@/lib/api/requireUser'

/**
 * GET /api/skills/trees
 * スキルツリー一覧を取得
 * クエリパラメータ:
 *   - categoryId: カテゴリID（必須）
 *   - visible: trueの場合、表示中のツリーのみ取得
 */
export async function GET(request: NextRequest) {
  try {
    const userResult = await requireUser()
    if (isUserFailure(userResult)) {
      return userResult.response
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId') ?? ''

    const result = skillTreesQuerySchema.safeParse({ categoryId })
    if (!result.success) {
      return formatZodError(result.error)
    }

    // カテゴリ存在確認
    const categoryResult = await requireCategory(
      userResult.userId,
      result.data.categoryId
    )
    if (isCategoryFailure(categoryResult)) {
      return categoryResult.response
    }

    const visibleOnly = searchParams.get('visible') === 'true'
    const trees = await prisma.skillTree.findMany({
      where: {
        userId: userResult.userId,
        categoryId: result.data.categoryId,
        ...(visibleOnly && { visible: true }),
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        categoryId: true,
        name: true,
        visible: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ trees })
  } catch (error) {
    console.error('Failed to fetch skill trees:', error)
    return formatInternalError('スキルツリーの取得に失敗しました')
  }
}
