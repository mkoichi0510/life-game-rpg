import {
  BookOpen,
  Dumbbell,
  Sparkles,
  Star,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { CATEGORY_COLORS, type CategoryColorKey } from "@/lib/constants";

const CATEGORY_COLOR_MAP: Record<string, CategoryColorKey> = {
  "health-category": "health",
  "certification-category": "learning",
};

type CategoryLike = { id: string; name: string };

export function getCategoryColorKey(category: CategoryLike): CategoryColorKey {
  const mapped = CATEGORY_COLOR_MAP[category.id];
  if (mapped) return mapped;

  if (category.name.includes("健康")) return "health";
  if (category.name.includes("資格")) return "learning";
  if (category.name.includes("趣味")) return "hobby";
  if (category.name.includes("仕事")) return "work";
  return "life";
}

export function getCategoryColor(category: CategoryLike) {
  return CATEGORY_COLORS[getCategoryColorKey(category)];
}

export function getCategoryIcon(category: CategoryLike): LucideIcon {
  if (category.name.includes("健康")) return Dumbbell;
  if (category.name.includes("資格")) return BookOpen;
  if (category.name.includes("学習")) return BookOpen;
  if (category.name.includes("趣味")) return Star;
  if (category.name.includes("仕事")) return Wand2;
  return Sparkles;
}
