import { test, expect } from "@playwright/test";
import { registerPlay, resetDb } from "./helpers";

test.beforeEach(() => {
  resetDb();
});

test("プレイ登録フロー", async ({ page }) => {
  await registerPlay(page, "health-category", "health-1", "E2Eメモ");

  await expect(page.getByTestId("play-success")).toContainText(
    "プレイを記録しました！"
  );
});
