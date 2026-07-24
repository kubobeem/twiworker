# twiworker 🐦

**Cloudflare Pages + Functions で動く Twitter/X クライアント**

クッキーベースの認証で Twitter 内部 API（GraphQL）にアクセスし、ツイートの投稿・削除・検索、タイムライン表示、DM送信、トレンド取得などをブラウザから操作できる Web アプリケーションです。

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen?style=flat-square&logo=cloudflare)](https://85eeed39.twiworker.pages.dev)
![GitHub](https://img.shields.io/github/license/kubobeem/twiworker?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Hono](https://img.shields.io/badge/Hono-4.7-orange?style=flat-square)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare)

---

## ✨ 機能一覧

| 機能 | 説明 |
|---|---|
| 📊 ダッシュボード | アカウント情報・接続状態・統計を一覧表示 |
| ✍️ ツイート投稿 | テキスト投稿・画像URL付き・スレッドモード対応 |
| 🗑️ ツイート削除 | ツイートID指定で削除 |
| 📰 タイムライン | ホームタイムラインの表示（20件） |
| 🔍 検索 | キーワード検索（Top / Latest / Media） |
| 👤 ユーザー情報 | ユーザー詳細・ツイート一覧の取得 |
| 📈 トレンド | 全世界・日本のトレンド表示 |
| ✉️ DM | ダイレクトメッセージの送信・一覧表示 |
| 📅 スケジュール | ツイートの予約投稿（D1保存） |
| ⚙️ 設定 | 接続状態・Cronジョブ手動実行・API一覧 |
| 🔄 スレッド投稿 | 複数ツイートを連続投稿（リプライチェーン） |
| 🚦 レート制限 | IPベースのリクエスト制限（KV使用） |

---

## 🏗 アーキテクチャ

```
twiworker/
├── public/               # 静的ファイル（HTML, CSS, JS）
│   ├── index.html        # SPA メインページ
│   ├── style.css         # ダークテーマUI（グラスモーフィズム）
│   ├── app.js            # 共通JS（ナビゲーション, API, トースト）
│   └── pages/            # 各ページJS
│       ├── dashboard.js
│       ├── compose.js
│       ├── timeline.js
│       ├── search.js
│       ├── dm.js
│       ├── schedule.js
│       ├── trends.js
│       └── settings.js
├── functions/            # Cloudflare Pages Functions
│   └── api/
│       ├── _middleware.ts # CORS ミドルウェア
│       └── [[route]].ts  # Hono へのcatch-allルーティング
├── src/                  # バックエンドTypeScript
│   ├── index.ts          # Hono アプリ（ルーティング定義）
│   ├── client.ts         # Twitter API クライアント（GraphQL）
│   ├── types.ts          # 型定義
│   ├── handlers/         # 機能別ハンドラー
│   │   ├── admin.ts      # ヘルスチェック・ステータス
│   │   ├── tweet.ts      # ツイート投稿・削除
│   │   ├── search.ts     # 検索
│   │   ├── timeline.ts   # タイムライン
│   │   ├── user.ts       # ユーザー情報
│   │   ├── trends.ts     # トレンド
│   │   ├── dm.ts         # DM送信・一覧
│   │   └── cron.ts       # スケジュール・クリーンアップ
│   ├── storage/          # データストア
│   │   ├── d1.ts         # D1 データベース操作
│   │   └── kv.ts         # KV ストア操作
│   └── middleware/        # ミドルウェア
│       └── ratelimit.ts  # レート制限
├── migrations/           # D1 マイグレーション
│   └── 0000_init.sql     # 初期テーブル定義
├── wrangler.toml          # Cloudflare 設定
└── package.json           # 依存関係・スクリプト
```

### 技術スタック

- **フロントエンド**: バニラJS（SPA）, CSS（グラスモーフィズム・ダークテーマ）
- **バックエンド**: TypeScript, [Hono](https://hono.dev/) フレームワーク
- **認証**: Twitter クッキーベース（グラフQL内部API）
- **ストレージ**: Cloudflare KV（レート制限）, Cloudflare D1（ログ・スケジュール）
- **デプロイ**: Cloudflare Pages + Functions

---

## 🚀 デプロイ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/kubobeem/twiworker.git
cd twiworker
npm install
```

### 2. Cloudflare リソースを作成

```bash
# KV 名前空間を作成
npx wrangler kv namespace create twiworker-kv
# → 出力された ID を wrangler.toml の [[kv_namespaces]] id に設定

# D1 データベースを作成
npx wrangler d1 create twiworker-db
# → 出力された ID を wrangler.toml の [[d1_databases]] database_id に設定

# マイグレーションを適用
npm run db:migrate
```

### 3. Twitter クッキーを取得

ブラウザで X（Twitter）にログイン後、DevTools の Application > Cookies から以下のクッキーを取得します：

- `auth_token`
- `ct0`
- `twid`
- `kdt`
- `lang`
- `_twitter_sess`

### 4. シークレットを設定

```bash
# JSON 形式でクッキーを設定
npx wrangler pages secret put TWITTER_COOKIES --project-name=twiworker
# ↑ auth_token, ct0, twid, kdt, lang, _twitter_sess をJSONにしたものを入力
```

または Cloudflare Pages のダッシュボード > twiworker > Settings > Environment variables から設定します。

### 5. デプロイ

```bash
npm run deploy
```

### 6. ローカル開発

```bash
# .dev.vars ファイルを作成して TWITTER_COOKIES を設定
echo '{"auth_token":"...","ct0":"..."}' > .dev.vars

# 開発サーバー起動
npm run dev
```

---

## 🔌 API エンドポイント一覧

### 管理系

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/health` | ヘルスチェック（KV/D1/Twitter状態） |
| GET | `/api/status` | 詳細ステータス（アカウント情報含む） |

### ツイート操作

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/tweet` | ツイート投稿 |
| POST | `/api/thread` | スレッド投稿（複数ツイート） |
| DELETE | `/api/tweet/:id` | ツイート削除 |

### 情報取得

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/timeline` | ホームタイムライン |
| GET | `/api/search?q=キーワード` | ツイート検索 |
| GET | `/api/user/:id` | ユーザー情報 |
| GET | `/api/user/:id/tweets` | ユーザーのツイート一覧 |
| GET | `/api/trends?woeid=1` | トレンド（1=全世界, 23424856=日本） |

### DM

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/dm` | DM一覧 |
| POST | `/api/dm` | DM送信 |

### Cron（HTTP経由の手動実行）

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/cron/trends` | トレンドをD1に保存 |
| POST | `/api/cron/scheduled-tweets` | 予約ツイートを実行 |
| POST | `/api/cron/cleanup` | 30日以上前のログを削除 |

---

## 🔑 環境変数・シークレット

| 変数 | 必須 | 説明 |
|------|------|------|
| `TWITTER_COOKIES` | ✅ | Twitter ログインクッキー（JSON） |
| `ACCOUNT_USERNAME` | 任意 | Twitter ユーザー名 |
| `SITE_URL` | 任意 | サイトURL（CORS用） |
| `ADMIN_API_KEY` | 任意 | 管理APIキー |

---

## 🔧 注意事項

- **GraphQL クエリID**: Twitter は定期的に内部 API のクエリIDをローテーションします。検索などが動かなくなった場合は `src/client.ts` の `ENDPOINTS` を [twikit](https://github.com/d60/twikit) の最新コードを参照して更新してください。
- **レート制限**: Twitter 内部 API に対する過剰なリクエストはアカウント停止のリスクがあります。適度に使用してください。
- **クッキーの有効期限**: `auth_token` や `ct0` のクッキーには有効期限があります。定期的な更新が必要です。

---

## 📝 ライセンス

MIT

---

## 🙏 クレジット

- [twikit](https://github.com/d60/twikit) - Python 版 Twitter クライアント（GraphQL エンドポイントの参考実装）
- [Hono](https://hono.dev/) - 軽量 Web フレームワーク
- [Cloudflare Pages](https://pages.cloudflare.com/) - サーバーレスホスティング
