import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { skillTreeIdParamSchema } from '@/lib/validations/skill'
import {
  formatZodError,
  formatNotFoundError,
  formatInternalError,
} from '@/lib/validations/helpers'

/**
 * GET /api/skills/trees/:id
 * スキルツリー詳細を取得（ノード一覧・解放状態を含む）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = skillTreeIdParamSchema.safeParse({ id })
    if (!result.success) {
      return formatZodError(result.error)
    }

    const tree = await prisma.skillTree.findUnique({
      where: { id: result.data.id },
      include: {
        skillNodes: {
          orderBy: [{ order: 'asc' }, { id: 'asc' }],
          include: {
            unlockedNodes: {
              select: {
                id: true,
                unlockedAt: true,
              },
            },
          },
        },
      },
    })

    if (!tree) {
      return formatNotFoundError('スキルツリー', result.data.id)
    }

    // ノードに解放状態を追加
    const nodesWithUnlockStatus = tree.skillNodes.map((node) => ({
      id: node.id,
      treeId: node.treeId,
      order: node.order,
      title: node.title,
      costSp: node.costSp,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      isUnlocked: node.unlockedNodes.length > 0,
      unlockedAt: node.unlockedNodes[0]?.unlockedAt ?? null,
    }))

    return NextResponse.json({
      tree: {
        id: tree.id,
        categoryId: tree.categoryId,
        name: tree.name,
        visible: tree.visible,
        order: tree.order,
        createdAt: tree.createdAt,
        updatedAt: tree.updatedAt,
        nodes: nodesWithUnlockStatus,
      },
    })
  } catch (error) {
    console.error('Failed to fetch skill tree:', error)
    return formatInternalError('スキルツリーの取得に失敗しました')
  }
}
