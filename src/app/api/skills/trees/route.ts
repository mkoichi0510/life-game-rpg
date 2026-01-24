import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { skillTreesQuerySchema } from '@/lib/validations/skill'
import {
  formatZodError,
  formatNotFoundError,
  formatInternalError,
} from '@/lib/validations/helpers'

/**
 * GET /api/skills/trees
 * スキルツリー一覧を取得
 * クエリパラメータ:
 *   - categoryId: カテゴリID（必須）
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
    const category = await prisma.category.findUnique({
      where: { id: result.data.categoryId },
    })
    if (!category) {
      return formatNotFoundError('カテゴリ', result.data.categoryId)
    }

    const trees = await prisma.skillTree.findMany({
      where: { categoryId: result.data.categoryId },
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
