/**
 * twiworker v0.2.0 — 投票ハンドラー
 */
import { Context } from 'hono';
import type { Env } from '../types';
import { TwitterClient } from '../client';

export class PollHandler {
  constructor(private client: TwitterClient) {}

  async vote(c: Context<{ Bindings: Env }>) {
    const tweetId = c.req.param('id');
    if (!tweetId) return c.json({ success: false, error: { code: 'validation_error', message: 'tweet id is required' } }, 400);
    const { choice } = await c.req.json<{ choice: number }>();
    if (choice === undefined || choice < 0 || choice > 3) {
      return c.json({ success: false, error: { code: 'validation_error', message: 'choice (0-3) is required' } }, 400);
    }
    await this.client.vote(tweetId, choice);
    return c.json({ success: true, data: { voted: true } });
  }
}
