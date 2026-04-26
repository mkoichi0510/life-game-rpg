# Daily Confirmation Specification

> 詳細仕様。高位概要は [`./overview.md`](./overview.md) を参照。

## 1. エンティティ定義

`DailyResult`, `DailyCategoryResult`, `PlayerCategoryState` を扱う。スキーマ詳細は [`../play-log/spec.md`](../play-log/spec.md) §1 と [`docs/data-model.md`](../data-model.md) を参照。

| 状態 | 意味 |
|------|------|
| `DailyResult.status = 'draft'` | プレイ登録のみ。XP/SP 未確定 |
| `DailyResult.status = 'confirmed'` | 確定済み。`PlayerCategoryState` に累計加算済み |

## 2. API 設計

### エンドポイント一覧

| Method | Path | 用途 | 認証 |
|--------|------|------|------|
| GET | `/api/results/[dayKey]` | 当日リザルト取得（過去日の自動確定オプションあり） | 必須 |
| POST | `/api/results/[dayKey]/confirm` | 明示確定 | 必須 |

### `POST /api/results/[dayKey]/confirm`

**パスパラメータ**: `dayKey`（`YYYY-MM-DD`）

**リクエストボディ**: なし

**レスポンス（200）**: `{ "ok": true }`

**副作用**: 後述 `confirmDay` 参照

### `GET /api/results/[dayKey]`

**レスポンス（200）**:
```json
{
  "dailyResult": { "userId": "...", "dayKey": "...", "status": "draft", "confirmedAt": null },
  "categoryResults": [{ "categoryId": "...", "playCount": 3, "xpEarned": 30, "spEarned": 1 }]
}
```

過去日付かつ `status === 'draft'` の場合、環境変数で自動確定オプトインがあると `confirmDay` を実行する。

### バリデーション

スキーマ: `src/lib/validations/result.ts`

| スキーマ | フィールド | 制約 |
|---------|----------|------|
| `dayKeyParamSchema` | `dayKey` | `YYYY-MM-DD` 正規表現 + `isValidDate` |

## 3. ドメイン関数

### `confirmDay(userId, dayKey, options?)` — `src/lib/domains/confirm.ts`

**シグネチャ**:
```ts
async function confirmDay(
  userId: string,
  dayKey: string,
  options?: { allowAlreadyConfirmed?: boolean }
): Promise<DailyResult>
```

**処理順序（トランザクション内）**:

1. **未来日付チェック**: `dayKey > getTodayKey()` → `FutureDateError`
2. `DailyResult` を `(userId, dayKey)` で取得 or 作成
3. **既確定チェック**: `status === 'confirmed'` かつ `!allowAlreadyConfirmed` → `AlreadyConfirmedError`
4. その日の `DailyCategoryResult` 一覧を取得
5. 各 categoryResult に対して:
   - `xpEarned = calculateXpEarned(playCount, category.xpPerPlay)`
   - `spEarned = calculateSpFromXp(xpEarned, category.xpPerSp)`
   - `DailyCategoryResult.update`
   - `PlayerCategoryState.upsert`（`xpTotal += xpEarned`, `spUnspent += spEarned`）
6. `DailyResult.update`（`status = 'confirmed'`, `confirmedAt = now()`）

任意のステップで例外発生時は全ロールバック。

## 4. エラーハンドリング

| エラー | HTTP Status | code | 発生条件 |
|--------|-------------|------|---------|
| 認証エラー | 401 | `UNAUTHORIZED` | `requireUser()` 失敗 |
| バリデーションエラー | 400 | `VALIDATION_ERROR` | `dayKey` 形式不正 |
| 未来日付 | 422 | `FUTURE_DATE` | `FutureDateError`（`formatInvalidOperationError`） |
| 既確定 | 422 | `ALREADY_CONFIRMED` | `AlreadyConfirmedError` |
| 内部エラー | 500 | `INTERNAL_ERROR` | DB / トランザクション失敗 |

エラークラスは `src/lib/domains/errors.ts`、フォーマッタは `src/lib/validations/helpers.ts`。

## 5. 画面仕様

| 画面 | パス | 主要操作 |
|------|------|---------|
| リザルト | `src/app/(main)/result/page.tsx` | 確定ボタン押下 → API 呼び出し |

確定済み日付ではボタン非表示。確定成功時はトースト通知。

## 6. テスト戦略

- ユニット: `src/app/api/results/__tests__/confirm.test.ts`, `src/lib/domains/__tests__/confirm.test.ts`
- 重点カバー: 未来日付拒否 / 既確定拒否 / 当日許可 / 過去日許可 / `PlayerCategoryState` 累計加算の正確性 / トランザクションロールバック

## 更新履歴

| 日付 | 変更内容 | 関連 PR |
|------|---------|--------|
| 2026-04-26 | 初版（LIF-66） | — |
