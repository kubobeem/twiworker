/**
 * twiworker v0.2.0 — Cloudflare Workers / Pages Functions で動く Twitter/X クライアント
 *
 * 全機能ルーティング
 */

import { Hono } from 'hono';
import type { Env } from './types';
import { TwitterClient } from './client';
import { KVStore } from './storage/kv';
import { D1Store } from './storage/d1';
import { RateLimiter } from './middleware/ratelimit';
import { TweetHandler } from './handlers/tweet';
import { SearchHandler } from './handlers/search';
import { TimelineHandler } from './handlers/timeline';
import { UserHandler } from './handlers/user';
import { TrendsHandler } from './handlers/trends';
import { DmHandler } from './handlers/dm';
import { InteractionHandler } from './handlers/interaction';
import { CronHandler } from './handlers/cron';
import { AdminHandler } from './handlers/admin';
import { BookmarkHandler } from './handlers/bookmark';
import { ListHandler } from './handlers/list';
import { NotificationHandler } from './handlers/notification';
import { PollHandler } from './handlers/poll';
import { SpaceHandler } from './handlers/space';

const app = new Hono<{ Bindings: Env }>();

// ---- レート制限ミドルウェア ----
app.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS') return next();

  const ip = c.req.header('CF-Connecting-IP')
    ?? c.req.header('X-Forwarded-For')?.split(',')[0]?.trim()
    ?? 'unknown';
  const limiter = new RateLimiter(c.env);
  const { allowed, remaining } = await limiter.check(c.req.method, c.req.path, ip);

  if (!allowed) {
    c.res = c.json(
      { success: false, error: { code: 'rate_limit_exceeded', message: 'リクエスト制限を超えました' } },
      429,
    );
    c.res.headers.set('X-RateLimit-Remaining', '0');
    return;
  }

  await next();
});

// ---- 各ハンドラーのインスタンスを作成 ----
function getHandlers(c: any) {
  const client = new TwitterClient(c.env);
  const kv = new KVStore(c.env);
  const d1 = new D1Store(c.env);
  return {
    tweet: new TweetHandler(client, d1),
    search: new SearchHandler(client),
    timeline: new TimelineHandler(client),
    user: new UserHandler(client),
    trends: new TrendsHandler(client, d1),
    dm: new DmHandler(client, d1),
    interaction: new InteractionHandler(client),
    cron: new CronHandler(client, d1),
    admin: new AdminHandler(client, c.env, kv, d1),
    bookmark: new BookmarkHandler(client),
    list: new ListHandler(client),
    notification: new NotificationHandler(client),
    poll: new PollHandler(client),
    space: new SpaceHandler(client),
    client, d1,
  };
}

// ---- 管理系 ----
app.get('/api/health', async (c) => {
  const { client, admin } = getHandlers(c);
  await client.initialize();
  return c.json({ success: true, data: await admin.health() });
});

app.get('/api/status', async (c) => {
  const { client, admin } = getHandlers(c);
  await client.initialize();
  return c.json({ success: true, data: await admin.status() });
});

// ---- ツイート操作 ----
app.post('/api/tweet', async (c) => {
  const { client, tweet } = getHandlers(c);
  await client.initialize();
  return tweet.postTweet(c);
});

app.post('/api/thread', async (c) => {
  const { client } = getHandlers(c);
  await client.initialize();
  const { tweets } = await c.req.json<{ tweets: { text: string; media_urls?: string[] }[] }>();
  if (!tweets?.length || tweets.length < 2) {
    return c.json({ success: false, error: { code: 'validation_error', message: 'Thread needs at least 2 tweets' } }, 400);
  }
  const results = [];
  let replyTo: string | undefined;
  for (const t of tweets) {
    const result = await client.postTweet(t.text, t.media_urls, replyTo);
    results.push(result);
    replyTo = result.tweetId;
  }
  return c.json({ success: true, data: { tweets: results } }, 201);
});

app.get('/api/tweet/:id', async (c) => {
  const { client, tweet } = getHandlers(c);
  await client.initialize();
  return tweet.getTweet(c);
});

app.delete('/api/tweet/:id', async (c) => {
  const { client, tweet } = getHandlers(c);
  await client.initialize();
  return tweet.deleteTweet(c);
});

// ---- 検索 ----
app.get('/api/search', async (c) => {
  const { client, search } = getHandlers(c);
  await client.initialize();
  return search.search(c);
});

// ---- タイムライン ----
app.get('/api/timeline', async (c) => {
  const { client, timeline } = getHandlers(c);
  await client.initialize();
  return timeline.getTimeline(c);
});

// ---- ユーザー情報 ----
app.get('/api/user/:id', async (c) => {
  const { client, user } = getHandlers(c);
  await client.initialize();
  return user.getUser(c);
});

app.get('/api/user/:id/tweets', async (c) => {
  const { client, user } = getHandlers(c);
  await client.initialize();
  return user.getUserTweets(c);
});

app.get('/api/user/:id/likes', async (c) => {
  const { client, user } = getHandlers(c);
  await client.initialize();
  return user.getUserLikes(c);
});

app.get('/api/user/:id/followers', async (c) => {
  const { client, user } = getHandlers(c);
  await client.initialize();
  return user.getFollowers(c);
});

app.get('/api/user/:id/following', async (c) => {
  const { client, user } = getHandlers(c);
  await client.initialize();
  return user.getFollowing(c);
});

// ---- いいね / リポスト / フォロー ----
app.post('/api/tweet/:id/like', async (c) => {
  const { client, interaction } = getHandlers(c);
  await client.initialize();
  return interaction.likeTweet(c);
});

app.post('/api/tweet/:id/unlike', async (c) => {
  const { client, interaction } = getHandlers(c);
  await client.initialize();
  return interaction.unlikeTweet(c);
});

app.post('/api/tweet/:id/retweet', async (c) => {
  const { client, interaction } = getHandlers(c);
  await client.initialize();
  return interaction.retweet(c);
});

app.post('/api/tweet/:id/unretweet', async (c) => {
  const { client, interaction } = getHandlers(c);
  await client.initialize();
  return interaction.unretweet(c);
});

app.post('/api/follow/:id', async (c) => {
  const { client, interaction } = getHandlers(c);
  await client.initialize();
  return interaction.followUser(c);
});

app.post('/api/unfollow/:id', async (c) => {
  const { client, interaction } = getHandlers(c);
  await client.initialize();
  return interaction.unfollowUser(c);
});

// ---- ブックマーク ----
app.get('/api/bookmarks', async (c) => {
  const { client, bookmark } = getHandlers(c);
  await client.initialize();
  return bookmark.getBookmarks(c);
});

app.post('/api/bookmarks', async (c) => {
  const { client, bookmark } = getHandlers(c);
  await client.initialize();
  return bookmark.createBookmark(c);
});

app.delete('/api/bookmarks/:id', async (c) => {
  const { client, bookmark } = getHandlers(c);
  await client.initialize();
  return bookmark.deleteBookmark(c);
});

// ---- リスト ----
app.get('/api/lists', async (c) => {
  const { client, list } = getHandlers(c);
  await client.initialize();
  return list.getLists(c);
});

app.post('/api/lists', async (c) => {
  const { client, list } = getHandlers(c);
  await client.initialize();
  return list.createList(c);
});

app.get('/api/lists/:id/tweets', async (c) => {
  const { client, list } = getHandlers(c);
  await client.initialize();
  return list.getListTweets(c);
});

app.delete('/api/lists/:id', async (c) => {
  const { client, list } = getHandlers(c);
  await client.initialize();
  return list.deleteList(c);
});

app.get('/api/lists/:id/members', async (c) => {
  const { client, list } = getHandlers(c);
  await client.initialize();
  return list.getListMembers(c);
});

// ---- 通知 ----
app.get('/api/notifications', async (c) => {
  const { client, notification } = getHandlers(c);
  await client.initialize();
  return notification.getNotifications(c);
});

// ---- 投票 ----
app.post('/api/tweet/:id/vote', async (c) => {
  const { client, poll } = getHandlers(c);
  await client.initialize();
  return poll.vote(c);
});

// ---- スペース ----
app.get('/api/spaces/:id', async (c) => {
  const { client, space } = getHandlers(c);
  await client.initialize();
  return space.getSpace(c);
});

app.get('/api/spaces/search', async (c) => {
  const { client, space } = getHandlers(c);
  await client.initialize();
  return space.searchSpaces(c);
});

// ---- DM ----
app.get('/api/dm', async (c) => {
  const { client, dm } = getHandlers(c);
  await client.initialize();
  return dm.getDMs(c);
});

app.post('/api/dm', async (c) => {
  const { client, dm } = getHandlers(c);
  await client.initialize();
  return dm.sendDM(c);
});

app.get('/api/dm/conversations', async (c) => {
  const { client, dm } = getHandlers(c);
  await client.initialize();
  return dm.getConversations(c);
});

app.get('/api/dm/conversation/:id', async (c) => {
  const { client, dm } = getHandlers(c);
  await client.initialize();
  return dm.getConversation(c);
});

// ---- トレンド ----
app.get('/api/trends', async (c) => {
  const { client, trends } = getHandlers(c);
  await client.initialize();
  return trends.getTrends(c);
});

// ---- Cron ジョブ ----
app.post('/api/cron/trends', async (c) => {
  const { client, cron } = getHandlers(c);
  await client.initialize();
  return cron.fetchTrends(c);
});

app.post('/api/cron/scheduled-tweets', async (c) => {
  const { client, cron } = getHandlers(c);
  await client.initialize();
  return cron.processScheduledTweets(c);
});

app.post('/api/cron/cleanup', async (c) => {
  const { d1, cron } = getHandlers(c);
  return cron.cleanup(c);
});

// ---- Global Error Handler ----
app.onError((err, c) => {
  return c.json(
    { success: false, error: { code: 'internal_error', message: err.message } },
    500,
  );
});

// ---- 404 ----
app.all('*', (c) => {
  return c.json(
    { success: false, error: { code: 'not_found', message: `エンドポイント ${c.req.method} ${c.req.path} は見つかりませんでした` } },
    404,
  );
});

// ---- Exports ----
export { app };
export default app.fetch;
