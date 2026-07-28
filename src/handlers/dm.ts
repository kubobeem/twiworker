/**
 * twiworker v0.2.0 — DM ハンドラー
 */
import { Context } from 'hono';
import type { Env, DM } from '../types';
import { TwitterClient } from '../client';
import { D1Store } from '../storage/d1';

export class DmHandler {
  constructor(
    private client: TwitterClient,
    private d1: D1Store,
  ) {}

  /**
   * DMリスト取得（D1 に保存されたログから）
   */
  async getDMs(c: Context<{ Bindings: Env }>) {
    const limit = Math.min(parseInt(c.req.query('limit') ?? '20', 10), 50);
    const dms = await this.d1.getDMs(limit);
    return c.json({ success: true, data: { dms } });
  }

  /**
   * DM送信（v1.1 REST API経由）
   */
  async sendDM(c: Context<{ Bindings: Env }>) {
    const { user_id, text } = await c.req.json<{ user_id: string; text: string }>();
    if (!user_id || !text) {
      return c.json({ success: false, error: { code: 'validation_error', message: 'user_id and text are required' } }, 400);
    }

    try {
      await this.client.sendDM(user_id, text);
      this.d1.logDm(`out_${Date.now()}`, 0, user_id, '', text, 'out').catch(() => {});
      return c.json({ success: true, data: { sent: true } });
    } catch (err: any) {
      return c.json({ success: false, error: { code: 'dm_error', message: err.message } }, 500);
    }
  }

  /**
   * DM会話一覧を取得
   */
  async getConversations(c: Context<{ Bindings: Env }>) {
    const conversations = await this.client.getDMConversations();
    return c.json({ success: true, data: { count: conversations.length, conversations } });
  }

  /**
   * DM会話のメッセージを取得
   */
  async getConversation(c: Context<{ Bindings: Env }>) {
    const convId = c.req.param('id');
    if (!convId) {
      return c.json({ success: false, error: { code: 'validation_error', message: 'conversation id is required' } }, 400);
    }
    const messages = await this.client.getDMConversation(convId);
    return c.json({ success: true, data: { conversation_id: convId, count: messages.length, messages } });
  }
}
