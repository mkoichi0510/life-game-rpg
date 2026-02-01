"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCategoryIcon } from "@/lib/category-ui";
import { CATEGORY_COLORS, type CategoryColorKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type RankCardProps = {
  categoryId: string;
  categoryName: string;
  categoryColor: CategoryColorKey;
  rankName: string | null;
  nextRankName: string | null;
  weekSp: number;
  nextRankSp: number;
  weekXp: number;
  rankWindowRange: string;
};

export function RankCard({
  categoryId,
  categoryName,
  categoryColor,
  rankName,
  nextRankName,
  weekSp,
  nextRankSp,
  weekXp,
  rankWindowRange,
}: RankCardProps) {
  const [open, setOpen] = useState(false);
  const colorClasses = CATEGORY_COLORS[categoryColor];
  const CategoryIcon = getCategoryIcon({ id: categoryId, name: categoryName });
  const remainingSp = Math.max(nextRankSp - weekSp, 0);
  const hasNextRank = nextRankName !== null && nextRankSp > weekSp;
  const progressPercent = hasNextRank
    ? Math.min(100, Math.round((weekSp / nextRankSp) * 100))
    : 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 親コンポーネントで TooltipProvider のラップが必要 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="w-full text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`${categoryName}ランク詳細を開く`}
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            <Card
              data-category-id={categoryId}
              className="relative overflow-hidden border bg-card/80"
            >
              <div
                className={cn("absolute left-0 top-0 h-full w-1", colorClasses.bg)}
              />
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted/40">
                    <CategoryIcon
                      className={cn("h-5 w-5", colorClasses.text)}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        "absolute inset-0 rounded-full opacity-20",
                        colorClasses.bg
                      )}
                    />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">カテゴリ</p>
                    <CardTitle className="text-base font-bold sm:text-lg">
                      {categoryName}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
                  <p className="text-xs text-muted-foreground">現在のランク</p>
                </div>
                <p className="text-lg font-bold tracking-tight sm:text-xl">
                  {rankName ?? "未設定"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-md bg-sp-glow p-3">
                    <p className="text-xs text-muted-foreground">週SP</p>
                    <p className="mt-1 text-lg font-bold text-sp-gradient">
                      {weekSp} SP
                    </p>
                  </div>
                  <div className="rounded-md bg-xp-glow p-3">
                    <p className="text-xs text-muted-foreground">週XP</p>
                    <p className="mt-1 text-lg font-bold text-xp-gradient">
                      {weekXp} XP
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>次ランクまで</span>
                    <span className="font-medium text-foreground">
                      {hasNextRank
                        ? `あと ${remainingSp} SPで${nextRankName}`
                        : "最高ランク"}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={weekSp}
                    aria-valuemin={0}
                    // 最小値 1 を設定してゼロ除算を防止
                    aria-valuemax={Math.max(nextRankSp, weekSp, 1)}
                    className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/50"
                  >
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        colorClasses.bg
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="space-y-1">
            <p>週SP: {weekSp}</p>
            <p>週XP: {weekXp}</p>
          </div>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{categoryName}ランク詳細</DialogTitle>
          <DialogDescription>
            現在のランク: {rankName ?? "未設定"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">週SP</p>
            <p className="text-base font-semibold">{weekSp} SP</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">週XP</p>
            <p className="text-base font-semibold">{weekXp} XP</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">集計期間</p>
            <p className="text-base font-semibold">{rankWindowRange}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">次ランク</p>
            {hasNextRank ? (
              <p className="text-base font-semibold">
                {nextRankName}（必要 {nextRankSp} SP / 残り {remainingSp} SP）
              </p>
            ) : (
              <p className="text-base font-semibold">最高ランク</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
