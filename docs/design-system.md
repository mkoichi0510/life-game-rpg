# Design System

本ドキュメントは、Life Game RPG のデザインシステムを定義する。
shadcn/ui を活用した統一的なコンポーネント設計と、RPG感を演出するビジュアル仕様を記載する。

---

## 1. 設計思想

### 1.1 デザイン原則

| 原則 | 説明 | 実装への反映 |
|------|------|-------------|
| 日常RPG感 | 日常の行動をゲームのように楽しめる | XP/SP表示、称号システム、スキルツリー |
| 即時フィードバック | 行動が即座に反映される感覚 | プレイ登録時の+XPアニメーション、Toast通知 |
| 達成感の演出 | 小さな進捗も可視化して褒める | プログレスバー、バッジ、解放エフェクト |
| 軽量・高速 | ストレスなく使える | 最小限のアニメーション、Skeleton UI |

### 1.2 ビジュアルコンセプト

> 「日常を冒険に変える」

- **トーン**: ゲーミフィケーションを感じさせつつ、大人向けの落ち着いた配色
- **UI密度**: 情報を詰め込みすぎず、余白を活かしたレイアウト
- **アクセント**: XP獲得やノード解放時に控えめだが印象的な演出

---

## 2. 技術スタック

### 2.1 UI ライブラリ構成

| ライブラリ | 用途 | バージョン |
|-----------|------|-----------|
| shadcn/ui | UIコンポーネントベース | latest |
| Radix UI | アクセシブルなプリミティブ | shadcn/ui に内包 |
| Tailwind CSS | ユーティリティファーストCSS | 3.x（4.x安定版リリース後にアップグレード予定） |
| Lucide React | アイコン | latest |
| cva (class-variance-authority) | バリアント管理 | latest |
| clsx / tailwind-merge | クラス結合 | latest |

### 2.2 セットアップ手順

```bash
# shadcn/ui 初期化
npx shadcn@latest init

# 必要なコンポーネントをインストール
npx shadcn@latest add button card badge dialog progress skeleton sonner
```

### 2.3 必要コンポーネント一覧（Phase 1）

| コンポーネント | インストールコマンド | 用途 |
|---------------|---------------------|------|
| Button | `npx shadcn@latest add button` | 各種ボタン |
| Card | `npx shadcn@latest add card` | カテゴリカード、サマリー |
| Badge | `npx shadcn@latest add badge` | ステータス、称号表示 |
| Dialog | `npx shadcn@latest add dialog` | 確認ダイアログ |
| Progress | `npx shadcn@latest add progress` | SP進捗表示 |
| Skeleton | `npx shadcn@latest add skeleton` | ローディング |
| Sonner | `npx shadcn@latest add sonner` | Toast通知 |

---

## 3. デザイントークン

### 3.1 カラーパレット

#### ベースカラー（shadcn/ui デフォルト + 拡張）

```css
:root {
  /* shadcn/ui ベース */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 262 83% 58%;          /* 紫 - メインカラー */
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 45 93% 47%;            /* ゴールド - XP/報酬 */
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 262 83% 58%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 262 83% 68%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 45 93% 58%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 262 83% 68%;
}
```

#### カテゴリ別カラー

| カテゴリ | カラー | Hex | Tailwind クラス |
|---------|--------|-----|-----------------|
| 健康 | エメラルド | #10B981 | `text-emerald-500` `bg-emerald-500` |
| 資格・学習 | ブルー | #3B82F6 | `text-blue-500` `bg-blue-500` |
| 趣味 | パープル | #8B5CF6 | `text-violet-500` `bg-violet-500` |
| 仕事 | オレンジ | #F97316 | `text-orange-500` `bg-orange-500` |
| 生活 | ティール | #14B8A6 | `text-teal-500` `bg-teal-500` |

#### RPG特殊カラー

| 用途 | カラー | Hex | CSS変数 |
|------|--------|-----|---------|
| XP（未確定） | グレー | #9CA3AF | `--xp-pending` |
| XP（確定） | ゴールド | #FBBF24 | `--xp-confirmed` |
| SP | パープル | #8B5CF6 | `--sp` |
| 解放可能 | シアン | #06B6D4 | `--unlockable` |
| 解放済み | グリーン | #10B981 | `--unlocked` |

```css
:root {
  /* RPG拡張カラー */
  --xp-pending: 220 9% 63%;
  --xp-confirmed: 45 93% 56%;
  --sp: 262 83% 58%;
  --unlockable: 191 91% 43%;
  --unlocked: 160 84% 39%;
}
```

### 3.2 タイポグラフィ

#### フォント

```css
:root {
  --font-sans: "Inter", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
}
```

#### サイズスケール

| 名称 | サイズ | line-height | 用途 |
|------|--------|-------------|------|
| xs | 12px | 1.5 | 補助テキスト |
| sm | 14px | 1.5 | 本文（サブ） |
| base | 16px | 1.5 | 本文 |
| lg | 18px | 1.5 | リード文 |
| xl | 20px | 1.4 | 小見出し |
| 2xl | 24px | 1.3 | 中見出し |
| 3xl | 30px | 1.2 | 大見出し |
| 4xl | 36px | 1.2 | XP/SP数値表示 |

### 3.3 スペーシング

4px を基準単位とする Tailwind デフォルトに準拠。

| トークン | 値 | 用途 |
|----------|-----|------|
| 1 | 4px | 最小間隔 |
| 2 | 8px | アイコンとテキスト |
| 3 | 12px | コンパクト間隔 |
| 4 | 16px | 標準間隔 |
| 6 | 24px | セクション間 |
| 8 | 32px | カード間 |
| 12 | 48px | 大セクション間 |

### 3.4 角丸（Border Radius）

shadcn/ui の `--radius` 変数を基準とする。

| 名称 | 値 | Tailwind | 用途 |
|------|-----|----------|------|
| none | 0 | `rounded-none` | - |
| sm | calc(var(--radius) - 4px) | `rounded-sm` | バッジ |
| default | var(--radius) | `rounded-md` | ボタン、入力 |
| lg | calc(var(--radius) + 4px) | `rounded-lg` | カード |
| xl | calc(var(--radius) + 8px) | `rounded-xl` | ダイアログ |
| full | 9999px | `rounded-full` | アバター、アイコン |

### 3.5 シャドウ

| レベル | 値 | 用途 |
|--------|-----|------|
| sm | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | ホバー状態 |
| default | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | カード |
| md | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | ドロップダウン |
| lg | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | モーダル |
| xl | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | 強調カード |

### 3.6 トランジション

| 名称 | Duration | Easing | 用途 |
|------|----------|--------|------|
| fast | 150ms | ease-out | ホバー、フォーカス |
| normal | 200ms | ease-out | 一般的なアニメーション |
| slow | 300ms | ease-in-out | フェードイン/アウト |
| xp-pop | 400ms | cubic-bezier(0.34, 1.56, 0.64, 1) | XP獲得ポップ |

```css
:root {
  --transition-fast: 150ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-slow: 300ms ease-in-out;
  --transition-xp-pop: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 4. コンポーネントマッピング

### 4.1 shadcn/ui コンポーネント対応表

| UX Spec 要件 | shadcn/ui | カスタマイズ内容 |
|-------------|-----------|----------------|
| Button | Button | RPGバリアント（`confirm`, `xp`）追加 |
| Card | Card | カテゴリ別ボーダーカラー対応 |
| Badge | Badge | ステータス/週ランク用バリアント |
| Dialog | Dialog | 確認ダイアログ用ラッパー |
| Toast | Sonner | XP獲得通知、解放通知用設定 |
| ProgressBar | Progress | SP進捗表示用スタイル |
| Skeleton | Skeleton | データ取得中の表示 |

### 4.2 画面固有コンポーネント

#### ホーム画面（`/`）

| コンポーネント | 説明 |
|---------------|------|
| `TodayStats` | 今日のプレイ数・未確定XP表示 |
| `CategorySummaryCard` | カテゴリ別の進捗サマリー |
| `QuickActionButtons` | プレイ登録・確定へのショートカット |

#### プレイ登録画面（`/play`）

| コンポーネント | 説明 |
|---------------|------|
| `CategorySelector` | カテゴリ選択UI |
| `ActionList` | アクション一覧 |
| `PlayForm` | メモ入力・登録フォーム |
| `PlaySuccessFeedback` | 登録成功時のフィードバック |

#### リザルト画面（`/result`）

| コンポーネント | 説明 |
|---------------|------|
| `ResultSummary` | 合計プレイ数・XP・SP表示 |
| `CategoryBreakdown` | カテゴリ別内訳テーブル |
| `PlayLogList` | プレイログ一覧 |
| `ConfirmDialog` | 確定確認ダイアログ |

#### スキルツリー画面（`/skills`）

| コンポーネント | 説明 |
|---------------|------|
| `SkillTreeView` | ツリー全体のコンテナ |
| `SkillNode` | 個別ノード表示 |
| `SeasonalTitleBadge` | 週ランク称号バッジ |
| `NodeUnlockDialog` | 解放確認ダイアログ |

---

## 5. カスタムスタイル定義

### 5.1 globals.css

```css
@import "tailwindcss";

/* shadcn/ui ベース変数 */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 262 83% 58%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 45 93% 47%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 262 83% 58%;
  --radius: 0.5rem;

  /* RPG拡張 */
  --xp-pending: 220 9% 63%;
  --xp-confirmed: 45 93% 56%;
  --sp: 262 83% 58%;
  --unlockable: 191 91% 43%;
  --unlocked: 160 84% 39%;

  /* トランジション */
  --transition-fast: 150ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-slow: 300ms ease-in-out;
  --transition-xp-pop: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 262 83% 68%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 45 93% 58%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 262 83% 68%;

  /* RPG拡張（ダークモード） */
  --xp-pending: 220 9% 53%;
  --xp-confirmed: 45 93% 66%;
}

/* ベーススタイル */
* {
  @apply border-border;
}

body {
  @apply bg-background text-foreground;
  font-feature-settings: "rlig" 1, "calt" 1;
}

/* XPポップアニメーション */
@keyframes xp-pop {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }
  50% {
    transform: translateY(-5px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-xp-pop {
  animation: xp-pop var(--transition-xp-pop) forwards;
}

/* パルスアニメーション（解放可能ノード） */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 hsl(var(--unlockable) / 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px hsl(var(--unlockable) / 0);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* フェードイン */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in var(--transition-slow) forwards;
}
```

### 5.2 tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // RPG拡張カラー
        xp: {
          pending: "hsl(var(--xp-pending))",
          confirmed: "hsl(var(--xp-confirmed))",
        },
        sp: "hsl(var(--sp))",
        skill: {
          unlockable: "hsl(var(--unlockable))",
          unlocked: "hsl(var(--unlocked))",
        },
        // カテゴリカラー
        category: {
          health: "#10B981",
          learning: "#3B82F6",
          hobby: "#8B5CF6",
          work: "#F97316",
          life: "#14B8A6",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "xp-pop": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.9)" },
          "50%": { transform: "translateY(-5px) scale(1.05)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--unlockable) / 0.4)" },
          "50%": { boxShadow: "0 0 0 8px hsl(var(--unlockable) / 0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "xp-pop": "xp-pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-in": "fade-in 300ms ease-in-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 6. レスポンシブデザイン

### 6.1 ブレークポイント

| 名称 | 幅 | Tailwind | 主な用途 |
|------|-----|----------|----------|
| mobile | < 640px | (default) | スマートフォン |
| sm | >= 640px | `sm:` | 大型スマートフォン |
| md | >= 768px | `md:` | タブレット（縦） |
| lg | >= 1024px | `lg:` | タブレット（横）、小型PC |
| xl | >= 1280px | `xl:` | デスクトップ |

### 6.2 レイアウトパターン

#### ナビゲーション

```tsx
// モバイル: 下部タブバー
// デスクトップ: サイドバー

<nav className="fixed bottom-0 left-0 right-0 lg:left-0 lg:top-0 lg:bottom-0 lg:w-64">
  {/* ナビゲーションコンテンツ */}
</nav>
```

#### カードグリッド

```tsx
// モバイル: 1列
// タブレット以上: 2列

<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
  {categories.map((category) => (
    <CategorySummaryCard key={category.id} category={category} />
  ))}
</div>
```

#### スキルツリー

```tsx
// モバイル: 縦スクロール
// デスクトップ: 横配置

<div className="flex flex-col space-y-4 lg:flex-row lg:space-x-8 lg:space-y-0">
  {nodes.map((node) => (
    <SkillNode key={node.id} node={node} />
  ))}
</div>
```

### 6.3 タッチターゲット

| 要素 | 最小サイズ | 間隔 |
|------|-----------|------|
| ボタン | 44px × 44px | 8px |
| リスト項目 | 48px (高さ) | 4px |
| アイコンボタン | 44px × 44px | 8px |

---

## 7. アクセシビリティ

### 7.1 コントラスト比

WCAG AA準拠（4.5:1以上）を目標とする。

| 組み合わせ | コントラスト比 | 判定 |
|-----------|---------------|------|
| foreground / background | 15.8:1 | OK |
| primary / primary-foreground | 4.6:1 | OK |
| muted-foreground / background | 4.5:1 | OK |
| accent / accent-foreground | 4.8:1 | OK |

### 7.2 フォーカス管理

```css
/* フォーカスリング */
.focus-visible:focus-visible {
  @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
}
```

### 7.3 ARIAラベル例

```tsx
// プレイ登録ボタン
<Button aria-label="プレイを記録する">
  プレイを記録
</Button>

// 解放可能ノード
<button
  aria-label="習慣化の兆し（解放可能、3SP必要）"
  aria-pressed={false}
  className="animate-pulse-glow"
>
  習慣化の兆し
</button>

// 確定状態バッジ
<Badge role="status" aria-live="polite">
  {status === "draft" ? "未確定" : "確定済み"}
</Badge>

// 進捗バー
<Progress
  value={progress}
  aria-label={`SP獲得まであと${remaining}XP`}
/>
```

### 7.4 スキルツリーのアクセシビリティ

スキルツリー（`SkillTreeView`、`SkillNode`）は複雑なインタラクティブUIのため、追加のアクセシビリティ対応が必要。

#### キーボードナビゲーション

```tsx
// SkillTreeView: ツリー全体のキーボード操作
<div
  role="tree"
  aria-label="スキルツリー"
  onKeyDown={(e) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        focusNextNode();
        break;
      case "ArrowLeft":
      case "ArrowUp":
        focusPrevNode();
        break;
      case "Enter":
      case " ":
        if (canUnlock) unlockNode();
        break;
    }
  }}
>
  {nodes.map((node) => (
    <SkillNode key={node.id} node={node} />
  ))}
</div>

// SkillNode: 個別ノードのARIA属性
<div
  role="treeitem"
  aria-selected={isSelected}
  aria-disabled={!canUnlock}
  aria-describedby={`${node.id}-description`}
  tabIndex={isSelected ? 0 : -1}
>
  <span id={`${node.id}-description`} className="sr-only">
    {node.title}、{isUnlocked ? "解放済み" : canUnlock ? `解放可能、${node.costSp}SP必要` : "解放不可"}
  </span>
</div>
```

#### フォーカス管理

- フォーカスは常に1つのノードにのみ表示
- Tab キーでツリー全体に入る/出る
- 矢印キーでノード間を移動
- 解放後はフォーカスを維持し、状態変化をアナウンス

```tsx
// 解放成功時のアナウンス
<div aria-live="polite" className="sr-only">
  {justUnlocked && `${node.title}を解放しました`}
</div>
```

#### `prefers-reduced-motion` 対応

```css
/* アニメーション無効化 */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-glow,
  .animate-xp-pop,
  .animate-fade-in {
    animation: none;
  }

  /* 解放可能状態は静的なスタイルで表示 */
  .skill-node-unlockable {
    outline: 2px solid hsl(var(--unlockable));
    outline-offset: 2px;
  }
}
```

---

## 8. コンポーネントディレクトリ構造

```
src/components/
├── ui/                    # shadcn/ui ベースコンポーネント
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── dialog.tsx
│   ├── progress.tsx
│   ├── skeleton.tsx
│   └── sonner.tsx
├── home/                  # ホーム画面固有
│   ├── today-stats.tsx
│   ├── category-summary-card.tsx
│   └── quick-action-buttons.tsx
├── play/                  # プレイ登録固有
│   ├── category-selector.tsx
│   ├── action-list.tsx
│   ├── play-form.tsx
│   └── play-success-feedback.tsx
├── result/                # リザルト固有
│   ├── result-summary.tsx
│   ├── category-breakdown.tsx
│   ├── play-log-list.tsx
│   └── confirm-dialog.tsx
├── skills/                # スキルツリー固有
│   ├── skill-tree-view.tsx
│   ├── skill-node.tsx
│   ├── seasonal-title-badge.tsx
│   └── node-unlock-dialog.tsx
└── layout/                # 共通レイアウト
    ├── header.tsx
    ├── navigation.tsx
    └── page-container.tsx
```

---

## 9. 実装ガイドライン

### 9.1 コンポーネント作成パターン

```tsx
// src/components/home/category-summary-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategorySummaryCardProps {
  category: {
    id: string;
    name: string;
    color: string;
    todayPlays: number;
    pendingXp: number;
    totalXp: number;
    unspentSp: number;
    weeklyRank: string;
  };
  className?: string;
}

export function CategorySummaryCard({
  category,
  className
}: CategorySummaryCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* カテゴリカラーのアクセント */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: category.color }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{category.name}</CardTitle>
          <Badge variant="secondary">{category.weeklyRank}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm">
          <p>{category.todayPlays}回 / +{category.pendingXp} XP</p>
          <p className="text-muted-foreground">
            累計: {category.totalXp} XP / SP: {category.unspentSp}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 9.2 バリアント定義パターン（cva使用）

```tsx
// src/components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // RPG拡張バリアント
        confirm: "bg-emerald-600 text-white hover:bg-emerald-700",
        xp: "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 hover:from-amber-500 hover:to-yellow-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

### 9.3 ローディング状態パターン

```tsx
// スケルトンUIの使用例
import { Skeleton } from "@/components/ui/skeleton";

function CategorySummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </CardContent>
    </Card>
  );
}

// 使用例
function CategorySummarySection() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <CategorySummaryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {categories.map((category) => (
        <CategorySummaryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
```

### 9.4 Toast通知パターン

```tsx
// src/lib/toast.ts
import { toast } from "sonner";

export const showXpGained = (xp: number) => {
  toast.success(`+${xp} XP`, {
    description: "プレイを記録しました",
    duration: 3000,
  });
};

export const showSpGained = (sp: number) => {
  toast.success(`+${sp} SP 獲得！`, {
    description: "日次確定が完了しました",
    duration: 4000,
  });
};

export const showNodeUnlocked = (nodeName: string) => {
  toast.success("称号を獲得！", {
    description: nodeName,
    duration: 4000,
  });
};

export const showError = (message: string) => {
  toast.error("エラー", {
    description: message,
    duration: 5000,
  });
};
```

---

## 10. 実装チェックリスト

### Phase 1 必須項目

- [ ] shadcn/ui 初期化（`npx shadcn@latest init`）
- [ ] 必須コンポーネントのインストール
- [ ] globals.css にデザイントークン定義
- [ ] tailwind.config.ts にカスタムカラー・アニメーション追加
- [ ] 共通UIコンポーネント
  - [ ] Button（confirm, xpバリアント追加）
  - [ ] Card
  - [ ] Badge
  - [ ] Dialog
  - [ ] Progress
  - [ ] Skeleton
  - [ ] Sonner設定
- [ ] ホーム画面コンポーネント
  - [ ] TodayStats
  - [ ] CategorySummaryCard
  - [ ] QuickActionButtons
- [ ] プレイ登録コンポーネント
  - [ ] CategorySelector
  - [ ] ActionList
  - [ ] PlayForm
- [ ] リザルトコンポーネント
  - [ ] ResultSummary
  - [ ] CategoryBreakdown
  - [ ] PlayLogList
  - [ ] ConfirmDialog
- [ ] スキルツリーコンポーネント
  - [ ] SkillTreeView
  - [ ] SkillNode
  - [ ] SeasonalTitleBadge
- [ ] レスポンシブ対応（mobile / tablet / desktop）
- [ ] アクセシビリティ基本対応（ARIAラベル、コントラスト）

### Phase 2 以降

- [ ] ダークモード切り替え機能
- [ ] カスタムテーマ設定
- [ ] 高度なアニメーション（レベルアップ演出など）
- [ ] グラフ/チャートコンポーネント（統計画面用）
- [ ] 設定画面用コンポーネント

---

## 更新履歴

| 日付 | 更新内容 |
|------|----------|
| 2026-01-22 | 初版作成 |
