/**
 * twiworker v0.2.0 — ブックマークハンドラー
 */
import { Context } from 'hono';
import type { Env } from '../types';
import { TwitterClient } from '../client';

export class BookmarkHandler {
  constructor(private client: TwitterClient) {}

  async getBookmarks(c: Context<{ Bindings: Env }>) {
    const count = Math.min(Math.max(parseInt(c.req.query('count') ?? '20', 10) || 20, 1), 100);
    const cursor = c.req.query('cursor') || undefined;
    const result = await this.client.getBookmarks(count, cursor);
    return c.json({ success: true, data: { count: result.bookmarks.length, bookmarks: result.bookmarks, cursor: result.cursor } });
  }

  async createBookmark(c: Context<{ Bindings: Env }>) {
    const { tweet_id } = await c.req.json<{ tweet_id: string }>();
    if (!tweet_id) {
      return c.json({ success: false, error: { code: 'validation_error', message: 'tweet_id is required' } }, 400);
    }
    await this.client.createBookmark(tweet_id);
    return c.json({ success: true, data: { bookmarked: true } });
  }

  async deleteBookmark(c: Context<{ Bindings: Env }>) {
    const tweetId = c.req.param('id');
    if (!tweetId) return c.json({ success: false, error: { code: 'validation_error', message: 'tweet id is required' } }, 400);
    await this.client.deleteBookmark(tweetId);
    return c.json({ success: true, data: { bookmarked: false } });
  }
}
