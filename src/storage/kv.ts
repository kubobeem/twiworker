/**
 * KV ストレージ操作
 */

import type { Env } from '../types';

export class KVStore {
  constructor(private env: Env) {}

  get available(): boolean {
    return !!this.env.KV;
  }

  // ---- Cookie ----

  async saveCookies(accountId: string, cookies: Record<string, string>): Promise<void> {
    if (!this.available) return;
    await this.env.KV.put(`cookie:${accountId}`, JSON.stringify(cookies));
  }

  async loadCookies(accountId: string): Promise<Record<string, string> | null> {
    if (!this.available) return null;
    const raw = await this.env.KV.get(`cookie:${accountId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async deleteCookies(accountId: string): Promise<void> {
    if (!this.available) return;
    await this.env.KV.delete(`cookie:${accountId}`);
  }

  // ---- レート制限 ----

  async checkRateLimit(
    ip: string,
    endpoint: string,
    maxRequests: number,
    windowSeconds = 60,
  ): Promise<{ allowed: boolean; remaining: number }> {
    if (!this.available) {
      return { allowed: true, remaining: maxRequests };
    }

    const key = `ratelimit:${ip}:${endpoint}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - windowSeconds;

    const raw = await this.env.KV.get(key);
    let timestamps: number[] = [];
    if (raw) {
      try {
        timestamps = JSON.parse(raw) as number[];
      } catch { /* ignore */ }
    }

    timestamps = timestamps.filter(t => t > windowStart);

    if (timestamps.length >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    timestamps.push(now);
    await this.env.KV.put(key, JSON.stringify(timestamps), { expirationTtl: windowSeconds });

    const remaining = maxRequests - timestamps.length;
    return { allowed: true, remaining };
  }

  // ---- セッション ----

  async saveSession(sessionId: string, data: Record<string, unknown>, ttl = 3600): Promise<void> {
    if (!this.available) return;
    await this.env.KV.put(`session:${sessionId}`, JSON.stringify(data), { expirationTtl: ttl });
  }

  async loadSession(sessionId: string): Promise<Record<string, unknown> | null> {
    if (!this.available) return null;
    const raw = await this.env.KV.get(`session:${sessionId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
