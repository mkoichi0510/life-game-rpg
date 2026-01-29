# Phase 2 実装計画 - Life Game RPG 機能拡張

## 概要

Phase 1 プロトタイプのユーザーフィードバックに基づき、UX改善と新機能追加を行う。
フィードバックの深掘りにより、表面的な要望ではなく本質的な問題を特定し、より効果的な解決策を設計した。

## 当初の要望 vs 本質的な問題

| 当初の要望 | 本質的な問題 | 解決方針 |
|-----------|------------|---------|
| メモを折りたたみに | XPに「量」の概念がない | アクションに「単位」を追加 |
| カテゴリ選択を目立たせる | 操作階層が視覚的に表現されていない | ステップ形式のUI |
| 週ランクをスクロールせず見たい | ゲームライクなランクUIがない | Apex/LoL風のランク表示 |
| 週/昨日のサマリー | 「成果」のハイライトがない | 成果ハイライト機能 |

---

## 実装ロードマップ

### Wave 1: アクションの「単位」機能
**目的**: 「腹筋30回」と「腹筋100回」を区別できるようにする

### Wave 2: ゲームライクなランクUI
**目的**: Apex/LoLのようなランクシステムUIを実現

### Wave 3: スキルツリー画面のステップ形式化
**目的**: 操作階層（カテゴリ→ツリー→ノード）を視覚的に明示

### Wave 4: 成果ハイライト機能
**目的**: 最近の成果（スキル解放、ランクアップ）を表示

### Wave 5: 振り返り機能
**目的**: 過去のリザルトを閲覧可能に

### Wave 6: 管理機能（設定画面）
**目的**: カテゴリ/アクションの登録UI

### Wave 7: 認証・デプロイ（オプション）
**目的**: スマホでの利用、複数デバイス対応

---

## Issue一覧

詳細は各GitHub Issueを参照してください。

| Wave | Issue | タイトル | 見積もり |
|------|-------|---------|---------|
| 1 | #52 | データモデル拡張（単位・数量） | S |
| 1 | #53 | プレイ登録画面：数値入力UI | M |
| 1 | #54 | リザルト画面：数量表示 | S |
| 1 | #55 | メモ機能の折りたたみ化 | S |
| 2 | #56 | ランクカードコンポーネント | M |
| 2 | #57 | Top画面：ランクUI統合 | M |
| 2 | #58 | ランク詳細モーダル | S |
| 3 | #59 | ステップコンポーネント | M |
| 3 | #60 | スキルツリー画面リファクタ | L |
| 4 | #61 | 成果ハイライトAPI | M |
| 4 | #62 | 成果ハイライトUI | M |
| 5 | #63 | リザルト画面：日付ナビゲーション | M |
| 6 | #64 | 設定画面：基盤 | S |
| 6 | #65 | カテゴリ登録UI | M |
| 6 | #66 | アクション登録UI | M |
| 7 | #67 | NextAuth.js導入 | L |
| 7 | #68 | 既存モデルにuserId追加 | L |
| 7 | #69 | ログインUI | M |

### 見積もり凡例
- S: 小（1-2時間）
- M: 中（3-5時間）
- L: 大（6時間以上）

---

## 主要ファイル

| ファイル | Wave | 変更内容 |
|----------|------|----------|
| `prisma/schema.prisma` | 1 | Action.unit, PlayLog.quantity追加 |
| `src/app/play/page.tsx` | 1 | 数値入力UI追加、メモ折りたたみ |
| `src/app/result/page.tsx` | 1, 5 | 数量表示、日付ナビゲーション |
| `src/app/page.tsx` | 2, 4 | ランクUI、成果ハイライト、サマリー削除 |
| `src/components/home/rank-card.tsx` | 2 | 新規作成 |
| `src/components/home/achievement-highlights.tsx` | 4 | 新規作成 |
| `src/app/skills/page.tsx` | 3 | ステップ形式UI |
| `src/components/skills/skill-steps.tsx` | 3 | 新規作成 |
| `src/app/settings/page.tsx` | 6 | 新規作成 |

---

## 追加パッケージ

```bash
# Wave 1
npx shadcn@latest add collapsible

# Wave 2
npx shadcn@latest add tooltip dialog

# Wave 6
pnpm add react-hook-form @hookform/resolvers

# Wave 7
pnpm add next-auth@beta @auth/prisma-adapter
```

---

## 詳細な分析ドキュメント

深掘り分析の詳細は `/Users/machida_koichi/.claude/plans/greedy-sleeping-squid.md` を参照してください。
