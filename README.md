# Life Game RPG

人生の行動を「プレイ」として記録し、日次リザルトで確定してスキルポイント（SP）を獲得。カテゴリ別の称号・スキルツリーを成長させる **人生RPG型システム**。

## コンセプト

このプロジェクトは一般的な習慣化アプリではなく、**人生を攻略するゲーム体験**を提供します。

### 設計思想

- 意志力やモチベーションを前提にしない
- 毎日続けることを正解にしない
- 成果や結果ではなく「進んでいる状態」を評価する
- 停滞は失敗ではなく、ランク変動などの仕様として扱う

## 技術スタック

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 17 (Docker)
- **ORM**: Prisma 6
- **Runtime**: Node.js 24 (LTS) + pnpm
- **Bundler**: Turbopack (Next.js 16デフォルト)
- **Deploy**: Vercel (予定)

## 前提条件

- Node.js 24.11.0+ (LTS 'Krypton')
- pnpm
- Docker & Docker Compose
- mise (バージョン管理ツール、推奨)

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd life-game-rpg
```

### 2. Node.jsのセットアップ（miseを使用）

**miseがインストールされていない場合:**

```bash
# macOS/Linux
curl https://mise.run | sh

# または Homebrew
brew install mise
```

**Node.jsのインストール:**

```bash
# mise.tomlまたは.tool-versionsからNode.jsをインストール
mise install

# Node.jsバージョンの確認
node -v  # v24.11.0
```

**miseを使わない場合:**
- Node.js 20.9.0以上を手動でインストールしてください

### 3. 依存関係のインストール

```bash
pnpm install

# または mise taskを使用
mise run setup  # すべてのセットアップを自動実行
```

### 3. 環境変数の設定

```bash
cp .env.local.example .env.local
```

### 4. データベースの起動

```bash
pnpm docker:up
```

データベースが起動したことを確認：

```bash
docker ps
```

### 5. Prisma のセットアップ

データベーススキーマをプッシュ：

```bash
pnpm db:push
```

Prisma Client を生成：

```bash
pnpm db:generate
```

### 6. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開く

## 便利なコマンド

### mise tasks（推奨）

```bash
# プロジェクトの初期セットアップ（DB起動〜シードまで自動実行）
mise run setup

# 開発サーバー起動
mise run dev

# Prisma Studioの起動
mise run db
```

### データベース関連

```bash
# DBをDockerで起動
pnpm docker:up

# DBを停止
pnpm docker:down

# Prisma Studio（DBビューア）を起動
pnpm db:studio

# マイグレーションを作成・適用
pnpm db:migrate

# スキーマをDBにプッシュ（開発用）
pnpm db:push

# Prisma Clientを再生成
pnpm db:generate
```

### 開発

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# 本番サーバー起動
pnpm start

# Lint
pnpm lint
```

## プロジェクト構造

```
life-game-rpg/
├── docker/              # Docker設定
│   └── docker-compose.yml
├── prisma/              # Prisma設定・マイグレーション
│   └── schema.prisma
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # Reactコンポーネント
│   ├── lib/            # ユーティリティ・型定義
│   └── hooks/          # カスタムフック
├── .env.local.example  # 環境変数テンプレート
├── package.json
└── README.md
```

## Phase 1 実装対象

1. プレイ登録（テンプレ15アクション）
2. 日次リザルト（draft → confirmed）
3. カテゴリ別XP / SP反映
4. 健康カテゴリの称号（恒久＋週ランク）
5. 資格カテゴリの恒久称号ツリー

## データモデル

詳細は `prisma/schema.prisma` を参照。

主要なモデル：
- **Category**: カテゴリ管理
- **Action**: アクション定義
- **PlayLog**: プレイ記録
- **DailyResult**: 日次確定状態
- **PlayerCategoryState**: プレイヤーステータス
- **SkillTree / SkillNode**: 恒久称号ツリー
- **SeasonalTitle**: 週ランク称号

## ライセンス

Private Project
