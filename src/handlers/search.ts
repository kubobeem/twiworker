/**
 * 検索ハンドラー
 */

import type { Context } from 'hono';
import type { Env } from '../types';
import type { TwitterClient } from '../client';

export class SearchHandler {
  constructor(private client: TwitterClient) {}

  async search(c: Context<{ Bindings: Env }>) {
    const query = c.req.query('q');
    if (!query) {
      return c.json({ success: false, error: { code: 'validation_error', message: 'q (query) is required' } }, 400);
    }

    const count = Math.min(Math.max(parseInt(c.req.query('count') ?? '20', 10) || 20, 1), 100);
    const rawType = (c.req.query('type') ?? 'Top').toLowerCase();
    const typeMap: Record<string, 'Top' | 'Latest' | 'Media'> = {
      top: 'Top', latest: 'Latest', media: 'Media',
    };
    const product = typeMap[rawType];
    if (!product) {
      return c.json({ success: false, error: { code: 'validation_error', message: 'type must be Top, Latest, or Media' } }, 400);
    }
    const tweets = await this.client.searchTweets(query, count, product);
    const lang = c.req.query('lang');

    const filtered = lang ? tweets.filter(t => t.lang === lang) : tweets;

    return c.json({ success: true, data: { query, count: filtered.length, tweets: filtered } });
  }
}
