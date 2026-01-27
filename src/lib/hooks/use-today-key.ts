"use client";

import { useEffect, useState } from "react";
import { getTodayKey } from "@/lib/date";

const CHECK_INTERVAL_MS = 60_000;

export function useTodayKey(): string {
  const [todayKey, setTodayKey] = useState(() => getTodayKey());

  useEffect(() => {
    const id = setInterval(() => {
      const current = getTodayKey();
      setTodayKey((prev) => (prev !== current ? current : prev));
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  return todayKey;
}
