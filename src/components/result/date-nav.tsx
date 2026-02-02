"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDayLabel, getNextDayKey, getPreviousDayKey } from "@/lib/date";

interface DateNavProps {
  currentDayKey: string;
  todayKey: string;
  onDateChange: (dayKey: string) => void;
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
        <Button
          variant="link"
          size="sm"
          onClick={handleGoToday}
          className="text-muted-foreground"
          data-testid="date-nav-today"
        >
          今日に戻る
        </Button>
      )}
    </div>
  );
}
