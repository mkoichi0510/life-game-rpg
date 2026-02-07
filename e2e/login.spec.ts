import { test, expect } from "@playwright/test";

test.describe("ログインページ", () => {
  test("ログインページが正しくレンダリングされる", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("ログインしてはじめる")).toBeVisible();
    await expect(
      page.getByText("Life Game RPG をもっと楽しむためにログインしましょう。")
    ).toBeVisible();
    await expect(page.getByTestId("login-github")).toBeVisible();
    await expect(page.getByTestId("login-github")).toHaveText(
      "GitHubでログイン"
    );
  });

  test("ログインページではHeader/BottomNavが非表示", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("ログインしてはじめる")).toBeVisible();
    await expect(
      page.getByRole("banner").getByText("Life Game RPG")
    ).not.toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "メインナビゲーション" })
    ).not.toBeVisible();
  });

  test("通常ページではHeader/BottomNavが表示される", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("banner").getByText("Life Game RPG")
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "メインナビゲーション" })
    ).toBeVisible();
  });
});
