# twiworker

**Cloudflare Workers 上で動く Twitter/X クライアント**

[twiworker-spec.md](../twiworker-spec.md) に基づいて開発されています。

## 概要

twiworker は Cloudflare Workers 上で [twikit](https://github.com/d60/twikit) (Python) を動作させ、
Twitter/X の各種操作を REST API として提供します。

### 主な機能

- **ツイート操作**: 投稿・削除・スレッド投稿
- **検索**: キーワード検索、トレンド取得
- **タイムライン**: ホームタイムライン取得
- **ユーザー情報**: プロフィール取得、ツイート一覧
- **DM**: 取得・送信
- **フォロー管理**: フォロー/アンフォロー、フォロワー一覧
- **Cron ジョブ**: 定期ツイート、トレンド保存、ログクリーンアップ
- **管理**: ヘルスチェック、ステータス確認

## セットアップ

### 1. 環境準備

```bash
# uv のインストール（なければ）
pip install uv

# 依存関係のインストール
uv sync
```

### 2. Cloudflare リソースの作成

```bash
# KV 名前空間の作成
npx wrangler kv:namespace create twiworker-kv

# D1 データベースの作成
npx wrangler d1 create twiworker-db

# マイグレーションの適用
npx wrangler d1 migrations apply twiworker-db
```

`wrangler.toml` に作成した KV/D1 の ID を設定してください。

### 3. 環境変数の設定

```bash
# クッキーの設定（ブラウザから Twitter ログイン済みクッキーをエクスポート）
npx wrangler secret put TWITTER_COOKIES

# アカウント名の設定
npx wrangler secret put ACCOUNT_USERNAME
```

ローカル開発時は `.dev.vars.example` を `.dev.vars` にコピーして編集してください。

### 4. ローカル開発

```bash
npx wrangler dev
```

### 5. デプロイ

```bash
npx wrangler deploy
```

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/api/health` | ヘルスチェック |
| `GET` | `/api/status` | 詳細ステータス |
| `POST` | `/api/tweet` | ツイート投稿 |
| `POST` | `/api/thread` | スレッド投稿 |
| `GET` | `/api/tweet/:id` | ツイート取得 |
| `DELETE` | `/api/tweet/:id` | ツイート削除 |
| `GET` | `/api/search?q=keyword` | ツイート検索 |
| `GET` | `/api/timeline` | タイムライン取得 |
| `GET` | `/api/user/:id` | ユーザー情報 |
| `GET` | `/api/user/:id/tweets` | ユーザーのツイート |
| `GET` | `/api/dm` | DM一覧 |
| `POST` | `/api/dm` | DM送信 |
| `POST` | `/api/follow/:id` | フォロー |
| `POST` | `/api/unfollow/:id` | アンフォロー |
| `GET` | `/api/followers` | フォロワー一覧 |
| `GET` | `/api/following` | フォロー中一覧 |
| `GET` | `/api/trends` | トレンド取得 |
| `POST` | `/api/cron/trends` | トレンド保存ジョブ |
| `POST` | `/api/cron/scheduled-tweets` | 予約ツイート実行 |
| `POST` | `/api/cron/cleanup` | ログクリーンアップ |

## 認証

Twitter 認証には **クッキーベース認証** を使用します。
ブラウザで Twitter にログインした状態でクッキーをエクスポートし、
`TWITTER_COOKIES` 環境変数に設定してください。

**注意**: twikit は非公式の Twitter API クライアントです。
アカウントが停止されるリスクがあるため、バーナーアカウントの使用を推奨します。

## ライセンス

MIT
