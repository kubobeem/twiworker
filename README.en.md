# twiworker 🐦

> **🇯🇵 日本語版はこちら → [README.md](README.md)**

**Twitter/X Client running on Cloudflare Pages + Functions**

A web application that accesses Twitter's internal GraphQL API using cookie-based authentication. Post/delete/search tweets, view timelines with infinite scroll, like/retweet/follow, send DMs, and fetch trends — all from your browser.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen?style=flat-square&logo=cloudflare)](https://twiworker.pages.dev)
![GitHub](https://img.shields.io/github/license/kubobeem/twiworker?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Hono](https://img.shields.io/badge/Hono-4.7-orange?style=flat-square)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare)
![Version](https://img.shields.io/badge/version-0.2.0-purple?style=flat-square)

---

## ✨ v0.2.0 New Features

### 🎨 X-Style UI Redesign

| Feature | Description |
|---------|-------------|
| 🏠 **3-Column Layout** | Left: Navigation / Center: Main Content / Right: Trends+Search |
| 🖼️ **Profile Images** | Real profile images on tweet cards (with letter fallback) |
| 🎯 **X-Style Tweet Cards** | Like, retweet, reply, bookmark actions |
| 📱 **Responsive** | Desktop 3-col / Tablet compact / Mobile hamburger menu |

### 🆕 New Pages

| Page | Features |
|------|----------|
| 👤 **Profile** | User info, tweets/likes tabs |
| 🔔 **Notifications** | Like/retweet/follow/mention filters |
| 🔖 **Bookmarks** | Bookmarked tweets with infinite scroll |
| 📋 **Lists** | Create lists, view list tweets |
| ✉️ **DM 2-Pane** | Conversation list + message view |

### ⌨️ Keyboard Shortcuts (v0.2.0)

| Key | Action |
|-----|--------|
| `1`-`9` | Switch pages (1:Home 2:Explore 3:Notif 4:DM 5:Lists 6:Bookmarks 7:Profile 8:Compose 9:Schedule) |
| `0` | Settings |
| `N` | New tweet |
| `/` | Search |
| `R` | Refresh |
| `B` | Bookmarks |
| `L` | Lists |
| `Ctrl+Enter` | Post tweet |

### 🆕 New API Endpoints (v0.2.0)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bookmarks` | List bookmarks |
| POST | `/api/bookmarks` | Add bookmark |
| DELETE | `/api/bookmarks/:id` | Remove bookmark |
| GET | `/api/lists` | List your lists |
| POST | `/api/lists` | Create list |
| GET | `/api/lists/:id/tweets` | List tweets |
| DELETE | `/api/lists/:id` | Delete list |
| GET | `/api/lists/:id/members` | List members |
| GET | `/api/notifications` | Get notifications |
| POST | `/api/tweet/:id/vote` | Vote on poll |
| GET | `/api/spaces/:id` | Get space |
| GET | `/api/spaces/search` | Search spaces |
| GET | `/api/dm/conversations` | DM conversations |
| GET | `/api/dm/conversation/:id` | DM conversation messages |

---

## 🏗 Architecture

```
twiworker/
├── public/                    # Static assets (SPA)
│   ├── index.html             # 3-column layout + consent modal + footer
│   ├── style.css              # X-style UI (3-column layout)
│   ├── app.js                 # Shared JS (nav, API, toasts, infinite scroll, tweet cards)
│   └── pages/                 # Page-specific JS (10 pages)
│       ├── timeline.js        # Home timeline
│       ├── search.js          # Explore / Search
│       ├── notifications.js   # Notifications 🆕
│       ├── dm.js              # DM 2-pane
│       ├── lists.js           # Lists 🆕
│       ├── bookmarks.js       # Bookmarks 🆕
│       ├── profile.js         # Profile 🆕
│       ├── compose.js         # Compose (with polls)
│       ├── schedule.js        # Schedule
│       └── settings.js        # Settings
├── functions/api/             # Cloudflare Pages Functions
│   ├── _middleware.ts         # CORS
│   └── [[route]].ts          # Routing to Hono
├── src/                       # Backend TypeScript
│   ├── index.ts               # Hono app & routes
│   ├── client.ts              # Twitter GraphQL API client
│   ├── types.ts               # Type definitions
│   ├── config.ts              # Configuration
│   ├── handlers/              # Feature handlers (14 files)
│   │   ├── tweet.ts           # Post/delete tweets
│   │   ├── timeline.ts        # Home timeline
│   │   ├── search.ts          # Search
│   │   ├── user.ts            # User info
│   │   ├── interaction.ts     # Like/retweet/follow
│   │   ├── dm.ts              # DM
│   │   ├── trends.ts          # Trends
│   │   ├── cron.ts            # Cron jobs
│   │   ├── admin.ts           # Health check
│   │   ├── bookmark.ts        # Bookmarks 🆕
│   │   ├── list.ts            # Lists 🆕
│   │   ├── notification.ts    # Notifications 🆕
│   │   ├── poll.ts            # Polls 🆕
│   │   └── space.ts           # Spaces 🆕
│   ├── storage/
│   │   ├── d1.ts              # D1 database
│   │   └── kv.ts              # KV store
│   ├── middleware/
│   │   └── ratelimit.ts       # Rate limiting
│   └── __tests__/             # Unit tests 🆕
│       └── client.test.ts     # Vitest tests
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
| Frontend | Vanilla JS (SPA) + CSS (X-style dark theme, 3-column) |
| Backend | TypeScript + [Hono](https://hono.dev/) |
| Testing | [Vitest](https://vitest.dev/) 🆕 |
| Auth | Twitter cookies (internal GraphQL API) |
| Storage | Cloudflare KV (rate limiting) + D1 (logs, schedules) |
| Hosting | Cloudflare Pages + Functions |

---

## 🚀 Deployment Guide

**Prerequisites:** Cloudflare account (free) + Twitter/X account

### 1. Login & Clone

```bash
npx wrangler login
git clone https://github.com/kubobeem/twiworker.git
cd twiworker
npm install
```

### 2. Configure KV + D1

```bash
npx wrangler kv namespace create twiworker-kv
npx wrangler d1 create twiworker-db
```

Update IDs in `wrangler.toml`, then:

```bash
npx wrangler d1 execute twiworker-db --local --file=migrations/0000_init.sql
npx wrangler d1 execute twiworker-db --remote --file=migrations/0000_init.sql
```

### 3. Create Pages project

```bash
npx wrangler pages project create twiworker --production-branch main
```

### 4. Set Twitter cookies

```bash
npx wrangler pages secret put TWITTER_COOKIES --project-name=twiworker
```

Paste JSON:
```json
{"auth_token":"...","ct0":"...","twid":"u%3D...","kdt":"...","lang":"ja","_twitter_sess":"..."}
```

### 5. Deploy

```bash
npx wrangler pages deploy public --project-name twiworker --branch main
```

### 6. Local Development

```bash
cp .dev.vars.example .dev.vars
npm run dev
# → http://localhost:8788
```

---

## 🧪 Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `TWITTER_COOKIES` | ✅ | Twitter cookies JSON (auth_token, ct0, twid, kdt, lang, _twitter_sess) |
| `ACCOUNT_USERNAME` | Optional | Twitter username |
| `SITE_URL` | Optional | Site URL (for CORS) |
| `ADMIN_API_KEY` | Optional | Admin API key |
| `DEBUG` | Optional | Enable debug logging |

---

## ⚠️ Important: Terms of Use

> **This software is provided for Educational and Research Purposes ONLY.**

**Summary: This tool is for learning and research. Not affiliated with X Corp. Use at your own risk.**

---

## 📝 License

MIT

---

## 🙏 Credits

- [twikit](https://github.com/d60/twikit) — Python Twitter client
- [Hono](https://hono.dev/) — Lightweight web framework
- [Cloudflare Pages](https://pages.cloudflare.com/) — Serverless hosting
- [Vitest](https://vitest.dev/) — Test runner
