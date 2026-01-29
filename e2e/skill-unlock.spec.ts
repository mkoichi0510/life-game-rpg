import { test, expect } from "@playwright/test";
import { registerPlay, confirmDay, goSkills, resetDb } from "./helpers";

test.beforeEach(() => {
  resetDb();
});

test("スキルノード解放フロー", async ({ page }) => {
  await registerPlay(page, "health-category", "health-1");
  await registerPlay(page, "health-category", "health-1");
  await confirmDay(page);

  await goSkills(page);
  await page.getByTestId("skill-category-health-category").click();
  await page.getByTestId("skill-tree-health-skill-tree").click();

  const node = page.getByTestId("skill-node-health-node-1");
  await node.click();

  const dialog = page.getByTestId("skill-unlock-dialog");
  await expect(dialog).toBeVisible();

  await page.getByTestId("skill-unlock-submit").click();
  await expect(node).toHaveAttribute("aria-label", /解放済み/);
});
