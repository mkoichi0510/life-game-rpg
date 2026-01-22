# CLAUDE.md

このファイルは、Claude Code がこのリポジトリで作業する際のガイダンスを提供します。

## ドキュメント参照

このリポジトリで作業する際は、必ず `docs/` 配下のドキュメントを参照してください。

| ドキュメント | 内容 |
|-------------|------|
| `docs/architecture.md` | システムアーキテクチャ、技術スタック、ディレクトリ構成、API設計 |
| `docs/data-model.md` | データベーススキーマ、Prismaモデル定義、シードデータ |
| `docs/design-system.md` | UIコンポーネント設計、デザイントークン、shadcn/ui使用方針 |
| `docs/state-machine.md` | 状態遷移、日次確定処理、XP/SP計算ロジック |
| `docs/ux-spec.md` | 画面仕様、ユーザーフロー、インタラクション設計 |
| `docs/open-questions.md` | 未決定事項、検討中の設計判断 |

## 開発時の注意事項

- **ディレクトリ構成**: `src/` 配下に `app/`, `components/`, `lib/` を配置
- **スタイリング**: Tailwind CSS 3.x + shadcn/ui を使用
- **データベース**: PostgreSQL + Prisma ORM
- **Phase 1 制限**: 認証なしのため、公開デプロイ厳禁（ローカル環境のみ）

## 実装済み機能

### Category API (`/api/categories`)

- **GET**: カテゴリ一覧取得（id昇順）
  - `?visible=true` で表示中のカテゴリのみフィルタ可能
- **POST**: カテゴリ新規作成

### バリデーション

- `src/lib/validations/` にzodスキーマを配置
- `category.ts`: カテゴリ作成用スキーマ
- `helpers.ts`: zodエラーをAPIレスポンス形式に変換するヘルパー

### テスト

- **フレームワーク**: Vitest
- **実行コマンド**: `npm run test:run`
- テストファイルは `__tests__/` ディレクトリに配置
