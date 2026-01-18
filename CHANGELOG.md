# 変更履歴

## v0.1.0 - 2026年1月（初期リリース）

### プロジェクト初期化

**技術スタック:**
- **Next.js 16.1.3** (最新LTS)
- **React 19.0.0**
- **TypeScript 5.7.2**
- **Prisma 6.1.0**
- **PostgreSQL 17**
- **Turbopack** (デフォルトバンドラー)

**バージョン管理:**
- **mise** 対応（.tool-versions & mise.toml）
- Node.js 20.18.2 (LTS)

### Next.js 16の主要機能

#### 1. Turbopackがデフォルト
- 開発時のFast Refreshが5-10倍高速化
- ビルド時間が2-5倍高速化
- `--turbopack`フラグは不要（デフォルトで有効）

#### 2. 明示的なキャッシング
- `use cache`ディレクティブによる明示的なキャッシュ制御
- 予測可能なキャッシュ動作

#### 3. proxy.tsの導入
- `middleware.ts`は非推奨に
- ネットワーク境界を明確化
- Node.jsランタイム（Edgeは非サポート）

#### 4. React Compilerの安定化
- 自動メモ化により再レンダリングを削減
- `reactCompiler`設定が安定版に

#### 5. 改善されたルーティング
- レイアウトの重複排除
- インクリメンタルプリフェッチ
- より軽量で高速なナビゲーション

### 主要な依存パッケージ

**フロントエンド:**
- Next.js: `^16.1.3` ✨
- React: `^19.0.0`
- React DOM: `^19.0.0`
- Tailwind CSS: `^3.4.17`

**バックエンド・ORM:**
- Prisma: `^6.1.0`
- @prisma/client: `^6.1.0`

**開発ツール:**
- TypeScript: `^5.7.2`
- ESLint: `^9.17.0` (Flat Config)
- @eslint/eslintrc: `^3.2.0`

**インフラ:**
- PostgreSQL: `17-alpine`
- Docker Compose

### 設定ファイル

**Next.js:**
- `next.config.mjs` (ESモジュール形式)

**ESLint:**
- `eslint.config.mjs` (Flat Config形式)

**mise:**
- `.tool-versions` (asdf互換)
- `mise.toml` (タスク定義含む)

### 破壊的変更への対応

#### Next.js 16の主要な変更点

1. **Node.js最小バージョン**: 18.x → **20.9.0**
2. **middleware.ts → proxy.ts**: ネットワーク境界の明確化
3. **Turbopackがデフォルト**: webpackは`--webpack`フラグで使用可能
4. **async params/searchParams**: 必須に（App Router）

### セットアップ要件

**必須:**
- Node.js 20.9.0以上（20.18.2 LTS推奨）
- npm 10以上
- Docker & Docker Compose

**推奨:**
- mise（バージョン管理ツール）

### mise対応

プロジェクトは`mise`によるバージョン管理に対応しています：

```bash
# Node.jsのインストール
mise install

# プロジェクトセットアップ
mise run setup

# 開発サーバー起動
mise run dev

# Prisma Studio起動
mise run db
```

### データモデル

Prismaスキーマで定義された主要モデル：
- **Category**: カテゴリ管理
- **Action**: アクション定義
- **PlayLog**: プレイ記録
- **DailyResult**: 日次確定状態
- **DailyCategoryResult**: カテゴリ別日次結果
- **PlayerCategoryState**: プレイヤーステータス
- **SkillTree / SkillNode**: 恒久称号ツリー
- **SeasonalTitle**: 週ランク称号
- **SpendLog**: SP消費履歴

### 初期データ

シードデータ（`prisma/seed.ts`）：
- 健康カテゴリ + 5アクション
- 資格・学習カテゴリ + 5アクション
- 各カテゴリのスキルツリー（5段階）
- 週ランク称号（5段階）

### 参考リンク

- [Next.js 16 リリースノート](https://nextjs.org/blog/next-16)
- [Next.js 16.1 リリースノート](https://nextjs.org/blog/next-16-1)
- [React 19 リリースノート](https://react.dev/blog/2024/12/05/react-19)
- [Prisma 6 リリースノート](https://www.prisma.io/blog/prisma-6-ga)
- [mise ドキュメント](https://mise.jdx.dev/)

---

## 移行手順（既存プロジェクトから）

既存のNext.js 15以前のプロジェクトから移行する場合：

```bash
# 1. mise経由でNode.jsバージョン更新
mise install

# 2. 依存関係のクリーンインストール
rm -rf node_modules package-lock.json
npm install

# 3. Prisma Clientの再生成
npm run db:generate

# 4. middleware.tsがある場合はproxy.tsにリネーム
mv src/middleware.ts src/proxy.ts
# エクスポート名も変更: export function middleware → export function proxy

# 5. 開発サーバー起動
npm run dev
```
