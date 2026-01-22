/**
 * XP（経験値）計算ユーティリティ
 */

/**
 * 獲得XPを計算
 * @param playCount - プレイ回数
 * @param xpPerPlay - 1プレイあたりのXP
 * @returns 獲得XP
 */
export function calculateXpEarned(playCount: number, xpPerPlay: number): number {
  return playCount * xpPerPlay;
}

/**
 * 次のSP獲得までに必要な残りXPを計算
 * @param currentXp - 現在の累計XP
 * @param xpPerSp - 1SP獲得に必要なXP
 * @returns 次のSP獲得までに必要なXP
 */
export function calculateXpUntilNextSp(
  currentXp: number,
  xpPerSp: number
): number {
  const remainder = currentXp % xpPerSp;
  return remainder === 0 ? xpPerSp : xpPerSp - remainder;
}

/**
 * 次のSP獲得までの進捗率を計算（0-100）
 * @param currentXp - 現在の累計XP
 * @param xpPerSp - 1SP獲得に必要なXP
 * @returns 進捗率（パーセント）
 */
export function calculateXpProgressPercent(
  currentXp: number,
  xpPerSp: number
): number {
  const progress = currentXp % xpPerSp;
  return Math.round((progress / xpPerSp) * 100);
}
