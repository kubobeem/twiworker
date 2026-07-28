/**
 * twiworker v0.2.0 — リストハンドラー
 */
import { Context } from 'hono';
import type { Env } from '../types';
import { TwitterClient } from '../client';

export class ListHandler {
  constructor(private client: TwitterClient) {}

  async getLists(c: Context<{ Bindings: Env }>) {
    const lists = await this.client.getMyLists();
    return c.json({ success: true, data: { count: lists.length, lists } });
  }

  async getListTweets(c: Context<{ Bindings: Env }>) {
    const listId = c.req.param('id');
    if (!listId) return c.json({ success: false, error: { code: 'validation_error', message: 'list id is required' } }, 400);
    const count = Math.min(Math.max(parseInt(c.req.query('count') ?? '20', 10) || 20, 1), 100);
    const cursor = c.req.query('cursor') || undefined;
    const result = await this.client.getListTweets(listId, count, cursor);
    return c.json({ success: true, data: { list_id: listId, count: result.tweets.length, tweets: result.tweets, cursor: result.cursor } });
  }

  async createList(c: Context<{ Bindings: Env }>) {
    const { name, description, is_private } = await c.req.json<{ name: string; description?: string; is_private?: boolean }>();
    if (!name?.trim()) {
      return c.json({ success: false, error: { code: 'validation_error', message: 'name is required' } }, 400);
    }
    const list = await this.client.createList(name.trim(), description, is_private);
    return c.json({ success: true, data: list }, 201);
  }

  async deleteList(c: Context<{ Bindings: Env }>) {
    const listId = c.req.param('id');
    if (!listId) return c.json({ success: false, error: { code: 'validation_error', message: 'list id is required' } }, 400);
    await this.client.deleteList(listId);
    return c.json({ success: true, data: { deleted: true } });
  }

  async getListMembers(c: Context<{ Bindings: Env }>) {
    const listId = c.req.param('id');
    if (!listId) return c.json({ success: false, error: { code: 'validation_error', message: 'list id is required' } }, 400);
    const count = Math.min(Math.max(parseInt(c.req.query('count') ?? '20', 10) || 20, 1), 100);
    const members = await this.client.getListMembers(listId, count);
    return c.json({ success: true, data: { list_id: listId, count: members.length, members } });
  }
}
