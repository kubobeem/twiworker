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
├── public/               # 静的ファイル（SPA）
│   ├── index.html        # メインページ
│   ├── style.css         # ダークテーマUI
│   ├── app.js            # 共通JS（ナビゲーション, API, トースト）
│   └── pages/            # ページ別JS（8ページ）
├── functions/api/        # Cloudflare Pages Functions
│   ├── _middleware.ts    # CORS
│   └── [[route]].ts     # Honoへルーティング
├── src/                  # バックエンド TypeScript
│   ├── index.ts          # Hono アプリ・ルーティング
│   ├── client.ts         # Twitter GraphQL API クライアント
│   ├── types.ts          # 型定義
│   ├── handlers/         # 機能別ハンドラー（8ファイル）
│   ├── storage/          # D1 / KV ストア
│   └── middleware/       # レート制限
├── migrations/
│   └── 0000_init.sql     # D1 テーブル定義
├── wrangler.toml
└── package.json
```

### スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | バニラJS（SPA） + CSS（ダークテーマ・グラスモーフィズム） |
| バックエンド | TypeScript + [Hono](https://hono.dev/) |
| 認証 | Twitter クッキーベース（内部 GraphQL API） |
| ストレージ | Cloudflare KV（レート制限）+ D1（ログ・スケジュール） |
| ホスティング | Cloudflare Pages + Functions |

---

## 🚀 1からのデプロイ手順

必要になるもの:
- Cloudflare アカウント（無料でOK）
- Twitter/X アカウント（ログイン済みのブラウザ）

### 1. リポジトリをクローン

```bash
git clone https://github.com/kubobeem/twiworker.git
cd twiworker
npm install
```

### 2. wrangler.toml を設定

`wrangler.toml` を開いて、KV と D1 の設定をコメント解除・編集します。

まず KV 名前空間を作成:

```bash
npx wrangler kv namespace create twiworker-kv
# → 出力例: 🪣  KV ID:  abc123def456...
```

表示された ID を `wrangler.toml` に反映:

```toml
[[kv_namespaces]]
binding = "KV"
id = "abc123def456..."  # ← ここに上のIDを入れる
```

次に D1 データベースを作成:

```bash
npx wrangler d1 create twiworker-db
# → 出力例: ⛅ Database created. ID: xyz789...
```

表示された ID を `wrangler.toml` に反映:

```toml
[[d1_databases]]
binding = "DB"
database_name = "twiworker-db"
database_id = "xyz789..."  # ← ここに上のIDを入れる
```

### 3. D1 マイグレーション

```bash
# ローカル（開発用）にテーブルを作成
npx wrangler d1 execute twiworker-db --local --file=migrations/0000_init.sql

# リモート（本番用）にテーブルを作成
npx wrangler d1 execute twiworker-db --remote --file=migrations/0000_init.sql
```

### 4. Cloudflare Pages プロジェクトを作成

```bash
npx wrangler pages project create twiworker --production-branch main
```

### 5. Twitter クッキーを取得

1. ブラウザで [x.com](https://x.com) にログイン
2. DevTools を開く（F12）
3. **Application** > **Storage** > **Cookies** > `https://x.com` を開く
4. 以下のクッキーの **Value** をメモ:

| クッキー名 | 必須 | 説明 |
|-----------|------|------|
| `auth_token` | ✅ | 認証トークン |
| `ct0` | ✅ | CSRF トークン |
| `twid` | ✅ | ユーザーID |
| `kdt` | ✅ | デバイストークン |
| `lang` | ✅ | 言語（通常 `ja` または `en`） |
| `_twitter_sess` | ✅ | セッション情報（長い文字列） |

### 6. シークレットを設定（本番用）

```bash
# JSON を作って入力（1行で）
npx wrangler pages secret put TWITTER_COOKIES --project-name=twiworker
```

以下のJSONを1行で入力:

```json
{"auth_token":"af8c...","ct0":"a01f...","twid":"u%3D2066...","kdt":"z4nJ...","lang":"ja","_twitter_sess":"BAh7..."}
```

**または** Cloudflare Dashboard > twiworker > Settings > Environment variables > Add variable からも設定できます。

### 7. デプロイ

```bash
npm run deploy
```

デプロイ完了後、表示された URL にアクセスして「Twitter 接続済み」と表示されれば成功です。

### 8. ローカル開発

```bash
# .dev.vars.example をコピーして実際の値を設定
cp .dev.vars.example .dev.vars

# .dev.vars を編集して TWITTER_COOKIES に実際のJSONを入れる

# 開発サーバー起動
npm run dev
# → http://localhost:8788 で開く
```

---

## 🔌 API エンドポイント一覧

### 管理系

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/health` | ヘルスチェック |
| GET | `/api/status` | 詳細ステータス |

### ツイート操作

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/tweet` | ツイート投稿（body: `{text, media_urls?, schedule_at?}`） |
| POST | `/api/thread` | スレッド投稿（body: `{tweets: [{text}]}`） |
| DELETE | `/api/tweet/:id` | ツイート削除 |

### 情報取得

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/timeline?count=20` | ホームタイムライン |
| GET | `/api/search?q=キーワード&type=latest` | 検索 |
| GET | `/api/user/:id` | ユーザー情報 |
| GET | `/api/user/:id/tweets` | ユーザーのツイート一覧 |
| GET | `/api/trends?woeid=1` | トレンド（1=全世界, 23424856=日本） |
| GET | `/api/tweet/:id` | ツイート詳細 |

### DM

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/dm` | DM一覧 |
| POST | `/api/dm` | DM送信（body: `{user_id, text}`） |

### Cron（HTTP手動実行用）

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/cron/trends` | トレンドをD1保存 |
| POST | `/api/cron/scheduled-tweets` | 予約ツイート実行 |
| POST | `/api/cron/cleanup` | 30日以上前のログ削除 |

---

## 🔑 環境変数一覧

| 変数 | 必須 | 説明 |
|------|------|------|
| `TWITTER_COOKIES` | ✅ | TwitterクッキーのJSON |
| `ACCOUNT_USERNAME` | 任意 | Twitter ユーザー名 |
| `SITE_URL` | 任意 | サイトURL（CORS用） |
| `ADMIN_API_KEY` | 任意 | 管理APIキー |
| `DEBUG` | 任意 | デバッグログ有効化 |

---

## 🔧 メンテナンス

### GraphQL クエリIDの更新

Twitter は内部APIのクエリIDを不定期でローテーションします。
ツイート/TL/検索などが突然動かなくなったら、`src/client.ts` の `ENDPOINTS` を
[twikit](https://github.com/d60/twikit) の最新コードを参照して更新してください。

### クッキーの再取得

`auth_token` や `ct0` には有効期限があります。
約1〜2ヶ月ごとにブラウザからクッキーを再取得して `TWITTER_COOKIES` を更新してください。

### D1 のリセット

```bash
# テーブルを作り直す場合
npx wrangler d1 execute twiworker-db --remote --command="DROP TABLE IF EXISTS tweets; DROP TABLE IF EXISTS scheduled_tweets; DROP TABLE IF EXISTS trends_log; DROP TABLE IF EXISTS dm_log;"
npx wrangler d1 execute twiworker-db --remote --file=migrations/0000_init.sql
```

---

## 📝 ライセンス

MIT

---

## 🙏 クレジット

- [twikit](https://github.com/d60/twikit) — Python 版 Twitter クライアント（GraphQL エンドポイント参考実装）
- [Hono](https://hono.dev/) — 軽量 Web フレームワーク
- [Cloudflare Pages](https://pages.cloudflare.com/) — サーバーレスホスティング
