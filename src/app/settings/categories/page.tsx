"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryForm, type CategoryFormValues } from "@/components/settings/category-form";
import { CategoryList } from "@/components/settings/category-list";
import {
  createCategory,
  fetchCategories,
  updateCategory,
  type Category,
} from "@/lib/api-client/client";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const result = await fetchCategories(false);
      setCategories(result.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("カテゴリの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      await createCategory({
        name: values.name,
        visible: values.visible,
        xpPerPlay: values.xpPerPlay,
      });
      toast.success("カテゴリを追加しました");
      setIsDialogOpen(false);
      await loadCategories();
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("カテゴリの追加に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVisible = async (id: string, visible: boolean) => {
    try {
      await updateCategory(id, { visible });
      toast.success(visible ? "カテゴリを表示しました" : "カテゴリを非表示にしました");
      await loadCategories();
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error("表示設定の変更に失敗しました");
    }
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
        <h1 className="text-2xl font-bold tracking-tight">カテゴリ管理</h1>
      </div>

      <CategoryList
        categories={categories}
        isLoading={isLoading}
        onAddClick={handleAddClick}
        onToggleVisible={handleToggleVisible}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カテゴリを追加</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleSubmit}
            onCancel={handleDialogClose}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
