import { test, expect } from "@playwright/test";
import { resetDb, goSettings, goSettingsCategories } from "./helpers";

test.beforeEach(() => {
  resetDb();
});

test.describe("カテゴリ管理", () => {
  test("設定画面からカテゴリ管理へ遷移できる", async ({ page }) => {
    await goSettings(page);

    await page.getByRole("link", { name: "カテゴリ管理へ" }).click();
    await expect(page.getByRole("heading", { name: "カテゴリ管理" })).toBeVisible();
  });

  test("カテゴリ一覧が表示される", async ({ page }) => {
    await goSettingsCategories(page);

    // シードデータのカテゴリが表示されること
    await expect(page.getByText("健康")).toBeVisible();
    await expect(page.getByText("資格")).toBeVisible();
  });

  test("カテゴリを追加できる", async ({ page }) => {
    await goSettingsCategories(page);

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
    await goSettingsCategories(page);

    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // 名前を入力せずに保存をクリック
    await page.getByRole("button", { name: "保存" }).click();

    // バリデーションエラーが表示されること
    await expect(page.getByText("カテゴリ名は必須です")).toBeVisible();
  });

  test("設定に戻るリンクが機能する", async ({ page }) => {
    await goSettingsCategories(page);

    await page.getByRole("link", { name: "設定に戻る" }).click();
    await expect(page.getByRole("heading", { name: "設定" })).toBeVisible();
  });

  test("カテゴリの表示/非表示を切り替えられる", async ({ page }) => {
    await goSettingsCategories(page);

    // 健康カテゴリの行を取得
    const healthRow = page.locator('[data-testid="category-item"]').filter({ hasText: "健康" });
    const toggle = healthRow.getByRole("switch");

    // 初期状態を確認（visibleはtrue）
    await expect(toggle).toBeChecked();

    // トグルをクリックして非表示に
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/categories/") && res.request().method() === "PATCH"
      ),
      toggle.click(),
    ]);

    expect(response.status()).toBe(200);
    await expect(toggle).not.toBeChecked();

    // ページをリロードしても状態が保持される
    await page.reload();
    await expect(page.getByRole("heading", { name: "カテゴリ管理" })).toBeVisible();
    const healthRowAfterReload = page
      .locator('[data-testid="category-item"]')
      .filter({ hasText: "健康" });
    await expect(healthRowAfterReload.getByRole("switch")).not.toBeChecked();
  });
});
