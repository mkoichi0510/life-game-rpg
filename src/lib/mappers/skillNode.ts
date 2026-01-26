import { SkillNode, UnlockedNode } from '@prisma/client'

type SkillNodeWithUnlock = SkillNode & {
  unlockedNodes: Pick<UnlockedNode, 'id' | 'unlockedAt'>[]
}

/**
 * スキルノードに解放状態を付与してマッピングする
 */
export function mapNodeWithUnlockStatus(node: SkillNodeWithUnlock) {
  return {
    id: node.id,
    treeId: node.treeId,
    order: node.order,
    title: node.title,
    costSp: node.costSp,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    isUnlocked: node.unlockedNodes.length > 0,
    unlockedAt: node.unlockedNodes[0]?.unlockedAt ?? null,
  }
}
