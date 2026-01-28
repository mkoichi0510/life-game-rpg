"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryColor, getCategoryIcon } from "@/lib/category-ui";
import { useTodayKey } from "@/lib/hooks/use-today-key";
import { showError, showXpGained } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { ApiHttpError, getUserMessage } from "@/lib/api-client/errors";
import {
  createPlay,
  fetchActions,
  fetchCategories,
  fetchDailyResult,
  type Action,
  type Category,
  type DailyCategoryResult,
} from "@/lib/api-client/client";

const NOTE_MAX_LENGTH = 200;
const SUCCESS_BANNER_DURATION_MS = 5000;

type ValidationErrors = {
  category?: string;
  action?: string;
};

export default function PlayPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryResults, setCategoryResults] = useState<DailyCategoryResult[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingActions, setLoadingActions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [success, setSuccess] = useState<{ xp: number; actionLabel: string } | null>(
    null
  );
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const todayKey = useTodayKey();

  const categoryResultMap = useMemo(() => {
    return new Map(categoryResults.map((result) => [result.categoryId, result]));
  }, [categoryResults]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const selectedAction = useMemo(
    () => actions.find((action) => action.id === selectedActionId) ?? null,
    [actions, selectedActionId]
  );

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    setLoadError(null);
    try {
      const [categoriesResponse, dailyResultResponse] = await Promise.all([
        fetchCategories(true),
        fetchDailyResult(todayKey),
      ]);
      setCategories(categoriesResponse.categories);
      setCategoryResults(dailyResultResponse.categoryResults);
    } catch (error) {
      const message = getUserMessage(error, "カテゴリの取得に失敗しました");
      setLoadError(message);
      showError(message);
    } finally {
      setLoadingCategories(false);
    }
  }, [todayKey]);

  const loadActions = useCallback(
    async (categoryId: string) => {
      setLoadingActions(true);
      try {
        const response = await fetchActions(categoryId, true);
        setActions(response.actions);
      } catch (error) {
        const message = getUserMessage(error, "アクションの取得に失敗しました");
        showError(message);
        setActions([]);
      } finally {
        setLoadingActions(false);
      }
    },
    []
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setActions([]);
      setSelectedActionId(null);
      return;
    }

    setSelectedActionId(null);
    setErrors((prev) => ({ ...prev, action: undefined }));
    loadActions(selectedCategoryId);
  }, [loadActions, selectedCategoryId]);

  const handleSubmit = async () => {
    const nextErrors: ValidationErrors = {};
    if (!selectedCategoryId) {
      nextErrors.category = "カテゴリを選択してください";
    }
    if (!selectedActionId) {
      nextErrors.action = "アクションを選択してください";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!selectedCategory || !selectedAction) return;

    setSubmitting(true);
    setErrors({});

    try {
      await createPlay({
        actionId: selectedAction.id,
        note: note.trim() ? note.trim() : undefined,
      });
      const xp = selectedCategory.xpPerPlay;
      showXpGained(xp);
      setSuccess({ xp, actionLabel: selectedAction.label });
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccess(null), SUCCESS_BANNER_DURATION_MS);
      setSelectedActionId(null);
      setNote("");
      await loadCategories();
    } catch (error) {
      if (
        error instanceof ApiHttpError &&
        error.code === "VALIDATION_ERROR" &&
        error.details
      ) {
        const field = error.details.field;
        const reason = error.details.reason;
        if (field === "actionId") {
          setErrors({ action: String(reason ?? "アクションを選択してください") });
          return;
        }
      }
      const message = getUserMessage(error, "プレイの登録に失敗しました");
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const categorySection = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">カテゴリを選んでください</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingCategories ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : loadError ? (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>{loadError}</p>
            <Button variant="secondary" size="sm" onClick={loadCategories}>
              再読み込み
            </Button>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            表示できるカテゴリがありません。
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => {
              const color = getCategoryColor(category);
              const Icon = getCategoryIcon(category);
              const isSelected = category.id === selectedCategoryId;
              const playCount = categoryResultMap.get(category.id)?.playCount ?? 0;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                  className={cn(
                    "relative flex w-full items-center justify-between rounded-lg border p-4 text-left transition",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/60 hover:bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-white",
                        color.bg
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        今日: {playCount}回
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {errors.category && (
          <p className="mt-3 text-sm text-destructive">{errors.category}</p>
        )}
      </CardContent>
    </Card>
  );

  const actionSection = (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="text-base">アクションを選択</CardTitle>
        <p className="text-xs text-muted-foreground">
          {selectedCategory ? (
            <span className="inline-flex items-center gap-2">
              <span className="font-medium text-foreground">
                {selectedCategory.name}
              </span>
              のアクションを選びましょう
            </span>
          ) : (
            "カテゴリを選択するとアクションが表示されます"
          )}
        </p>
      </CardHeader>
      <CardContent>
        {loadingActions ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : !selectedCategory ? (
          <p className="text-sm text-muted-foreground">
            まずカテゴリを選択してください。
          </p>
        ) : actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            このカテゴリにアクションがありません。
          </p>
        ) : (
          <div className="space-y-2">
            {actions.map((action) => {
              const isSelected = action.id === selectedActionId;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    setSelectedActionId(action.id);
                    setErrors((prev) => ({ ...prev, action: undefined }));
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/60 hover:bg-primary/5"
                  )}
                >
                  <span className="font-medium">{action.label}</span>
                  {selectedCategory && (
                    <span className="text-xs text-muted-foreground">
                      +{selectedCategory.xpPerPlay} XP
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {errors.action && (
          <p className="mt-3 text-sm text-destructive">{errors.action}</p>
        )}
      </CardContent>
    </Card>
  );

  const memoSection = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">メモ（任意）</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={NOTE_MAX_LENGTH}
            rows={4}
            placeholder="今日やったことをメモできます"
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {selectedAction ? selectedAction.label : "アクション未選択"}
            </span>
            <span>
              {note.length}/{NOTE_MAX_LENGTH}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">プレビュー</span>
          <span className="text-amber-600">
            +{selectedCategory?.xpPerPlay ?? 0} XP
          </span>
          <span className="text-xs text-muted-foreground">（未確定）</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">ホームへ戻る</span>
          </Link>
        </Button>
        <div>
          <p className="text-xs text-muted-foreground">プレイ登録</p>
          <h2 className="text-xl font-semibold">プレイを記録する</h2>
        </div>
      </div>

      {success && (
        <Card className="border-emerald-200 bg-emerald-50/60">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">プレイを記録しました！</p>
                <p className="text-xs text-muted-foreground">
                  {success.actionLabel} / +{success.xp} XP
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (successTimerRef.current) clearTimeout(successTimerRef.current);
                  setSuccess(null);
                }}
              >
                続けて登録
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">ホームへ戻る</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {categorySection}
      {actionSection}
      {memoSection}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          variant="xp"
          size="lg"
          onClick={handleSubmit}
          disabled={submitting || !selectedCategoryId || !selectedActionId}
          className="w-full sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              登録中...
            </>
          ) : (
            "プレイを記録する"
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          カテゴリとアクションは必須です。
        </p>
      </div>
    </div>
  );
}
