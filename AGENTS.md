# AGENTS.md

このファイルは、Codex およびその他のエージェントがこのリポジトリで作業する際のガイダンスを提供します。

## ファイル同期について

> **重要**: `CLAUDE.md` と `AGENTS.md` は同一内容を維持する必要があります。
> いずれかのファイルを更新した場合は、もう一方のファイルも必ず同じ内容に更新してください。
>
> - `.claude/CLAUDE.md`: Claude Code 用ガイダンス
> - `AGENTS.md`: Codex / その他エージェント用ガイダンス

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

- **パッケージマネージャー**: pnpm を使用（npm は使用しない）
- **ディレクトリ構成**: `src/` 配下に `app/`, `components/`, `lib/` を配置
- **スタイリング**: Tailwind CSS 3.x + shadcn/ui を使用
- **データベース**: PostgreSQL + Prisma ORM
- **Phase 1 制限**: 認証なしのため、公開デプロイ厳禁（ローカル環境のみ）

## 実装済み機能

### Category API (`/api/categories`)

- **GET**: カテゴリ一覧取得（id昇順）
  - `?visible=true` で表示中のカテゴリのみフィルタ可能
- **POST**: カテゴリ新規作成

### Action API (`/api/actions`)

- **GET**: アクション一覧取得（order昇順 → id昇順）
  - `categoryId` 指定必須
  - `?visible=true` で表示中のアクションのみフィルタ可能
- **POST**: アクション新規作成

### 共通ユーティリティ

#### 日付処理 (`src/lib/date/`)
- `formatDayKey(date)`: Date → dayKey(YYYY-MM-DD)変換（JST基準）
- `getTodayKey()`: 今日のdayKeyを取得
- `getNextDayKey(dayKey)`: 翌日のdayKeyを取得
- `getRecentDayKeys(days)`: 直近N日分のdayKey配列を取得
- `parseDayKey(dayKey)`: dayKey → Date変換

#### XP/SP計算 (`src/lib/calculation/`)
- `calculateXpEarned(playCount, xpPerPlay)`: 獲得XP計算
- `calculateXpUntilNextSp(currentXp, xpPerSp)`: 次SP獲得までの必要XP
- `calculateXpProgressPercent(currentXp, xpPerSp)`: XP進捗率
- `calculateSpFromXp(xpEarned, xpPerSp)`: XPからSP算出
- `hasEnoughSp(spUnspent, costSp)`: SP残高判定

#### 定数 (`src/lib/constants/`)
- `XP_PER_PLAY`: 1プレイあたりのXP (10)
- `XP_PER_SP`: 1SP獲得に必要なXP (20)
- `DEFAULT_TIMEZONE`: タイムゾーン (Asia/Tokyo)

### バリデーション

- `src/lib/validations/` にzodスキーマを配置
- `category.ts`: カテゴリ作成用スキーマ
- `action.ts`: アクション作成・一覧取得用スキーマ
- `helpers.ts`: zodエラーをAPIレスポンス形式に変換するヘルパー

### テスト

- **フレームワーク**: Vitest
- **実行コマンド**: `pnpm test:run`
- テストファイルは `__tests__/` ディレクトリに配置

## Phase 1 実装ロードマップ

### AI-A 担当タスク（Core API Chain）

| Wave | Issue | タイトル | 状態 |
|------|-------|---------|------|
| 1 | #2 | Prismaスキーマ定義 | ✅ 完了 |
| 2 | #3 | シードデータ作成 | ✅ 完了 |
| 2 | #5 | Category API | ✅ 完了 |
| 3 | #6 | Action API | ✅ 完了 |
| 4 | #7 | PlayLog API | ✅ 完了 |
| 5 | #8 | DailyResult API | ⬜ |
| 6 | #9 | 日次確定API | ⬜ |
| 7 | #10 | PlayerState API | ⬜ |
| 9 | #17 | ホーム画面 | ⬜ |
| 11-12 | #21,#22 | 統合・E2E | ⬜ |

### AI-B 担当タスク（Infrastructure + UI）

| Wave | Issue | タイトル | 状態 |
|------|-------|---------|------|
| 1 | #4 | 共通ユーティリティ | ✅ 完了 |
| 1 | #15 | 共通UIコンポーネント | 🔄 PR #24 |
| 2 | #16 | レイアウト | ⬜ |
| 2 | #11 | SkillTree API | ⬜ |
| 4 | #13 | SeasonalTitle API | ⬜ |
| 5 | #18 | プレイ登録画面 | ⬜ |
| 6 | #19 | リザルト画面 | ⬜ |
| 8 | #12 | ノード解放API | ⬜ |
| 9 | #14 | SpendLog API | ⬜ |
| 10 | #20 | スキルツリー画面 | ⬜ |
| 11-12 | #21,#22 | 統合・E2E | ⬜ |

### 凡例
- ⬜ 未着手
- 🔄 PR作成済み（レビュー待ち）
- ✅ 完了（マージ済み）

## 作業完了時の必須アクション

タスク（Issue）の作業が完了したら、以下を必ず実行すること：

1. **ロードマップ更新**: 本ファイルの「Phase 1 実装ロードマップ」セクションの該当タスクの状態を更新
   - ⬜ → 🔄 PR #XX（PR作成時）
   - 🔄 → ✅ 完了（マージ時）

2. **Issue更新**: GitHub Issue をクローズ（PRマージ時に自動クローズされる場合は不要）

3. **ファイル同期**: AGENTS.md を更新した場合は、CLAUDE.md も同じ内容に更新
