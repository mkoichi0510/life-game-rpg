import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { skillNodesQuerySchema } from '@/lib/validations/skill'
import {
  formatZodError,
  formatNotFoundError,
  formatInternalError,
} from '@/lib/validations/helpers'
import { mapNodeWithUnlockStatus } from '@/lib/mappers/skillNode'

/**
 * GET /api/skills/nodes
 * スキルノード一覧を取得
 * クエリパラメータ:
 *   - treeId: ツリーID（必須）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const treeId = searchParams.get('treeId') ?? ''

    const result = skillNodesQuerySchema.safeParse({ treeId })
    if (!result.success) {
      return formatZodError(result.error)
    }

    // ツリー存在確認
    const tree = await prisma.skillTree.findUnique({
      where: { id: result.data.treeId },
    })
    if (!tree) {
      return formatNotFoundError('スキルツリー', result.data.treeId)
    }

    const nodes = await prisma.skillNode.findMany({
      where: { treeId: result.data.treeId },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: {
        unlockedNodes: {
          select: {
            id: true,
            unlockedAt: true,
          },
        },
      },
    })

    // 解放状態を追加
    const nodesWithUnlockStatus = nodes.map(mapNodeWithUnlockStatus)

    return NextResponse.json({ nodes: nodesWithUnlockStatus })
  } catch (error) {
    console.error('Failed to fetch skill nodes:', error)
    return formatInternalError('スキルノードの取得に失敗しました')
  }
}
