import { describe, expect, it } from "vitest";
import { calculateSpFromXp, hasEnoughSp } from "../sp";

describe("calculateSpFromXp", () => {
  it("正常系: 45XP / 20SP = 2SP（切り捨て）", () => {
    // 45 XP / 20 = 2.25, floor to 2
    expect(calculateSpFromXp(45, 20)).toBe(2);
  });

  it("境界値: 19XP → 0SP", () => {
    expect(calculateSpFromXp(19, 20)).toBe(0);
  });

  it("境界値: 20XP → 1SP", () => {
    expect(calculateSpFromXp(20, 20)).toBe(1);
  });

  it("境界値: 0XP → 0SP", () => {
    expect(calculateSpFromXp(0, 20)).toBe(0);
  });

  it("大きい数値の計算", () => {
    expect(calculateSpFromXp(1000, 20)).toBe(50);
  });

  it("エラー: 負のxpEarned", () => {
    expect(() => calculateSpFromXp(-10, 20)).toThrow(
      "xpEarned must be non-negative, got -10"
    );
  });

  it("エラー: xpPerSp = 0", () => {
    expect(() => calculateSpFromXp(45, 0)).toThrow(
      "xpPerSp must be positive, got 0"
    );
  });

  it("エラー: 負のxpPerSp", () => {
    expect(() => calculateSpFromXp(45, -20)).toThrow(
      "xpPerSp must be positive, got -20"
    );
  });
});

describe("hasEnoughSp", () => {
  it("正常系: 10SP >= 5コスト → true", () => {
    expect(hasEnoughSp(10, 5)).toBe(true);
  });

  it("境界値: 5SP >= 5コスト → true", () => {
    expect(hasEnoughSp(5, 5)).toBe(true);
  });

  it("正常系: 4SP >= 5コスト → false", () => {
    expect(hasEnoughSp(4, 5)).toBe(false);
  });

  it("境界値: コスト0の場合 → true", () => {
    expect(hasEnoughSp(5, 0)).toBe(true);
  });

  it("境界値: 両方0の場合 → true", () => {
    expect(hasEnoughSp(0, 0)).toBe(true);
  });

  it("エラー: 負のspUnspent", () => {
    expect(() => hasEnoughSp(-5, 3)).toThrow(
      "spUnspent must be non-negative, got -5"
    );
  });

  it("エラー: 負のcostSp", () => {
    expect(() => hasEnoughSp(10, -3)).toThrow(
      "costSp must be non-negative, got -3"
    );
  });
});
