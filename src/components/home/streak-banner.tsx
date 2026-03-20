import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type StreakBannerProps = {
  streak: number;
  playedToday: boolean;
};

export function StreakBanner({ streak, playedToday }: StreakBannerProps) {
  return (
    <div
      className={cn(
        "mt-4 flex items-center gap-3 rounded-lg px-4 py-3",
        playedToday
          ? "border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:border-orange-800/50 dark:from-orange-950/40 dark:to-amber-950/40"
          : streak > 0
          ? "border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 dark:border-yellow-800/50 dark:from-yellow-950/40 dark:to-amber-950/40"
          : "border border-muted bg-muted/30"
      )}
    >
      {playedToday ? (
        <Flame className="h-6 w-6 shrink-0 text-orange-500" />
      ) : streak > 0 ? (
        <span className="text-xl shrink-0">⏰</span>
      ) : (
        <Flame className="h-6 w-6 shrink-0 text-muted-foreground" />
      )}
      {playedToday ? (
        <div>
          <p className="text-base font-bold text-orange-700 dark:text-orange-300">
            {streak}日連続記録済み！
          </p>
          <p className="text-xs text-orange-600/70 dark:text-orange-400/70">
            今日もクリア！この調子で続けよう
          </p>
        </div>
      ) : streak > 0 ? (
        <div>
          <p className="text-base font-bold text-yellow-700 dark:text-yellow-300">
            今日まだ記録してない！
          </p>
          <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">
            🔥 {streak}日連続継続中 → 記録しよう
          </p>
        </div>
      ) : (
        <div>
          <p className="text-base font-bold text-foreground">
            💪 今日が最初の一歩！
          </p>
          <p className="text-xs text-muted-foreground">
            プレイを記録してストリークを始めよう
          </p>
        </div>
      )}
    </div>
  );
}
