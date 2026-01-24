import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { skillNodeIdParamSchema } from '@/lib/validations/skill'
import {
  formatInternalError,
  formatNotFoundError,
  formatZodError,
} from '@/lib/validations/helpers'

type InvalidOperationDetails = Record<string, unknown> | undefined

function formatInvalidOperation(message: string, details?: InvalidOperationDetails) {
  return NextResponse.json(
    {
      error: {
        code: 'INVALID_OPERATION',
        message,
        details,
      },
    },
    { status: 400 }
  )
}

/**
 * POST /api/skills/nodes/:id/unlock
 * スキルノードを解放
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    const { id } = await params
    const result = skillNodeIdParamSchema.safeParse({ id: id ?? '' })

    if (!result.success) {
      return formatZodError(result.error)
    }

    const node = await prisma.skillNode.findUnique({
      where: { id: result.data.id },
      include: {
        tree: {
          select: {
            id: true,
            categoryId: true,
            category: {
              select: {
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
            },
          },
        },
        unlockedNodes: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!node) {
      return formatNotFoundError('スキルノード', result.data.id)
    }

    if (node.unlockedNodes.length > 0) {
      return formatInvalidOperation('既に解放済みです')
    }

    const playerState = node.tree.category.playerState
    if (!playerState) {
      return formatInvalidOperation('プレイヤー状態が存在しません')
    }

    if (playerState.spUnspent < node.costSp) {
      return formatInvalidOperation('SPが不足しています', {
        requiredSp: node.costSp,
        currentSp: playerState.spUnspent,
      })
    }

    if (node.order > 1) {
      const prevNode = await prisma.skillNode.findUnique({
        where: {
          treeId_order: {
            treeId: node.treeId,
            order: node.order - 1,
          },
        },
        include: {
          unlockedNodes: {
            select: { id: true },
          },
        },
      })

      if (!prevNode || prevNode.unlockedNodes.length === 0) {
        return formatInvalidOperation('前提ノードが解放されていません')
      }
    }

    const unlockResult = await prisma.$transaction(async (tx) => {
      const updatedPlayerState = await tx.playerCategoryState.update({
        where: { categoryId: node.tree.categoryId },
        data: { spUnspent: { decrement: node.costSp } },
        select: {
          id: true,
          categoryId: true,
          xpTotal: true,
          spUnspent: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      const unlockedNode = await tx.unlockedNode.create({
        data: { nodeId: node.id },
        select: {
          id: true,
          nodeId: true,
          unlockedAt: true,
        },
      })

      const spendLog = await tx.spendLog.create({
        data: {
          categoryId: node.tree.categoryId,
          type: 'unlock_node',
          costSp: node.costSp,
          refId: node.id,
        },
        select: {
          id: true,
          at: true,
          categoryId: true,
          type: true,
          costSp: true,
          refId: true,
          dayKey: true,
          createdAt: true,
        },
      })

      return { updatedPlayerState, unlockedNode, spendLog }
    })

    return NextResponse.json({
      playerState: unlockResult.updatedPlayerState,
      unlockedNode: unlockResult.unlockedNode,
      spendLog: unlockResult.spendLog,
    })
  } catch (error) {
    console.error('Failed to unlock skill node:', error)
    return formatInternalError('スキルノードの解放に失敗しました')
  }
}
