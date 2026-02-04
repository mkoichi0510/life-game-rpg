import { fetchJson } from "./fetch";

// TODO: Prisma型からの導出に統一する (see issue #47 — 後続PRで対応)
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

export type Action = {
  id: string;
  categoryId: string;
  label: string;
  unit: string | null;
  order: number;
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

export type SkillTree = {
  id: string;
  categoryId: string;
  name: string;
  visible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type SkillNode = {
  id: string;
  treeId: string;
  order: number;
  title: string;
  costSp: number;
  createdAt: string;
  updatedAt: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
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

export type HighlightUnlockedNode = {
  id: string;
  name: string;
  unlockedAt: string;
  categoryName: string;
};

export type HighlightRankChange = {
  categoryId: string;
  categoryName: string;
  fromRank: string | null;
  toRank: string | null;
};

export type HighlightWeekSummary = {
  totalSp: number;
  totalXp: number;
};

export type HighlightsResponse = {
  unlockedNodes: HighlightUnlockedNode[];
  rankUps: HighlightRankChange[];
  weekSummary: HighlightWeekSummary;
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

export type PlayLog = {
  id: string;
  dayKey: string;
  at: string;
  note: string | null;
  quantity: number | null;
  action: {
    id: string;
    label: string;
    categoryId: string;
    unit: string | null;
    category: {
      id: string;
      name: string;
    };
  };
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (init?.body) {
    headers["Content-Type"] = "application/json";
  }

  return fetchJson<T>(path, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers ?? {}),
    },
  });
}

export function fetchCategories(visibleOnly = true) {
  return requestJson<{ categories: Category[] }>(
    `/api/categories?visible=${visibleOnly ? "true" : "false"}`
  );
}

export function fetchActions(categoryId: string, visibleOnly = true) {
  return requestJson<{ actions: Action[] }>(
    `/api/actions?categoryId=${encodeURIComponent(categoryId)}&visible=${
      visibleOnly ? "true" : "false"
    }`
  );
}

export function fetchDailyResult(dayKey: string) {
  return requestJson<{ dailyResult: DailyResult; categoryResults: DailyCategoryResult[] }>(
    `/api/results/${encodeURIComponent(dayKey)}`
  );
}

export function fetchPlayLogs(dayKey: string, categoryId?: string) {
  const params = new URLSearchParams({ dayKey });
  if (categoryId) params.set("categoryId", categoryId);
  return requestJson<{ playLogs: PlayLog[] }>(`/api/plays?${params.toString()}`);
}

export function createPlay(input: {
  actionId: string;
  note?: string;
  quantity?: number;
}) {
  return requestJson<{ playLog: PlayLog }>("/api/plays", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deletePlayLog(id: string) {
  return requestJson<{ ok: boolean }>(`/api/plays/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function confirmDailyResult(dayKey: string) {
  return requestJson<{ ok: boolean }>(
    `/api/results/${encodeURIComponent(dayKey)}/confirm`,
    { method: "POST" }
  );
}

export function fetchSkillTrees(categoryId: string, visibleOnly = true) {
  const params = new URLSearchParams({
    categoryId,
    visible: visibleOnly ? "true" : "false",
  });
  return requestJson<{ trees: SkillTree[] }>(`/api/skills/trees?${params.toString()}`);
}

export function fetchSkillNodes(treeId: string) {
  const params = new URLSearchParams({ treeId });
  return requestJson<{ nodes: SkillNode[] }>(`/api/skills/nodes?${params.toString()}`);
}

export function unlockSkillNode(nodeId: string) {
  return requestJson<{ unlockedNode: { id: string; nodeId: string; unlockedAt: string } }>(
    `/api/skills/nodes/${encodeURIComponent(nodeId)}/unlock`,
    { method: "POST" }
  );
}

export function fetchPlayerStates() {
  return requestJson<{ playerStates: PlayerCategoryState[] }>("/api/player/states");
}

export function fetchCurrentSeasonalTitle(categoryId: string) {
  const params = new URLSearchParams({ categoryId });
  return requestJson<SeasonalTitleCurrent>(
    `/api/skills/seasonal-titles/current?${params.toString()}`
  );
}

export function fetchHighlights() {
  return requestJson<HighlightsResponse>("/api/highlights");
}

export function createCategory(input: {
  name: string;
  visible?: boolean;
  xpPerPlay?: number;
}) {
  return requestJson<{ category: Category }>("/api/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
