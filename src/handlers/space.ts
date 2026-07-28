/**
 * twiworker v0.2.0 — スペースハンドラー
 */
import { Context } from 'hono';
import type { Env } from '../types';
import { TwitterClient } from '../client';

export class SpaceHandler {
  constructor(private client: TwitterClient) {}

  async getSpace(c: Context<{ Bindings: Env }>) {
    const spaceId = c.req.param('id');
    if (!spaceId) return c.json({ success: false, error: { code: 'validation_error', message: 'space id is required' } }, 400);
    const space = await this.client.getSpace(spaceId);
    return c.json({ success: true, data: space });
  }

  async searchSpaces(c: Context<{ Bindings: Env }>) {
    const query = c.req.query('q');
    if (!query) {
      return c.json({ success: false, error: { code: 'validation_error', message: 'q (query) is required' } }, 400);
    }
    const count = Math.min(Math.max(parseInt(c.req.query('count') ?? '20', 10) || 20, 1), 50);
    const spaces = await this.client.searchSpaces(query, count);
    return c.json({ success: true, data: { query, count: spaces.length, spaces } });
  }
}
