import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { skillNodesQuerySchema } from '@/lib/validations/skill'
import {
  formatInternalError,
  formatNotFoundError,
  formatZodError,
} from '@/lib/validations/helpers'

/**
 * GET /api/skills/nodes
 * スキルノード一覧を取得
 * クエリパラメータ:
 *   - treeId: 対象ツリーID（必須）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = {
      treeId: searchParams.get('treeId') ?? '',
    }
    const result = skillNodesQuerySchema.safeParse(query)

    if (!result.success) {
      return formatZodError(result.error)
    }

    const tree = await prisma.skillTree.findUnique({
      where: { id: result.data.treeId },
      select: { id: true },
    })

    if (!tree) {
      return formatNotFoundError('スキルツリー', result.data.treeId)
    }

    const skillNodes = await prisma.skillNode.findMany({
      where: { treeId: result.data.treeId },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        treeId: true,
        order: true,
        title: true,
        costSp: true,
        createdAt: true,
        updatedAt: true,
        unlockedNodes: {
          select: {
            id: true,
            nodeId: true,
            unlockedAt: true,
          },
        },
      },
    })

    return NextResponse.json({ skillNodes })
  } catch (error) {
    console.error('Failed to fetch skill nodes:', error)
    return formatInternalError('スキルノードの取得に失敗しました')
  }
}
