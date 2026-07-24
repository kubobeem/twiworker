/**
 * Cron ジョブハンドラー
 */

import type { Context } from 'hono';
import type { Env } from '../types';
import type { TwitterClient } from '../client';
import type { D1Store } from '../storage/d1';

export class CronHandler {
  constructor(
    private client: TwitterClient,
    private d1: D1Store,
  ) {}

  async fetchTrends(c?: Context<{ Bindings: Env }>) {
    if (!this.d1.available) {
      if (c) return c.json({ success: false, error: { code: 'd1_unavailable', message: 'D1 is not available' } }, 503);
      return;
    }

    for (const woeid of [1, 23424856]) {
      const trends = await this.client.getTrends(woeid);
      await this.d1.logTrends(woeid, trends);
    }

    if (c) return c.json({ success: true, data: { message: 'Trends saved', locations: ['worldwide', 'japan'] } });
  }

  async processScheduledTweets(c?: Context<{ Bindings: Env }>) {
    if (!this.d1.available) {
      if (c) return c.json({ success: false, error: { code: 'd1_unavailable', message: 'D1 is not available' } }, 503);
      return;
    }

    const pending = await this.d1.getPendingScheduledTweets();
    const results: any[] = [];

    for (const st of pending) {
      try {
        const result = await this.client.postTweet(st.text);
        await this.d1.updateScheduledTweetStatus(st.id, 'posted');
        await this.d1.logTweet(result.tweetId, st.account_id, st.text);
        results.push({ id: st.id, status: 'posted', tweet_id: result.tweetId });
      } catch (e: any) {
        await this.d1.updateScheduledTweetStatus(st.id, 'failed', e.message);
        results.push({ id: st.id, status: 'failed', error: e.message });
      }
    }

    if (c) return c.json({ success: true, data: { processed: results.length, results } });
  }

  async cleanup(c?: Context<{ Bindings: Env }>) {
    if (!this.d1.available) {
      if (c) return c.json({ success: false, error: { code: 'd1_unavailable', message: 'D1 is not available' } }, 503);
      return;
    }

    await this.d1.cleanupOldLogs();
    if (c) return c.json({ success: true, data: { message: 'Old logs cleaned up' } });
  }
}
