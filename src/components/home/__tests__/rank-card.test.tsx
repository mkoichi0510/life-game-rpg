import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { TooltipProvider } from "@/components/ui/tooltip";

import { RankCard } from "../rank-card";

describe("RankCard", () => {
  it("renders next rank progress copy", () => {
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <RankCard
          categoryId="health-category"
          categoryName="健康"
          categoryColor="health"
          rankName="アクティブ"
          nextRankName="ストイック"
          weekSp={6}
          nextRankSp={8}
          weekXp={120}
        />
      </TooltipProvider>
    );

    // 進捗表示のテキストが正しいこと
    expect(html).toContain("あと 2 SPでストイック");
    expect(html).toContain("6 SP");
    expect(html).toContain("120 XP");
    expect(html).toContain("アクティブ");
    expect(html).toContain("健康");

    // aria属性が正しく設定されていること
    expect(html).toContain('aria-valuenow="6"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="8"');
    expect(html).toContain('role="progressbar"');

    // 装飾アイコンに aria-hidden が設定されていること
    expect(html).toContain('aria-hidden="true"');
  });

  it("renders max rank state when no next rank", () => {
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <RankCard
          categoryId="work-category"
          categoryName="仕事"
          categoryColor="work"
          rankName="レジェンド"
          nextRankName={null}
          weekSp={12}
          nextRankSp={0}
          weekXp={240}
        />
      </TooltipProvider>
    );

    // 最高ランク時の表示が正しいこと
    expect(html).toContain("最高ランク");
    expect(html).not.toContain("/ 0");
    expect(html).toContain("レジェンド");
    expect(html).toContain("12 SP");
    expect(html).toContain("240 XP");

    // aria属性が正しく設定されていること（最高ランク時は weekSp が max になる）
    expect(html).toContain('aria-valuenow="12"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="12"');
  });

  it("renders progress bar at 100% when at max rank", () => {
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <RankCard
          categoryId="hobby-category"
          categoryName="趣味"
          categoryColor="hobby"
          rankName="マスター"
          nextRankName={null}
          weekSp={15}
          nextRankSp={0}
          weekXp={300}
        />
      </TooltipProvider>
    );

    // 最高ランク時は進捗バーが100%
    expect(html).toContain('style="width:100%"');
  });

  it("calculates progress percentage correctly", () => {
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <RankCard
          categoryId="learning-category"
          categoryName="学習"
          categoryColor="learning"
          rankName="ビギナー"
          nextRankName="ノービス"
          weekSp={5}
          nextRankSp={10}
          weekXp={100}
        />
      </TooltipProvider>
    );

    // 50%進捗（5/10）
    expect(html).toContain('style="width:50%"');
    expect(html).toContain("あと 5 SPでノービス");
  });
});
