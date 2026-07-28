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
    const { text, media_urls, reply_to, poll, schedule_at } = await c.req.json<{
      text?: string;
      media_urls?: string[];
      reply_to?: string;
      poll?: { options: string[]; duration_minutes: number };
      schedule_at?: string;
    }>();

    if (!text?.trim()) {
      return c.json({ success: false, error: { code: 'validation_error', message: 'text is required' } }, 400);
    }
    if (text.length > 280) {
      return c.json({ success: false, error: { code: 'validation_error', message: 'text must be 280 characters or less' } }, 400);
    }

    // 予約ツイートの場合
    if (schedule_at) {
      if (this.d1.available) {
        const d1AccountId = 1;
        await this.d1.createScheduledTweet(d1AccountId, text.trim(), schedule_at, media_urls);
        return c.json({ success: true, data: { scheduled: true, schedule_at } }, 201);
      }
      return c.json({ success: false, error: { code: 'd1_unavailable', message: 'D1 is not available for scheduling' } }, 503);
    }

    const result = await this.client.postTweet(text.trim(), media_urls, reply_to, poll);

    if (this.d1.available && result.tweetId) {
      await this.d1.logTweet(result.tweetId, 1, text, media_urls);
    }

    return c.json({ success: true, data: result }, 201);
  }

  async getTweet(c: Context<{ Bindings: Env }>) {
    const tweetId = c.req.param('id');
    if (!tweetId) return c.json({ success: false, error: { code: 'validation_error', message: 'tweet id is required' } }, 400);
    const tweet = await this.client.getTweet(tweetId);
    return c.json({ success: true, data: tweet });
  }

  async deleteTweet(c: Context<{ Bindings: Env }>) {
    const tweetId = c.req.param('id');
    if (!tweetId) return c.json({ success: false, error: { code: 'validation_error', message: 'tweet id is required' } }, 400);
    await this.client.deleteTweet(tweetId);
    return c.json({ success: true, data: { deleted: true, tweet_id: tweetId } });
  }
}
