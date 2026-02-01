import { execSync } from "node:child_process";
import { expect, type Page } from "@playwright/test";

export function resetDb() {
  execSync("pnpm e2e:db:reset", {
    stdio: "inherit",
    env: process.env,
  });
}

export async function goHome(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "今日の進捗" })).toBeVisible();
}

export async function goPlay(page: Page) {
  await page.goto("/play");
  await expect(page.getByRole("heading", { name: "プレイを記録する" })).toBeVisible();
}

export async function goResult(page: Page) {
  await page.goto("/result");
  await expect(page.getByRole("heading", { name: "リザルト" })).toBeVisible();
}

export async function goSkills(page: Page) {
  await page.goto("/skills");
  await expect(page.getByRole("heading", { name: "スキルツリーを見る" })).toBeVisible();
}

export async function registerPlay(
  page: Page,
  categoryId: string,
  actionId: string,
  note?: string,
  quantity?: number
) {
  await goPlay(page);
  await page.getByTestId(`play-category-${categoryId}`).click();
  await page.getByTestId(`play-action-${actionId}`).click();
  const quantityInput = page.getByTestId("play-quantity-input");
  if ((await quantityInput.count()) > 0) {
    await quantityInput.fill(String(quantity ?? 1));
  }
  if (note) {
    await page.getByTestId("play-note-toggle").click();
    await expect(page.getByTestId("play-note")).toBeVisible({ timeout: 1000 });
    await page.getByTestId("play-note").fill(note);
  }
  const submitButton = page.getByTestId("play-submit");
  await expect(submitButton).toBeEnabled();
  const [response] = await Promise.all([
    page.waitForResponse((res) => {
      return (
        res.url().includes("/api/plays") &&
        res.request().method() === "POST"
      );
    }),
    submitButton.click(),
  ]);
  if (response.status() !== 201) {
    const body = await response.text();
    throw new Error(
      `createPlay failed: ${response.status()} ${body || "(empty)"}`
    );
  }
  await expect(page.getByTestId("play-success")).toBeVisible();
}

export async function confirmDay(page: Page) {
  await goResult(page);
  const confirmButton = page.getByTestId("result-confirm");
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();
  await page.getByRole("dialog").getByTestId("result-confirm-submit").click();
  await expect(page.getByTestId("result-status")).toHaveText(/確定済み/);
}
