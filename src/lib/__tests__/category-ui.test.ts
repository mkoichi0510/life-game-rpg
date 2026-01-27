import { describe, it, expect } from "vitest";
import { getCategoryColorKey, getCategoryIcon } from "../category-ui";

describe("getCategoryColorKey", () => {
  it("returns mapped color for known category ID", () => {
    expect(getCategoryColorKey({ id: "health-category", name: "何か" })).toBe("health");
    expect(getCategoryColorKey({ id: "certification-category", name: "何か" })).toBe("learning");
  });

  it("infers color from category name containing 健康", () => {
    expect(getCategoryColorKey({ id: "unknown", name: "健康管理" })).toBe("health");
  });

  it("infers color from category name containing 資格", () => {
    expect(getCategoryColorKey({ id: "unknown", name: "資格取得" })).toBe("learning");
  });

  it("infers color from category name containing 趣味", () => {
    expect(getCategoryColorKey({ id: "unknown", name: "趣味活動" })).toBe("hobby");
  });

  it("infers color from category name containing 仕事", () => {
    expect(getCategoryColorKey({ id: "unknown", name: "仕事効率" })).toBe("work");
  });

  it("falls back to life for unknown categories", () => {
    expect(getCategoryColorKey({ id: "unknown", name: "その他" })).toBe("life");
  });
});

describe("getCategoryIcon", () => {
  it("returns Dumbbell for 健康", () => {
    const icon = getCategoryIcon({ id: "x", name: "健康" });
    expect(icon.displayName).toBe("Dumbbell");
  });

  it("returns BookOpen for 資格", () => {
    const icon = getCategoryIcon({ id: "x", name: "資格" });
    expect(icon.displayName).toBe("BookOpen");
  });

  it("returns BookOpen for 学習", () => {
    const icon = getCategoryIcon({ id: "x", name: "学習" });
    expect(icon.displayName).toBe("BookOpen");
  });

  it("returns Star for 趣味", () => {
    const icon = getCategoryIcon({ id: "x", name: "趣味" });
    expect(icon.displayName).toBe("Star");
  });

  it("returns Wand2 for 仕事", () => {
    const icon = getCategoryIcon({ id: "x", name: "仕事" });
    expect(icon.displayName).toBe("WandSparkles");
  });

  it("returns Sparkles as fallback", () => {
    const icon = getCategoryIcon({ id: "x", name: "その他" });
    expect(icon.displayName).toBe("Sparkles");
  });
});
