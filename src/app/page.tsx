import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { ja } from "date-fns/locale";
import { Zap, Sparkles, Trophy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { calculateXpProgressPercent, calculateXpUntilNextSp } from "@/lib/calculation";
import { CATEGORY_COLORS, DAILY_RESULT_STATUS } from "@/lib/constants";
import { DEFAULT_TIMEZONE, getTodayKey } from "@/lib/date";
import {
  fetchCategories,
  fetchCurrentSeasonalTitle,
  fetchDailyResult,
  fetchPlayerStates,
  type Category,
} from "@/lib/api-client";

export const dynamic = "force-dynamic";

const CATEGORY_COLOR_MAP: Record<string, keyof typeof CATEGORY_COLORS> = {
  "health-category": "health",
  "certification-category": "learning",
};

function formatTodayLabel(date = new Date()): string {
  return formatInTimeZone(date, DEFAULT_TIMEZONE, "yyyy年M月d日（EEE）", {
    locale: ja,
  });
}

function getCategoryColorKey(category: Category): keyof typeof CATEGORY_COLORS {
  if (CATEGORY_COLOR_MAP[category.id]) {
    return CATEGORY_COLOR_MAP[category.id];
  }
  if (category.name.includes("健康")) return "health";
  if (category.name.includes("資格")) return "learning";
  if (category.name.includes("趣味")) return "hobby";
  if (category.name.includes("仕事")) return "work";
  return "life";
}

function getRankBadgeStyles(rankLabel: string | undefined): string {
  if (!rankLabel) return "bg-secondary text-secondary-foreground";

  if (rankLabel.includes("ストイック")) {
    return "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-md";
  }
  if (rankLabel.includes("アクティブ")) {
    return "bg-gradient-to-r from-emerald-400 to-green-500 text-emerald-950 shadow-sm";
  }
  if (rankLabel.includes("習慣")) {
    return "bg-gradient-to-r from-blue-400 to-blue-500 text-blue-950";
  }
  return "bg-secondary text-secondary-foreground";
}

export default async function Home() {
  const todayKey = getTodayKey();
  const [categoriesResponse, dailyResultResponse, playerStatesResponse] =
    await Promise.all([
      fetchCategories(true),
      fetchDailyResult(todayKey),
      fetchPlayerStates(),
    ]);

  const categories = categoriesResponse.categories
    .slice()
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const dailyResult = dailyResultResponse.dailyResult;
  const dailyCategoryResults = dailyResultResponse.categoryResults;
  const playerStates = playerStatesResponse.playerStates;

  const categoryResultMap = new Map(
    dailyCategoryResults.map((result) => [result.categoryId, result])
  );
  const playerStateMap = new Map(
    playerStates.map((state) => [state.categoryId, state])
  );

  const seasonalTitleEntries = await Promise.all(
    categories.map(async (category) => {
      const seasonalTitle = await fetchCurrentSeasonalTitle(category.id);
      return [category.id, seasonalTitle] as const;
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
              <Link href="/play">プレイを記録する</Link>
            </Button>
            {!isConfirmed && (
              <Button variant="confirm" asChild size="lg" className="shadow-sm">
                <Link href="/result">今日を確定する</Link>
              </Button>
            )}
            <Button variant="outline" asChild size="lg">
              <Link href="/skills">スキルツリーを見る</Link>
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

      {/* カテゴリ別サマリーセクション */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight">カテゴリ別サマリー</h3>
          <p className="text-xs text-muted-foreground">
            今日の進捗と累計状態
          </p>
        </div>
        <div className="grid gap-4">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                カテゴリが登録されるとここにサマリーが表示されます。
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => {
              const categoryResult = categoryResultMap.get(category.id);
              const playerState = playerStateMap.get(category.id);
              const seasonalTitle = seasonalTitleMap.get(category.id);
              const colorKey = getCategoryColorKey(category);
              const colorClasses = CATEGORY_COLORS[colorKey];

              const playCount = categoryResult?.playCount ?? 0;
              const todayXp = categoryResult?.xpEarned ?? 0;
              const xpTotal = playerState?.xpTotal ?? 0;
              const spUnspent = playerState?.spUnspent ?? 0;
              const xpUntilNextSp = calculateXpUntilNextSp(
                xpTotal,
                category.xpPerSp
              );
              const xpProgressPercent = calculateXpProgressPercent(
                xpTotal,
                category.xpPerSp
              );

              return (
                <Card
                  key={category.id}
                  className={cn(
                    "overflow-hidden border-l-4 transition-all hover:shadow-md",
                    colorClasses.border
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="relative">
                          <span
                            className={cn(
                              "block h-3 w-3 rounded-full",
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
                        <CardTitle className="text-lg font-bold">
                          {category.name}
                        </CardTitle>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs font-semibold",
                          getRankBadgeStyles(seasonalTitle?.currentTitle?.label)
                        )}
                      >
                        {seasonalTitle?.currentTitle?.label ?? "未設定"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      <span>今日のプレイ: {playCount}回</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 今日の獲得XP - 強調表示 */}
                    <div className="flex items-center justify-between rounded-lg bg-xp-glow p-3">
                      <span className="text-sm text-muted-foreground">
                        {isConfirmed ? "今日の獲得XP" : "未確定XP"}
                      </span>
                      <span className="text-xl font-bold text-xp-gradient">
                        +{todayXp} XP
                      </span>
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-md border bg-muted/30 p-3">
                        <p className="text-xs text-muted-foreground">累計XP</p>
                        <p className="mt-1 text-lg font-bold">{xpTotal} XP</p>
                      </div>
                      <div className="rounded-md bg-sp-glow p-3">
                        <p className="text-xs text-muted-foreground">未使用SP</p>
                        <p className="mt-1 text-lg font-bold text-sp-gradient">{spUnspent} SP</p>
                      </div>
                    </div>

                    {/* 次SP獲得プログレス */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-violet-500" />
                          次SP獲得まで
                        </span>
                        <span className="font-medium text-foreground">あと {xpUntilNextSp} XP</span>
                      </div>
                      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
                        <div
                          className="shimmer h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500 ease-out"
                          style={{ width: `${xpProgressPercent}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* 週ランクセクション */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold tracking-tight">週ランク</h3>
          </div>
          <p className="text-xs text-muted-foreground">直近の称号と週実績</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                週ランクはカテゴリ登録後に表示されます。
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => {
              const seasonalTitle = seasonalTitleMap.get(category.id);
              const colorKey = getCategoryColorKey(category);
              const colorClasses = CATEGORY_COLORS[colorKey];
              const totalSpEarned = seasonalTitle?.totalSpEarned ?? 0;
              const weeklyXp = totalSpEarned * category.xpPerSp;
              const rankLabel = seasonalTitle?.currentTitle?.label;

              return (
                <Card
                  key={category.id}
                  className="overflow-hidden transition-all hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative">
                          <span
                            className={cn(
                              "block h-3 w-3 rounded-full",
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
                        <CardTitle className="text-base font-bold">
                          {category.name}
                        </CardTitle>
                      </div>
                      <Badge
                        className={cn(
                          "animate-badge-pop text-xs font-semibold",
                          getRankBadgeStyles(rankLabel)
                        )}
                      >
                        {rankLabel ?? "未設定"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between rounded-md bg-sp-glow p-2">
                      <span className="text-muted-foreground">週SP</span>
                      <span className="text-lg font-bold text-sp-gradient">{totalSpEarned} SP</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-xp-glow p-2">
                      <span className="text-muted-foreground">週XP</span>
                      <span className="text-lg font-bold text-xp-gradient">{weeklyXp} XP</span>
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                      直近{category.rankWindowDays}日間の集計
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
