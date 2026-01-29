import { test, expect } from "@playwright/test";

test("主要画面のスモーク", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "今日の進捗" })).toBeVisible();

  await page.goto("/play");
  await expect(page.getByRole("heading", { name: "プレイを記録する" })).toBeVisible();

  await page.goto("/result");
  await expect(page.getByRole("heading", { name: "リザルト" })).toBeVisible();

  await page.goto("/skills");
  await expect(page.getByRole("heading", { name: "スキルツリーを見る" })).toBeVisible();
});
