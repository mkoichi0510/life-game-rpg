/**
 * プレイログの表示ラベルを生成
 *
 * @param actionLabel - アクションのラベル
 * @param quantity - 数量（null/undefinedの場合は数量なし）
 * @param unit - 単位（null/undefinedの場合は単位なし）
 * @returns 表示用ラベル
 *
 * @example
 * formatPlayLabel("ストレッチ", 30, "回") // => "ストレッチ × 30回"
 * formatPlayLabel("筋トレ", null, null) // => "筋トレ"
 */
export function formatPlayLabel(
  actionLabel: string,
  quantity: number | null | undefined,
  unit: string | null | undefined
): string {
  if (quantity != null && unit) {
    return `${actionLabel} × ${quantity}${unit}`;
  }
  return actionLabel;
}
