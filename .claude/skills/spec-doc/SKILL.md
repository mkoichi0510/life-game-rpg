---
name: spec-doc
description: 機能仕様書（overview.md + spec.md）を `docs/[feature]/` に半自動生成・更新する。`/spec-doc` で直近の `git diff` から自動ドラフト、`/spec-doc <feature名>` でゼロから作成、`/spec-doc <feature名> --update` で既存更新。templates/ を雛形に使用。
---

# spec-doc Skill

機能ごとの仕様書を `docs/[feature]/overview.md`（高位概要）+ `docs/[feature]/spec.md`（詳細仕様）のセットでドラフト生成する。AI ドラフト + ユーザー承認の HITL ワークフロー。

## トリガー条件

- ユーザーが `/spec-doc` を実行した時
- ユーザーが「仕様書作って」「この機能の overview と spec を書いて」等と依頼した時
- コード変更後にドキュメント更新が必要だと判断した時（CLAUDE.md の方針に従う）

## 前提条件

- `life-game-rpg` リポジトリ内で実行
- `docs/` ディレクトリが存在
- このスキルと同階層の `references/template-overview.md` と `references/template.md` を雛形として使用

## 実行手順

### Step 1: 引数判定とモード分岐

ユーザー入力から以下のパターンを判定する:

- `/spec-doc` （引数なし） → **モード A: コード変更ドラフト**
- `/spec-doc <feature名>` → 既存 `docs/<feature名>/` の有無で分岐
  - 存在しない → **モード B: 依頼ゼロ生成**
  - 存在する → ユーザーに更新意図を確認 → **モード C: 既存更新**
- `/spec-doc <feature名> --update` → **モード C: 既存更新**（強制）

`<feature名>` は kebab-case を必須とする（例: `category-api`, `play-log`, `daily-confirmation`, `skill-tree-node-unlock`）。バリデーションに失敗したら、推奨スラッグを提案して再入力を求める。

### Step 2A: コード変更ドラフトモード

1. `git diff origin/main...HEAD --name-only` で変更ファイル一覧を取得
2. 変更ファイルのパスから feature を推定:
   - `src/app/api/<X>/` → スラッグ候補 `<X>-api`（例: `categories` → `category-api`）
   - `src/lib/domains/<X>.ts` → スラッグ候補 `<X>` または関連 API 名
   - `prisma/schema.prisma` 変更のみ → ユーザーに対象 feature を確認
3. 推定したスラッグを `AskUserQuestion` で確認（複数候補があれば選択肢提示）
4. 既存 `docs/<feature>/` があれば Step 2C へ、なければ Step 2B 相当のゼロ生成だが「差分内容のみ反映する」モード

### Step 2B: 依頼ゼロ生成モード

1. 関連コードを以下のパスから網羅収集:
   - `src/app/api/<feature>/` または `src/app/api/<keyword>/`（feature 名から推測）
   - `src/lib/validations/<keyword>.ts`
   - `src/lib/domains/<keyword>.ts`
   - `src/lib/<関連>` （計算ロジック・ヘルパー）
   - `src/app/(main)/<対応UI>/`
   - `prisma/schema.prisma`（関連モデルを抽出）
   - 既存テスト `**/__tests__/<keyword>*.test.ts`
2. このスキルの `references/template-overview.md` を読み込み、収集した情報で `{{...}}` プレースホルダを埋めてドラフト
3. `references/template.md` も同様に埋める
4. 該当しない章は「該当する場合」マーカーごと削除（テンプレ過剰を避ける）

### Step 2C: 既存更新モード

1. 既存 `docs/<feature>/overview.md` + `spec.md` を Read で読込
2. 関連コードの現状を Glob/Grep で再収集（Step 2B と同様の範囲）
3. **既存仕様 vs コード現状の差分** を抽出:
   - API シグネチャの追加・変更・削除
   - エラーコードの追加・削除
   - データモデルのフィールド追加・削除
   - ビジネスロジックの変更
4. 差分のみを既存仕様の該当箇所にマージ提案。**既存の章立て・記述スタイル・参照リンクは保持**
5. 「更新履歴」表に新しい行を追加（日付・変更内容・関連 PR があれば PR 番号）

### Step 3: プレビューとユーザー承認

1. 生成または更新したドラフトを以下のフォーマットで表示:
   ```
   ## docs/<feature>/overview.md (新規 / 更新)
   <ドラフト全文>

   ---

   ## docs/<feature>/spec.md (新規 / 更新)
   <ドラフト全文>
   ```
2. `AskUserQuestion` で承認を得る（選択肢: 「書き込む」/「修正指示」/「キャンセル」）
3. 「修正指示」を選んだ場合、ユーザーの追加指示を受けてドラフト再生成

### Step 4: ファイル書込

1. 承認されたら、ディレクトリ未作成なら `mkdir -p docs/<feature>/` し、`Write` で 2 ファイルを書込
2. CLAUDE.md / AGENTS.md の「実装済み機能」表に該当 feature の行があれば、API シグネチャの差分を反映する追記提案を出す（自動書込はしない）

### Step 5: 後始末

1. 生成したパスを `git status` で確認し、変更行数の概算を表示
2. 「次のアクション候補」を提示:
   - PR を作成するなら `git add docs/<feature>/ && git commit ...` の例示
   - レビューしたいなら `/genshijin-review docs/<feature>/spec.md` 等の代替案
3. **コミットや push は実行しない**（ユーザーが明示的に依頼した時のみ）

## 使い方

| パターン | 例 | 動作 |
|---------|-----|------|
| コード変更ドラフト | `/spec-doc` | `git diff` から feature 推定 → ドラフト生成 |
| ゼロ生成 | `/spec-doc category-api` | 既存なし → コード網羅 → 雛形にゼロ生成 |
| 既存更新 | `/spec-doc category-api --update` | 既存 docs を読込 → コード差分を反映して更新 |
| スラッグ補正 | `/spec-doc Category API` | バリデーション失敗 → `category-api` を提案して再入力要求 |

## ルール

- **ユーザー承認なしに `docs/` へ書き込まない**: Step 3 のプレビュー → 承認を必ず経由
- **既存フラット構成 docs を保護**: `docs/architecture.md`, `docs/data-model.md`, `docs/design-system.md`, `docs/state-machine.md`, `docs/ux-spec.md`, `docs/spec_v1.0.md`, `docs/open-questions.md`, `docs/phase2-plan.md` は読込専用。これらを編集する依頼は別タスクとして拒否する
- **CLAUDE.md / AGENTS.md 同期**: もし「実装済み機能」表の更新提案を採用する場合、両ファイルに同じ変更を提案する
- **テンプレ過剰回避**: 該当しない章はテンプレから削除し、空の章は残さない
- **重複排除**: data-model.md / design-system.md など既存 docs に詳細がある場合、spec.md ではリンク参照に留め、再記述しない
- **コミット・push は手動**: このスキルはファイル生成のみ。Git 操作はユーザー指示後

## 検証フィードバック

### 2026-04-26 初回検証（5 feature ドラフト生成）

**対象**: `category-api`, `action-api`, `play-log`, `daily-confirmation`, `skill-tree-node-unlock`

**得た所見と SKILL.md / テンプレートへの反映**:

1. **テンプレ過剰**: 詳細仕様テンプレ（`references/template.md`）の「画面仕様」「状態遷移」章は CRUD 系機能では空になりやすい。テンプレ側に `> 該当する場合のみ記述` のマーカーは入っているので、Skill 本文 Step 2B 末尾「該当しない章は削除」を堅持
2. **既存 docs への参照集中化が有効**: `data-model.md`, `state-machine.md`, `ux-spec.md`, `design-system.md` への相対リンク多用で冗長な再記述を避けられた。spec.md 側で「詳細は `../<file>.md` を参照」スタイルが定着 → ルール「重複排除」を継続
3. **feature 間相互リンクの追加が必要**: `play-log` と `daily-confirmation` のように密結合な機能では関連 feature の overview/spec へリンクを貼るのが自然。`references/template-overview.md` の「関連ドキュメント」枠で他 feature リンクを例示する形に拡張する
4. **エラー表のフォーマット確定**: 「エラー / HTTP Status / code / 発生条件」の 4 列が運用しやすかった。`references/template.md` §5 のフォーマットを推奨形式として固定
5. **更新履歴の最低限化**: 初版時点で更新履歴は `日付 / 変更内容 / 関連 PR` の 1 行のみで十分。PR 番号は確定後に追記する運用とする

**未対応 / 次回検証で確認したい項目**:

- モード A（コード変更ドラフト）の自動 feature 推定精度（複数 feature にまたがる差分でどう振り分けるか）
- モード C（既存更新）で「変更箇所のみ」をきれいに反映できるか（既存記述の保護精度）
- CLAUDE.md / AGENTS.md の「実装済み機能」表との同期提案ロジック
