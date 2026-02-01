import "server-only";

import { headers } from "next/headers";
import { fetchJson } from "./fetch";

export type Category = {
  id: string;
  name: string;
  order: number;
  rankWindowDays: number;
  xpPerPlay: number;
  xpPerSp: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DailyResult = {
  dayKey: string;
  status: string;
  confirmedAt: string | null;
};

export type DailyCategoryResult = {
  id: string;
  dayKey: string;
  categoryId: string;
  playCount: number;
  xpEarned: number;
  spEarned: number;
  category: {
    id: string;
    name: string;
    order: number;
    xpPerPlay: number;
    xpPerSp: number;
  };
};

export type PlayerCategoryState = {
  id: string;
  categoryId: string;
  xpTotal: number;
  spUnspent: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    order: number;
  };
};

export type SeasonalTitle = {
  id: string;
  categoryId: string;
  label: string;
  minSpEarned: number;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type SeasonalTitleCurrent = {
  currentTitle: SeasonalTitle | null;
  totalSpEarned: number;
  rankWindowDays: number;
};

async function getBaseUrl(): Promise<string> {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    "http://localhost:3000"
  );
}

async function requestJson<T>(path: string): Promise<T> {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}${path}`;
  return fetchJson<T>(url);
}

export function fetchCategories(visibleOnly = true) {
  return requestJson<{ categories: Category[] }>(
    `/api/categories?visible=${visibleOnly ? "true" : "false"}`
  );
}

export function fetchDailyResult(dayKey: string) {
  return requestJson<{ dailyResult: DailyResult; categoryResults: DailyCategoryResult[] }>(
    `/api/results/${encodeURIComponent(dayKey)}`
  );
}

export function fetchPlayerStates() {
  return requestJson<{ playerStates: PlayerCategoryState[] }>(
    "/api/player/states"
  );
}

export function fetchCurrentSeasonalTitle(categoryId: string) {
  return requestJson<SeasonalTitleCurrent>(
    `/api/skills/seasonal-titles/current?categoryId=${encodeURIComponent(
      categoryId
    )}`
  );
}

export function fetchSeasonalTitles(categoryId: string) {
  return requestJson<{ titles: SeasonalTitle[] }>(
    `/api/skills/seasonal-titles?categoryId=${encodeURIComponent(categoryId)}`
  );
}
