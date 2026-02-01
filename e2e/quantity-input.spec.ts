import { test, expect } from "@playwright/test";
import { goPlay, registerPlay, resetDb } from "./helpers";

test.beforeEach(() => {
  resetDb();
});

test("単位付きアクションで数量入力が表示される", async ({ page }) => {
  await goPlay(page);
  await page.getByTestId("play-category-health-category").click();
  // health-4: ストレッチ（unit: "回"）
  await page.getByTestId("play-action-health-4").click();

  await expect(page.getByTestId("play-quantity-input")).toBeVisible();
});

test("単位なしアクションで数量入力が非表示", async ({ page }) => {
  await goPlay(page);
  await page.getByTestId("play-category-health-category").click();
  // health-1: 筋トレ上半身（unit: なし）
  await page.getByTestId("play-action-health-1").click();

  await expect(page.getByTestId("play-quantity-input")).not.toBeVisible();
});

test("インクリメント/デクリメントボタン動作", async ({ page }) => {
  await goPlay(page);
  await page.getByTestId("play-category-health-category").click();
  await page.getByTestId("play-action-health-4").click();

  const input = page.getByTestId("play-quantity-input");
  await expect(input).toHaveValue("1");

  // +ボタンで増加
  await page.getByTestId("play-quantity-increment").click();
  await expect(input).toHaveValue("2");

  // -ボタンで減少
  await page.getByTestId("play-quantity-decrement").click();
  await expect(input).toHaveValue("1");

  // 最小値1を下回らない
  await page.getByTestId("play-quantity-decrement").click();
  await expect(input).toHaveValue("1");
});

test("数量付きプレイ登録成功", async ({ page }) => {
  await registerPlay(page, "health-category", "health-4", "ストレッチ5回", 5);
  await expect(page.getByTestId("play-success")).toBeVisible();
});
