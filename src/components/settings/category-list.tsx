"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Category } from "@/lib/api-client/client";
import { getCategoryColor, getCategoryIcon } from "@/lib/category-ui";

type CategoryListProps = {
  categories: Category[];
  isLoading?: boolean;
  onAddClick: () => void;
};

export function CategoryList({ categories, isLoading, onAddClick }: CategoryListProps) {
  if (isLoading) {
    return <CategoryListSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">カテゴリ一覧</CardTitle>
        <Button size="sm" onClick={onAddClick}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            カテゴリがありません。「追加」ボタンから作成してください。
          </p>
        ) : (
          categories.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function CategoryItem({ category }: { category: Category }) {
  const color = getCategoryColor(category);
  const Icon = getCategoryIcon(category);

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color.hex}20` }}
        >
          <Icon className="h-4 w-4" style={{ color: color.hex }} />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{category.name}</p>
          <p className="text-xs text-muted-foreground">
            XP/Play: {category.xpPerPlay}
          </p>
        </div>
      </div>
      <Badge variant={category.visible ? "default" : "secondary"}>
        {category.visible ? "表示" : "非表示"}
      </Badge>
    </div>
  );
}

function CategoryListSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-16" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
