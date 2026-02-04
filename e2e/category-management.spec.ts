import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers";

test.beforeEach(() => {
  resetDb();
});

test.describe("カテゴリ管理", () => {
  test("設定画面からカテゴリ管理へ遷移できる", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "設定" })).toBeVisible();

    await page.getByRole("link", { name: "カテゴリ管理へ" }).click();
    await expect(page.getByRole("heading", { name: "カテゴリ管理" })).toBeVisible();
  });

  test("カテゴリ一覧が表示される", async ({ page }) => {
    await page.goto("/settings/categories");
    await expect(page.getByRole("heading", { name: "カテゴリ管理" })).toBeVisible();

    // シードデータのカテゴリが表示されること
    await expect(page.getByText("健康")).toBeVisible();
    await expect(page.getByText("資格")).toBeVisible();
  });

  test("カテゴリを追加できる", async ({ page }) => {
    await page.goto("/settings/categories");
    await expect(page.getByRole("heading", { name: "カテゴリ管理" })).toBeVisible();

    // 追加ボタンをクリック
    await page.getByRole("button", { name: "追加" }).click();

    // ダイアログが表示されること
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "カテゴリを追加" })).toBeVisible();

    // フォームに入力
    await page.getByLabel("カテゴリ名").fill("テストカテゴリ");
    await page.getByLabel("XP/Play").clear();
    await page.getByLabel("XP/Play").fill("15");

    // 保存
    const [response] = await Promise.all([
      page.waitForResponse((res) =>
        res.url().includes("/api/categories") && res.request().method() === "POST"
      ),
      page.getByRole("button", { name: "保存" }).click(),
    ]);

    expect(response.status()).toBe(201);

    // ダイアログが閉じること
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // 新しいカテゴリが一覧に表示されること
    await expect(page.getByText("テストカテゴリ")).toBeVisible();
    await expect(page.getByText("XP/Play: 15")).toBeVisible();
  });

  test("カテゴリ名が空の場合はエラーが表示される", async ({ page }) => {
    await page.goto("/settings/categories");

    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // 名前を入力せずに保存をクリック
    await page.getByRole("button", { name: "保存" }).click();

    // バリデーションエラーが表示されること
    await expect(page.getByText("カテゴリ名は必須です")).toBeVisible();
  });

  test("設定に戻るリンクが機能する", async ({ page }) => {
    await page.goto("/settings/categories");
    await expect(page.getByRole("heading", { name: "カテゴリ管理" })).toBeVisible();

    await page.getByRole("link", { name: "設定に戻る" }).click();
    await expect(page.getByRole("heading", { name: "設定" })).toBeVisible();
  });
});
