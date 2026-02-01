import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { ja } from "date-fns/locale";
import { Zap, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RankCard } from "@/components/home/rank-card";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, DAILY_RESULT_STATUS } from "@/lib/constants";
import { getCategoryColorKey } from "@/lib/category-ui";
import {
  DEFAULT_TIMEZONE,
  getRecentDayKeys,
  getTodayKey,
  parseDayKey,
} from "@/lib/date";
import {
  fetchCategories,
  fetchCurrentSeasonalTitle,
  fetchDailyResult,
  fetchSeasonalTitles,
} from "@/lib/api-client";

export const dynamic = "force-dynamic";

function formatTodayLabel(date = new Date()): string {
  return formatInTimeZone(date, DEFAULT_TIMEZONE, "yyyy年M月d日（EEE）", {
    locale: ja,
  });
}

function formatRankWindowRange(rankWindowDays: number): string {
  if (rankWindowDays <= 0) return "-";

  const dayKeys = getRecentDayKeys(rankWindowDays);
  if (dayKeys.length === 0) return "-";

  const startKey = dayKeys[dayKeys.length - 1];
  const endKey = dayKeys[0];
  const startLabel = formatInTimeZone(
    parseDayKey(startKey),
    DEFAULT_TIMEZONE,
    "M/d"
  );
  const endLabel = formatInTimeZone(
    parseDayKey(endKey),
    DEFAULT_TIMEZONE,
    "M/d"
  );
  return `${startLabel} - ${endLabel}`;
}

export default async function Home() {
  const todayKey = getTodayKey();
  const [categoriesResponse, dailyResultResponse] = await Promise.all([
    fetchCategories(true),
    fetchDailyResult(todayKey),
  ]);

  const categories = categoriesResponse.categories
    .slice()
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const dailyResult = dailyResultResponse.dailyResult;
  const dailyCategoryResults = dailyResultResponse.categoryResults;
  const categoryResultMap = new Map(
    dailyCategoryResults.map((result) => [result.categoryId, result])
  );

  const seasonalTitleEntries = await Promise.all(
    categories.map(async (category) => {
      const [current, titlesResponse] = await Promise.all([
        fetchCurrentSeasonalTitle(category.id),
        fetchSeasonalTitles(category.id),
      ]);
      return [
        category.id,
        {
          current,
          titles: titlesResponse.titles,
        },
      ] as const;
    })
  );
  const seasonalTitleMap = new Map(seasonalTitleEntries);

  const totalPlays = dailyCategoryResults.reduce(
    (sum, result) => sum + result.playCount,
    0
  );
  const totalXpEarned = dailyCategoryResults.reduce(
    (sum, result) => sum + result.xpEarned,
    0
  );
  const isConfirmed = dailyResult.status === DAILY_RESULT_STATUS.CONFIRMED;
  const xpSummaryLabel = isConfirmed ? "今日の獲得XP" : "未確定XP合計";
  const xpSummaryValue = totalXpEarned;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      {/* ヒーローエリア: 今日の進捗 */}
      <section className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-lg">
        {/* 装飾: ぼかし円 */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-br from-violet-200/30 to-purple-200/30 blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{formatTodayLabel()}</p>
              <h2 className="text-2xl font-bold tracking-tight">今日の進捗</h2>
            </div>
            <Badge
              className={cn(
                "animate-badge-pop border px-3 py-1 text-xs font-semibold",
                isConfirmed
                  ? "border-emerald-300 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 shadow-sm dark:from-emerald-900/50 dark:to-green-900/50 dark:text-emerald-300"
                  : "border-amber-300 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 shadow-sm dark:from-amber-900/50 dark:to-yellow-900/50 dark:text-amber-300"
              )}
            >
              {isConfirmed ? "✓ 確定済み" : "○ 未確定"}
            </Badge>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* プレイ数カード */}
            <div className="group rounded-lg border bg-card/80 p-4 backdrop-blur-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>今日のプレイ</span>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                {totalPlays}
                <span className="ml-1 text-lg font-medium text-muted-foreground">回</span>
              </p>
            </div>
            {/* XPカード */}
            <div className="group rounded-lg border bg-xp-glow p-4 backdrop-blur-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>{xpSummaryLabel}</span>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                <span className="text-xp-gradient">+{xpSummaryValue}</span>
                <span className="ml-1 text-lg font-medium text-amber-600 dark:text-amber-400">XP</span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="shadow-sm">
              <Link href="/play" data-testid="home-play">
                プレイを記録する
              </Link>
            </Button>
            {!isConfirmed && (
              <Button variant="confirm" asChild size="lg" className="shadow-sm">
                <Link href="/result" data-testid="home-confirm">
                  今日を確定する
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild size="lg">
              <Link href="/skills" data-testid="home-skills">
                スキルツリーを見る
              </Link>
            </Button>
          </div>
        </div>

        {/* カテゴリ別XP */}
        <div className="relative z-10 mt-6 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-muted-foreground">
              カテゴリ別XP（今日）
            </p>
          </div>
          <div className="space-y-4">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                まだカテゴリが登録されていません。
              </p>
            ) : (
              categories.map((category) => {
                const categoryResult = categoryResultMap.get(category.id);
                const todayXp = categoryResult?.xpEarned ?? 0;
                const progress = Math.min(
                  100,
                  Math.round((todayXp / category.xpPerSp) * 100)
                );
                const colorKey = getCategoryColorKey(category);
                const colorClasses = CATEGORY_COLORS[colorKey];

                return (
                  <div key={category.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        {/* カラードット with リング */}
                        <span className="relative">
                          <span
                            className={cn(
                              "block h-2.5 w-2.5 rounded-full",
                              colorClasses.bg
                            )}
                          />
                          <span
                            className={cn(
                              "absolute -inset-0.5 rounded-full opacity-30",
                              colorClasses.bg
                            )}
                          />
                        </span>
                        <span className="font-medium text-foreground">
                          {category.name}
                        </span>
                      </span>
                      <span className="font-semibold text-foreground">
                        +{todayXp} XP
                      </span>
                    </div>
                    {/* カスタムプログレスバー */}
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500 ease-out",
                          colorClasses.bg
                        )}
                        style={{ width: `${progress}%` }}
                      >
                        {/* 光沢オーバーレイ */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ランクカードセクション */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight">週ランク</h3>
          <p className="text-xs text-muted-foreground">直近の称号と週実績</p>
        </div>
        <TooltipProvider>
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  週ランクはカテゴリ登録後に表示されます。
                </CardContent>
              </Card>
            ) : (
              categories.map((category) => {
                const seasonalData = seasonalTitleMap.get(category.id);
                const colorKey = getCategoryColorKey(category);
                const titlesSorted = (seasonalData?.titles ?? [])
                  .slice()
                  .sort(
                    (a, b) =>
                      a.minSpEarned - b.minSpEarned || a.order - b.order
                  );
                const weekSp = seasonalData?.current?.totalSpEarned ?? 0;
                const weekXp = weekSp * category.xpPerSp;
                const rankName =
                  seasonalData?.current?.currentTitle?.label ?? null;
                const nextTitle =
                  titlesSorted.find((title) => title.minSpEarned > weekSp) ?? null;
                const nextRankName = nextTitle?.label ?? null;
                const nextRankSp = nextTitle?.minSpEarned ?? 0;
                const rankWindowRange = formatRankWindowRange(
                  category.rankWindowDays
                );

                return (
                  <RankCard
                    key={category.id}
                    categoryId={category.id}
                    categoryName={category.name}
                    categoryColor={colorKey}
                    rankName={rankName}
                    nextRankName={nextRankName}
                    weekSp={weekSp}
                    nextRankSp={nextRankSp}
                    weekXp={weekXp}
                    rankWindowRange={rankWindowRange}
                  />
                );
              })
            )}
          </div>
        </TooltipProvider>
      </section>
    </div>
  );
}
