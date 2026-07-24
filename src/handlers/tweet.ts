/**
 * ツイート操作ハンドラー
 */

import type { Context } from 'hono';
import type { Env } from '../types';
import type { TwitterClient } from '../client';
import type { D1Store } from '../storage/d1';

export class TweetHandler {
  constructor(
    private client: TwitterClient,
    private d1: D1Store,
  ) {}

  async postTweet(c: Context<{ Bindings: Env }>) {
    const { text, media_urls, reply_to } = await c.req.json<{
      text?: string;
      media_urls?: string[];
      reply_to?: string;
    }>();

    if (!text?.trim()) {
      return c.json({ success: false, error: { code: 'validation_error', message: 'text is required' } }, 400);
    }
    if (text.length > 280) {
      return c.json({ success: false, error: { code: 'validation_error', message: 'text must be 280 characters or less' } }, 400);
    }

    const result = await this.client.postTweet(text.trim(), media_urls, reply_to);

    if (this.d1.available && result.tweetId) {
      await this.d1.logTweet(result.tweetId, 1, text, media_urls);
    }

    return c.json({ success: true, data: result }, 201);
  }

  async getTweet(c: Context<{ Bindings: Env }>) {
    const tweetId = c.req.param('id');
    const tweet = await this.client.getTweet(tweetId);
    return c.json({ success: true, data: tweet });
  }

  async deleteTweet(c: Context<{ Bindings: Env }>) {
    const tweetId = c.req.param('id');
    await this.client.deleteTweet(tweetId);
    return c.json({ success: true, data: { deleted: true, tweet_id: tweetId } });
  }
}
