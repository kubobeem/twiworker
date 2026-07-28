# twiworker 🐦

> **🌐 English version available → [README.en.md](README.en.md)**

**Cloudflare Pages + Functions で動く Twitter/X クライアント**

クッキーベースの認証で Twitter 内部 API（GraphQL）にアクセスし、ツイート投稿・削除・検索、タイムライン表示、いいね・リポスト・フォロー、DM送信、トレンド取得などをブラウザから操作できる Web アプリケーションです。

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen?style=flat-square&logo=cloudflare)](https://twiworker.pages.dev)
![GitHub](https://img.shields.io/github/license/kubobeem/twiworker?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Hono](https://img.shields.io/badge/Hono-4.7-orange?style=flat-square)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare)
![Version](https://img.shields.io/badge/version-0.2.0-purple?style=flat-square)

---

## ✨ v0.2.0 新機能

### 🎨 X（Twitter）風UI全面リニューアル

| 機能 | 説明 |
|------|------|
| 🏠 **3カラムレイアウト** | 左:ナビゲーション / 中央:メインコンテンツ / 右:トレンド+検索 |
| 🖼️ **プロフィール画像表示** | ツイートカードのアバターに実際のプロフィール画像を表示 |
| 🎯 **X風ツイートカード** | いいね・リポスト・返信・ブックマークアクション付き |
| 📱 **レスポンシブ対応** | デスクトップ3カラム / タブレット縮小 / モバイルハンバーガー |

### 🆕 新規ページ

| ページ | 機能 |
|--------|------|
| 👤 **プロフィール** | ユーザー情報表示・ツイート/いいねタブ切替 |
| 🔔 **通知** | いいね/リポスト/フォロー/メンション通知フィルター |
| 🔖 **ブックマーク** | ブックマークしたツイート一覧（無限スクロール） |
| 📋 **リスト** | リスト作成・ツイート表示 |
| ✉️ **DM 2ペイン** | DM会話一覧＋メッセージ表示 |

### 🖥️ Web UI（フロントエンド）

| ページ | 機能 | 操作性 |
|--------|------|--------|
| 🏠 **ホーム（タイムライン）** | ホームタイムライン表示・**無限スクロール** | 自動読み込み |
| 🔍 **探索（検索）** | キーワード検索（Top / Latest / Media）・言語フィルター・**無限スクロール** | フォーム＋自動読み込み |
| ✍️ **ツイート投稿** | テキスト投稿・画像URL添付・**投票付きツイート**・予約投稿・スレッドモード | フォーム入力 |
| ✉️ **DM** | DM会話一覧（2ペイン）・メディア添付送信 | 会話選択＋入力 |
| 📅 **スケジュール** | 予約ツイート作成 | フォーム入力 |
| ⚙️ **設定** | 接続状態確認・Cronジョブ手動実行・APIエンドポイント一覧・**免責事項同意取り消し** | ボタン操作 |

### 💡 ツイートカードインタラクション

| 操作 | 説明 |
|------|------|
| ❤️ **いいね / いいね解除** | クリックでトグル（💖に変化） |
| 🔄 **リポスト** | クリックでリポスト |
| 💬 **返信** | クリックでインライン返信フォーム表示 |
| 🔖 **ブックマーク** | クリックでブックマーク追加 |
| 📊 **投票** | 投票付きツイートの選択肢をクリック |

### ⌨️ キーボードショートカット（v0.2.0 拡張）

| キー | 操作 |
|------|------|
| `1`-`9` | ページ切替（1:ホーム 2:探索 3:通知 4:DM 5:リスト 6:ブックマーク 7:プロフィール 8:投稿 9:スケジュール） |
| `0` | 設定ページ |
| `N` | 新規ツイートページを開く |
| `/` | 検索ページを開く |
| `R` | 現在のページを更新 |
| `B` | ブックマーク |
| `L` | リスト |
| `Ctrl+Enter` | ツイート投稿（投稿ページで） |

### 🎨 UI/UX 機能

| 機能 | 説明 |
|------|------|
| 🌓 ダークテーマ | X風ダークテーマ |
| 📱 レスポンシブ | デスクトップ3カラム → タブレット縮小 → モバイルハンバーガー |
| ♾️ **無限スクロール** | IntersectionObserver による自動ページネーション |
| 💬 **インライン返信** | ツイートカード内で直接返信入力・送信 |
| 🔔 **トースト通知** | 操作結果をポップアップ表示 |
| 🦴 **スケルトンローディング** | 読み込み中はプレースホルダーを表示 |
| ⚡ **SPA遷移** | ページ遷移が高速（画面遷移なし） |
| 🔄 **自動状態更新** | 60秒ごとに接続状態を自動確認 |

### ⚖️ 同意・免責システム

| 機能 | 説明 |
|------|------|
| 🪟 **初回同意モーダル** | 初回アクセス時に免責事項を表示（`localStorage` で制御） |
| ✅ **同意** | ボタンクリックで同意 → 通常利用開始 |
| ✖️ **同意しない** | Google.com にリダイレクト |
| ⌨️ **Escapeキー** | 同意しない |
| 🔄 **同意取り消し** | 設定ページの「同意を取り消す」ボタン |
| 📜 **フッター免責** | 常時表示 |

### 🔧 バックエンドAPI

#### 管理系

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/health` | ヘルスチェック（KV/D1/Twitter状態） |
| GET | `/api/status` | 詳細ステータス（アカウント情報含む） |

#### ツイート操作

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/tweet` | ツイート投稿（text, media_urls, reply_to, poll, schedule_at） |
| POST | `/api/thread` | スレッド投稿 |
| GET | `/api/tweet/:id` | ツイート詳細 |
| DELETE | `/api/tweet/:id` | ツイート削除 |

#### 情報取得

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/timeline` | ホームタイムライン（カーソルページネーション対応） |
| GET | `/api/search` | 検索（Top/Latest/Media, カーソル対応） |
| GET | `/api/user/:id` | ユーザー情報 |
| GET | `/api/user/:id/tweets` | ユーザーのツイート一覧 |
| GET | `/api/user/:id/likes` | ユーザーのいいね一覧 |
| GET | `/api/user/:id/followers` | フォロワー一覧 |
| GET | `/api/user/:id/following` | フォロー中一覧 |
| GET | `/api/trends` | トレンド（1=全世界, 23424856=日本） |

#### 🆕 新規エンドポイント（v0.2.0）

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/bookmarks` | ブックマーク一覧 |
| POST | `/api/bookmarks` | ブックマーク追加 |
| DELETE | `/api/bookmarks/:id` | ブックマーク削除 |
| GET | `/api/lists` | リスト一覧 |
| POST | `/api/lists` | リスト作成 |
| GET | `/api/lists/:id/tweets` | リストのツイート |
| DELETE | `/api/lists/:id` | リスト削除 |
| GET | `/api/lists/:id/members` | リストメンバー |
| GET | `/api/notifications` | 通知一覧 |
| POST | `/api/tweet/:id/vote` | 投票 |
| GET | `/api/spaces/:id` | スペース情報 |
| GET | `/api/spaces/search` | スペース検索 |
| GET | `/api/dm/conversations` | DM会話一覧 |
| GET | `/api/dm/conversation/:id` | DM会話メッセージ |

#### インタラクション

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/tweet/:id/like` | いいね |
| POST | `/api/tweet/:id/unlike` | いいね解除 |
| POST | `/api/tweet/:id/retweet` | リポスト |
| POST | `/api/tweet/:id/unretweet` | リポスト解除 |
| POST | `/api/follow/:id` | フォロー |
| POST | `/api/unfollow/:id` | アンフォロー |

#### DM + Cron

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/dm` | DM一覧（D1ログ） |
| POST | `/api/dm` | DM送信 |
| POST | `/api/cron/trends` | トレンドをD1保存 |
| POST | `/api/cron/scheduled-tweets` | 予約ツイート実行 |
| POST | `/api/cron/cleanup` | 30日以上前のログ削除 |

---

## 🏗 アーキテクチャ

```
twiworker/
├── public/                    # 静的ファイル（SPA）
│   ├── index.html             # 3カラムレイアウト + 同意モーダル + フッター
│   ├── style.css              # X風UI（3カラムレイアウト）
│   ├── app.js                 # 共通JS（ナビ, API, トースト, 無限スクロール, ツイートカード）
│   └── pages/                 # ページ別JS（10ページ）
│       ├── timeline.js        # ホームタイムライン
│       ├── search.js          # 探索・検索
│       ├── notifications.js   # 通知 🆕
│       ├── dm.js              # DM 2ペイン
│       ├── lists.js           # リスト 🆕
│       ├── bookmarks.js       # ブックマーク 🆕
│       ├── profile.js         # プロフィール 🆕
│       ├── compose.js         # ツイート投稿（投票対応）
│       ├── schedule.js        # スケジュール
│       └── settings.js        # 設定
├── functions/api/             # Cloudflare Pages Functions
│   ├── _middleware.ts         # CORS
│   └── [[route]].ts          # Honoへルーティング
├── src/                       # バックエンド TypeScript
│   ├── index.ts               # Hono アプリ・ルーティング（全API）
│   ├── client.ts              # Twitter GraphQL API クライアント（全機能）
│   ├── types.ts               # 型定義（全機能対応）
│   ├── config.ts              # 設定管理
│   ├── handlers/              # 機能別ハンドラー（14ファイル）
│   │   ├── tweet.ts           # ツイート投稿・削除
│   │   ├── timeline.ts        # ホームタイムライン
│   │   ├── search.ts          # 検索
│   │   ├── user.ts            # ユーザー情報
│   │   ├── interaction.ts     # いいね・リポスト・フォロー
│   │   ├── dm.ts              # DM
│   │   ├── trends.ts          # トレンド
│   │   ├── cron.ts            # Cronジョブ
│   │   ├── admin.ts           # ヘルスチェック・ステータス
│   │   ├── bookmark.ts        # ブックマーク 🆕
│   │   ├── list.ts            # リスト 🆕
│   │   ├── notification.ts    # 通知 🆕
│   │   ├── poll.ts            # 投票 🆕
│   │   └── space.ts           # スペース 🆕
│   ├── storage/               # ストレージ
│   │   ├── d1.ts              # D1 データベース
│   │   └── kv.ts              # KV ストア
│   ├── middleware/
│   │   └── ratelimit.ts       # レート制限
│   └── __tests__/             # ユニットテスト 🆕
│       └── client.test.ts     # Vitest テスト
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
| フロントエンド | バニラJS（SPA）+ CSS（X風ダークテーマ・3カラム） |
| バックエンド | TypeScript + [Hono](https://hono.dev/) |
| テスト | [Vitest](https://vitest.dev/) 🆕 |
| 認証 | Twitter クッキーベース（内部 GraphQL API） |
| ストレージ | Cloudflare KV（レート制限）+ D1（ログ・スケジュール） |
| ホスティング | Cloudflare Pages + Functions |

---

## 🚀 デプロイ手順

必要になるもの:
- Cloudflare アカウント（無料でOK）
- Twitter/X アカウント（ログイン済みのブラウザ）

### 1. Cloudflare にログイン

```bash
npx wrangler login
```

### 2. リポジトリをクローン

```bash
git clone https://github.com/kubobeem/twiworker.git
cd twiworker
npm install
```

### 3. wrangler.toml を設定

```bash
npx wrangler kv namespace create twiworker-kv
npx wrangler d1 create twiworker-db
```

`wrangler.toml` に ID を反映:

```toml
[[kv_namespaces]]
binding = "KV"
id = "取得したKV_ID"

[[d1_databases]]
binding = "DB"
database_name = "twiworker-db"
database_id = "取得したD1_ID"
```

### 4. D1 マイグレーション

```bash
npx wrangler d1 execute twiworker-db --local --file=migrations/0000_init.sql
npx wrangler d1 execute twiworker-db --remote --file=migrations/0000_init.sql
```

### 5. Pages プロジェクトを作成

```bash
npx wrangler pages project create twiworker --production-branch main
```

### 6. Twitter クッキーを取得 → シークレット設定

```bash
npx wrangler pages secret put TWITTER_COOKIES --project-name=twiworker
```

JSON形式で入力:
```json
{"auth_token":"...","ct0":"...","twid":"u%3D...","kdt":"...","lang":"ja","_twitter_sess":"..."}
```

### 7. デプロイ

```bash
npm run deploy
```

または:
```bash
npx wrangler pages deploy public --project-name twiworker --branch main
```

### 8. ローカル開発

```bash
cp .dev.vars.example .dev.vars
# .dev.vars を編集
npm run dev
# → http://localhost:8788
```

---

## 🧪 テスト

```bash
npm test        # テスト実行
npm run test:watch  # ウォッチモード
```

---

## 🔑 環境変数一覧

| 変数 | 必須 | 説明 |
|------|:----:|------|
| `TWITTER_COOKIES` | ✅ | TwitterクッキーのJSON（auth_token, ct0, twid, kdt, lang, _twitter_sess） |
| `ACCOUNT_USERNAME` | 任意 | Twitter ユーザー名 |
| `SITE_URL` | 任意 | サイトURL（CORS用） |
| `ADMIN_API_KEY` | 任意 | 管理APIキー |
| `DEBUG` | 任意 | デバッグログ有効化 |

---

## 🔧 メンテナンス

### GraphQL クエリIDの更新

`src/client.ts` の `ENDPOINTS` を [twikit](https://github.com/d60/twikit) の最新コードを参照して更新してください。

### クッキーの再取得

`auth_token` や `ct0` には有効期限があります。約1〜2ヶ月ごとにブラウザからクッキーを再取得してください。

### テスト実行

```bash
npm test
```

---

## ⚠️ 重要：利用上の注意

> **このソフトウェアは教育・研究目的（Educational and Research Purposes）のみで提供されています。**

**要約：このツールは学習と研究のためのものです。X Corp. とは無関係です。自己責任で使用してください。**

---

## 📝 ライセンス

MIT

---

## 🙏 クレジット

- [twikit](https://github.com/d60/twikit) — Python 版 Twitter クライアント
- [Hono](https://hono.dev/) — 軽量 Web フレームワーク
- [Cloudflare Pages](https://pages.cloudflare.com/) — サーバーレスホスティング
- [Vitest](https://vitest.dev/) — テストランナー
