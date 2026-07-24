/**
 * タイムラインハンドラー
 */

import type { Context } from 'hono';
import type { Env } from '../types';
import type { TwitterClient } from '../client';

export class TimelineHandler {
  constructor(private client: TwitterClient) {}

  async getTimeline(c: Context<{ Bindings: Env }>) {
    const count = Math.min(Math.max(parseInt(c.req.query('count') ?? '20', 10) || 20, 1), 100);
    const cursor = c.req.query('cursor') || undefined;
    const result = await this.client.getHomeTimeline(count, cursor);
    return c.json({ success: true, data: { type: 'home', count: result.tweets.length, tweets: result.tweets, cursor: result.cursor } });
  }
}
