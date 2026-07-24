/**
 * レート制限ミドルウェア
 */

import type { Env } from '../types';
import { KVStore } from '../storage/kv';

const RATE_LIMIT_CONFIG: Record<string, { max: number; window: number }> = {
  'POST:/api/tweet': { max: 10, window: 900 },
  'POST:/api/thread': { max: 5, window: 900 },
  'GET:/api/search': { max: 30, window: 900 },
  'GET:/api/timeline': { max: 30, window: 900 },
  'GET:/api/dm': { max: 30, window: 900 },
  'POST:/api/dm': { max: 20, window: 900 },
  'POST:/api/follow': { max: 15, window: 900 },
  'POST:/api/unfollow': { max: 15, window: 900 },
  'GET:/api/trends': { max: 10, window: 300 },
};

const DEFAULT = { max: 60, window: 60 };

export class RateLimiter {
  private kv: KVStore;

  constructor(env: Env) {
    this.kv = new KVStore(env);
  }

  async check(method: string, path: string, ip: string): Promise<{ allowed: boolean; remaining: number }> {
    if (path === '/api/health' || path === '/api/status') {
      return { allowed: true, remaining: 999 };
    }

    const key = `${method}:${path}`;
    const config = RATE_LIMIT_CONFIG[key] ?? DEFAULT;

    return this.kv.checkRateLimit(ip, key, config.max, config.window);
  }
}
