# Action API Overview

> 高位概要。詳細は [`./spec.md`](./spec.md) を参照。

## 1. 目的・背景

カテゴリ内の具体的な「プレイ可能な行動」を `Action` として定義し、ユーザー自身がカスタマイズできるようにする。プレイログ記録時の `actionId` 参照先となる。

## 2. コンセプト / 設計思想

カテゴリが「領域（勉強）」を表すのに対し、Action は「行動（30分問題集を解く）」を表す。`unit`（任意）を持たせることで「回」「分」「km」などの単位付き記録に拡張可能（Phase 2 ロードマップ）。Phase 1 では単純な `playCount` 集計を基本とする。

## 3. スコープ

### 含む（Phase 1）
- Action CRUD のうち GET（一覧）と POST（作成）
- `categoryId` 必須化によるスコープ強制
- `visible` / `order` の管理
- `unit` フィールド（空文字は `undefined` に変換）

### 含まない（将来）
- PATCH / DELETE
- `unit` を活用した quantity 必須化（Phase 2: LIF-52 〜 LIF-54）
- Action 単位の統計

## 4. ユースケース / 主要フロー

- 設定画面でカテゴリを選択 → そのカテゴリのアクション一覧を取得（`GET /api/actions?categoryId=...`）
- 新規アクション追加（`POST /api/actions`）
- プレイ登録画面では Category → Action の順でドリルダウン

API シグネチャ・バリデーションは [`./spec.md`](./spec.md) を参照。

## 5. 設計上の重要制約

- `categoryId` は GET / POST 双方で必須（クエリ・ボディ）
- `requireCategory(userId, categoryId)` で他ユーザーのカテゴリへの操作を 404 で防止
- `label` は 1〜50 文字、`unit` は 0〜20 文字（空文字は null 化）
- 一覧は `order` 昇順、同値は `id` 昇順で安定ソート

## 関連ドキュメント

- 詳細仕様: [./spec.md](./spec.md)
- カテゴリ API: [`../category-api/overview.md`](../category-api/overview.md)
- 全体アーキテクチャ: [`docs/architecture.md`](../architecture.md)
- データモデル: [`docs/data-model.md`](../data-model.md)
- 全体仕様（v1.0）: [`docs/spec_v1.0.md`](../spec_v1.0.md)
