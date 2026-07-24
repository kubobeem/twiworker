// ======================================================
// twiworker — 型定義
// ======================================================

/** Cloudflare Workers の Environment バインディング */
export interface Env {
  KV: KVNamespace;
  DB: D1Database;
  // Secrets
  TWITTER_COOKIES?: string;
  ACCOUNT_USERNAME?: string;
  SITE_URL?: string;
  DEBUG?: string;
  RATE_LIMIT_DEFAULT?: string;
  RATE_LIMIT_WINDOW?: string;
  ADMIN_API_KEY?: string;
}

/** API 成功レスポンス */
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

/** API エラーレスポンス */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/** API 全レスポンス型 */
export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

/** ツイートオブジェクト */
export interface Tweet {
  id: string;
  text: string;
  user?: {
    id: string;
    screen_name: string;
    name: string;
  };
  created_at: string;
  retweet_count: number;
  like_count: number;
  reply_count: number;
  view_count?: number;
  lang?: string;
  media_urls: string[];
  is_retweet: boolean;
}

/** ユーザー情報 */
export interface TwitterUser {
  id: string;
  screen_name: string;
  name: string;
  description?: string;
  followers_count: number;
  following_count: number;
  tweet_count: number;
  profile_image_url?: string;
  created_at?: string;
  verified?: boolean;
}

/** DM オブジェクト */
export interface DM {
  id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

/** トレンドアイテム */
export interface Trend {
  name: string;
  tweet_count?: number;
  category?: string;
}

/** アカウント情報 (D1) */
export interface Account {
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

/** スケジュールツイート (D1) */
export interface ScheduledTweet {
  id: number;
  account_id: number;
  text: string;
  media_urls?: string;
  schedule_at: string;
  status: 'pending' | 'posted' | 'cancelled' | 'failed';
  error_msg?: string;
  created_at: string;
}

/** Twitter API 呼び出しの設定 */
export interface TwitterApiConfig {
  cookies: Record<string, string>;
  username: string;
}

/** レート制限設定 */
export interface RateLimitConfig {
  max: number;
  window: number;
}
