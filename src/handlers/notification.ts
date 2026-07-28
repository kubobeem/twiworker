/**
 * twiworker v0.2.0 — 通知ハンドラー
 */
import { Context } from 'hono';
import type { Env, NotificationFilter } from '../types';
import { TwitterClient } from '../client';

export class NotificationHandler {
  constructor(private client: TwitterClient) {}

  async getNotifications(c: Context<{ Bindings: Env }>) {
    const rawFilter = c.req.query('filter') ?? 'all';
    const validFilters: NotificationFilter[] = ['all', 'mentions', 'likes', 'retweets', 'follows'];
    const filter = validFilters.includes(rawFilter as NotificationFilter) ? rawFilter as NotificationFilter : 'all';
    const cursor = c.req.query('cursor') || undefined;
    const result = await this.client.getNotifications(filter, cursor);
    return c.json({ success: true, data: { count: result.notifications.length, notifications: result.notifications, cursor: result.cursor } });
  }
}
