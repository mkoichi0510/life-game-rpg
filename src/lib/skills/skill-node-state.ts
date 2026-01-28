import { SKILL_NODE_STATE, type SkillNodeState } from "@/lib/constants";

export type SkillNodeLike = {
  id: string;
  order: number;
  costSp: number;
  isUnlocked: boolean;
};

export function getSkillNodeState(
  node: SkillNodeLike,
  previousNode: SkillNodeLike | null,
  spUnspent: number
): SkillNodeState {
  if (node.isUnlocked) return SKILL_NODE_STATE.UNLOCKED;

  const hasSp = spUnspent >= node.costSp;
  if (node.order === 1) {
    return hasSp ? SKILL_NODE_STATE.UNLOCKABLE : SKILL_NODE_STATE.LOCKED;
  }

  if (previousNode?.isUnlocked && hasSp) {
    return SKILL_NODE_STATE.UNLOCKABLE;
  }

  return SKILL_NODE_STATE.LOCKED;
}
