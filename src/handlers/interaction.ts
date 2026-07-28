/**
 * インタラクションハンドラー（いいね・リポスト・フォロー）
 */
import { Context } from 'hono';
import type { Env } from '../types';
import { TwitterClient } from '../client';

export class InteractionHandler {
  constructor(private client: TwitterClient) {}

  async likeTweet(c: Context<{ Bindings: Env }>) {
    const tweetId = c.req.param('id');
    if (!tweetId) return c.json({ success: false, error: { code: 'validation_error', message: 'id is required' } }, 400);
    await this.client.likeTweet(tweetId);
    return c.json({ success: true, data: { liked: true } });
  }

  async unlikeTweet(c: Context<{ Bindings: Env }>) {
    const tweetId = c.req.param('id');
    if (!tweetId) return c.json({ success: false, error: { code: 'validation_error', message: 'id is required' } }, 400);
    await this.client.unlikeTweet(tweetId);
    return c.json({ success: true, data: { liked: false } });
  }

  async retweet(c: Context<{ Bindings: Env }>) {
    const tweetId = c.req.param('id');
    if (!tweetId) return c.json({ success: false, error: { code: 'validation_error', message: 'id is required' } }, 400);
    const { retweetId } = await this.client.retweet(tweetId);
    return c.json({ success: true, data: { retweetId } });
  }

  async unretweet(c: Context<{ Bindings: Env }>) {
    const tweetId = c.req.param('id');
    if (!tweetId) return c.json({ success: false, error: { code: 'validation_error', message: 'id is required' } }, 400);
    await this.client.unretweet(tweetId);
    return c.json({ success: true, data: { retweeted: false } });
  }

  async followUser(c: Context<{ Bindings: Env }>) {
    const userId = c.req.param('id');
    if (!userId) return c.json({ success: false, error: { code: 'validation_error', message: 'id is required' } }, 400);
    await this.client.followUser(userId);
    return c.json({ success: true, data: { following: true } });
  }

  async unfollowUser(c: Context<{ Bindings: Env }>) {
    const userId = c.req.param('id');
    if (!userId) return c.json({ success: false, error: { code: 'validation_error', message: 'id is required' } }, 400);
    await this.client.unfollowUser(userId);
    return c.json({ success: true, data: { following: false } });
  }
}
