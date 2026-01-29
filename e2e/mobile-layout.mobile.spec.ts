import { test, expect } from "@playwright/test";

test("モバイル表示の崩れがない", async ({ page }) => {
  const checkNoOverflow = async () => {
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
  };

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "今日の進捗" })).toBeVisible();
  await checkNoOverflow();

  await page.goto("/play");
  await expect(page.getByRole("heading", { name: "プレイを記録する" })).toBeVisible();
  await checkNoOverflow();

  await page.goto("/result");
  await expect(page.getByRole("heading", { name: "リザルト" })).toBeVisible();
  await checkNoOverflow();

  await page.goto("/skills");
  await expect(page.getByRole("heading", { name: "スキルツリーを見る" })).toBeVisible();
  await checkNoOverflow();
});
