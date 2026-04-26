# Skill Tree & Node Unlock Overview

> 高位概要。詳細は [`./spec.md`](./spec.md) を参照。

## 1. 目的・背景

確定後の SP（`PlayerCategoryState.spUnspent`）を消費して、カテゴリ別の「恒久称号（スキルツリー）」のノードを段階的に解放していく機能。RPG のスキルツリーに相当し、長期成長の可視化と動機付けを担う。

## 2. コンセプト / 設計思想

- **段階解放**: 各 `SkillTree` 内のノードは `order` で順序付けされ、前ノードを解放しないと次が解放できない（`PrerequisiteNotMetError`）
- **不可逆**: 一度解放したノードは取り消せない（`UnlockedNode` の複合一意制約で重複防止）
- **SP の追跡**: `SpendLog` で `type='unlock_node'` として履歴残し、カテゴリ別に集計可能
- **状態は 3 値**: UI では `locked` / `unlockable` / `unlocked` の 3 状態で表現（`getSkillNodeState`）

## 3. スコープ

### 含む（Phase 1）
- スキルツリー一覧取得（`GET /api/skills/trees`）
- ノード一覧取得（`GET /api/skills/nodes`、解放状態付与）
- ノード解放（`POST /api/skills/nodes/[id]/unlock`）
- UI: 3 ステップ操作（カテゴリ → ツリー → ノード）

### 含まない（将来）
- ノード解放の取り消し（refund）
- ツリー / ノードの管理 UI（admin）
- 横断スキルツリー（カテゴリをまたぐ）

## 4. ユースケース / 主要フロー

- スキル画面でカテゴリ → スキルツリー → ノードの順に選択
- 解放ダイアログで `costSp` と現状 SP、前提条件を表示 → 「解放」押下
- API が事前条件 5 段（ノード存在 / 重複 / PlayerState / SP / 前提）を順序検証 → トランザクションで `spUnspent` 減算 + `UnlockedNode` 作成 + `SpendLog` 作成
- 完了後、ツリー画面が状態を更新

API・エラー・UI 詳細は [`./spec.md`](./spec.md) を参照。

## 5. 設計上の重要制約

- **トランザクション原子性**: `PlayerCategoryState` decrement → `UnlockedNode` create → `SpendLog` create を 1 トランザクション。任意の失敗で全ロールバック
- **複合一意制約**: `UnlockedNode @@unique([userId, nodeId])` により同時並行 POST でも重複解放しない（DB レベル保証）
- **順序制約**: `order > 1` のノードは前ノード（`order - 1`）が解放済みでなければ `PrerequisiteNotMetError`
- **SP 不足検知**: `spUnspent < costSp` で `InsufficientSpError`（`required` / `available` を返却）
- **認証**: 全リクエストで `requireUser()` 必須

## 関連ドキュメント

- 詳細仕様: [./spec.md](./spec.md)
- 状態遷移ロジック: [`docs/state-machine.md`](../state-machine.md)
- データモデル: [`docs/data-model.md`](../data-model.md)
- UI 設計: [`docs/ux-spec.md`](../ux-spec.md), [`docs/design-system.md`](../design-system.md)
- 全体仕様（v1.0）: [`docs/spec_v1.0.md`](../spec_v1.0.md)
