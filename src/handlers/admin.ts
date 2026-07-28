/**
 * twiworker v0.2.0 — 管理・ヘルスチェックハンドラー
 */

import type { Env } from '../types';
import type { TwitterClient } from '../client';
import type { KVStore } from '../storage/kv';
import type { D1Store } from '../storage/d1';

export class AdminHandler {
  constructor(
    private client: TwitterClient,
    private env: Env,
    private kv: KVStore,
    private d1: D1Store,
  ) {}

  async health() {
    return {
      status: 'ok',
      version: '0.2.0',
      twitter_logged_in: this.client.isInitialized,
      kv_available: this.kv.available,
      d1_available: this.d1.available,
    };
  }

  async status() {
    return {
      status: 'ok',
      version: '0.2.0',
      config: {
        account_username: this.env.ACCOUNT_USERNAME ?? null,
        debug: this.env.DEBUG === '1',
        site_url: this.env.SITE_URL ?? null,
      },
      twitter: {
        initialized: this.client.isInitialized,
      },
      storage: {
        kv_available: this.kv.available,
        d1_available: this.d1.available,
      },
    };
  }
}
