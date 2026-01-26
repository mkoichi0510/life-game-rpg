"use client";

import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { ja } from "date-fns/locale";
import { DEFAULT_TIMEZONE } from "@/lib/date";

function formatToday(): string {
  return formatInTimeZone(
    new Date(),
    DEFAULT_TIMEZONE,
    "yyyy年M月d日（EEE）",
    { locale: ja }
  );
}

export function Header() {
  const [today, setToday] = useState("");

  useEffect(() => {
    // Set initial date after hydration
    setToday(formatToday());

    // Update every minute to detect date changes
    const interval = setInterval(() => {
      setToday(formatToday());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 lg:pl-64 lg:pr-6">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{today}</p>
          <h1 className="text-lg font-semibold">Life Game RPG</h1>
        </div>
      </div>
    </header>
  );
}
