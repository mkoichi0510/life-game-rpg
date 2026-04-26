# Skill Tree & Node Unlock Specification

> 詳細仕様。高位概要は [`./overview.md`](./overview.md) を参照。

## 1. エンティティ定義

### 主要モデル（`prisma/schema.prisma`）

| モデル | 主要フィールド | 制約・備考 |
|--------|--------------|-----------|
| `SkillTree` | `id`, `categoryId`, `userId`, `name`, `visible`, `order` | `@@index([userId, categoryId, visible, order])` |
| `SkillNode` | `id`, `treeId`, `userId`, `order`, `title`, `costSp` | `@@unique([userId, treeId, order])` |
| `UnlockedNode` | `id`, `nodeId`, `userId`, `unlockedAt` | `@@unique([userId, nodeId])`, `@@index([userId, unlockedAt])` |
| `SpendLog` | `id`, `at`, `categoryId`, `userId`, `type`, `costSp`, `refId`, `dayKey?` | `@@index([userId, categoryId, at])` |
| `PlayerCategoryState` | `id`, `categoryId`, `userId`, `xpTotal`, `spUnspent` | `categoryId` に `@unique` |

`SpendLog.type` は `unlock_node` 固定（定数 `SPEND_LOG_TYPE.UNLOCK_NODE`）、`refId` は `nodeId` を保持。

データモデル全体は [`docs/data-model.md`](../data-model.md) を参照。

## 2. API 設計

### エンドポイント一覧

| Method | Path | 用途 | 認証 |
|--------|------|------|------|
| GET | `/api/skills/trees` | カテゴリ配下のツリー一覧 | 必須 |
| GET | `/api/skills/nodes` | ツリー配下のノード一覧（解放状態付与） | 必須 |
| POST | `/api/skills/nodes/[id]/unlock` | ノード解放 | 必須 |

### `GET /api/skills/trees`

**クエリ**: `categoryId`（必須）, `visible`（任意）

**レスポンス（200）**:
```json
{ "trees": [{ "id": "...", "categoryId": "...", "name": "...", "visible": true, "order": 0, "createdAt": "...", "updatedAt": "..." }] }
```

### `GET /api/skills/nodes`

**クエリ**: `treeId`（必須）

**レスポンス（200）**:
```json
{
  "nodes": [
    { "id": "...", "treeId": "...", "order": 1, "title": "...", "costSp": 5, "isUnlocked": false, "unlockedAt": null, "createdAt": "...", "updatedAt": "..." }
  ]
}
```

`isUnlocked`, `unlockedAt` は `mapNodeWithUnlockStatus`（`src/lib/mappers/skillNode.ts`）が付与。

### `POST /api/skills/nodes/[id]/unlock`

**パスパラメータ**: `id`（nodeId）

**リクエストボディ**: なし

**レスポンス（200）**:
```json
{ "unlockedNode": { "id": "...", "nodeId": "...", "unlockedAt": "..." } }
```

副作用は後述の `unlockNode` を参照。

### バリデーション

スキーマ: `src/lib/validations/skill.ts`（共通ヘルパー `requiredId` を使用）

| スキーマ | 主なフィールド |
|---------|--------------|
| `skillTreesQuerySchema` | `categoryId`（必須） |
| `skillTreeIdParamSchema` | `id`（必須） |
| `skillNodesQuerySchema` | `treeId`（必須） |
| `skillNodeIdParamSchema` | `id`（必須） |

## 3. ドメイン関数

### `unlockNode(userId, nodeId)` — `src/lib/domains/skill.ts`

**シグネチャ**:
```ts
async function unlockNode(userId: string, nodeId: string): Promise<{
  unlockedNode: { id: string; nodeId: string; unlockedAt: Date };
  costSp: number;
  categoryId: string;
  treeId: string;
}>
```

**事前条件チェック（順序）**:
1. `SkillNode` 存在確認 → 失敗で `SkillNodeNotFoundError`
2. `UnlockedNode.length > 0` チェック → 既存で `AlreadyUnlockedError`
3. `PlayerCategoryState` 存在確認 → 失敗で `PlayerStateNotFoundError`
4. `spUnspent >= costSp` → 不足で `InsufficientSpError(required, available, nodeId)`
5. `order > 1` の場合、前ノード（`order - 1`）解放確認 → 失敗で `PrerequisiteNotMetError(prerequisiteNodeId)`

**トランザクション内処理（順序）**:
1. `PlayerCategoryState.update` で `spUnspent -= costSp`
2. `UnlockedNode.create`（`@@unique([userId, nodeId])` で並行重複防止）
3. `SpendLog.create`（`type=unlock_node`, `refId=nodeId`, `costSp`）

任意のステップで失敗時はトランザクション全ロールバック。

## 4. 状態計算 / マッパー

### `getSkillNodeState(node, previousNode, spUnspent)` — `src/lib/skills/skill-node-state.ts`

**戻り値**: `'locked' | 'unlockable' | 'unlocked'`

| 条件 | 結果 |
|------|------|
| `node.isUnlocked === true` | `unlocked` |
| `order === 1` かつ `spUnspent >= costSp` | `unlockable` |
| `order > 1` かつ前ノード解放済み かつ `spUnspent >= costSp` | `unlockable` |
| 上記以外 | `locked` |

### `mapNodeWithUnlockStatus(node)` — `src/lib/mappers/skillNode.ts`

`UnlockedNode[]` を集約し、API レスポンス用に `isUnlocked`（boolean）と `unlockedAt`（Date or null）を付与。

## 5. エラーハンドリング

| エラー | HTTP Status | code | 発生条件 |
|--------|-------------|------|---------|
| 認証エラー | 401 | `UNAUTHORIZED` | `requireUser()` 失敗 |
| バリデーションエラー | 400 | `VALIDATION_ERROR` | Zod エラー |
| ノード未検出 | 404 | `SKILL_NODE_NOT_FOUND` | `SkillNodeNotFoundError` |
| プレイヤーステート未検出 | 404 | `PLAYER_STATE_NOT_FOUND` | `PlayerStateNotFoundError` |
| 重複解放 | 400 | `ALREADY_UNLOCKED` | `AlreadyUnlockedError` |
| SP 不足 | 400 | `INSUFFICIENT_SP` | `InsufficientSpError`（`details: { required, available, nodeId }`） |
| 前提未達 | 400 | `PREREQUISITE_NOT_MET` | `PrerequisiteNotMetError`（`details: { prerequisiteNodeId }`） |
| 内部エラー | 500 | `INTERNAL_ERROR` | トランザクション失敗 |

エラーフォーマッタ: `src/lib/validations/helpers.ts`

## 6. 画面仕様

| 画面・コンポーネント | パス | 役割 |
|--------------------|------|------|
| スキルツリー画面 | `src/app/(main)/skills/page.tsx` | カテゴリ → ツリー → ノードの 3 ステップ統合 |
| ツリー表示 | `src/components/skills/skill-tree-view.tsx` | ノード配列を order 順表示、キーボード操作 |
| 解放ダイアログ | `src/components/skills/node-unlock-dialog.tsx` | コスト・現 SP・前提条件表示、解放実行 |

UI 設計指針は [`docs/design-system.md`](../design-system.md) と [`docs/ux-spec.md`](../ux-spec.md) を参照。

## 7. テスト戦略

- ユニット: `src/lib/domains/__tests__/skill.test.ts`, `src/lib/__tests__/skill-node-state.test.ts`
- UI: `src/components/skills/__tests__/skill-steps.test.tsx`
- 重点カバー:
  - 5 段階の事前条件チェックそれぞれの失敗ケース
  - 並行解放での `@@unique` による重複防止
  - SP 不足時の details 返却
  - 状態計算 6 ケース（解放済み / order=1 SP 充分・不足 / order>1 前解放有無 × SP 充分・不足）

## 更新履歴

| 日付 | 変更内容 | 関連 PR |
|------|---------|--------|
| 2026-04-26 | 初版（LIF-66） | — |
