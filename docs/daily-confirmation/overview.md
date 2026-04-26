# Daily Confirmation Overview

> 高位概要。詳細は [`./spec.md`](./spec.md) を参照。

## 1. 目的・背景

その日のプレイログを「確定」（`draft → confirmed`）し、`DailyCategoryResult` の XP/SP を `PlayerCategoryState` の累計に加算する処理。RPG における「日次セーブ」に相当し、以降そのデータは不変となる。

## 2. コンセプト / 設計思想

- **確定後は不変**: 一度 `confirmed` になった日付は再計算されない。誤りがあっても修正は別タスクとして扱う
- **未来日付の禁止**: 当日より未来は確定不可（`FutureDateError`）
- **二重確定の防止**: `AlreadyConfirmedError` で再確定を拒否（オプションで許可可）
- **トランザクション原子性**: XP/SP 計算と累計加算は 1 つのトランザクション内

## 3. スコープ

### 含む（Phase 1）
- `POST /api/results/[dayKey]/confirm` による明示確定
- `confirmDay()` ドメイン関数によるトランザクション処理
- `GET /api/results/[dayKey]` での状態取得（過去日の自動確定オプション含む）

### 含まない（将来）
- 確定済み日付の取り消し（unconfirm）
- バッチによる自動確定（cron）
- 確定通知・メール

## 4. ユースケース / 主要フロー

- リザルト画面で「日次確定」ボタンを押下 → `POST /api/results/[dayKey]/confirm`
- 確定後は当画面で確定済み表示、ボタン非表示
- `confirmDay` は SP の累計を `PlayerCategoryState.spUnspent` へ加算 → スキルツリーのノード解放原資となる

API シグネチャ・副作用順序は [`./spec.md`](./spec.md) を参照。

## 5. 設計上の重要制約

- 全リクエストで `requireUser()` 認証必須
- `dayKey` は `YYYY-MM-DD` + 実在日付チェック（`isValidDayKey`）
- 当日の `dayKey` は `getTodayKey()` 基準。未来は `FutureDateError`（422）
- 既確定の再確定は `AlreadyConfirmedError`（422）。`allowAlreadyConfirmed` オプションで上書き許可可
- トランザクション中の任意の失敗で全ロールバック（中途半端な累計加算を防ぐ）

## 関連ドキュメント

- 詳細仕様: [./spec.md](./spec.md)
- プレイログ: [`../play-log/overview.md`](../play-log/overview.md)
- 状態遷移: [`docs/state-machine.md`](../state-machine.md)
- データモデル: [`docs/data-model.md`](../data-model.md)
- 全体仕様（v1.0）: [`docs/spec_v1.0.md`](../spec_v1.0.md)
