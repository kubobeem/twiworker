# twiworker 🐦

> **🌐 English version available → [README.en.md](README.en.md)**

**Cloudflare Pages + Functions で動く Twitter/X クライアント**

クッキーベースの認証で Twitter 内部 API（GraphQL）にアクセスし、ツイート投稿・削除・検索、タイムライン表示、いいね・リポスト・フォロー、DM送信、トレンド取得などをブラウザから操作できる Web アプリケーションです。

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen?style=flat-square&logo=cloudflare)](https://85eeed39.twiworker.pages.dev)
![GitHub](https://img.shields.io/github/license/kubobeem/twiworker?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Hono](https://img.shields.io/badge/Hono-4.7-orange?style=flat-square)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare)

---

## ✨ 機能一覧

### 🖥️ Web UI（フロントエンド）

| ページ | 機能 | 操作性 |
|--------|------|--------|
| 📊 **ダッシュボード** | アカウント情報・接続状態・各種統計・最近のツイート一覧 | 自動更新 |
| ✍️ **ツイート投稿** | テキスト投稿・画像URL添付・予約投稿・スレッドモード（複数ツイート連続） | フォーム入力 |
| 🔍 **検索** | キーワード検索（Top / Latest / Media）・言語フィルター・件数指定・**無限スクロール** | フォーム＋自動読み込み |
| 📰 **タイムライン** | ホームタイムライン表示・**無限スクロール**・最新に更新 | 自動読み込み＋更新ボタン |
| ✉️ **DM** | ダイレクトメッセージ一覧表示・送信 | フォーム入力 |
| 📅 **スケジュール** | 予約ツイート一覧・手動実行・削除 | 一覧＋ボタン操作 |
| 📈 **トレンド** | 全世界/日本のトレンド表示・WOEID切替 | タブ切替 |
| ⚙️ **設定** | 接続状態確認・Cronジョブ手動実行（トレンド保存/予約ツイート実行/ログ削除）・APIエンドポイント一覧・**免責事項同意取り消し** | ボタン操作 |

### 💡 インタラクション機能（ツイートカード）

| 操作 | 説明 |
|------|------|
| ❤️ **いいね / いいね解除** | ツイートカードの❤️をクリックでトグル（💖に変化） |
| 🔄 **リポスト** | ツイートカードの🔄をクリック |
| 💬 **返信** | ツイートカードの💬をクリックでインライン返信フォーム表示 |
| 👤 **フォロー / アンフォロー** | `POST /api/follow/:id` / `POST /api/unfollow/:id` |

### 🔧 バックエンドAPI

| カテゴリ | エンドポイント | 説明 |
|----------|---------------|------|
| **管理** | `GET /api/health` | ヘルスチェック（KV/D1/Twitter状態） |
| | `GET /api/status` | 詳細ステータス（アカウント情報含む） |
| **ツイート** | `POST /api/tweet` | ツイート投稿（text, media_urls, reply_to, schedule_at） |
| | `POST /api/thread` | スレッド投稿（複数ツイートをリプライチェーンで） |
| | `DELETE /api/tweet/:id` | ツイート削除 |
| | `GET /api/tweet/:id` | ツイート詳細 |
| **タイムライン** | `GET /api/timeline?count=&cursor=` | ホームタイムライン（カーソルページネーション対応） |
| **検索** | `GET /api/search?q=&type=&count=&cursor=` | ツイート検索（Top/Latest/Media, カーソル対応） |
| **ユーザー** | `GET /api/user/:id` | ユーザー情報（screen_nameまたはID） |
| | `GET /api/user/:id/tweets` | ユーザーのツイート一覧 |
| | `GET /api/user/:id/likes` | ユーザーのいいね一覧 |
| | `GET /api/user/:id/followers` | フォロワー一覧 |
| | `GET /api/user/:id/following` | フォロー中一覧 |
| **いいね** | `POST /api/tweet/:id/like` | いいね |
| | `POST /api/tweet/:id/unlike` | いいね解除 |
| **リポスト** | `POST /api/tweet/:id/retweet` | リポスト |
| | `POST /api/tweet/:id/unretweet` | リポスト解除 |
| **フォロー** | `POST /api/follow/:id` | フォロー |
| | `POST /api/unfollow/:id` | アンフォロー |
| **DM** | `GET /api/dm` | DM一覧 |
| | `POST /api/dm` | DM送信（user_id, text） |
| **トレンド** | `GET /api/trends?woeid=` | トレンド取得（1=全世界, 23424856=日本） |
| **Cron** | `POST /api/cron/trends` | トレンドをD1に保存 |
| | `POST /api/cron/scheduled-tweets` | 予約ツイートを実行 |
| | `POST /api/cron/cleanup` | 30日以上前のログ削除 |

### ⌨️ キーボードショートカット

| キー | 操作 |
|------|------|
| `1`-`8` | ページ切替（左サイドバーの順） |
| `N` | 新規ツイートページを開く |
| `/` | 検索ページを開く（入力欄にフォーカス） |
| `R` | 現在のページを更新 |

### 🎨 UI/UX 機能

| 機能 | 説明 |
|------|------|
| 🌓 ダークテーマ | グラスモーフィズム（ガラス調）デザイン |
| 📱 レスポンシブ | モバイル対応（ハンバーガーメニュー） |
| ♾️ **無限スクロール** | IntersectionObserver による自動ページネーション（タイムライン・検索結果） |
| 💬 **インライン返信** | ツイートカード内で直接返信入力・送信 |
| 🔔 **トースト通知** | 操作結果を画面上部にポップアップ表示 |
| 🦴 **スケルトンローディング** | 読み込み中はプレースホルダーを表示 |
| ⚡ **SPA遷移** | ページ遷移が高速（画面遷移なし） |
| 🔄 **自動状態更新** | 60秒ごとに接続状態を自動確認 |

### ⚖️ 同意・免責システム

| 機能 | 説明 |
|------|------|
| 🪟 **初回同意モーダル** | 初回アクセス時に7項目の免責事項を表示（`localStorage` で制御） |
| ✅ **同意** | ボタンクリックで同意 → 通常利用開始 |
| ✖️ **同意しない** | Google.com にリダイレクト |
| ⌨️ **Escapeキー** | 同意しない（← と同じ動作） |
| 🔄 **同意取り消し** | 設定ページの「同意を取り消す」ボタンで再表示可能 |
| 📜 **フッター免責** | 全ページフッターに常時表示 |
| ⚙️ **設定ページ** | 設定ページ内にも免責事項カードあり |

---

## 🏗 アーキテクチャ

```
twiworker/
├── public/                    # 静的ファイル（SPA）
│   ├── index.html             # メインページ + 同意モーダル + フッター
│   ├── style.css              # ダークテーマUI（グラスモーフィズム）
│   ├── app.js                 # 共通JS（ナビ, API, トースト, 無限スクロール, 同意モーダル）
│   └── pages/                 # ページ別JS（8ページ）
│       ├── dashboard.js
│       ├── compose.js
│       ├── search.js
│       ├── timeline.js
│       ├── dm.js
│       ├── schedule.js
│       ├── trends.js
│       └── settings.js
├── functions/api/             # Cloudflare Pages Functions
│   ├── _middleware.ts         # CORS
│   └── [[route]].ts          # Honoへルーティング
├── src/                       # バックエンド TypeScript
│   ├── index.ts               # Hono アプリ・ルーティング（全API）
│   ├── client.ts              # Twitter GraphQL API クライアント
│   ├── types.ts               # 型定義
│   ├── config.ts              # 設定管理
│   ├── handlers/              # 機能別ハンドラー（9ファイル）
│   │   ├── tweet.ts           # ツイート投稿・削除
│   │   ├── timeline.ts        # ホームタイムライン
│   │   ├── search.ts          # 検索
│   │   ├── user.ts            # ユーザー情報
│   │   ├── interaction.ts     # いいね・リポスト・フォロー
│   │   ├── dm.ts              # DM
│   │   ├── trends.ts          # トレンド
│   │   ├── cron.ts            # Cronジョブ
│   │   └── admin.ts           # ヘルスチェック・ステータス
│   ├── storage/               # ストレージ
│   │   ├── d1.ts              # D1 データベース
│   │   └── kv.ts              # KV ストア
│   └── middleware/
│       └── ratelimit.ts       # レート制限
├── migrations/
│   └── 0000_init.sql          # D1 テーブル定義
├── wrangler.toml
├── package.json
├── tsconfig.json
└── .dev.vars.example          # ローカル環境変数テンプレート
```

### スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | バニラJS（SPA）+ CSS（ダークテーマ・グラスモーフィズム） |
| バックエンド | TypeScript + [Hono](https://hono.dev/) |
| 認証 | Twitter クッキーベース（内部 GraphQL API） |
| ストレージ | Cloudflare KV（レート制限）+ D1（ログ・スケジュール） |
| ホスティング | Cloudflare Pages + Functions |

---

## 🚀 1からのデプロイ手順

必要になるもの:
- Cloudflare アカウント（無料でOK）
- Twitter/X アカウント（ログイン済みのブラウザ）

### 1. Cloudflare にログイン

```bash
npx wrangler login
```

ブラウザが開いて Cloudflare の認証画面が表示されるので許可します。

### 2. リポジトリをクローン

```bash
git clone https://github.com/kubobeem/twiworker.git
cd twiworker
npm install
```

### 3. wrangler.toml を設定

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

## 🔌 API エンドポイント一覧（全件）

### 管理系

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/health` | ヘルスチェック（KV/D1/Twitter接続状態） |
| GET | `/api/status` | 詳細ステータス |

### ツイート操作

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/tweet` | ツイート投稿（body: `{text, media_urls?, reply_to?, schedule_at?}`） |
| POST | `/api/thread` | スレッド投稿（body: `{tweets: [{text, media_urls?}]}`） |
| DELETE | `/api/tweet/:id` | ツイート削除 |
| GET | `/api/tweet/:id` | ツイート詳細 |

### 情報取得

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/timeline?count=20&cursor=` | ホームタイムライン（カーソルページネーション対応） |
| GET | `/api/search?q=キーワード&type=Top&count=20&cursor=` | 検索（Top/Latest/Media, カーソル対応） |
| GET | `/api/user/:id` | ユーザー情報（screen_name または user_id） |
| GET | `/api/user/:id/tweets` | ユーザーのツイート一覧 |
| GET | `/api/user/:id/likes` | ユーザーのいいね一覧 |
| GET | `/api/user/:id/followers` | フォロワー一覧 |
| GET | `/api/user/:id/following` | フォロー中一覧 |
| GET | `/api/trends?woeid=1` | トレンド（1=全世界, 23424856=日本） |

### インタラクション

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/tweet/:id/like` | いいね |
| POST | `/api/tweet/:id/unlike` | いいね解除 |
| POST | `/api/tweet/:id/retweet` | リポスト |
| POST | `/api/tweet/:id/unretweet` | リポスト解除 |
| POST | `/api/follow/:id` | フォロー |
| POST | `/api/unfollow/:id` | アンフォロー |

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
| `TWITTER_COOKIES` | ✅ | TwitterクッキーのJSON（auth_token, ct0, twid, kdt, lang, _twitter_sess） |
| `ACCOUNT_USERNAME` | 任意 | Twitter ユーザー名 |
| `SITE_URL` | 任意 | サイトURL（CORS用） |
| `ADMIN_API_KEY` | 任意 | 管理APIキー |
| `DEBUG` | 任意 | デバッグログ有効化 |

---

## 🔧 メンテナンス

### GraphQL クエリIDの更新

Twitter は内部APIのクエリIDを不定期でローテーションします。ツイート/TL/検索などが突然動かなくなったら、`src/client.ts` の `ENDPOINTS` を [twikit](https://github.com/d60/twikit) の最新コードを参照して更新してください。

現在対応しているエンドポイント:
`CreateTweet`, `DeleteTweet`, `SearchTimeline`, `HomeTimeline`, `UserByScreenName`, `UserTweets`, `TweetDetail`, `Followers`, `Following`, `FavoriteTweet`, `UnfavoriteTweet`, `CreateRetweet`, `DeleteRetweet`, `UserByRestId`, `UserLikes`

### クッキーの再取得

`auth_token` や `ct0` には有効期限があります。約1〜2ヶ月ごとにブラウザからクッキーを再取得して `TWITTER_COOKIES` を更新してください。

### D1 のリセット

```bash
# テーブルを作り直す場合
npx wrangler d1 execute twiworker-db --remote --command="DROP TABLE IF EXISTS tweets; DROP TABLE IF EXISTS scheduled_tweets; DROP TABLE IF EXISTS trends_log; DROP TABLE IF EXISTS dm_log;"
npx wrangler d1 execute twiworker-db --remote --file=migrations/0000_init.sql
```

---

## ⚠️ 重要：利用上の注意

> **このソフトウェアは教育・研究目的（Educational and Research Purposes）のみで提供されています。**

### 免責事項

1. **教育・研究目的** — 本ソフトウェアは、Twitter/X の内部API仕様を学術的に調査・研究する目的で開発されました。業務目的や商用目的での使用を意図していません。

2. **X Corp.との関係** — 本ソフトウェアは **X Corp.（旧Twitter）とは一切関係がなく、公認・承認・支援されたものではありません**。X Corp. の公式製品、サービス、またはパートナー製品ではありません。

3. **非公式クライアント** — 本ソフトウェアは非公式のクライアントであり、X Corp. が提供する公開API（X API）ではなく、内部的に使用されているプライベートAPIを利用しています。このAPIの仕様は予告なく変更される可能性があります。

4. **利用規約の遵守** — 利用者は、X Corp. の[利用規約](https://x.com/tos)、[開発者契約](https://developer.twitter.com/en/developer-terms)、および[自動化ルール](https://help.twitter.com/rules-and-policies/twitter-automation)を遵守する責任を負います。本ソフトウェアの使用がこれらの規約に違反する可能性があることを認識した上で利用してください。

5. **自己責任** — 本ソフトウェアの使用により生じたいかなる損害、データ損失、アカウント停止、法的措置についても、**開発者は一切の責任を負いません**。すべてのリスクと責任は利用者自身に帰属します。

6. **アカウント停止のリスク** — 非公式の内部APIを使用することは、X Corp. の自動化ポリシーに違反する可能性があり、アカウントの一時的または恒久的な停止につながる可能性があります。重要なアカウントでの使用は推奨しません。

7. **クッキーの取り扱い** — 本ソフトウェアはユーザーのTwitter認証クッキーを使用します。これらのクッキーは機密情報であり、第三者と共有したり、公開リポジトリにコミットしたりしないでください。

8. **レート制限と負荷** — X のサーバーに過剰な負荷をかけることは避け、適切なレート制限を守って使用してください。

9. **無保証** — 本ソフトウェアは「現状のまま（AS-IS）」で提供され、明示的または黙示的な一切の保証を行いません。

10. **変更の権利** — 本免責事項は予告なく変更されることがあります。定期的に最新バージョンを確認することを推奨します。

---

**要約：このツールは学習と研究のためのものです。X Corp. とは無関係です。自己責任で使用してください。**

---

## 📝 ライセンス

MIT

---

## 🙏 クレジット

- [twikit](https://github.com/d60/twikit) — Python 版 Twitter クライアント（GraphQL エンドポイント参考実装）
- [Hono](https://hono.dev/) — 軽量 Web フレームワーク
- [Cloudflare Pages](https://pages.cloudflare.com/) — サーバーレスホスティング
