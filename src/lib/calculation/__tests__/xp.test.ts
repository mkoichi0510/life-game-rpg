import { describe, expect, it } from "vitest";
import {
  calculateXpEarned,
  calculateXpUntilNextSp,
  calculateXpProgressPercent,
} from "../xp";

describe("calculateXpEarned", () => {
  it("正常系: 3プレイ × 10XP = 30XP", () => {
    expect(calculateXpEarned(3, 10)).toBe(30);
  });

  it("境界値: 0プレイ = 0XP", () => {
    expect(calculateXpEarned(0, 10)).toBe(0);
  });

  it("大きい数値の計算", () => {
    expect(calculateXpEarned(100, 50)).toBe(5000);
  });

  it("エラー: 負のplayCount", () => {
    expect(() => calculateXpEarned(-1, 10)).toThrow(
      "playCount must be non-negative, got -1"
    );
  });

  it("エラー: xpPerPlay = 0", () => {
    expect(() => calculateXpEarned(3, 0)).toThrow(
      "xpPerPlay must be positive, got 0"
    );
  });

  it("エラー: 負のxpPerPlay", () => {
    expect(() => calculateXpEarned(3, -5)).toThrow(
      "xpPerPlay must be positive, got -5"
    );
  });
});

describe("calculateXpUntilNextSp", () => {
  it("正常系: 25XP / 20SP → 15XP必要", () => {
    // 25 XP, 20 per SP: 25 % 20 = 5, need 15 more
    expect(calculateXpUntilNextSp(25, 20)).toBe(15);
  });

  it("境界値: 0XPの場合は全額必要", () => {
    expect(calculateXpUntilNextSp(0, 20)).toBe(20);
  });

  it("境界値: ちょうど割り切れる場合は全額必要", () => {
    // 40 XP, 20 per SP: 40 % 20 = 0, need 20 more (to next SP)
    expect(calculateXpUntilNextSp(40, 20)).toBe(20);
  });

  it("境界値: 1XP足りない場合", () => {
    expect(calculateXpUntilNextSp(19, 20)).toBe(1);
  });

  it("エラー: 負のcurrentXp", () => {
    expect(() => calculateXpUntilNextSp(-5, 20)).toThrow(
      "currentXp must be non-negative, got -5"
    );
  });

  it("エラー: xpPerSp = 0", () => {
    expect(() => calculateXpUntilNextSp(25, 0)).toThrow(
      "xpPerSp must be positive, got 0"
    );
  });
});

describe("calculateXpProgressPercent", () => {
  it("正常系: 15XP / 20SP → 75%", () => {
    // 15 XP, 20 per SP: 15 % 20 = 15, 15/20 = 0.75 = 75%
    expect(calculateXpProgressPercent(15, 20)).toBe(75);
  });

  it("境界値: 0XP → 0%", () => {
    expect(calculateXpProgressPercent(0, 20)).toBe(0);
  });

  it("境界値: ちょうど20XP → 0%", () => {
    // 40 XP, 20 per SP: 40 % 20 = 0, 0/20 = 0%
    expect(calculateXpProgressPercent(40, 20)).toBe(0);
  });

  it("境界値: 50%の場合", () => {
    expect(calculateXpProgressPercent(10, 20)).toBe(50);
  });

  it("丸め処理: 17XP / 20SP → 85%", () => {
    // 17 XP, 20 per SP: 17 % 20 = 17, 17/20 = 0.85 = 85%
    expect(calculateXpProgressPercent(17, 20)).toBe(85);
  });

  it("エラー: 負のcurrentXp", () => {
    expect(() => calculateXpProgressPercent(-10, 20)).toThrow(
      "currentXp must be non-negative, got -10"
    );
  });

  it("エラー: xpPerSp = 0", () => {
    expect(() => calculateXpProgressPercent(15, 0)).toThrow(
      "xpPerSp must be positive, got 0"
    );
  });
});
