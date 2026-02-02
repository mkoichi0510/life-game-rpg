"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { DEFAULT_TIMEZONE, parseDayKey, getNextDayKey, getPreviousDayKey } from "@/lib/date";

interface DateNavProps {
  currentDayKey: string;
  todayKey: string;
  onDateChange: (dayKey: string) => void;
}

function formatDayLabel(dayKey: string): string {
  return formatInTimeZone(
    parseDayKey(dayKey),
    DEFAULT_TIMEZONE,
    "yyyy年M月d日（EEE）",
    { locale: ja }
  );
}

export function DateNav({ currentDayKey, todayKey, onDateChange }: DateNavProps) {
  const isToday = currentDayKey === todayKey;
  const canGoNext = currentDayKey < todayKey;

  const handlePrev = () => {
    onDateChange(getPreviousDayKey(currentDayKey));
  };

  const handleNext = () => {
    if (canGoNext) {
      onDateChange(getNextDayKey(currentDayKey));
    }
  };

  const handleGoToday = () => {
    onDateChange(todayKey);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          data-testid="date-nav-prev"
          aria-label="前日へ"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span
          className="min-w-[180px] text-center text-lg font-semibold"
          data-testid="date-nav-label"
        >
          {formatDayLabel(currentDayKey)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={!canGoNext}
          data-testid="date-nav-next"
          aria-label="翌日へ"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      {!isToday && (
        <button
          onClick={handleGoToday}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          data-testid="date-nav-today"
        >
          今日に戻る
        </button>
      )}
    </div>
  );
}
