/**
 * dayKey形式（YYYY-MM-DD）のユーティリティ
 * dayKeyはJST基準で算出される日付文字列
 */

import { formatInTimeZone } from "date-fns-tz";
import { DEFAULT_TIMEZONE } from "./timezone";

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
 * @returns 今日のdayKey文字列
 */
export function getTodayKey(): string {
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
 * 直近N日分のdayKey配列を取得（今日を含む）
 * @param days - 取得する日数
 * @returns dayKeyの配列（新しい日付順）
 */
export function getRecentDayKeys(days: number): string[] {
  const result: string[] = [];
  const today = new Date();

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
