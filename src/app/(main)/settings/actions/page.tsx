"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ActionForm, type ActionFormValues } from "@/components/settings/action-form";
import { ActionList } from "@/components/settings/action-list";
import {
  createAction,
  fetchActions,
  fetchCategories,
  type Action,
  type Category,
} from "@/lib/api-client/client";
import { selectClassName } from "@/lib/utils";

export default function ActionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const result = await fetchCategories(false);
      setCategories(result.categories);
      setSelectedCategoryId((prev) => {
        if (prev && result.categories.some((category) => category.id === prev)) {
          return prev;
        }
        return result.categories[0]?.id ?? null;
      });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("カテゴリの取得に失敗しました");
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  const loadActions = useCallback(async (categoryId: string) => {
    setIsLoadingActions(true);
    try {
      const result = await fetchActions(categoryId, false);
      setActions(result.actions);
    } catch (error) {
      console.error("Failed to fetch actions:", error);
      toast.error("アクションの取得に失敗しました");
      setActions([]);
    } finally {
      setIsLoadingActions(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!selectedCategoryId) {
      setActions([]);
      return;
    }
    loadActions(selectedCategoryId);
  }, [loadActions, selectedCategoryId]);

  const defaultOrder = useMemo(() => {
    if (actions.length === 0) return 1;
    return Math.max(...actions.map((action) => action.order)) + 1;
  }, [actions]);

  const handleSubmit = async (values: ActionFormValues) => {
    setIsSubmitting(true);
    try {
      await createAction({
        categoryId: values.categoryId,
        label: values.label,
        unit: values.unit,
        order: values.order,
      });
      toast.success("アクションを追加しました");
      setIsDialogOpen(false);
      if (values.categoryId !== selectedCategoryId) {
        setSelectedCategoryId(values.categoryId);
      } else {
        await loadActions(values.categoryId);
      }
    } catch (error) {
      console.error("Failed to create action:", error);
      toast.error("アクションの追加に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = () => {
    if (categories.length === 0) {
      toast.error("先にカテゴリを追加してください");
      return;
    }
    setDialogKey((k) => k + 1);
    setIsDialogOpen(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-12">
      <div className="space-y-1">
        <Link
          href="/settings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          設定に戻る
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">アクション管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">カテゴリ選択</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoadingCategories ? (
            <p className="text-sm text-muted-foreground">カテゴリを読み込み中...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              カテゴリがありません。先にカテゴリを追加してください。
            </p>
          ) : (
            <>
              <Label htmlFor="action-category">カテゴリ</Label>
              <select
                id="action-category"
                className={selectClassName}
                value={selectedCategoryId ?? ""}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </CardContent>
      </Card>

      <ActionList
        actions={actions}
        isLoading={isLoadingActions}
        onAddClick={handleAddClick}
        canAdd={categories.length > 0}
        emptyMessage={
          selectedCategoryId
            ? "このカテゴリにアクションがありません。"
            : "カテゴリを選択してください。"
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>アクションを追加</DialogTitle>
          </DialogHeader>
          <ActionForm
            key={dialogKey}
            categories={categories}
            defaultCategoryId={selectedCategoryId ?? undefined}
            defaultOrder={defaultOrder}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
