import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  formatDayKey,
  formatRankWindowRange,
  getTodayKey,
  getNextDayKey,
  getRecentDayKeys,
  parseDayKey,
} from "../day-key";

describe("formatDayKey", () => {
  it("正常系: JST基準でYYYY-MM-DD形式に変換", () => {
    // 2026-01-15 00:00:00 JST
    const date = new Date("2026-01-15T00:00:00+09:00");
    expect(formatDayKey(date)).toBe("2026-01-15");
  });

  it("UTC日時をJSTに正しく変換", () => {
    // 2026-01-15 00:00:00 UTC = 2026-01-15 09:00:00 JST
    const date = new Date("2026-01-15T00:00:00Z");
    expect(formatDayKey(date)).toBe("2026-01-15");
  });

  it("境界値: 日付境界（23:59 JST）", () => {
    // 2026-01-14 23:59:00 JST - still Jan 14 in JST
    const date = new Date("2026-01-14T23:59:00+09:00");
    expect(formatDayKey(date)).toBe("2026-01-14");
  });

  it("境界値: 日付境界（00:01 JST）", () => {
    // 2026-01-15 00:01:00 JST - now Jan 15 in JST
    const date = new Date("2026-01-15T00:01:00+09:00");
    expect(formatDayKey(date)).toBe("2026-01-15");
  });
});

describe("getTodayKey", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("正常系: 今日の日付を返す", () => {
    // Set time to 2026-01-20 12:00:00 JST
    vi.setSystemTime(new Date("2026-01-20T12:00:00+09:00"));
    expect(getTodayKey()).toBe("2026-01-20");
  });

  it("境界値: 深夜近くでも正しい日付を返す", () => {
    // Set time to 2026-01-20 23:59:59 JST
    vi.setSystemTime(new Date("2026-01-20T23:59:59+09:00"));
    expect(getTodayKey()).toBe("2026-01-20");
  });
});

describe("getNextDayKey", () => {
  it("正常系: 翌日を返す", () => {
    expect(getNextDayKey("2026-01-15")).toBe("2026-01-16");
  });

  it("境界値: 月末 → 翌月1日", () => {
    expect(getNextDayKey("2026-01-31")).toBe("2026-02-01");
  });

  it("境界値: 年末 → 翌年1月1日", () => {
    expect(getNextDayKey("2025-12-31")).toBe("2026-01-01");
  });

  it("境界値: うるう年の2月", () => {
    expect(getNextDayKey("2024-02-28")).toBe("2024-02-29");
    expect(getNextDayKey("2024-02-29")).toBe("2024-03-01");
  });

  it("境界値: 非うるう年の2月", () => {
    expect(getNextDayKey("2025-02-28")).toBe("2025-03-01");
  });
});

describe("getRecentDayKeys", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set time to 2026-01-20 12:00:00 JST
    vi.setSystemTime(new Date("2026-01-20T12:00:00+09:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("正常系: 7日分の配列", () => {
    const keys = getRecentDayKeys(7);
    expect(keys).toHaveLength(7);
    expect(keys[0]).toBe("2026-01-20"); // Today
    expect(keys[6]).toBe("2026-01-14"); // 6 days ago
  });

  it("境界値: 0日 → 空配列", () => {
    expect(getRecentDayKeys(0)).toEqual([]);
  });

  it("境界値: 1日 → 今日のみ", () => {
    const keys = getRecentDayKeys(1);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe("2026-01-20");
  });

  it("月をまたぐ場合", () => {
    // Set to 2026-01-03
    vi.setSystemTime(new Date("2026-01-03T12:00:00+09:00"));
    const keys = getRecentDayKeys(5);
    expect(keys).toEqual([
      "2026-01-03",
      "2026-01-02",
      "2026-01-01",
      "2025-12-31",
      "2025-12-30",
    ]);
  });

  it("エラー: 負の日数", () => {
    expect(() => getRecentDayKeys(-1)).toThrow(
      "days must be non-negative, got -1"
    );
  });
});

describe("parseDayKey", () => {
  it("正常系: dayKey → Date変換（JST 00:00）", () => {
    const date = parseDayKey("2026-01-15");
    // The date should represent midnight JST
    expect(date.toISOString()).toBe("2026-01-14T15:00:00.000Z");
  });

  it("formatDayKeyとの往復変換", () => {
    const originalKey = "2026-06-15";
    const date = parseDayKey(originalKey);
    expect(formatDayKey(date)).toBe(originalKey);
  });
});

describe("formatRankWindowRange", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set time to 2026-01-20 12:00:00 JST
    vi.setSystemTime(new Date("2026-01-20T12:00:00+09:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("正常系: 7日間のウィンドウ", () => {
    // 2026-01-20から7日前まで = 1/14 - 1/20
    const result = formatRankWindowRange(7);
    expect(result).toBe("1/14 - 1/20");
  });

  it("正常系: 1日間のウィンドウ", () => {
    const result = formatRankWindowRange(1);
    expect(result).toBe("1/20 - 1/20");
  });

  it("境界値: 0日 → ハイフン", () => {
    expect(formatRankWindowRange(0)).toBe("-");
  });

  it("境界値: 負の日数 → ハイフン", () => {
    expect(formatRankWindowRange(-1)).toBe("-");
  });

  it("月をまたぐ場合", () => {
    // Set to 2026-02-03
    vi.setSystemTime(new Date("2026-02-03T12:00:00+09:00"));
    // 7日前 = 1/28
    const result = formatRankWindowRange(7);
    expect(result).toBe("1/28 - 2/3");
  });
});
