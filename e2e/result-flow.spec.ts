import { test, expect } from "@playwright/test";
import { registerPlay, goResult, resetDb } from "./helpers";

test.beforeEach(() => {
  resetDb();
});

test("リザルト確認・削除・確定フロー", async ({ page }) => {
  await registerPlay(page, "health-category", "health-1");
  await registerPlay(page, "health-category", "health-1");

  await goResult(page);

  const playLogList = page.getByTestId("playlog-list");
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
