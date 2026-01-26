/**
 * 計算関数用バリデーションユーティリティ
 */

/**
 * 値が正（0より大きい）であることを検証
 * @param value - 検証する値
 * @param name - エラーメッセージ用のパラメータ名
 * @throws 値が0以下の場合
 */
export function assertPositive(value: number, name: string): void {
  if (value <= 0) {
    throw new Error(`${name} must be positive, got ${value}`);
  }
}

/**
 * 値が非負（0以上）であることを検証
 * @param value - 検証する値
 * @param name - エラーメッセージ用のパラメータ名
 * @throws 値が負の場合
 */
export function assertNonNegative(value: number, name: string): void {
  if (value < 0) {
    throw new Error(`${name} must be non-negative, got ${value}`);
  }
}
