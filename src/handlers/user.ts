/**
 * ユーザー情報ハンドラー
 */

import type { Context } from 'hono';
import type { Env } from '../types';
import type { TwitterClient } from '../client';

export class UserHandler {
  constructor(private client: TwitterClient) {}

  async getUser(c: Context<{ Bindings: Env }>) {
    const userId = c.req.param('id');
    const userInfo = await this.client.getUserInfo(userId);
    return c.json({ success: true, data: userInfo });
  }

  async getUserTweets(c: Context<{ Bindings: Env }>) {
    const userId = c.req.param('id');
    const count = Math.min(Math.max(parseInt(c.req.query('count') ?? '20', 10) || 20, 1), 100);
    const tweets = await this.client.getUserTweets(userId, count);
    return c.json({ success: true, data: { user_id: userId, count: tweets.length, tweets } });
  }
}
