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
  action: {
    id: string;
    label: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
    };
  };
};

type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

function getErrorMessage(text: string, fallback: string): string {
  try {
    const data = JSON.parse(text) as ApiErrorResponse;
    return data.error?.message ?? fallback;
  } catch {
    return text || fallback;
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (init?.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(path, {
    cache: "no-store",
    ...init,
    headers: {
      ...headers,
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();

  if (!response.ok) {
    const message = getErrorMessage(text, `Failed to fetch ${path}`);
    throw new Error(message);
  }

  if (!text) {
    throw new Error(`Empty response from ${path}`);
  }

  return JSON.parse(text) as T;
}

export function fetchCategories(visibleOnly = true) {
  return fetchJson<{ categories: Category[] }>(
    `/api/categories?visible=${visibleOnly ? "true" : "false"}`
  );
}

export function fetchActions(categoryId: string, visibleOnly = true) {
  return fetchJson<{ actions: Action[] }>(
    `/api/actions?categoryId=${encodeURIComponent(categoryId)}&visible=${
      visibleOnly ? "true" : "false"
    }`
  );
}

export function fetchDailyResult(dayKey: string) {
  return fetchJson<{ dailyResult: DailyResult; categoryResults: DailyCategoryResult[] }>(
    `/api/results/${encodeURIComponent(dayKey)}`
  );
}

export function fetchPlayLogs(dayKey: string, categoryId?: string) {
  const params = new URLSearchParams({ dayKey });
  if (categoryId) params.set("categoryId", categoryId);
  return fetchJson<{ playLogs: PlayLog[] }>(`/api/plays?${params.toString()}`);
}

export function createPlay(input: { actionId: string; note?: string }) {
  return fetchJson<{ playLog: PlayLog }>("/api/plays", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deletePlayLog(id: string) {
  return fetchJson<{ ok: boolean }>(`/api/plays/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function confirmDailyResult(dayKey: string) {
  return fetchJson<{ ok: boolean }>(
    `/api/results/${encodeURIComponent(dayKey)}/confirm`,
    { method: "POST" }
  );
}

export function fetchSkillTrees(categoryId: string, visibleOnly = true) {
  const params = new URLSearchParams({
    categoryId,
    visible: visibleOnly ? "true" : "false",
  });
  return fetchJson<{ trees: SkillTree[] }>(`/api/skills/trees?${params.toString()}`);
}

export function fetchSkillNodes(treeId: string) {
  const params = new URLSearchParams({ treeId });
  return fetchJson<{ nodes: SkillNode[] }>(`/api/skills/nodes?${params.toString()}`);
}

export function unlockSkillNode(nodeId: string) {
  return fetchJson<{ unlockedNode: { id: string; nodeId: string; unlockedAt: string } }>(
    `/api/skills/nodes/${encodeURIComponent(nodeId)}/unlock`,
    { method: "POST" }
  );
}

export function fetchPlayerStates() {
  return fetchJson<{ playerStates: PlayerCategoryState[] }>("/api/player/states");
}

export function fetchCurrentSeasonalTitle(categoryId: string) {
  const params = new URLSearchParams({ categoryId });
  return fetchJson<SeasonalTitleCurrent>(
    `/api/skills/seasonal-titles/current?${params.toString()}`
  );
}
