import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { RankCard } from "../rank-card";

describe("RankCard", () => {
  it("renders next rank progress copy", () => {
    const html = renderToStaticMarkup(
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
    );

    expect(html).toContain("あと 2 SPでストイック");
    expect(html).toMatchInlineSnapshot(`"<div class="rounded-lg text-card-foreground shadow-sm relative overflow-hidden border bg-card/80" data-category-id="health-category"><div class="absolute left-0 top-0 h-full w-1 bg-emerald-500"></div><div class="flex flex-col p-6 space-y-3 pb-3"><div class="flex items-center gap-3"><span class="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted/40"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dumbbell h-5 w-5 text-emerald-500" aria-hidden="true"><path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"></path><path d="m2.5 21.5 1.4-1.4"></path><path d="m20.1 3.9 1.4-1.4"></path><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"></path><path d="m9.6 14.4 4.8-4.8"></path></svg><span class="absolute inset-0 rounded-full opacity-20 bg-emerald-500"></span></span><div><p class="text-xs text-muted-foreground">カテゴリ</p><div class="tracking-tight text-base font-bold sm:text-lg">健康</div></div></div><div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy h-5 w-5 text-amber-500" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path></svg><p class="text-xs text-muted-foreground">現在のランク</p></div><p class="text-lg font-bold tracking-tight sm:text-xl">アクティブ</p></div><div class="p-6 pt-0 space-y-4"><div class="grid gap-2 sm:grid-cols-2"><div class="rounded-md bg-sp-glow p-3"><p class="text-xs text-muted-foreground">週SP</p><p class="mt-1 text-lg font-bold text-sp-gradient">6 SP</p></div><div class="rounded-md bg-xp-glow p-3"><p class="text-xs text-muted-foreground">週XP</p><p class="mt-1 text-lg font-bold text-xp-gradient">120 XP</p></div></div><div class="space-y-2"><div class="flex items-center justify-between text-xs text-muted-foreground"><span>次ランクまで</span><span class="font-medium text-foreground">あと 2 SPでストイック</span></div><div role="progressbar" aria-valuenow="6" aria-valuemin="0" aria-valuemax="8" class="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/50" data-state="closed"><div class="h-full rounded-full transition-all duration-500 ease-out bg-emerald-500" style="width:75%"></div></div></div></div></div>"`);
  });

  it("renders max rank state when no next rank", () => {
    const html = renderToStaticMarkup(
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
    );

    expect(html).toContain("最高ランク");
    expect(html).not.toContain("/ 0");
    expect(html).toMatchInlineSnapshot(`"<div class="rounded-lg text-card-foreground shadow-sm relative overflow-hidden border bg-card/80" data-category-id="work-category"><div class="absolute left-0 top-0 h-full w-1 bg-orange-500"></div><div class="flex flex-col p-6 space-y-3 pb-3"><div class="flex items-center gap-3"><span class="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted/40"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand-sparkles h-5 w-5 text-orange-500" aria-hidden="true"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M21 16h-4"></path><path d="M11 3H9"></path></svg><span class="absolute inset-0 rounded-full opacity-20 bg-orange-500"></span></span><div><p class="text-xs text-muted-foreground">カテゴリ</p><div class="tracking-tight text-base font-bold sm:text-lg">仕事</div></div></div><div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy h-5 w-5 text-amber-500" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path></svg><p class="text-xs text-muted-foreground">現在のランク</p></div><p class="text-lg font-bold tracking-tight sm:text-xl">レジェンド</p></div><div class="p-6 pt-0 space-y-4"><div class="grid gap-2 sm:grid-cols-2"><div class="rounded-md bg-sp-glow p-3"><p class="text-xs text-muted-foreground">週SP</p><p class="mt-1 text-lg font-bold text-sp-gradient">12 SP</p></div><div class="rounded-md bg-xp-glow p-3"><p class="text-xs text-muted-foreground">週XP</p><p class="mt-1 text-lg font-bold text-xp-gradient">240 XP</p></div></div><div class="space-y-2"><div class="flex items-center justify-between text-xs text-muted-foreground"><span>次ランクまで</span><span class="font-medium text-foreground">最高ランク</span></div><div role="progressbar" aria-valuenow="12" aria-valuemin="0" aria-valuemax="12" class="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/50" data-state="closed"><div class="h-full rounded-full transition-all duration-500 ease-out bg-orange-500" style="width:100%"></div></div></div></div></div>"`);
  });
});
