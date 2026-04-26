# Play Log Specification

> 詳細仕様。高位概要は [`./overview.md`](./overview.md) を参照。

## 1. エンティティ定義

### 主要モデル（`prisma/schema.prisma`）

| モデル | 主要フィールド | 制約・備考 |
|--------|--------------|-----------|
| `PlayLog` | `id`, `at`, `dayKey`, `actionId`, `userId`, `quantity?`, `note?`, `createdAt` | `@@index([userId, dayKey])`, `@@index([userId, actionId])` |
| `DailyResult` | `[userId, dayKey]` 複合主キー, `status` (`draft`/`confirmed`), `confirmedAt?` | プレイ登録で upsert |
| `DailyCategoryResult` | `id`, `dayKey`, `categoryId`, `userId`, `playCount`, `xpEarned`, `spEarned` | `@@unique([userId, dayKey, categoryId])` |
| `PlayerCategoryState` | `id`, `categoryId`, `userId`, `xpTotal`, `spUnspent` | `categoryId` に `@unique` |

データモデル全体は [`docs/data-model.md`](../data-model.md)、状態遷移は [`docs/state-machine.md`](../state-machine.md) を参照。

## 2. API 設計

### エンドポイント一覧

| Method | Path | 用途 | 認証 |
|--------|------|------|------|
| GET | `/api/plays` | 一覧取得 | 必須 |
| POST | `/api/plays` | 新規記録 | 必須 |
| DELETE | `/api/plays/[id]` | 削除（未確定時のみ） | 必須 |

### `GET /api/plays`

**クエリパラメータ**:
- `dayKey`（必須、`YYYY-MM-DD`）
- `categoryId`（任意）

**レスポンス（200）**:
```json
{ "playLogs": [{ "id": "...", "at": "...", "dayKey": "2026-04-26", "actionId": "...", "quantity": 3, "note": "問題集 1.1", "createdAt": "..." }] }
```

### `POST /api/plays`

**リクエスト**: `CreatePlayInput`

```json
{ "actionId": "act-...", "quantity": 3, "note": "問題集 1.1" }
```

**レスポンス（201）**: `{ "playLog": PlayLog }`

**副作用**（トランザクション内）:
1. `DailyResult` を `(userId, dayKey)` で取得 or 作成
2. `confirmed` 状態なら `dayKey = getNextDayKey(dayKey)` で翌日に繰り越し
3. `PlayLog.create`
4. `DailyCategoryResult` を `(userId, dayKey, categoryId)` で upsert（`playCount += 1`、未確定 XP/SP 再計算）

### `DELETE /api/plays/[id]`

未確定日（`status === 'draft'`）の `PlayLog` を削除し、`DailyCategoryResult` を再計算。

**レスポンス（200）**: `{ "ok": true }`
**エラー**: 422（確定済み日付の削除）/ 404 / 401

### バリデーション

スキーマ: `src/lib/validations/play.ts`

| スキーマ | フィールド | 制約 |
|---------|----------|------|
| `getPlaysQuerySchema` | `dayKey` | `dayKeySchema`（YYYY-MM-DD + 実在チェック） |
|  | `categoryId` | 任意 |
| `createPlaySchema` | `actionId` | 必須、文字列 |
|  | `quantity` | 任意、1 以上の整数 |
|  | `note` | 任意、文字列 |
| `playIdParamSchema` | `id` | 必須 |

## 3. ビジネスロジック

- **集計の一貫性**: POST トランザクション内で `PlayLog` と `DailyCategoryResult` を同時更新。中途半端な状態を作らない
- **翌日繰り越し**: 確定済み日付への POST は `getNextDayKey` で `dayKey` を再計算（[`docs/state-machine.md`](../state-machine.md) §「確定後プレイの翌日回し」参照）
- **XP/SP の即時計算**: `DailyCategoryResult.xpEarned` は未確定段階で `calculateXpEarned(playCount, xpPerPlay)` を反映、`spEarned` は `calculateSpFromXp(xpEarned, xpPerSp)`
- **削除時の再計算**: DELETE は `playCount -= 1` と XP/SP の再算出を行う（確定済みは拒否）

### 関連ユーティリティ

- `src/lib/calculation/xp.ts` — `calculateXpEarned`, `calculateXpUntilNextSp`, `calculateXpProgressPercent`
- `src/lib/calculation/sp.ts` — `calculateSpFromXp`, `hasEnoughSp`
- `src/lib/date/day-key.ts` — `getTodayKey`, `getNextDayKey`, `getPreviousDayKey`, `isValidDayKey`, `parseDayKey`, `formatDayLabel`

## 4. エラーハンドリング

| エラー | HTTP Status | code | 発生条件 |
|--------|-------------|------|---------|
| 認証エラー | 401 | `UNAUTHORIZED` | `requireUser()` 失敗 |
| バリデーションエラー | 400 | `VALIDATION_ERROR` | Zod エラー |
| 確定済み削除 | 422 | `INVALID_OPERATION` | DELETE で `confirmed` 日付 |
| アクション未検出 | 404 | `NOT_FOUND` | `actionId` 該当なし |
| 内部エラー | 500 | `INTERNAL_ERROR` | DB エラー |

## 5. 画面仕様

| 画面 | パス | 主要操作 |
|------|------|---------|
| プレイ登録 | `src/app/(main)/play/page.tsx` | カテゴリ → アクション → 数量・備考入力 → POST |
| 当日リザルト | `src/app/(main)/result/page.tsx` | 当日プレイログ表示・未確定 XP/SP 表示・削除 |

UI 詳細は [`docs/ux-spec.md`](../ux-spec.md) §「プレイ画面」「リザルト画面」を参照。

## 6. テスト戦略

- ユニット: `src/app/api/plays/__tests__/route.test.ts`, `src/lib/calculation/__tests__/xp.test.ts`, `src/lib/calculation/__tests__/sp.test.ts`, `src/lib/date/__tests__/day-key.test.ts`
- 重点カバー: 認証 / dayKey 必須 / 確定済み日付の翌日繰り越し / 削除の再計算

## 更新履歴

| 日付 | 変更内容 | 関連 PR |
|------|---------|--------|
| 2026-04-26 | 初版（LIF-66） | — |
