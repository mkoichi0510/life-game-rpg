# Play Log Overview

> 高位概要。詳細は [`./spec.md`](./spec.md) を参照。

## 1. 目的・背景

ユーザーの行動を「プレイ」として記録する中核機能。プレイログの作成・取得・削除を提供し、記録と同時に当日の `DailyResult` / `DailyCategoryResult` を upsert することで、未確定 XP/SP の即時表示を可能にする。

## 2. コンセプト / 設計思想

「成長の即時フィードバック」を実現するため、プレイ登録時に集計データもトランザクション内で更新する設計。日次確定（`/spec/daily-confirmation/`）はこの集計済みデータを `confirmed` 状態へ遷移させるだけで、二重計算を避ける。

確定済み日付に対するプレイ登録は **翌日へ自動繰り越し**（`getNextDayKey`）する。これは spec_v1.0 の「確定後は不変」の原則を守るための制約。

## 3. スコープ

### 含む（Phase 1）
- `POST /api/plays`（作成 + 集計 upsert）
- `GET /api/plays`（dayKey でフィルタ取得）
- `DELETE /api/plays/[id]`（未確定時のみ）

### 含まない（将来）
- プレイログの編集（PUT/PATCH）
- `quantity`（数量）を必須化した量重視ロジック（Phase 2: LIF-52〜LIF-54）
- バルク登録

## 4. ユースケース / 主要フロー

- プレイ登録画面でカテゴリ → アクション → 数量・備考を入力 → POST
- リザルト画面で当日のプレイログ一覧と未確定 XP/SP を表示（GET）
- 未確定日のプレイログを削除すると DailyCategoryResult が再計算される

確定処理は別機能（[`../daily-confirmation/overview.md`](../daily-confirmation/overview.md)）。

## 5. 設計上の重要制約

- POST はトランザクション内で `DailyResult` upsert → `PlayLog` create → `DailyCategoryResult` upsert を実行
- 既に `confirmed` の日付に対する POST は **翌日 dayKey** へ繰り越し（`getNextDayKey`）
- GET は `userId` で必ず絞り込む（横断アクセス不可）
- `dayKey` は `YYYY-MM-DD` 形式かつ実在日付（`isValidDayKey` でチェック）

## 関連ドキュメント

- 詳細仕様: [./spec.md](./spec.md)
- 日次確定: [`../daily-confirmation/overview.md`](../daily-confirmation/overview.md)
- 状態遷移・XP/SP 計算ロジック: [`docs/state-machine.md`](../state-machine.md)
- データモデル: [`docs/data-model.md`](../data-model.md)
- 全体仕様（v1.0）: [`docs/spec_v1.0.md`](../spec_v1.0.md)
