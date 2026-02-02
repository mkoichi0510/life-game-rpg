/**
 * リザルト画面のE2Eテスト
 *
 * シードデータ依存:
 * - health-category: 健康カテゴリ
 * - health-1: 筋トレ（上半身）
 * - health-4: ストレッチ（単位: 回）
 *
 * @see prisma/seed.ts
 */
import { test, expect } from "@playwright/test";
import { registerPlay, goResult, resetDb } from "./helpers";

test.beforeEach(() => {
  resetDb();
});

test("リザルト確認・削除・確定フロー", async ({ page }) => {
  await registerPlay(page, "health-category", "health-1");
  await registerPlay(page, "health-category", "health-1");
  // health-4 = ストレッチ（単位: 回） @see prisma/seed.ts
  await registerPlay(page, "health-category", "health-4", undefined, 30);

  await goResult(page);

  const playLogList = page.getByTestId("playlog-list");
  await expect(playLogList).toContainText("ストレッチ × 30回");
  const rows = playLogList.locator(":scope > div");
  await expect
    .poll(async () => rows.count(), { timeout: 10_000 })
    .toBeGreaterThanOrEqual(2);
  const initialCount = await rows.count();

  const deleteButton = playLogList
    .locator("[data-testid^='playlog-delete-']")
    .first();
  await deleteButton.click();
  await page.getByTestId("playlog-delete-confirm").click();

  await expect(rows).toHaveCount(initialCount - 1);

  await page.getByTestId("result-confirm").click();
  await page.getByTestId("result-confirm-submit").click();
  await expect(page.getByTestId("result-status")).toHaveText(/確定済み/);
});

test.describe("日付ナビゲーション", () => {
  test("前日ボタンで過去日へ移動", async ({ page }) => {
    // プレイを登録して確定
    await registerPlay(page, "health-category", "health-1");
    await goResult(page);

    // 確定ボタンがenabledになるのを待ってクリック
    const confirmButton = page.getByTestId("result-confirm");
    await expect(confirmButton).toBeEnabled({ timeout: 10_000 });
    await confirmButton.click();
    await page.getByTestId("result-confirm-submit").click();
    await expect(page.getByTestId("result-status")).toHaveText(/確定済み/);

    // 前日ボタンをクリック
    await page.getByTestId("date-nav-prev").click();

    // URLに?date=パラメータが付く
    await expect(page).toHaveURL(/\/result\?date=\d{4}-\d{2}-\d{2}/);

    // 過去日は確定済み（自動確定）
    await expect(page.getByTestId("result-status")).toHaveText(/確定済み/);

    // 「今日に戻る」リンクが表示される
    await expect(page.getByTestId("date-nav-today")).toBeVisible();
  });

  test("「今日に戻る」で今日に戻る", async ({ page }) => {
    await goResult(page);

    // DateNavが表示されるのを待つ
    await expect(page.getByTestId("date-nav-prev")).toBeVisible();

    // 前日へ移動
    await page.getByTestId("date-nav-prev").click();
    await expect(page).toHaveURL(/\/result\?date=\d{4}-\d{2}-\d{2}/);

    // 「今日に戻る」をクリック
    await page.getByTestId("date-nav-today").click();

    // URLからdateパラメータがなくなる
    await expect(page).toHaveURL("/result");

    // 「今日に戻る」は非表示
    await expect(page.getByTestId("date-nav-today")).not.toBeVisible();
  });

  test("今日は翌日ボタンが無効", async ({ page }) => {
    await goResult(page);

    // DateNavが表示されるのを待つ
    await expect(page.getByTestId("date-nav-prev")).toBeVisible();

    // 翌日ボタンが無効化されている
    const nextButton = page.getByTestId("date-nav-next");
    await expect(nextButton).toBeDisabled();
  });

  test("URLパラメータで直接アクセス", async ({ page }) => {
    // 過去日を直接指定してアクセス
    await page.goto("/result?date=2026-01-14");
    await expect(page.getByRole("heading", { name: "リザルト" })).toBeVisible();

    // 日付ラベルが正しく表示される
    await expect(page.getByTestId("date-nav-label")).toContainText("2026年1月14日");

    // 過去日は確定済み
    await expect(page.getByTestId("result-status")).toHaveText(/確定済み/);

    // 「今日に戻る」が表示される
    await expect(page.getByTestId("date-nav-today")).toBeVisible();
  });

  test("過去日では確定ボタンが非表示", async ({ page }) => {
    // 今日プレイを登録
    await registerPlay(page, "health-category", "health-1");

    // 今日のリザルト画面を確認（確定ボタンが表示）
    await goResult(page);
    const confirmButton = page.getByTestId("result-confirm");
    await expect(confirmButton).toBeVisible();
    await expect(confirmButton).toBeEnabled({ timeout: 10_000 });

    // 前日へ移動
    await page.getByTestId("date-nav-prev").click();

    // 過去日では確定ボタンが非表示
    await expect(page.getByTestId("result-confirm")).not.toBeVisible();
  });
});
