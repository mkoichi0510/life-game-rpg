"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { ja } from "date-fns/locale";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getCategoryColor, getCategoryIcon } from "@/lib/category-ui";
import { DAILY_RESULT_STATUS } from "@/lib/constants";
import { parseDayKey, DEFAULT_TIMEZONE } from "@/lib/date";
import { useTodayKey } from "@/lib/hooks/use-today-key";
import { showDayConfirmed, showError } from "@/lib/toast";
import {
  confirmDailyResult,
  deletePlayLog,
  fetchDailyResult,
  fetchPlayLogs,
  type DailyCategoryResult,
  type DailyResult,
  type PlayLog,
} from "@/lib/api-client/client";

function formatDayLabel(dayKey: string): string {
  return formatInTimeZone(parseDayKey(dayKey), DEFAULT_TIMEZONE, "yyyy年M月d日（EEE）", {
    locale: ja,
  });
}

function formatTimeLabel(isoString: string): string {
  return formatInTimeZone(new Date(isoString), DEFAULT_TIMEZONE, "HH:mm", {
    locale: ja,
  });
}

export default function ResultPage() {
  const todayKey = useTodayKey();
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);
  const [categoryResults, setCategoryResults] = useState<DailyCategoryResult[]>([]);
  const [playLogs, setPlayLogs] = useState<PlayLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const categoryResultMap = useMemo(
    () => new Map(categoryResults.map((result) => [result.categoryId, result])),
    [categoryResults]
  );

  const totals = useMemo(() => {
    const totalPlays = categoryResults.reduce(
      (sum, result) => sum + result.playCount,
      0
    );
    const totalXp = categoryResults.reduce(
      (sum, result) => sum + result.xpEarned,
      0
    );
    const totalSp = categoryResults.reduce(
      (sum, result) => sum + result.spEarned,
      0
    );
    return { totalPlays, totalXp, totalSp };
  }, [categoryResults]);

  const isConfirmed =
    dailyResult?.status === DAILY_RESULT_STATUS.CONFIRMED;

  const loadResult = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dailyResultResponse, playLogsResponse] = await Promise.all([
        fetchDailyResult(todayKey),
        fetchPlayLogs(todayKey),
      ]);
      setDailyResult(dailyResultResponse.dailyResult);
      setCategoryResults(dailyResultResponse.categoryResults);
      setPlayLogs(playLogsResponse.playLogs);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "リザルトの取得に失敗しました";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [todayKey]);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  const handleConfirm = async () => {
    if (!dailyResult || isConfirmed) return;
    setConfirming(true);
    try {
      await confirmDailyResult(dailyResult.dayKey);
      showDayConfirmed(totals.totalXp, totals.totalSp);
      setConfirmOpen(false);
      await loadResult();
    } catch (confirmError) {
      const message =
        confirmError instanceof Error
          ? confirmError.message
          : "日次確定に失敗しました";
      showError(message);
    } finally {
      setConfirming(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deletePlayLog(id);
      await loadResult();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "プレイログの削除に失敗しました";
      showError(message);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">ホームへ戻る</span>
            </Link>
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">今日のリザルト</p>
            <h1 className="text-xl font-bold tracking-tight">リザルト</h1>
          </div>
        </div>
        <Badge
          className={cn(
            "border px-3 py-1 text-xs font-semibold",
            isConfirmed
              ? "border-emerald-300 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 shadow-sm dark:from-emerald-900/50 dark:to-green-900/50 dark:text-emerald-300"
              : "border-amber-300 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 shadow-sm dark:from-amber-900/50 dark:to-yellow-900/50 dark:text-amber-300"
          )}
        >
          {isConfirmed ? "✓ 確定済み" : "○ 未確定"}
        </Badge>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">今日の日付</CardTitle>
          {loading ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            <p className="text-lg font-semibold">
              {dailyResult ? formatDayLabel(dailyResult.dayKey) : formatDayLabel(todayKey)}
            </p>
          )}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">サマリー</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">合計プレイ数</p>
                <p className="mt-2 text-2xl font-bold">
                  {totals.totalPlays}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">回</span>
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">合計XP</p>
                <p className="mt-2 text-2xl font-bold">
                  {totals.totalXp}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">XP</span>
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">
                  {isConfirmed ? "獲得SP" : "獲得予定SP"}
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {totals.totalSp}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">SP</span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">カテゴリ別内訳</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : categoryResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              まだプレイがありません。
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium">カテゴリ</th>
                    <th className="px-3 py-2 font-medium">回数</th>
                    <th className="px-3 py-2 font-medium">XP</th>
                    <th className="px-3 py-2 font-medium">SP</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryResults.map((result) => {
                    const color = getCategoryColor(result.category);
                    return (
                      <tr key={result.id} className="border-t">
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2.5 w-2.5 rounded-full",
                                color.bg
                              )}
                            />
                            {result.category.name}
                          </span>
                        </td>
                        <td className="px-3 py-2">{result.playCount}回</td>
                        <td className="px-3 py-2">{result.xpEarned} XP</td>
                        <td className="px-3 py-2">{result.spEarned} SP</td>
                      </tr>
                    );
                  })}
                  <tr className="border-t bg-muted/30 font-semibold">
                    <td className="px-3 py-2">合計</td>
                    <td className="px-3 py-2">{totals.totalPlays}回</td>
                    <td className="px-3 py-2">{totals.totalXp} XP</td>
                    <td className="px-3 py-2">{totals.totalSp} SP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">プレイログ</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : playLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              まだプレイが記録されていません。
            </p>
          ) : (
            <div className="space-y-3">
              {playLogs.map((log) => {
                const color = getCategoryColor(log.action.category);
                const Icon = getCategoryIcon(log.action.category);
                const xpPerPlay =
                  categoryResultMap.get(log.action.categoryId)?.category
                    .xpPerPlay ?? null;
                const isDeleting = deletingIds.has(log.id);

                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
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
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeLabel(log.at)} ・ {log.action.category.name}
                          {xpPerPlay !== null && ` ・ ${xpPerPlay} XP`}
                        </p>
                        <p className="text-sm font-semibold">{log.action.label}</p>
                        {log.note && (
                          <p className="text-xs text-muted-foreground">
                            {log.note}
                          </p>
                        )}
                      </div>
                    </div>
                    {!isConfirmed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(log.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                        <span className="sr-only">プレイログを削除</span>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {error ? error : "確定は当日のみ実行できます。過去分は自動確定されます。"}
        </div>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger asChild>
            <Button
              variant={isConfirmed ? "secondary" : "confirm"}
              size="lg"
              disabled={loading || isConfirmed}
            >
              {isConfirmed ? "確定済み" : "今日を確定する"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>今日を確定しますか？</DialogTitle>
              <DialogDescription>
                確定すると、以下が反映されます。確定後の変更はできません。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              {categoryResults.length === 0 ? (
                <p className="text-muted-foreground">
                  今日はプレイがありません（XP/SPは0で確定されます）。
                </p>
              ) : (
                <div className="space-y-2">
                  {categoryResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <span>{result.category.name}</span>
                      <span className="font-semibold">
                        +{result.xpEarned} XP / +{result.spEarned} SP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="secondary" type="button">
                  キャンセル
                </Button>
              </DialogClose>
              <Button
                variant="confirm"
                type="button"
                onClick={handleConfirm}
                disabled={confirming}
              >
                {confirming ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    確定中...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    確定する
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
