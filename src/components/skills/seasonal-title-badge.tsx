"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SeasonalTitleBadgeProps {
  title: string | null;
  totalSpEarned: number;
  rankWindowDays: number;
}

function getRankBadgeStyles(rankLabel: string | null): string {
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

export function SeasonalTitleBadge({
  title,
  totalSpEarned,
  rankWindowDays,
}: SeasonalTitleBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge
        className={cn(
          "animate-badge-pop border px-3 py-1 text-xs font-semibold",
          getRankBadgeStyles(title)
        )}
      >
        現在のランク: {title ?? "未達"}
      </Badge>
      <p className="text-xs text-muted-foreground">
        直近{rankWindowDays}日: {totalSpEarned} SP
      </p>
    </div>
  );
}
