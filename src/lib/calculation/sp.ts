/**
 * SP（スキルポイント）計算ユーティリティ
 */

/**
 * XPからSP獲得数を計算（切り捨て）
 * @param xpEarned - 獲得XP
 * @param xpPerSp - 1SP獲得に必要なXP
 * @returns 獲得SP
 */
export function calculateSpFromXp(xpEarned: number, xpPerSp: number): number {
  return Math.floor(xpEarned / xpPerSp);
}

/**
 * SP残高が十分かどうかを判定
 * @param spUnspent - 未使用SP残高
 * @param costSp - 必要SP
 * @returns 十分な場合true
 */
export function hasEnoughSp(spUnspent: number, costSp: number): boolean {
  return spUnspent >= costSp;
}
