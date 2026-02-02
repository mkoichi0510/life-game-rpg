/**
 * dayKey形式（YYYY-MM-DD）のユーティリティ
 * dayKeyはJST基準で算出される日付文字列
 */

import { formatInTimeZone } from "date-fns-tz";

import { DEFAULT_TIMEZONE } from "./timezone";

/**
 * 値が非負（0以上）であることを検証
 * @param value - 検証する値
 * @param name - エラーメッセージ用のパラメータ名
 * @throws 値が負の場合
 */
function assertNonNegative(value: number, name: string): void {
  if (value < 0) {
    throw new Error(`${name} must be non-negative, got ${value}`);
  }
}

/**
 * DateオブジェクトをdayKey形式（YYYY-MM-DD）に変換
 * @param date - 変換する日付
 * @returns JST基準のdayKey文字列
 */
export function formatDayKey(date: Date): string {
  return formatInTimeZone(date, DEFAULT_TIMEZONE, "yyyy-MM-dd");
}

/**
 * 今日のdayKeyを取得
 *
 * @remarks
 * E2Eテスト用の日付オーバーライド機能:
 * - `TODAY_KEY_OVERRIDE` または `NEXT_PUBLIC_TODAY_KEY_OVERRIDE` 環境変数で日付を固定可能（形式: YYYY-MM-DD）
 * - サーバーサイドでは `TODAY_KEY_OVERRIDE` を優先
 * - 主にE2Eテストでの日付固定に使用（.env.e2e で設定）
 *
 * @returns 今日のdayKey文字列
 */
export function getTodayKey(): string {
  const override =
    typeof window === "undefined"
      ? process.env.TODAY_KEY_OVERRIDE ??
        process.env.NEXT_PUBLIC_TODAY_KEY_OVERRIDE
      : process.env.NEXT_PUBLIC_TODAY_KEY_OVERRIDE;

  if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) {
    return override;
  }

  return formatDayKey(new Date());
}

/**
 * 指定されたdayKeyの翌日を取得
 * @param dayKey - 基準となるdayKey
 * @returns 翌日のdayKey文字列
 */
export function getNextDayKey(dayKey: string): string {
  const date = new Date(`${dayKey}T00:00:00+09:00`);
  date.setDate(date.getDate() + 1);
  return formatInTimeZone(date, DEFAULT_TIMEZONE, "yyyy-MM-dd");
}

/**
 * 指定されたdayKeyの前日を取得
 * @param dayKey - 基準となるdayKey
 * @returns 前日のdayKey文字列
 */
export function getPreviousDayKey(dayKey: string): string {
  const date = new Date(`${dayKey}T00:00:00+09:00`);
  date.setDate(date.getDate() - 1);
  return formatInTimeZone(date, DEFAULT_TIMEZONE, "yyyy-MM-dd");
}

/**
 * dayKey形式の正規表現パターン
 */
const dayKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 文字列が有効なdayKey形式かどうかを検証
 * @param value - 検証する文字列
 * @returns 有効なdayKeyであればtrue
 */
export function isValidDayKey(value: string): boolean {
  if (!dayKeyRegex.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * 直近N日分のdayKey配列を取得（今日を含む）
 * @param days - 取得する日数（0以上）
 * @returns dayKeyの配列（新しい日付順）
 * @throws daysが負の場合
 */
export function getRecentDayKeys(days: number): string[] {
  assertNonNegative(days, "days");

  if (days === 0) {
    return [];
  }

  const result: string[] = [];
  const today = parseDayKey(getTodayKey());

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    result.push(formatDayKey(date));
  }

  return result;
}

/**
 * dayKey文字列をDateオブジェクトに変換（JST 00:00:00）
 * @param dayKey - 変換するdayKey
 * @returns Dateオブジェクト
 */
export function parseDayKey(dayKey: string): Date {
  return new Date(`${dayKey}T00:00:00+09:00`);
}

/**
 * ランク集計期間を「M/d - M/d」形式でフォーマット
 * @param rankWindowDays - 集計期間日数（0以下の場合は「-」を返す）
 * @returns フォーマットされた期間文字列
 */
export function formatRankWindowRange(rankWindowDays: number): string {
  if (rankWindowDays <= 0) return "-";

  const dayKeys = getRecentDayKeys(rankWindowDays);
  if (dayKeys.length === 0) return "-";

  const startKey = dayKeys[dayKeys.length - 1];
  const endKey = dayKeys[0];
  const startLabel = formatInTimeZone(
    parseDayKey(startKey),
    DEFAULT_TIMEZONE,
    "M/d"
  );
  const endLabel = formatInTimeZone(
    parseDayKey(endKey),
    DEFAULT_TIMEZONE,
    "M/d"
  );
  return `${startLabel} - ${endLabel}`;
}
