/**
 * トースト通知ヘルパー
 * XP/SP獲得、エラーなど共通の通知パターンを提供
 */

import { toast } from "sonner";

/**
 * XP獲得通知を表示
 * @param xp - 獲得したXP
 */
export function showXpGained(xp: number): void {
  toast.success(`+${xp} XP`, {
    description: "プレイを記録しました",
    duration: 3000,
  });
}

/**
 * SP獲得通知を表示
 * @param sp - 獲得したSP
 */
export function showSpGained(sp: number): void {
  toast.success(`+${sp} SP 獲得！`, {
    description: "日次確定が完了しました",
    duration: 4000,
  });
}

/**
 * 日次確定完了通知を表示
 * @param totalXp - 合計XP
 * @param totalSp - 合計SP
 */
export function showDayConfirmed(totalXp: number, totalSp: number): void {
  toast.success("今日を確定しました", {
    description: `+${totalXp} XP / +${totalSp} SP`,
    duration: 4000,
  });
}

/**
 * ノード解放通知を表示
 * @param nodeName - 解放したノード名
 */
export function showNodeUnlocked(nodeName: string): void {
  toast.success("称号を獲得！", {
    description: nodeName,
    duration: 4000,
  });
}

/**
 * エラー通知を表示
 * @param message - エラーメッセージ
 */
export function showError(message: string): void {
  toast.error("エラー", {
    description: message,
    duration: 5000,
  });
}

/**
 * 情報通知を表示
 * @param title - タイトル
 * @param description - 説明（オプション）
 */
export function showInfo(title: string, description?: string): void {
  toast.info(title, {
    description,
    duration: 3000,
  });
}
