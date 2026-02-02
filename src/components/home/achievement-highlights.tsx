import { Card, CardContent } from "@/components/ui/card";
import type { HighlightsResponse } from "@/lib/api-client";

type AchievementHighlightsProps = {
  highlights: HighlightsResponse;
};

type HighlightEntry = {
  id: string;
  label: string;
};

export function AchievementHighlights({ highlights }: AchievementHighlightsProps) {
  const unlockedEntries: HighlightEntry[] = highlights.unlockedNodes.map((node) => ({
    id: `unlocked-${node.id}`,
    label: `🎉 新しいスキルを解放しました: ${node.name}`,
  }));

  const rankEntries: HighlightEntry[] = highlights.rankUps.map((rankUp) => {
    const fromLabel = rankUp.fromRank ?? "未設定";
    const toLabel = rankUp.toRank ?? "未設定";
    return {
      id: `rank-${rankUp.categoryId}-${fromLabel}-${toLabel}`,
      label: `📈 ${rankUp.categoryName}ランクが${fromLabel}→${toLabel}に！`,
    };
  });

  const hasSummary =
    highlights.weekSummary.totalXp > 0 || highlights.weekSummary.totalSp > 0;
  const summaryEntries: HighlightEntry[] = hasSummary
    ? [
        {
          id: "summary",
          label: `今週: +${highlights.weekSummary.totalXp} XP, +${highlights.weekSummary.totalSp} SP`,
        },
      ]
    : [];

  const entries = [...unlockedEntries, ...rankEntries, ...summaryEntries];
  const isEmpty = entries.length === 0;

  return (
    <section className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">🎯 最近の成果</h3>
          <p className="text-xs text-muted-foreground">直近の達成内容</p>
        </div>
      </div>
      <Card className="border bg-card/80">
        <CardContent className="pt-4">
          {isEmpty ? (
            <p className="text-sm text-muted-foreground">
              まだ成果がありません。頑張りましょう！
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-md border border-dashed bg-muted/30 px-3 py-2 text-sm"
                >
                  {entry.label}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
