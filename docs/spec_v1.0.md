## 1. コンセプト

人生の行動を「プレイ」として記録し、

日次リザルトで確定 → スキルポイント（SP）を獲得 →

カテゴリ別の称号・スキルツリーを成長させる **人生RPG型システム**。

本仕様では以下を重視する。

- 成長の即時フィードバック
- 中長期継続に耐える設計
- ユーザー主導（カスタマイズ前提）
- 停滞が「失敗」ではなく「仕様」になること

---

## 2. 基本ルール

### 2.1 プレイと経験値

- ユーザーは日中に「プレイ」を登録する
- 1プレイ = **該当カテゴリに +10XP（未確定）**
- プレイ時点ではステータスは変化しない

### 2.2 日次確定（重要）

- 1日の終わりに「今日を確定する」操作を行う
- 確定時にのみ XP / SP が反映される
- 確定後、その日の結果は再計算されない

### 2.3 XP / SP 変換

- 20XP = **1SP**
- SPは **カテゴリ別に管理**
- SPは **貯めておける**
- SPは **同一カテゴリでのみ使用可能**
- カテゴリ間でSPの移動は不可

---

## 3. カテゴリ設計

### 3.1 カテゴリの性質

- カテゴリはユーザーが自由に作成・編集・非表示可能
- 初期カテゴリはテンプレートにすぎない

### 3.2 Category データ

```tsx
Category {
  id: string
  name: string
  visible: boolean
  order: number
  rankWindowDays: number   // 週ランク判定期間（例：7）
  xpPerPlay: number        // 初期値：10
  xpPerSp: number          // 初期値：20
}
```

---

## 4. アクション（プレイ定義）

### 4.1 方針

- 各カテゴリに複数の「事前定義アクション（テンプレ）」を持つ
- アクションはユーザーが編集・非表示・削除可能
- プレイ登録時は「何をやったか」を必ず選択（任意メモ可）

### 4.2 Action データ

```tsx
Action {
  id: string
  categoryId: string
  label: string
  visible: boolean
}
```

---

## 5. プレイログ

### 5.1 PlayLog

```tsx
PlayLog {
  id: string
  at: string               // ISO datetime
  dayKey: string           // YYYY-MM-DD（ローカル）
  actionId: string
  note?: string
}
```

---

## 6. 日次リザルト（確定式の核）

### 6.1 DailyResult

```tsx
DailyResult {
  dayKey: string
  status: "draft" | "confirmed"
  confirmedAt?: string
}
```

### 6.2 DailyCategoryResult

```tsx
DailyCategoryResult {
  dayKey: string
  categoryId: string
  playCount: number
  xpEarned: number
  spEarned: number
  playLogIds: string[]
}
```

---

## 7. プレイヤーステータス（カテゴリ別）

```tsx
PlayerCategoryState {
  categoryId: string
  xpTotal: number        // 確定済み累計XP
  spUnspent: number     // 未使用SP
}
```

---

## 8. 成長表現：称号システム（二層構造）

### 8.1 恒久称号（到達型）

- カテゴリごとに一本道
- SPを消費して解放
- 一度解放したら失われない

```tsx
SkillTree {
  id: string
  categoryId: string
  name: string
  visible: boolean
  order: number
}

SkillNode {
  id: string
  treeId: string
  order: number
  title: string
  costSp: number
}

UnlockedNode {
  nodeId: string
  unlockedAt: string
}
```

---

### 8.2 週ランク称号（維持・変動型）

- **直近 N 日（例：7日）で獲得したSP合計**で自動判定
- SPは「使ったかどうか」は無関係
- やれば戻る / サボると落ちる

```tsx
SeasonalTitle {
  id: string
  categoryId: string
  label: string
  minSpEarned: number
  order: number
}
```

---

## 9. SP消費履歴（監査・振り返り用）

```tsx
SpendLog {
  id: string
  at: string
  categoryId: string
  type: "unlock_node"
  costSp: number
  refId: string          // nodeId
  dayKey?: string
}
```

---

## 10. UIフロー（実装前提）

### 日中

- プレイ登録（カテゴリ → アクション → 登録）
- 表示：`+10XP（未確定）`

### 夜

- 今日のリザルト（カテゴリ別 XP / SP）
- **[今日を確定する]** ボタン

### 確定後

- カテゴリ別SPが加算
- 該当カテゴリの称号ツリーで解放可能ノードがハイライト

---

## 11. 設計上の重要な制約

- 確定後に追加されたプレイは「翌日分」として扱う
- 確定済み DailyResult は再計算しない
- SPはカテゴリ外で使えない
- 称号解放と週ランク判定は完全に独立

---

## 12. 初期実装対象（Phase 1）

1. プレイ登録（テンプレ15アクション）
2. 日次リザルト（draft → confirmed）
3. カテゴリ別XP / SP反映
4. 健康カテゴリの称号（恒久＋週ランク）
5. 資格カテゴリの恒久称号ツリー

---

## 13. 拡張前提（将来DLC）

- XP/SP重み付け
- 分岐ツリー
- 月ランク称号
- 全体レベル（アカウントLv）
- 視覚演出（アニメーション/音）

---

## 14. 設計思想（レビュー時の前提共有）

- 継続できることより「触りたくなること」を優先
- 行動量ではなく「状態」を評価する
- 停滞は失敗ではなくランク変動という仕様
- 人生を“攻略対象”として扱う

---