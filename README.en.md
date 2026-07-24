# twiworker 🐦

> **🇯🇵 日本語版はこちら → [README.md](README.md)**

**Twitter/X Client running on Cloudflare Pages + Functions**

A web application that accesses Twitter's internal GraphQL API using cookie-based authentication. Post/delete/search tweets, view timelines with infinite scroll, like/retweet/follow, send DMs, and fetch trends — all from your browser.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen?style=flat-square&logo=cloudflare)](https://b66fd67e.twiworker.pages.dev)
![GitHub](https://img.shields.io/github/license/kubobeem/twiworker?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Hono](https://img.shields.io/badge/Hono-4.7-orange?style=flat-square)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare)

---

## ✨ Features

### 🖥️ Web UI (Frontend Pages)

| Page | Features | Interaction |
|------|----------|-------------|
| 📊 **Dashboard** | Account info, connection status, stats cards, recent tweets | Auto-refresh |
| ✍️ **Compose** | Text tweets, image URLs, scheduled posts, thread mode (multi-tweet chain) | Form input |
| 🔍 **Search** | Keyword search (Top / Latest / Media), language filter, count, **infinite scroll** | Form + auto-load |
| 📰 **Timeline** | Home timeline display, **infinite scroll**, refresh to latest | Auto-load + refresh |
| ✉️ **DM** | Direct message list & send | Form input |
| 📅 **Schedule** | Scheduled tweets list, manual execution, deletion | List + buttons |
| 📈 **Trends** | Global / Japan trends display, WOEID toggle | Tab switching |
| ⚙️ **Settings** | Connection status, manual cron jobs, API endpoints, **consent revocation** | Buttons |

### 💡 Tweet Card Interactions

| Action | Description |
|--------|-------------|
| ❤️ **Like / Unlike** | Click ❤️ on any tweet card to toggle like (changes to 💖) |
| 🔄 **Retweet** | Click 🔄 to retweet |
| 💬 **Reply** | Click 💬 to show inline reply form |
| 👤 **Follow / Unfollow** | Via `POST /api/follow/:id` / `POST /api/unfollow/:id` |

### 🔧 Backend API

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Admin** | `GET /api/health` | Health check (KV/D1/Twitter status) |
| | `GET /api/status` | Detailed status with account info |
| **Tweets** | `POST /api/tweet` | Post tweet (text, media_urls, reply_to, schedule_at) |
| | `POST /api/thread` | Post thread (multiple tweets as reply chain) |
| | `DELETE /api/tweet/:id` | Delete tweet |
| | `GET /api/tweet/:id` | Tweet detail |
| **Timeline** | `GET /api/timeline?count=&cursor=` | Home timeline (cursor pagination) |
| **Search** | `GET /api/search?q=&type=&count=&cursor=` | Search (Top/Latest/Media, cursor) |
| **User** | `GET /api/user/:id` | User info (screen_name or ID) |
| | `GET /api/user/:id/tweets` | User's tweets |
| | `GET /api/user/:id/likes` | User's likes |
| | `GET /api/user/:id/followers` | Followers list |
| | `GET /api/user/:id/following` | Following list |
| **Like** | `POST /api/tweet/:id/like` | Like a tweet |
| | `POST /api/tweet/:id/unlike` | Unlike a tweet |
| **Retweet** | `POST /api/tweet/:id/retweet` | Retweet |
| | `POST /api/tweet/:id/unretweet` | Unretweet |
| **Follow** | `POST /api/follow/:id` | Follow user |
| | `POST /api/unfollow/:id` | Unfollow user |
| **DM** | `GET /api/dm` | List DMs |
| | `POST /api/dm` | Send DM (user_id, text) |
| **Trends** | `GET /api/trends?woeid=` | Get trends (1=World, 23424856=Japan) |
| **Cron** | `POST /api/cron/trends` | Save trends to D1 |
| | `POST /api/cron/scheduled-tweets` | Execute scheduled tweets |
| | `POST /api/cron/cleanup` | Delete logs older than 30 days |

### ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1`-`8` | Switch pages (sidebar order) |
| `N` | Open compose page |
| `/` | Open search page (auto-focus input) |
| `R` | Refresh current page |

### 🎨 UI/UX Features

| Feature | Description |
|---------|-------------|
| 🌓 Dark Theme | Glassmorphism design with frosted-glass effects |
| 📱 Responsive | Mobile-friendly with hamburger menu |
| ♾️ **Infinite Scroll** | IntersectionObserver-based auto-pagination (timeline & search) |
| 💬 **Inline Reply** | Reply directly within tweet cards |
| 🔔 **Toast Notifications** | Operation feedback popups |
| 🦴 **Skeleton Loading** | Placeholder cards while loading |
| ⚡ **SPA Navigation** | Fast page transitions without full reload |
| 🔄 **Auto Status Updates** | Connection status refresh every 60s |

### ⚖️ Consent & Disclaimer System

| Feature | Description |
|---------|-------------|
| 🪟 **First-visit Modal** | 7-item disclaimer on first access (controlled via `localStorage`) |
| ✅ **Agree** | Button click → normal usage |
| ✖️ **Decline** | Redirects to Google.com |
| ⌨️ **Escape Key** | Triggers decline (same as above) |
| 🔄 **Revoke Consent** | "Revoke consent" button in Settings page |
| 📜 **Footer Disclaimer** | Always visible on all pages |
| ⚙️ **Settings Page** | Embedded disclaimer card for re-reading |

---

## 🏗 Architecture

```
twiworker/
├── public/                    # Static assets (SPA)
│   ├── index.html             # Main page + consent modal + footer
│   ├── style.css              # Dark theme UI (glassmorphism)
│   ├── app.js                 # Shared JS (nav, API, toasts, infinite scroll, consent modal)
│   └── pages/                 # Page-specific JS (8 pages)
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
│   └── [[route]].ts          # Catch-all routing to Hono
├── src/                       # Backend TypeScript
│   ├── index.ts               # Hono app & routes (all API endpoints)
│   ├── client.ts              # Twitter GraphQL API client
│   ├── types.ts               # Type definitions
│   ├── config.ts              # Configuration management
│   ├── handlers/              # Feature handlers (9 files)
│   │   ├── tweet.ts           # Post/delete tweets
│   │   ├── timeline.ts        # Home timeline
│   │   ├── search.ts          # Search
│   │   ├── user.ts            # User info
│   │   ├── interaction.ts     # Like/retweet/follow
│   │   ├── dm.ts              # Direct messages
│   │   ├── trends.ts          # Trending topics
│   │   ├── cron.ts            # Cron jobs
│   │   └── admin.ts           # Health check & status
│   ├── storage/
│   │   ├── d1.ts              # D1 database
│   │   └── kv.ts              # KV store
│   └── middleware/
│       └── ratelimit.ts       # Rate limiting
├── migrations/
│   └── 0000_init.sql          # D1 table definitions
├── wrangler.toml
├── package.json
├── tsconfig.json
└── .dev.vars.example          # Local env var template
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

## 🔌 API Endpoints (Full List)

### Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check (KV/D1/Twitter connection status) |
| GET | `/api/status` | Detailed status with account info |

### Tweet Operations

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tweet` | Post a tweet (body: `{text, media_urls?, reply_to?, schedule_at?}`) |
| POST | `/api/thread` | Post a thread (body: `{tweets: [{text, media_urls?}]}`) |
| DELETE | `/api/tweet/:id` | Delete a tweet |
| GET | `/api/tweet/:id` | Tweet detail |

### Data Retrieval

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/timeline?count=20&cursor=` | Home timeline (cursor pagination) |
| GET | `/api/search?q=keyword&type=Top&count=20&cursor=` | Search (Top/Latest/Media, cursor) |
| GET | `/api/user/:id` | User info (screen_name or user_id) |
| GET | `/api/user/:id/tweets` | User's tweets |
| GET | `/api/user/:id/likes` | User's likes |
| GET | `/api/user/:id/followers` | Followers list |
| GET | `/api/user/:id/following` | Following list |
| GET | `/api/trends?woeid=1` | Trends (1=World, 23424856=Japan) |

### Interactions

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tweet/:id/like` | Like a tweet |
| POST | `/api/tweet/:id/unlike` | Unlike a tweet |
| POST | `/api/tweet/:id/retweet` | Retweet |
| POST | `/api/tweet/:id/unretweet` | Unretweet |
| POST | `/api/follow/:id` | Follow a user |
| POST | `/api/unfollow/:id` | Unfollow a user |

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
| `TWITTER_COOKIES` | ✅ | Twitter cookies JSON (auth_token, ct0, twid, kdt, lang, _twitter_sess) |
| `ACCOUNT_USERNAME` | Optional | Twitter username |
| `SITE_URL` | Optional | Site URL (for CORS) |
| `ADMIN_API_KEY` | Optional | Admin API key |
| `DEBUG` | Optional | Enable debug logging |

---

## 🔧 Maintenance

### Updating GraphQL Query IDs

Twitter periodically rotates internal API query IDs. If tweets, timeline, or search suddenly stop working, update the `ENDPOINTS` in `src/client.ts` by checking the latest [twikit](https://github.com/d60/twikit) source code.

Currently supported endpoints:
`CreateTweet`, `DeleteTweet`, `SearchTimeline`, `HomeTimeline`, `UserByScreenName`, `UserTweets`, `TweetDetail`, `Followers`, `Following`, `FavoriteTweet`, `UnfavoriteTweet`, `CreateRetweet`, `DeleteRetweet`, `UserByRestId`, `UserLikes`

### Refreshing cookies

`auth_token` and `ct0` have expiration dates. Re-fetch the cookies from your browser every 1–2 months and update `TWITTER_COOKIES`.

### Resetting D1

```bash
# Drop and recreate tables
npx wrangler d1 execute twiworker-db --remote --command="DROP TABLE IF EXISTS tweets; DROP TABLE IF EXISTS scheduled_tweets; DROP TABLE IF EXISTS trends_log; DROP TABLE IF EXISTS dm_log;"
npx wrangler d1 execute twiworker-db --remote --file=migrations/0000_init.sql
```

---

## ⚠️ Important: Terms of Use

> **This software is provided for Educational and Research Purposes ONLY.**

### Disclaimer

1. **Educational & Research Purpose** — This software was developed for the sole purpose of academically studying and researching the internal API specifications of Twitter/X. It is not intended for commercial or production use.

2. **Not Affiliated with X Corp.** — This software is **not affiliated with, endorsed by, or sponsored by X Corp. (formerly Twitter)**. It is not an official X product, service, or partner application.

3. **Unofficial Client** — This is an unofficial client that utilizes Twitter's internal/private APIs, not the official public X API. These internal API specifications may change without notice.

4. **Terms of Service Compliance** — Users are solely responsible for complying with X Corp.'s [Terms of Service](https://x.com/tos), [Developer Agreement](https://developer.twitter.com/en/developer-terms), and [Automation Rules](https://help.twitter.com/rules-and-policies/twitter-automation). Be aware that using this software may violate these terms.

5. **Use at Your Own Risk** — **The developers assume no liability** for any damages, data loss, account suspension, or legal action resulting from the use of this software. All risks and responsibilities lie with the user.

6. **Account Suspension Risk** — Using unofficial internal APIs may violate X Corp.'s automation policies and could result in temporary or permanent account suspension. Use with caution and avoid using with critical accounts.

7. **Cookie Handling** — This software uses your Twitter authentication cookies. These cookies are sensitive credentials. Do not share them with third parties or commit them to public repositories.

8. **Rate Limiting & Server Load** — Avoid placing excessive load on X's servers. Respect appropriate rate limits.

9. **No Warranty** — This software is provided "AS-IS" without any warranty, express or implied.

10. **Right to Change** — These terms may be updated without notice. Regularly check for the latest version.

---

**Summary: This tool is for learning and research. Not affiliated with X Corp. Use at your own risk.**

---

## 📝 License

MIT

---

## 🙏 Credits

- [twikit](https://github.com/d60/twikit) — Python Twitter client (GraphQL endpoint reference)
- [Hono](https://hono.dev/) — Lightweight web framework
- [Cloudflare Pages](https://pages.cloudflare.com/) — Serverless hosting
