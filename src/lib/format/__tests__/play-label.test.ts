import { describe, expect, it } from "vitest";
import { formatPlayLabel } from "../play-label";

describe("formatPlayLabel", () => {
  it("数量と単位があれば「アクション名 × 数量単位」形式で返す", () => {
    expect(formatPlayLabel("ストレッチ", 30, "回")).toBe("ストレッチ × 30回");
  });

  it("quantityがnullの場合はラベルのみを返す", () => {
    expect(formatPlayLabel("筋トレ", null, "回")).toBe("筋トレ");
  });

  it("unitがnullの場合はラベルのみを返す", () => {
    expect(formatPlayLabel("筋トレ", 10, null)).toBe("筋トレ");
  });

  it("quantityがundefinedの場合はラベルのみを返す", () => {
    expect(formatPlayLabel("筋トレ", undefined, "回")).toBe("筋トレ");
  });

  it("unitがundefinedの場合はラベルのみを返す", () => {
    expect(formatPlayLabel("筋トレ", 10, undefined)).toBe("筋トレ");
  });

  it("quantityが0でも「アクション名 × 0単位」形式で返す", () => {
    expect(formatPlayLabel("ストレッチ", 0, "回")).toBe("ストレッチ × 0回");
  });

  it("小数のquantityも正しくフォーマットする", () => {
    expect(formatPlayLabel("ランニング", 2.5, "km")).toBe("ランニング × 2.5km");
  });

  it("両方null/undefinedの場合はラベルのみを返す", () => {
    expect(formatPlayLabel("筋トレ", null, null)).toBe("筋トレ");
    expect(formatPlayLabel("筋トレ", undefined, undefined)).toBe("筋トレ");
  });
});
