# twiworker 🐦

> **🇯🇵 日本語版はこちら → [README.md](README.md)**

**Twitter/X Client running on Cloudflare Pages + Functions**

A web application that accesses Twitter's internal GraphQL API using cookie-based authentication. Post, delete, and search tweets, view timelines, send DMs, and fetch trends — all from your browser.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen?style=flat-square&logo=cloudflare)](https://85eeed39.twiworker.pages.dev)
![GitHub](https://img.shields.io/github/license/kubobeem/twiworker?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Hono](https://img.shields.io/badge/Hono-4.7-orange?style=flat-square)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 Dashboard | Account info, connection status, stats at a glance |
| ✍️ Compose Tweet | Text, image URLs, thread mode |
| 🗑️ Delete Tweet | Remove tweets by ID |
| 📰 Timeline | Home timeline display (20 tweets) |
| 🔍 Search | Keyword search (Top / Latest / Media) |
| 👤 User Info | User details and tweet history |
| 📈 Trends | Global and Japan trending topics |
| ✉️ DM | Send and list direct messages |
| 📅 Schedule | Schedule tweets for later (D1 storage) |
| ⚙️ Settings | Connection status, manual cron execution, API list |
| 🔄 Thread | Post multiple tweets as a reply chain |
| 🚦 Rate Limiting | IP-based request throttling (KV) |

---

## 🏗 Architecture

```
twiworker/
├── public/               # Static assets (SPA)
│   ├── index.html        # Main page
│   ├── style.css         # Dark theme UI
│   ├── app.js            # Shared JS (navigation, API, toasts)
│   └── pages/            # Page-specific JS (8 pages)
├── functions/api/        # Cloudflare Pages Functions
│   ├── _middleware.ts    # CORS
│   └── [[route]].ts     # Catch-all routing to Hono
├── src/                  # Backend TypeScript
│   ├── index.ts          # Hono app & routes
│   ├── client.ts         # Twitter GraphQL API client
│   ├── types.ts          # Type definitions
│   ├── handlers/         # Feature handlers (8 files)
│   ├── storage/          # D1 / KV stores
│   └── middleware/       # Rate limiter
├── migrations/
│   └── 0000_init.sql     # D1 table definitions
├── wrangler.toml
├── .dev.vars.example     # Local env var template
└── package.json
```

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS (SPA) + CSS (dark glassmorphism theme) |
| Backend | TypeScript + [Hono](https://hono.dev/) |
| Auth | Twitter cookies (internal GraphQL API) |
| Storage | Cloudflare KV (rate limiting) + D1 (logs, schedules) |
| Hosting | Cloudflare Pages + Functions |

---

## 🚀 Deployment Guide (from scratch)

**Prerequisites:**
- A Cloudflare account (free tier works)
- A Twitter/X account (logged in browser)

### 1. Login to Cloudflare

```bash
npx wrangler login
```

A browser window will open asking you to authorize Cloudflare access.

### 2. Clone the repository

```bash
git clone https://github.com/kubobeem/twiworker.git
cd twiworker
npm install
```

### 3. Configure wrangler.toml

Open `wrangler.toml` and set up your KV + D1 resources.

First create a KV namespace:

```bash
npx wrangler kv namespace create twiworker-kv
# → Example output: 🪣  KV ID:  abc123def456...
```

Update the ID in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV"
id = "abc123def456..."  # ← Replace with the ID above
```

Then create a D1 database:

```bash
npx wrangler d1 create twiworker-db
# → Example output: ⛅ Database created. ID: xyz789...
```

Update the ID in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "twiworker-db"
database_id = "xyz789..."  # ← Replace with the ID above
```

### 4. D1 Migration

```bash
# Create tables locally (for development)
npx wrangler d1 execute twiworker-db --local --file=migrations/0000_init.sql

# Create tables remotely (for production)
npx wrangler d1 execute twiworker-db --remote --file=migrations/0000_init.sql
```

### 5. Create the Pages project

```bash
npx wrangler pages project create twiworker --production-branch main
```

### 6. Get Twitter cookies

1. Log into [x.com](https://x.com) in your browser
2. Open DevTools (F12)
3. Go to **Application** > **Storage** > **Cookies** > `https://x.com`
4. Note the **Value** of each cookie:

| Cookie Name | Required | Description |
|------------|----------|-------------|
| `auth_token` | ✅ | Authentication token |
| `ct0` | ✅ | CSRF token |
| `twid` | ✅ | User ID (format: `u%3D123456...`) |
| `kdt` | ✅ | Device token |
| `lang` | ✅ | Language (usually `ja` or `en`) |
| `_twitter_sess` | ✅ | Session data (long string) |

### 7. Set secrets (production)

```bash
# Paste the JSON string (one line)
npx wrangler pages secret put TWITTER_COOKIES --project-name=twiworker
```

Enter a single-line JSON:

```json
{"auth_token":"af8c...","ct0":"a01f...","twid":"u%3D2066...","kdt":"z4nJ...","lang":"ja","_twitter_sess":"BAh7..."}
```

**Alternatively**, set it via the Cloudflare Dashboard: `twiworker > Settings > Environment variables > Add variable`.

### 8. Deploy

```bash
npm run deploy
```

After deployment, open the URL shown. If you see "Twitter 接続済み" (Connected to Twitter), you're all set!

### 9. Local Development

```bash
# Copy the env template and fill in your values
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your actual TWITTER_COOKIES JSON

# Start the dev server
npm run dev
# → Opens at http://localhost:8788
```

---

## 🔌 API Endpoints

### Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check (KV/D1/Twitter status) |
| GET | `/api/status` | Detailed status including account info |

### Tweet Operations

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tweet` | Post a tweet (body: `{text, media_urls?, schedule_at?}`) |
| POST | `/api/thread` | Post a thread (body: `{tweets: [{text}]}`) |
| DELETE | `/api/tweet/:id` | Delete a tweet |

### Data Retrieval

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/timeline?count=20` | Home timeline |
| GET | `/api/search?q=keyword&type=latest` | Search tweets |
| GET | `/api/user/:id` | User info |
| GET | `/api/user/:id/tweets` | User's tweets |
| GET | `/api/trends?woeid=1` | Trends (1=World, 23424856=Japan) |
| GET | `/api/tweet/:id` | Tweet detail |

### DM

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dm` | List DMs |
| POST | `/api/dm` | Send DM (body: `{user_id, text}`) |

### Cron (HTTP-triggered)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/cron/trends` | Save trends to D1 |
| POST | `/api/cron/scheduled-tweets` | Execute scheduled tweets |
| POST | `/api/cron/cleanup` | Delete logs older than 30 days |

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TWITTER_COOKIES` | ✅ | Twitter cookies as JSON |
| `ACCOUNT_USERNAME` | Optional | Twitter username |
| `SITE_URL` | Optional | Site URL (for CORS) |
| `ADMIN_API_KEY` | Optional | Admin API key |
| `DEBUG` | Optional | Enable debug logging |

---

## 🔧 Maintenance

### Updating GraphQL Query IDs

Twitter periodically rotates internal API query IDs. If tweets, timeline, or search suddenly stop working, update the `ENDPOINTS` in `src/client.ts` by checking the latest [twikit](https://github.com/d60/twikit) source code.

### Refreshing cookies

`auth_token` and `ct0` have expiration dates. Re-fetch the cookies from your browser every 1–2 months and update `TWITTER_COOKIES`.

### Resetting D1

```bash
# Drop and recreate tables
npx wrangler d1 execute twiworker-db --remote --command="DROP TABLE IF EXISTS tweets; DROP TABLE IF EXISTS scheduled_tweets; DROP TABLE IF EXISTS trends_log; DROP TABLE IF EXISTS dm_log;"
npx wrangler d1 execute twiworker-db --remote --file=migrations/0000_init.sql
```

---

## 📝 License

MIT

---

## 🙏 Credits

- [twikit](https://github.com/d60/twikit) — Python Twitter client (GraphQL endpoint reference)
- [Hono](https://hono.dev/) — Lightweight web framework
- [Cloudflare Pages](https://pages.cloudflare.com/) — Serverless hosting
