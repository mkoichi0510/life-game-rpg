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

#### ユニットテスト（Vitest）
- **実行コマンド**: `pnpm test:run`
- **配置**: 各モジュール内の `__tests__/` ディレクトリ
- **命名規則**: `*.test.ts`

#### E2Eテスト（Playwright）
- **実行コマンド**: `pnpm e2e`（UIモード: `pnpm e2e:ui`）
- **配置**: `e2e/` ディレクトリ
- **命名規則**:
  - `*.spec.ts`: 通常のE2Eテスト（Chromiumで実行）
  - `*.smoke.spec.ts`: スモークテスト（Chromium + WebKitで実行）
  - `*.mobile.spec.ts`: モバイルテスト（iPhone SE/14で実行）
- **セットアップ**: `SETUP.md` の「E2Eテスト（Playwright）」セクション参照

## Phase 1 実装状況

**✅ Phase 1 完了** - プロトタイプの基本機能が実装され、ユーザーテストを実施済み。

主な実装内容：
- カテゴリ/アクション管理API
- プレイログ記録・日次確定処理
- スキルツリー・ノード解放システム
- 週次ランク（SeasonalTitle）システム
- ホーム画面、プレイ登録画面、リザルト画面、スキルツリー画面
- E2Eテスト環境（Playwright）

---

## Phase 2 実装計画

**詳細**: `docs/phase2-plan.md` を参照

### 概要

Phase 1 プロトタイプのユーザーフィードバックに基づき、UX改善と新機能追加を行う。
フィードバックの深掘りにより、表面的な要望ではなく本質的な問題を特定し、解決策を設計。

### 本質的な問題と解決方針

| 当初の要望 | 本質的な問題 | 解決方針 |
|-----------|------------|---------|
| メモを折りたたみに | XPに「量」の概念がない | アクションに「単位」を追加 |
| カテゴリ選択を目立たせる | 操作階層が視覚的に表現されていない | ステップ形式のUI |
| 週ランクをスクロールせず見たい | ゲームライクなランクUIがない | Apex/LoL風のランク表示 |
| 週/昨日のサマリー | 「成果」のハイライトがない | 成果ハイライト機能 |

### 実装ロードマップ

| Wave | Issue | タイトル | 見積もり | 状態 |
|------|-------|---------|---------|------|
| 1 | #52 | データモデル拡張（単位・数量） | S | ⬜ |
| 1 | #53 | プレイ登録画面：数値入力UI | M | ⬜ |
| 1 | #54 | リザルト画面：数量表示 | S | ⬜ |
| 1 | #55 | メモ機能の折りたたみ化 | S | ⬜ |
| 2 | #56 | ランクカードコンポーネント | M | ⬜ |
| 2 | #57 | Top画面：ランクUI統合 | M | ⬜ |
| 2 | #58 | ランク詳細モーダル | S | ⬜ |
| 3 | #59 | ステップコンポーネント | M | ⬜ |
| 3 | #60 | スキルツリー画面リファクタ | L | ⬜ |
| 4 | #61 | 成果ハイライトAPI | M | ⬜ |
| 4 | #62 | 成果ハイライトUI | M | ⬜ |
| 5 | #63 | リザルト画面：日付ナビゲーション | M | ⬜ |
| 6 | #64 | 設定画面：基盤 | S | ⬜ |
| 6 | #65 | カテゴリ登録UI | M | ⬜ |
| 6 | #66 | アクション登録UI | M | ⬜ |
| 7 | #67 | NextAuth.js導入 | L | ⬜ |
| 7 | #68 | 既存モデルにuserId追加 | L | ⬜ |
| 7 | #69 | ログインUI | M | ⬜ |

### 見積もり凡例
- S: 小（1-2時間）
- M: 中（3-5時間）
- L: 大（6時間以上）

### 凡例
- ⬜ 未着手
- 🔄 PR作成済み（レビュー待ち）
- ✅ 完了（マージ済み）

---

## 作業完了時の必須アクション

タスク（Issue）の作業が完了したら、以下を必ず実行すること：

1. **ロードマップ更新**: 本ファイルの「Phase 1 実装ロードマップ」セクションの該当タスクの状態を更新
   - ⬜ → 🔄 PR #XX（PR作成時）
   - 🔄 → ✅ 完了（マージ時）

2. **Issue更新**: GitHub Issue をクローズ（PRマージ時に自動クローズされる場合は不要）

3. **ファイル同期**: AGENTS.md を更新した場合は、CLAUDE.md も同じ内容に更新
