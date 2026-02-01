import { describe, expect, it, vi, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { SkillSteps } from "../skill-steps";

describe("SkillSteps", () => {
  const mockOnStepClick = vi.fn();

  afterEach(() => {
    mockOnStepClick.mockClear();
  });

  it("renders all step labels and numbers", () => {
    const html = renderToStaticMarkup(
      <SkillSteps currentStep={1} onStepClick={mockOnStepClick} />
    );

    expect(html).toContain("1. カテゴリ選択");
    expect(html).toContain("2. ツリー選択");
    expect(html).toContain("3. スキルツリー");
  });

  it("marks current step as active with aria-current", () => {
    const html = renderToStaticMarkup(
      <SkillSteps currentStep={2} onStepClick={mockOnStepClick} />
    );

    // step-2 がアクティブであることを確認
    expect(html).toContain("trigger-step-2");
    expect(html).toContain('data-state="active"');
    expect(html).toContain('aria-current="step"');
  });

  it("shows check icon for completed steps when currentStep=3", () => {
    const html = renderToStaticMarkup(
      <SkillSteps currentStep={3} onStepClick={mockOnStepClick} />
    );

    // Step 1, 2 は完了済み（Check アイコンが表示される）
    // lucide-react の Check アイコンは path 要素を含む（polyline ではない）
    // Check アイコンのクラス名で確認
    expect(html).toContain("lucide-check");
    // 完了ステップの数だけ Check アイコンがある（2つ）
    const checkIconMatches = html.match(/lucide-check/g);
    expect(checkIconMatches).toHaveLength(2);
  });

  it("disables future steps that are not yet reachable", () => {
    const html = renderToStaticMarkup(
      <SkillSteps currentStep={1} onStepClick={mockOnStepClick} />
    );

    // currentStep=1 のとき、Step 2, 3 は disabled
    // data-disabled 属性でカウント
    const dataDisabledMatches = html.match(/data-disabled=""/g);
    expect(dataDisabledMatches).toHaveLength(2);
  });

  it("enables completed and current steps", () => {
    const html = renderToStaticMarkup(
      <SkillSteps currentStep={2} onStepClick={mockOnStepClick} />
    );

    // currentStep=2 のとき、Step 1, 2 は有効（disabled なし）、Step 3 は disabled
    const dataDisabledMatches = html.match(/data-disabled=""/g);
    expect(dataDisabledMatches).toHaveLength(1);
  });

  it("renders step numbers in correct order", () => {
    const html = renderToStaticMarkup(
      <SkillSteps currentStep={1} onStepClick={mockOnStepClick} />
    );

    const step1Pos = html.indexOf("1. カテゴリ選択");
    const step2Pos = html.indexOf("2. ツリー選択");
    const step3Pos = html.indexOf("3. スキルツリー");

    expect(step1Pos).toBeLessThan(step2Pos);
    expect(step2Pos).toBeLessThan(step3Pos);
  });

  it("has aria-hidden on decorative icons", () => {
    const html = renderToStaticMarkup(
      <SkillSteps currentStep={2} onStepClick={mockOnStepClick} />
    );

    // すべてのアイコンに aria-hidden が設定
    expect(html).toContain('aria-hidden="true"');
  });

  it("renders separator chevrons between steps", () => {
    const html = renderToStaticMarkup(
      <SkillSteps currentStep={1} onStepClick={mockOnStepClick} />
    );

    // ChevronRight アイコンのクラスで確認
    expect(html).toContain("lucide-chevron-right");
    // 3ステップの間に2つのセパレータがある
    const chevronMatches = html.match(/lucide-chevron-right/g);
    expect(chevronMatches).toHaveLength(2);
  });
});
