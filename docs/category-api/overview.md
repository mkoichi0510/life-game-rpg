# Category API Overview

> 高位概要。詳細は [`./spec.md`](./spec.md) を参照。

## 1. 目的・背景

ユーザーが自由に「カテゴリ」を作成・管理できるカスタマイズ前提の設計を実現する。プレイログ・アクション・スキルツリー・週ランクなど、ほぼ全機能が `Category` を起点に紐づく中核エンティティ。

## 2. コンセプト / 設計思想

「人生 RPG 型システム」の基本単位。ユーザーの行動領域（例: 勉強・運動・読書）を抽象化し、それぞれに XP/SP の変換レート（`xpPerPlay`, `xpPerSp`）と週ランク判定期間（`rankWindowDays`）を持つ。デフォルト値は spec_v1.0 の基準（XP10, XP20=1SP, 7日）に従う。

## 3. スコープ

### 含む（Phase 1）
- カテゴリ CRUD（GET / POST / PATCH）
- 表示・非表示の切り替え（`visible`）
- 表示順序の管理（`order`）
- ユーザー単位の隔離（自分のカテゴリのみ操作可）

### 含まない（将来）
- カテゴリ削除（DELETE）API ※ Cascade を持つため要件確定後に追加
- カテゴリの並び替え専用 API（現状はフロント側で `order` を計算）
- カテゴリ単位の権限共有・公開

## 4. ユースケース / 主要フロー

- 設定画面でカテゴリ一覧を取得（`GET /api/categories`）
- 「追加」ボタンから新規カテゴリ作成（`POST /api/categories`）
- トグルで表示・非表示を切替（`PATCH /api/categories/[id]`）
- 他機能（Action / Play / SkillTree）は `categoryId` で本 API のリソースを参照

API シグネチャ・バリデーション・エラーは [`./spec.md`](./spec.md) を参照。

## 5. 設計上の重要制約

- 全リクエストで `requireUser()` による認証必須
- カテゴリは必ず `userId` でフィルタ（他ユーザーのカテゴリへアクセス不可）
- `xpPerPlay`, `xpPerSp`, `rankWindowDays` は 1 以上の整数（バリデーションで強制）
- `name` は 1〜50 文字（trim 後）

## 関連ドキュメント

- 詳細仕様: [./spec.md](./spec.md)
- 全体アーキテクチャ: [`docs/architecture.md`](../architecture.md)
- データモデル: [`docs/data-model.md`](../data-model.md)
- XP/SP 計算ロジック: [`docs/state-machine.md`](../state-machine.md)
- 全体仕様（v1.0）: [`docs/spec_v1.0.md`](../spec_v1.0.md)
