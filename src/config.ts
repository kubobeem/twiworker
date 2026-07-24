/**
 * twiworker 設定モジュール
 */

import type { Env } from './types';

export class Config {
  constructor(private env: Env) {}

  /** Twitter ログインクッキー（JSON文字列） */
  get twitterCookies(): string | undefined {
    return this.env.TWITTER_COOKIES;
  }

  /** パース済みクッキー */
  get twitterCookiesDict(): Record<string, string> | undefined {
    const raw = this.twitterCookies;
    if (!raw) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }

  /** Twitter ユーザー名 */
  get accountUsername(): string | undefined {
    return this.env.ACCOUNT_USERNAME;
  }

  /** 公開URL */
  get siteUrl(): string {
    return this.env.SITE_URL ?? 'http://localhost:8787';
  }

  /** デバッグモード */
  get debug(): boolean {
    return this.env.DEBUG === '1';
  }
}
