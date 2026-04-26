# Action API Specification

> 詳細仕様。高位概要は [`./overview.md`](./overview.md) を参照。

## 1. エンティティ定義

### Action モデル（`prisma/schema.prisma`）

| フィールド | 型 | デフォルト | 役割 |
|----------|-----|-----------|------|
| `id` | String (CUID) | 自動 | 主キー |
| `categoryId` | String (FK) | — | 所属カテゴリ（Cascade） |
| `userId` | String (FK) | — | 所有ユーザー（Cascade） |
| `label` | String | — | 表示名（1〜50 文字） |
| `unit` | String? | `null` | 単位（任意、0〜20 文字） |
| `visible` | Boolean | `true` | 表示フラグ |
| `order` | Int | `0` | 表示順 |
| `createdAt` / `updatedAt` | DateTime | `now()` / 自動 | 監査 |

**インデックス**: `@@index([userId, categoryId, visible, order])`

**主要リレーション**: `User`, `Category`, `PlayLog[]`

データモデル全体は [`docs/data-model.md`](../data-model.md) を参照。

## 2. API 設計

### エンドポイント一覧

| Method | Path | 用途 | 認証 |
|--------|------|------|------|
| GET | `/api/actions` | 一覧取得 | 必須 |
| POST | `/api/actions` | 新規作成 | 必須 |

### `GET /api/actions`

**クエリパラメータ**:
- `categoryId`（必須、文字列）
- `visible`（任意、`true` で表示中のみ）

**ソート**: `order` 昇順 → `id` 昇順

**レスポンス（200）**:
```json
{
  "actions": [
    { "id": "...", "categoryId": "...", "label": "30分問題集", "unit": "回", "visible": true, "order": 0, "createdAt": "...", "updatedAt": "..." }
  ]
}
```

### `POST /api/actions`

**リクエスト**: `CreateActionInput`

```json
{
  "categoryId": "cat-...",
  "label": "30分問題集",
  "unit": "回",
  "visible": true,
  "order": 0
}
```

`unit`, `visible`, `order` は省略可。

**レスポンス（201）**: `{ "action": Action }`

### バリデーション

スキーマ: `src/lib/validations/action.ts`

| スキーマ | フィールド | 制約 |
|---------|----------|------|
| `getActionsQuerySchema` | `categoryId` | 1 文字以上、trim 必須 |
|  | `visible` | クエリ文字列 → boolean 変換（"true" → `true`） |
| `createActionSchema` | `categoryId` | 1 文字以上、trim |
|  | `label` | 1〜50 文字、trim |
|  | `unit` | 0〜20 文字、trim、空文字は `undefined` 化 |
|  | `visible` | boolean（省略時 `true`） |
|  | `order` | 整数（省略時 `0`） |

## 3. ビジネスロジック

- **categoryId 検証**: GET / POST で `requireCategory(userId, categoryId)` を呼び、所有権を確認。違反は 404
- **`unit` 空文字対応**: Zod の前処理で空文字は `undefined` に変換し、DB では `null` として保存
- **二段ソート**: `order` 昇順、`id` 昇順で安定。フロントの「並び順表示」前提
- **`visible` フィルタ**: 設定画面では全件、プレイ登録画面では `visible=true` を渡し UI から非表示にできる

## 4. エラーハンドリング

| エラー | HTTP Status | code | 発生条件 |
|--------|-------------|------|---------|
| 認証エラー | 401 | `UNAUTHORIZED` | `requireUser()` 失敗 |
| バリデーションエラー | 400 | `VALIDATION_ERROR` | クエリ・ボディ Zod エラー |
| 未検出 | 404 | `NOT_FOUND` | `requireCategory` で対象カテゴリなし |
| 内部エラー | 500 | `INTERNAL_ERROR` | DB エラー |

## 5. 画面仕様

| 画面 | パス | 主要操作 |
|------|------|---------|
| アクション管理 | `src/app/(main)/settings/actions/page.tsx` | カテゴリ選択 → 一覧 → 追加フォーム |

`ActionForm` は既存アクションの最大 `order + 1` を `defaultOrder` として算出。

## 6. テスト戦略

- ユニット: `src/app/api/actions/__tests__/route.test.ts`
- E2E: `e2e/action-management.spec.ts`
- 重点カバー: `categoryId` 欠落 / `label` 境界 / `unit` 空文字 / `order` 整数バリデーション / 404

## 更新履歴

| 日付 | 変更内容 | 関連 PR |
|------|---------|--------|
| 2026-04-26 | 初版（LIF-66） | — |
