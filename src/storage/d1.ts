/**
 * D1 データベース操作
 */

import type { Env, Account, ScheduledTweet } from '../types';

export class D1Store {
  constructor(private env: Env) {}

  get available(): boolean {
    return !!this.env.DB;
  }

  // ---- アカウント ----

  async getAccount(username: string): Promise<Account | null> {
    if (!this.available) return null;
    const result = await this.env.DB.prepare('SELECT * FROM accounts WHERE username = ?')
      .bind(username)
      .first<Account>();
    return result ?? null;
  }

  async createAccount(username: string, displayName?: string): Promise<number | null> {
    if (!this.available) return null;
    const result = await this.env.DB.prepare(
      'INSERT INTO accounts (username, display_name) VALUES (?, ?)',
    ).bind(username, displayName ?? username).run();
    return result.meta?.last_row_id ?? null;
  }

  // ---- ツイートログ ----

  async logTweet(
    tweetId: string,
    accountId: number,
    text: string,
    mediaUrls?: string[],
    tweetType = 'tweet',
  ): Promise<void> {
    if (!this.available) return;
    await this.env.DB.prepare(
      'INSERT INTO tweets (tweet_id, account_id, text, media_urls, tweet_type) VALUES (?, ?, ?, ?, ?)',
    ).bind(tweetId, accountId, text, JSON.stringify(mediaUrls ?? null), tweetType).run();
  }

  // ---- スケジュールツイート ----

  async getPendingScheduledTweets(): Promise<ScheduledTweet[]> {
    if (!this.available) return [];
    const { results } = await this.env.DB.prepare(
      "SELECT * FROM scheduled_tweets WHERE status = 'pending' AND schedule_at <= datetime('now')",
    ).all<ScheduledTweet>();
    return results ?? [];
  }

  async createScheduledTweet(
    accountId: number,
    text: string,
    scheduleAt: string,
    mediaUrls?: string[],
  ): Promise<number | null> {
    if (!this.available) return null;
    const result = await this.env.DB.prepare(
      'INSERT INTO scheduled_tweets (account_id, text, media_urls, schedule_at) VALUES (?, ?, ?, ?)',
    ).bind(accountId, text, JSON.stringify(mediaUrls ?? null), scheduleAt).run();
    return result.meta?.last_row_id ?? null;
  }

  async updateScheduledTweetStatus(id: number, status: string, errorMsg?: string): Promise<void> {
    if (!this.available) return;
    if (errorMsg) {
      await this.env.DB.prepare(
        'UPDATE scheduled_tweets SET status = ?, error_msg = ? WHERE id = ?',
      ).bind(status, errorMsg, id).run();
    } else {
      await this.env.DB.prepare(
        'UPDATE scheduled_tweets SET status = ? WHERE id = ?',
      ).bind(status, id).run();
    }
  }

  // ---- トレンドログ ----

  async logTrends(woeid: number, trends: unknown[]): Promise<void> {
    if (!this.available) return;
    await this.env.DB.prepare(
      'INSERT INTO trends_log (location_woeid, trends_data) VALUES (?, ?)',
    ).bind(woeid, JSON.stringify(trends)).run();
  }

  // ---- DMログ ----

  async getDMs(limit = 20): Promise<any[]> {
    if (!this.available) return [];
    const { results } = await this.env.DB.prepare(
      'SELECT * FROM dm_log ORDER BY created_at DESC LIMIT ?',
    ).bind(limit).all();
    return results ?? [];
  }

  async logDm(dmId: string, accountId: number, senderId: string, senderName: string, text: string, direction = 'in'): Promise<void> {
    if (!this.available) return;
    await this.env.DB.prepare(
      'INSERT INTO dm_log (dm_id, account_id, sender_id, sender_name, text, direction) VALUES (?, ?, ?, ?, ?, ?)',
    ).bind(dmId, accountId, senderId, senderName, text, direction).run();
  }

  // ---- APIログ ----

  async logApiCall(endpoint: string, method: string, ipAddress?: string, statusCode?: number, responseTimeMs?: number): Promise<void> {
    if (!this.available) return;
    await this.env.DB.prepare(
      'INSERT INTO api_log (endpoint, method, ip_address, status_code, response_time_ms) VALUES (?, ?, ?, ?, ?)',
    ).bind(endpoint, method, ipAddress ?? null, statusCode ?? null, responseTimeMs ?? null).run();
  }

  // ---- ログクリーンアップ ----

  async cleanupOldLogs(): Promise<void> {
    if (!this.available) return;
    await this.env.DB.prepare("DELETE FROM api_log WHERE created_at < datetime('now', '-30 days')").run();
    await this.env.DB.prepare("DELETE FROM trends_log WHERE fetched_at < datetime('now', '-30 days')").run();
    await this.env.DB.prepare("DELETE FROM dm_log WHERE created_at < datetime('now', '-30 days')").run();
  }
}
