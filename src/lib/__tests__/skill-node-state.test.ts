import { describe, expect, it } from "vitest";
import { getSkillNodeState } from "@/lib/skills/skill-node-state";
import { SKILL_NODE_STATE } from "@/lib/constants";

describe("getSkillNodeState", () => {
  it("returns UNLOCKED when node is already unlocked", () => {
    const node = { id: "n1", order: 1, costSp: 1, isUnlocked: true };
    const state = getSkillNodeState(node, null, 0);
    expect(state).toBe(SKILL_NODE_STATE.UNLOCKED);
  });

  it("returns UNLOCKABLE for first node when SP is enough", () => {
    const node = { id: "n1", order: 1, costSp: 2, isUnlocked: false };
    const state = getSkillNodeState(node, null, 2);
    expect(state).toBe(SKILL_NODE_STATE.UNLOCKABLE);
  });

  it("returns LOCKED for first node when SP is insufficient", () => {
    const node = { id: "n1", order: 1, costSp: 2, isUnlocked: false };
    const state = getSkillNodeState(node, null, 1);
    expect(state).toBe(SKILL_NODE_STATE.LOCKED);
  });

  it("returns UNLOCKABLE when previous node is unlocked and SP is enough", () => {
    const prev = { id: "n1", order: 1, costSp: 1, isUnlocked: true };
    const node = { id: "n2", order: 2, costSp: 3, isUnlocked: false };
    const state = getSkillNodeState(node, prev, 3);
    expect(state).toBe(SKILL_NODE_STATE.UNLOCKABLE);
  });

  it("returns LOCKED when previous node is locked", () => {
    const prev = { id: "n1", order: 1, costSp: 1, isUnlocked: false };
    const node = { id: "n2", order: 2, costSp: 3, isUnlocked: false };
    const state = getSkillNodeState(node, prev, 10);
    expect(state).toBe(SKILL_NODE_STATE.LOCKED);
  });

  it("returns LOCKED when SP is insufficient even if previous is unlocked", () => {
    const prev = { id: "n1", order: 1, costSp: 1, isUnlocked: true };
    const node = { id: "n2", order: 2, costSp: 3, isUnlocked: false };
    const state = getSkillNodeState(node, prev, 2);
    expect(state).toBe(SKILL_NODE_STATE.LOCKED);
  });
});
