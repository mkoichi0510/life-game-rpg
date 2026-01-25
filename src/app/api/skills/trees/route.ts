import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { skillTreesQuerySchema } from '@/lib/validations/skill'
import {
  formatZodError,
  formatInternalError,
} from '@/lib/validations/helpers'
import { requireCategory } from '@/lib/api/requireCategory'

/**
 * GET /api/skills/trees
 * スキルツリー一覧を取得
 * クエリパラメータ:
 *   - categoryId: カテゴリID（必須）
 *   - visible: trueの場合、表示中のツリーのみ取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId') ?? ''

    const result = skillTreesQuerySchema.safeParse({ categoryId })
    if (!result.success) {
      return formatZodError(result.error)
    }

    // カテゴリ存在確認
    const categoryResult = await requireCategory(result.data.categoryId)
    if (!categoryResult.ok) {
      return categoryResult.response
    }

    const visibleOnly = searchParams.get('visible') === 'true'
    const trees = await prisma.skillTree.findMany({
      where: {
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
