import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { CategoryForm } from "../category-form";

describe("CategoryForm", () => {
  const mockOnSubmit = async () => {};
  const mockOnCancel = () => {};

  it("renders form fields correctly", () => {
    const html = renderToStaticMarkup(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // カテゴリ名フィールドが存在すること
    expect(html).toContain('id="name"');
    expect(html).toContain("カテゴリ名");
    expect(html).toContain('placeholder="例: 健康、資格勉強"');

    // XP/Playフィールドが存在すること
    expect(html).toContain('id="xpPerPlay"');
    expect(html).toContain("XP/Play");
    expect(html).toContain("1プレイあたりに獲得するXP");

    // 表示スイッチが存在すること
    expect(html).toContain('id="visible"');
    expect(html).toContain("表示する");

    // ボタンが存在すること
    expect(html).toContain("キャンセル");
    expect(html).toContain("保存");
  });

  it("renders default values correctly", () => {
    const html = renderToStaticMarkup(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // XP/Playのデフォルト値が10であること
    expect(html).toContain('value="10"');

    // visibleのデフォルト値がtrueであること（checkedの状態）
    expect(html).toContain('data-state="checked"');
  });

  it("renders submitting state correctly", () => {
    const html = renderToStaticMarkup(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    // 保存中のテキストが表示されること
    expect(html).toContain("保存中...");

    // ボタンがdisabledであること
    expect(html).toContain("disabled");
  });
});
