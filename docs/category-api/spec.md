# Category API Specification

> 詳細仕様。高位概要は [`./overview.md`](./overview.md) を参照。

## 1. エンティティ定義

### Category モデル（`prisma/schema.prisma`）

| フィールド | 型 | デフォルト | 役割 |
|----------|-----|-----------|------|
| `id` | String (CUID) | 自動 | 主キー |
| `userId` | String (FK) | — | 所有ユーザー（Cascade 削除） |
| `name` | String | — | カテゴリ名（1〜50 文字） |
| `visible` | Boolean | `true` | 表示フラグ |
| `order` | Int | `0` | 表示順 |
| `rankWindowDays` | Int | `7` | 週ランク判定期間（日） |
| `xpPerPlay` | Int | `10` | 1 プレイあたり XP |
| `xpPerSp` | Int | `20` | 1 SP に必要な XP |
| `createdAt` / `updatedAt` | DateTime | `now()` / 自動 | 監査 |

**インデックス**: `@@index([userId, visible, order])`

**主要リレーション**: `Action[]`, `DailyCategoryResult[]`, `PlayerCategoryState`, `SkillTree[]`, `SeasonalTitle[]`, `SpendLog[]`

データモデル全体は [`docs/data-model.md`](../data-model.md) と `prisma/schema.prisma` を参照。

## 2. API 設計

### エンドポイント一覧

| Method | Path | 用途 | 認証 |
|--------|------|------|------|
| GET | `/api/categories` | 一覧取得 | 必須 |
| POST | `/api/categories` | 新規作成 | 必須 |
| PATCH | `/api/categories/[id]` | 更新（visible 切替） | 必須 |

### `GET /api/categories`

**クエリパラメータ**:
- `visible=true`（任意）: `true` のカテゴリのみ取得

**ソート**: `id` 昇順

**レスポンス（200）**:
```json
{
  "categories": [
    { "id": "...", "userId": "...", "name": "勉強", "visible": true, "order": 0, "rankWindowDays": 7, "xpPerPlay": 10, "xpPerSp": 20, "createdAt": "...", "updatedAt": "..." }
  ]
}
```

### `POST /api/categories`

**リクエスト**: `CreateCategoryInput`

```json
{
  "name": "勉強",
  "visible": true,
  "order": 0,
  "rankWindowDays": 7,
  "xpPerPlay": 10,
  "xpPerSp": 20
}
```

`name` 以外は省略可（デフォルト適用）。

**レスポンス（201）**: `{ "category": Category }`

### `PATCH /api/categories/[id]`

**リクエスト**: `UpdateCategoryInput`

```json
{ "visible": false }
```

**レスポンス（200）**: `{ "category": Category }`

### バリデーション

スキーマ: `src/lib/validations/category.ts`

| スキーマ | フィールド | 制約 |
|---------|----------|------|
| `createCategorySchema` | `name` | 1〜50 文字、trim 後必須 |
|  | `visible` | boolean、省略時 `true` |
|  | `order` | 整数、省略時 `0` |
|  | `rankWindowDays` | 1 以上の整数、省略時 `7` |
|  | `xpPerPlay` | 1 以上の整数、省略時 `10` |
|  | `xpPerSp` | 1 以上の整数、省略時 `20` |
| `updateCategorySchema` | `visible` | boolean（任意） |
| `categoryIdParamSchema` | `id` | 1 文字以上 |

## 3. ビジネスロジック

- **ユーザー隔離**: `requireUser()` で取得した `userId` で必ず WHERE 句に追加
- **`visible` フィルタ**: クエリ `visible=true` 指定時のみ表示中カテゴリへ絞り込む。デフォルトは全件返却
- **デフォルト値の根拠**: `xpPerPlay=10`, `xpPerSp=20` は spec_v1.0 の基準（[`docs/spec_v1.0.md`](../spec_v1.0.md)）。`rankWindowDays=7` は週ランクの標準ウィンドウ
- **関連ヘルパー**: `src/lib/api/requireCategory.ts` — 他 API（Action / Play / SkillTree）でのカテゴリ所有権検証に使用

## 4. エラーハンドリング

| エラー | HTTP Status | code | 発生条件 |
|--------|-------------|------|---------|
| 認証エラー | 401 | `UNAUTHORIZED` | `requireUser()` 失敗 |
| バリデーションエラー | 400 | `VALIDATION_ERROR` | Zod エラー（`formatZodError`） |
| 未検出 | 404 | `NOT_FOUND` | PATCH 時、id 該当なし（`formatNotFoundError('カテゴリ', id)`） |
| 内部エラー | 500 | `INTERNAL_ERROR` | DB エラーなど（`formatInternalError`） |

エラーフォーマッタ: `src/lib/validations/helpers.ts`

## 5. 画面仕様

| 画面 | パス | 主要操作 |
|------|------|---------|
| カテゴリ管理 | `src/app/(main)/settings/categories/page.tsx` | 一覧表示・追加・visible トグル |

UI コンポーネント: `src/components/settings/category-form.tsx`（`CategoryForm`）。トースト通知で成否をフィードバック。

## 6. テスト戦略

- ユニット: `src/app/api/categories/__tests__/route.test.ts`, `src/app/api/categories/[id]/__tests__/route.test.ts`
- E2E: `e2e/category-management.spec.ts`
- 重点カバー: 認証 / `visible` フィルタ / バリデーション境界（`name` 51 文字、`xpPerPlay=0` 等） / 404 ハンドリング

## 更新履歴

| 日付 | 変更内容 | 関連 PR |
|------|---------|--------|
| 2026-04-26 | 初版（LIF-66） | — |
