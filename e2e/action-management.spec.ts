import { test, expect } from "@playwright/test";
import { resetDb, goSettings, goSettingsActions } from "./helpers";

test.beforeEach(() => {
  resetDb();
});

test.describe("アクション管理", () => {
  test("設定画面からアクション管理へ遷移できる", async ({ page }) => {
    await goSettings(page);

    await page.getByRole("link", { name: "アクション管理へ" }).click();
    await expect(page.getByRole("heading", { name: "アクション管理" })).toBeVisible();
  });

  test("カテゴリ選択でアクション一覧が表示される", async ({ page }) => {
    await goSettingsActions(page);

    // アクションがロードされるのを待つ
    await expect(page.getByTestId("action-item").first()).toBeVisible();

    // 最初のカテゴリ（資格・学習）のアクションが表示される
    // ※カテゴリはID昇順でソートされるため、certification-category が先に来る
    await expect(page.getByText("教材・参考書学習")).toBeVisible();

    // カテゴリを切り替えると、そのカテゴリのアクションが表示される
    await page.getByLabel("カテゴリ").selectOption({ label: "健康" });
    await expect(page.getByText("筋トレ（上半身）")).toBeVisible();
  });

  test("アクションを追加できる", async ({ page }) => {
    await goSettingsActions(page);

    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "アクションを追加" })).toBeVisible();

    await page.getByLabel("アクション名").fill("テストアクション");
    await page.getByLabel("単位").fill("回");

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/actions") && res.request().method() === "POST"
      ),
      page.getByRole("button", { name: "保存" }).click(),
    ]);

    expect(response.status()).toBe(201);
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByText("テストアクション")).toBeVisible();
  });

  test("アクション名が空の場合はエラーが表示される", async ({ page }) => {
    await goSettingsActions(page);

    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "保存" }).click();
    await expect(page.getByText("アクション名は必須です")).toBeVisible();
  });
});
