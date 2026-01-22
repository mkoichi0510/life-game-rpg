# Life Game RPG - セットアップガイド

このガイドに従って、ローカル環境でプロジェクトを起動しましょう。

## 必要な環境

- **Node.js**: 24.11.0以上（**LTS 'Krypton'**）
- **pnpm**: 最新版
- **Docker**: 最新版
- **Docker Compose**: 最新版
- **mise**: 最新版（推奨）

バージョン確認：
```bash
node -v   # v24.11.0推奨
pnpm -v   # 最新版
docker -v
mise -v   # （オプション）
```

## ステップ 0: mise のインストール（推奨）

miseを使うと、Node.jsのバージョン管理が自動化されます。

### miseのインストール

**macOS / Linux:**
```bash
curl https://mise.run | sh

# または Homebrew
brew install mise
```

**セットアップ:**
```bash
# シェル設定に追加（bashの場合）
echo 'eval "$(mise activate bash)"' >> ~/.bashrc
source ~/.bashrc

# zshの場合
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
source ~/.zshrc
```

詳細は [mise公式ドキュメント](https://mise.jdx.dev/) を参照。

## ステップ 1: プロジェクトのセットアップ

### 1.1 GitHubリポジトリの作成（推奨）

1. GitHubにログイン
2. 新しいリポジトリを作成（例: `life-game-rpg`）
3. リポジトリのURLをコピー（例: `https://github.com/your-username/life-game-rpg.git`）

### 1.2 Gitの初期化とプッシュ

プロジェクトディレクトリで以下を実行：

```bash
# Gitリポジトリを初期化（init-git.shを使用）
chmod +x init-git.sh
./init-git.sh

# GitHubリポジトリと接続
git remote add origin https://github.com/your-username/life-game-rpg.git
git branch -M main
git push -u origin main
```

## ステップ 2: Node.jsのセットアップ

### 方法A: miseを使う場合（推奨）

```bash
# プロジェクトディレクトリでNode.jsを自動インストール
mise install

# バージョン確認
node -v  # v24.11.0
pnpm -v  # 最新版
```

### 方法B: 手動インストール

[Node.js公式サイト](https://nodejs.org/)から24.11.0以上をインストール

## ステップ 3: プロジェクトのセットアップ

### 方法A: miseタスクで一括セットアップ（最も簡単）

```bash
# 依存関係インストール → DB起動 → スキーマ適用 → シード投入まで自動実行
mise run setup
```

これだけで完了です！「ステップ 6」に進んでください。

### 方法B: 手動セットアップ

以下の手順を順番に実行：

#### 3.1 依存関係のインストール

```bash
pnpm install
```

#### 3.2 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local`ファイルが作成されます。デフォルト設定で問題ありません。

## ステップ 4: データベースの起動（手動セットアップの場合）

Dockerを使ってPostgreSQLを起動します：

```bash
pnpm docker:up
```

**確認方法:**

```bash
docker ps
```

`life-game-rpg-db`コンテナが起動していればOKです。

## ステップ 5: データベースの初期化（手動セットアップの場合）

### 5.1 スキーマをデータベースにプッシュ

```bash
pnpm db:push
```

これにより、`prisma/schema.prisma`に定義されたテーブルがPostgreSQLに作成されます。

### 5.2 Prisma Clientの生成

```bash
pnpm db:generate
```

これにより、TypeScriptから型安全にDBにアクセスできるようになります。

### 5.3 初期データの投入（シード）

```bash
pnpm db:seed
```

これにより、以下が作成されます：
- 「健康」カテゴリと5つのアクション
- 「資格・学習」カテゴリと5つのアクション
- 各カテゴリのスキルツリー
- 週ランク称号

## ステップ 6: 開発サーバーの起動

### 方法A: miseタスクを使う

```bash
mise run dev
```

### 方法B: pnpmスクリプトを使う

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開いてください。

「Life Game RPG」のページが表示されれば成功です！

## その他の便利なコマンド

### Prisma Studioでデータを確認

Prisma Studioは、データベースの内容を視覚的に確認・編集できるツールです。

**miseタスク:**
```bash
mise run db
```

**pnpmスクリプト:**
```bash
pnpm db:studio
```

ブラウザで http://localhost:5555 が開き、データベースの内容を確認できます。

## トラブルシューティング

### データベースに接続できない

```bash
# Dockerコンテナの状態を確認
docker ps

# コンテナが起動していない場合
pnpm docker:up

# コンテナを再起動
pnpm docker:down
pnpm docker:up
```

### Prismaの型が更新されない

```bash
# Prisma Clientを再生成
pnpm db:generate
```

### スキーマを変更した場合

```bash
# 開発環境では db:push を使用
pnpm db:push

# 本番環境では migration を使用
pnpm db:migrate
```

## 次のステップ

セットアップが完了したら、以下を実装していきます：

1. **プレイ登録機能** - カテゴリとアクションを選択してプレイを記録
2. **日次リザルト画面** - その日のXP/SPを確認し、確定する
3. **スキルツリー画面** - 称号を解放する
4. **週ランク表示** - 直近7日のパフォーマンスを確認

開発を始めましょう！🚀
