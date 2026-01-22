/**
 * XP（経験値）計算ユーティリティ
 */

import { assertNonNegative, assertPositive } from "./validation";

/**
 * 獲得XPを計算
 * @param playCount - プレイ回数（0以上）
 * @param xpPerPlay - 1プレイあたりのXP（1以上）
 * @returns 獲得XP
 * @throws playCountが負の場合
 * @throws xpPerPlayが0以下の場合
 */
export function calculateXpEarned(playCount: number, xpPerPlay: number): number {
  assertNonNegative(playCount, "playCount");
  assertPositive(xpPerPlay, "xpPerPlay");
  return playCount * xpPerPlay;
}

/**
 * 次のSP獲得までに必要な残りXPを計算
 * @param currentXp - 現在の累計XP（0以上）
 * @param xpPerSp - 1SP獲得に必要なXP（1以上）
 * @returns 次のSP獲得までに必要なXP
 * @throws currentXpが負の場合
 * @throws xpPerSpが0以下の場合
 */
export function calculateXpUntilNextSp(
  currentXp: number,
  xpPerSp: number
): number {
  assertNonNegative(currentXp, "currentXp");
  assertPositive(xpPerSp, "xpPerSp");
  const remainder = currentXp % xpPerSp;
  return remainder === 0 ? xpPerSp : xpPerSp - remainder;
}

/**
 * 次のSP獲得までの進捗率を計算（0-100）
 * @param currentXp - 現在の累計XP（0以上）
 * @param xpPerSp - 1SP獲得に必要なXP（1以上）
 * @returns 進捗率（パーセント、0-99）
 * @throws currentXpが負の場合
 * @throws xpPerSpが0以下の場合
 */
export function calculateXpProgressPercent(
  currentXp: number,
  xpPerSp: number
): number {
  assertNonNegative(currentXp, "currentXp");
  assertPositive(xpPerSp, "xpPerSp");
  const progress = currentXp % xpPerSp;
  return Math.round((progress / xpPerSp) * 100);
}
