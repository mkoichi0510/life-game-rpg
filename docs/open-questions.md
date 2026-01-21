# Open Questions

本ドキュメントは、spec_v1.0.md と実装の間で生じた未決定事項・曖昧な点を整理する。
各項目に推奨案を記載し、実装前にステークホルダーと合意を取ることを目的とする。

---

## 高優先度（Phase 1 実装に直接影響）

*全項目決定済み。「決定済み事項」セクションを参照。*

---

## 中優先度（Phase 1 設計に影響）

*全項目決定済み。「決定済み事項」セクションを参照。*

---

## 低優先度（将来検討）

| ID | 問題 | 詳細 | メモ |
|----|------|------|------|
| OQ-09 | マルチユーザー対応 | 現設計はシングルユーザー前提 | PlayLog等にuserId追加、認証システム導入が必要。Phase 2以降。 |
| OQ-10 | XP/SP重み付け | アクション難易度による係数 | spec 13章「拡張前提」に記載。Action モデルに weight フィールド追加で対応予定。 |
| OQ-11 | 分岐ツリー対応 | スキルツリーの分岐・複数パス | spec 13章記載。SkillNode に prerequisites（前提ノードID配列）追加で対応予定。Phase 1は一本道。 |
| OQ-12 | 月ランク称号 | 週ランクに加えて月単位の称号 | rankWindowDays を可変にすれば対応可能。SeasonalTitleの設計で吸収済み。 |
| OQ-13 | 全体レベル（アカウントLv） | カテゴリ横断の総合レベル | 新規モデル追加が必要。Phase 2以降で検討。 |

---

## 決定済み事項

以下は検討の結果、方針が決定した事項。

### 高優先度（OQ-01〜04）

| ID | 問題 | 決定内容 | 決定日 |
|----|------|----------|--------|
| OQ-01 | SP端数処理 | **切り捨て（0SP）** ただし将来の繰越方式への変更に備え、柔軟な設計を維持する | 2026-01-21 |
| OQ-02 | SkillNode解放順序 | **順序強制** order順に解放を強制 | 2026-01-21 |
| OQ-03 | タイムゾーン処理 | **Phase 1: サーバー固定（JST）** date-fns-tz使用を推奨 | 2026-01-21 |
| OQ-04 | 確定後プレイの翌日回し | **DailyResult.status === "confirmed" で判定** | 2026-01-21 |

### 中優先度（OQ-05〜08）

| ID | 問題 | 決定内容 | 決定日 |
|----|------|----------|--------|
| OQ-05 | シードデータ数不整合 | **10件でOK** spec の15件は目安であり、2カテゴリ×5=10件で問題なし | 2026-01-21 |
| OQ-06 | 永続化方針の差異 | **PostgreSQL採用** architecture.md に差異を明記済み | 2026-01-21 |
| OQ-07 | Category/Action削除の整合性 | **論理削除（visible=false）** 履歴を振り返れるようデータ保持 | 2026-01-21 |
| OQ-08 | 週ランク称号の更新タイミング | **Phase 1: 毎回計算** パフォーマンス問題発生時にキャッシュ化検討 | 2026-01-21 |

---

## 補足：OQ-01 SP端数処理の詳細

### 決定内容
**切り捨て方式を採用**するが、将来の繰越方式への変更に備えて柔軟な設計を維持する。

### Phase 1 実装（切り捨て）
- ユーザーが1日で19XP獲得（健康カテゴリ）
- 確定時: `spEarned = Math.floor(19 / 20) = 0`
- PlayerCategoryState.xpTotal += 19（累計には反映）
- PlayerCategoryState.spUnspent += 0

### 将来拡張への備え（繰越方式）

将来的に繰越方式に変更する場合の設計案：

```typescript
// SP計算ロジックを関数として分離し、切り替え可能にする
interface SpCalculationStrategy {
  calculate(xpEarned: number, xpPerSp: number, prevRemainder?: number): {
    spEarned: number;
    xpRemainder: number;
  };
}

// Phase 1: 切り捨て方式
const truncateStrategy: SpCalculationStrategy = {
  calculate: (xpEarned, xpPerSp) => ({
    spEarned: Math.floor(xpEarned / xpPerSp),
    xpRemainder: 0, // 繰越なし
  }),
};

// 将来: 繰越方式
const carryOverStrategy: SpCalculationStrategy = {
  calculate: (xpEarned, xpPerSp, prevRemainder = 0) => {
    const totalXp = xpEarned + prevRemainder;
    return {
      spEarned: Math.floor(totalXp / xpPerSp),
      xpRemainder: totalXp % xpPerSp,
    };
  },
};
```

**実装指針:**
- SP計算ロジックは関数として分離し、Strategy パターンで切り替え可能にする
- DailyCategoryResult に `xpRemainder` フィールドを将来追加できるよう、スキーマ変更を想定
- 繰越方式への移行時は、既存データのマイグレーション戦略が必要

---

## 補足：OQ-02 SkillNode解放順序の詳細

### 解放可能判定ロジック
```typescript
function canUnlock(nodeId: string): boolean {
  const node = await getNode(nodeId);
  const tree = await getTree(node.treeId);
  const category = await getCategory(tree.categoryId);
  const playerState = await getPlayerState(category.id);

  // SPが足りるか
  if (playerState.spUnspent < node.costSp) return false;

  // order=1 なら無条件で解放可能
  if (node.order === 1) return true;

  // 前のノードが解放済みか
  const prevNode = await getNodeByOrder(node.treeId, node.order - 1);
  const isUnlocked = await isNodeUnlocked(prevNode.id);

  return isUnlocked;
}
```

---

## 補足：OQ-04 確定後プレイの翌日回しロジック

### 処理フロー
```typescript
async function registerPlay(actionId: string, note?: string) {
  const now = new Date();
  const todayKey = formatDayKey(now); // "YYYY-MM-DD"

  // 今日のDailyResultを確認
  const todayResult = await getDailyResult(todayKey);

  let targetDayKey = todayKey;
  if (todayResult?.status === "confirmed") {
    // 確定済みなら翌日扱い
    targetDayKey = getNextDayKey(todayKey);
  }

  await createPlayLog({
    at: now,
    dayKey: targetDayKey,
    actionId,
    note,
  });
}
```

---

## 更新履歴

| 日付 | 更新内容 |
|------|----------|
| 2026-01-19 | 初版作成 |
| 2026-01-21 | OQ-01〜08 決定済みに移動、OQ-01 将来の繰越方式対応設計を追記 |
