/**
 * アプリケーション共通定数
 */

/**
 * カテゴリカラー定義
 * Tailwind CSSクラスとHex値の両方を提供
 */
export const CATEGORY_COLORS = {
  health: {
    hex: "#10B981",
    text: "text-emerald-500",
    bg: "bg-emerald-500",
    border: "border-emerald-500",
  },
  learning: {
    hex: "#3B82F6",
    text: "text-blue-500",
    bg: "bg-blue-500",
    border: "border-blue-500",
  },
  hobby: {
    hex: "#8B5CF6",
    text: "text-violet-500",
    bg: "bg-violet-500",
    border: "border-violet-500",
  },
  work: {
    hex: "#F97316",
    text: "text-orange-500",
    bg: "bg-orange-500",
    border: "border-orange-500",
  },
  life: {
    hex: "#14B8A6",
    text: "text-teal-500",
    bg: "bg-teal-500",
    border: "border-teal-500",
  },
} as const;

export type CategoryColorKey = keyof typeof CATEGORY_COLORS;

/**
 * DailyResult ステータス定数
 */
export const DAILY_RESULT_STATUS = {
  DRAFT: "draft",
  CONFIRMED: "confirmed",
} as const;

export type DailyResultStatus =
  (typeof DAILY_RESULT_STATUS)[keyof typeof DAILY_RESULT_STATUS];

/**
 * SkillNode 状態定数
 */
export const SKILL_NODE_STATE = {
  LOCKED: "locked",
  UNLOCKABLE: "unlockable",
  UNLOCKED: "unlocked",
} as const;

export type SkillNodeState =
  (typeof SKILL_NODE_STATE)[keyof typeof SKILL_NODE_STATE];

/**
 * SpendLog タイプ定数
 */
export const SPEND_LOG_TYPE = {
  UNLOCK_NODE: 'unlock_node',
} as const;

export type SpendLogType =
  (typeof SPEND_LOG_TYPE)[keyof typeof SPEND_LOG_TYPE];

/**
 * デフォルト値
 */
export const DEFAULTS = {
  XP_PER_PLAY: 10,
  XP_PER_SP: 20,
  RANK_WINDOW_DAYS: 7,
} as const;

/**
 * スキルツリー画面のステップ定数
 */
export const SKILL_STEP = {
  CATEGORY_SELECT: 1,
  TREE_SELECT: 2,
  SKILL_TREE: 3,
} as const;

export type SkillStep = (typeof SKILL_STEP)[keyof typeof SKILL_STEP];
