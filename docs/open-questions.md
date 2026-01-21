# Open Questions

本ドキュメントは、spec_v1.0.md と実装の間で生じた未決定事項・曖昧な点を整理する。
各項目に推奨案を記載し、実装前にステークホルダーと合意を取ることを目的とする。

---

## 高優先度（Phase 1 実装に直接影響）

| ID | 問題 | 詳細 | 推奨案 | 根拠 |
|----|------|------|--------|------|
| OQ-01 | SP端数処理 | 19XP獲得時、0SP？繰越？ | **切り捨て（0SP）** | spec「20XP = 1SP」の記述は整数除算を示唆。繰越は状態管理を複雑化する。端数XPは累計XPに含まれるため損失感は軽減。 |
| OQ-02 | SkillNode解放順序 | 任意ノード解放可能？順序強制？ | **順序強制** | spec「一本道」の記述から、order順に解放を強制。次ノードはorder-1が解放済みの場合のみ解放可能。 |
| OQ-03 | タイムゾーン処理 | dayKeyはどのタイムゾーン基準？ | **Phase 1: サーバー固定（JST）** | シングルユーザー前提のため複雑なタイムゾーン処理は不要。将来的にユーザー設定で拡張。 |
| OQ-04 | 確定後プレイの翌日回し | 確定後に登録されたプレイの dayKey 判定 | **DailyResult.status === "confirmed" で判定** | 対象日のDailyResultがconfirmedなら、PlayLogのdayKeyは翌日を設定。at（実時刻）は登録時刻のまま。 |

---

## 中優先度（Phase 1 設計に影響）

| ID | 問題 | 詳細 | 推奨案 | 根拠 |
|----|------|------|--------|------|
| OQ-05 | シードデータ数不整合 | spec「テンプレ15アクション」vs 実装「10件」 | **要確認** | spec Phase 1 で「テンプレ15アクション」と記載。現シードは2カテゴリ×5=10件。追加カテゴリ（家事等）を検討するか、specの15は目安と解釈するか決定が必要。 |
| OQ-06 | 永続化方針の差異 | spec では IndexedDB 前提の記述あり | **PostgreSQL採用を明記** | 既にPrisma + PostgreSQLで実装済み。spec はクライアントサイド永続化を想定していた可能性があるが、Server Components/API Routesと組み合わせる現構成では PostgreSQL が適切。architecture.md に差異を明記する。 |
| OQ-07 | Category/Action削除の整合性 | 物理削除すると関連データが破壊される | **論理削除（visible=false）** | Prisma スキーマで onDelete: Cascade を設定済みだが、履歴の整合性のため visible=false による論理削除を基本とする。物理削除は管理機能として将来提供。 |
| OQ-08 | 週ランク称号の更新タイミング | 毎回計算？定期更新？キャッシュ？ | **Phase 1: 毎回計算** | データ量が少ないPhase 1では、直近N日のspEarnedをクエリで都度計算。パフォーマンス問題が出れば将来キャッシュ化。 |

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

| ID | 問題 | 決定内容 | 決定日 |
|----|------|----------|--------|
| - | - | - | - |

---

## 補足：OQ-01 SP端数処理の詳細

### シナリオ例
- ユーザーが1日で19XP獲得（健康カテゴリ）
- 確定時: `spEarned = Math.floor(19 / 20) = 0`
- PlayerCategoryState.xpTotal += 19（累計には反映）
- PlayerCategoryState.spUnspent += 0

### 代替案（繰越方式）
- DailyCategoryResult に `xpRemainder` フィールド追加
- 翌日の XP 計算時に前日の remainder を加算
- **不採用理由**: 状態管理が複雑化し、日次リザルトの独立性が失われる

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
