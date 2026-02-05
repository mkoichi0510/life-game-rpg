import { prisma } from '@/lib/prisma'
import { SPEND_LOG_TYPE } from '@/lib/constants'
import {
  AlreadyUnlockedError,
  InsufficientSpError,
  PlayerStateNotFoundError,
  PrerequisiteNotMetError,
  SkillNodeNotFoundError,
} from './errors'

type UnlockNodeResult = {
  unlockedNode: {
    id: string
    nodeId: string
    unlockedAt: Date
  }
  costSp: number
  categoryId: string
  treeId: string
}

export async function unlockNode(
  userId: string,
  nodeId: string
): Promise<UnlockNodeResult> {
  return prisma.$transaction(async (tx) => {
    const node = await tx.skillNode.findFirst({
      where: { id: nodeId, userId },
      include: {
        tree: { include: { category: { include: { playerState: true } } } },
        unlockedNodes: { where: { userId } },
      },
    })

    if (!node) {
      throw new SkillNodeNotFoundError(nodeId)
    }

    if (node.unlockedNodes.length > 0) {
      throw new AlreadyUnlockedError(nodeId)
    }

    const playerState = node.tree.category.playerState
    if (!playerState) {
      throw new PlayerStateNotFoundError(node.tree.categoryId)
    }

    if (playerState.spUnspent < node.costSp) {
      throw new InsufficientSpError(node.costSp, playerState.spUnspent, nodeId)
    }

    if (node.order > 1) {
      const prevNode = await tx.skillNode.findUnique({
        where: {
          userId_treeId_order: {
            userId,
            treeId: node.treeId,
            order: node.order - 1,
          },
        },
        include: { unlockedNodes: { where: { userId } } },
      })

      if (!prevNode || prevNode.unlockedNodes.length === 0) {
        throw new PrerequisiteNotMetError(nodeId, prevNode?.id)
      }
    }

    await tx.playerCategoryState.update({
      where: { categoryId: node.tree.categoryId },
      data: { spUnspent: { decrement: node.costSp } },
    })

    const unlockedNode = await tx.unlockedNode.create({
      data: { userId, nodeId },
    })

    await tx.spendLog.create({
      data: {
        userId,
        categoryId: node.tree.categoryId,
        type: SPEND_LOG_TYPE.UNLOCK_NODE,
        costSp: node.costSp,
        refId: nodeId,
      },
    })

    return {
      unlockedNode: {
        id: unlockedNode.id,
        nodeId: unlockedNode.nodeId,
        unlockedAt: unlockedNode.unlockedAt,
      },
      costSp: node.costSp,
      categoryId: node.tree.categoryId,
      treeId: node.treeId,
    }
  })
}
