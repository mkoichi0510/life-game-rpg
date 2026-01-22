/**
 * SP（スキルポイント）計算ユーティリティ
 */

import { assertNonNegative, assertPositive } from "./validation";

/**
 * XPからSP獲得数を計算（切り捨て）
 * @param xpEarned - 獲得XP（0以上）
 * @param xpPerSp - 1SP獲得に必要なXP（1以上）
 * @returns 獲得SP（整数、切り捨て）
 * @throws xpEarnedが負の場合
 * @throws xpPerSpが0以下の場合
 */
export function calculateSpFromXp(xpEarned: number, xpPerSp: number): number {
  assertNonNegative(xpEarned, "xpEarned");
  assertPositive(xpPerSp, "xpPerSp");
  return Math.floor(xpEarned / xpPerSp);
}

/**
 * SP残高が十分かどうかを判定
 * @param spUnspent - 未使用SP残高（0以上）
 * @param costSp - 必要SP（0以上）
 * @returns 十分な場合true
 * @throws spUnspentが負の場合
 * @throws costSpが負の場合
 */
export function hasEnoughSp(spUnspent: number, costSp: number): boolean {
  assertNonNegative(spUnspent, "spUnspent");
  assertNonNegative(costSp, "costSp");
  return spUnspent >= costSp;
}
