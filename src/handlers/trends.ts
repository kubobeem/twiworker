/**
 * トレンドハンドラー
 */

import type { Context } from 'hono';
import type { Env } from '../types';
import type { TwitterClient } from '../client';
import type { D1Store } from '../storage/d1';

export class TrendsHandler {
  constructor(
    private client: TwitterClient,
    private d1: D1Store,
  ) {}

  async getTrends(c: Context<{ Bindings: Env }>) {
    const woeid = parseInt(c.req.query('woeid') ?? '1', 10) || 1;
    const trends = await this.client.getTrends(woeid);

    if (this.d1.available) {
      await this.d1.logTrends(woeid, trends);
    }

    return c.json({ success: true, data: { woeid, count: trends.length, trends } });
  }
}
