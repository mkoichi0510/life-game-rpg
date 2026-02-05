"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { type Action } from "@/lib/api-client/client";

type ActionListProps = {
  actions: Action[];
  isLoading?: boolean;
  onAddClick: () => void;
  canAdd?: boolean;
  emptyMessage?: string;
};

export function ActionList({
  actions,
  isLoading,
  onAddClick,
  canAdd = true,
  emptyMessage,
}: ActionListProps) {
  if (isLoading) {
    return <ActionListSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">アクション一覧</CardTitle>
        <Button size="sm" onClick={onAddClick} disabled={!canAdd}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {emptyMessage ?? "このカテゴリにアクションがありません。"}
          </p>
        ) : (
          actions.map((action) => <ActionItem key={action.id} action={action} />)
        )}
      </CardContent>
    </Card>
  );
}

function ActionItem({ action }: { action: Action }) {
  return (
    <div
      className="flex items-center justify-between rounded-lg border p-3"
      data-testid="action-item"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">{action.label}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">単位: {action.unit ?? "なし"}</Badge>
          <Badge variant="outline">表示順: {action.order}</Badge>
        </div>
      </div>
      <Badge variant={action.visible ? "secondary" : "outline"}>
        {action.visible ? "表示中" : "非表示"}
      </Badge>
    </div>
  );
}

function ActionListSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-16" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
