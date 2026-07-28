// ======================================================
// twiworker v0.2.0 — 型定義（全機能対応）
// ======================================================

/** Cloudflare Workers の Environment バインディング */
export interface Env {
  KV: KVNamespace;
  DB: D1Database;
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

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ======================================================
// ツイート関連
// ======================================================

export interface TweetUser {
  id: string;
  screen_name: string;
  name: string;
  profile_image_url?: string;
  verified?: boolean;
  blue_verified?: boolean;
}

export interface Tweet {
  id: string;
  text: string;
  user?: TweetUser;
  created_at: string;
  retweet_count: number;
  like_count: number;
  reply_count: number;
  view_count?: number;
  lang?: string;
  media_urls: string[];
  is_retweet: boolean;
  is_quote: boolean;
  is_reply: boolean;
  quoted_tweet?: Tweet;
  poll?: PollData;
  in_reply_to_screen_name?: string;
  in_reply_to_tweet_id?: string;
  source?: string;
}

export interface PollData {
  id: string;
  choices: PollChoice[];
  end_datetime: string;
  duration_minutes: number;
}

export interface PollChoice {
  label: string;
  count: number;
  percentage: number;
}

// ======================================================
// ユーザー関連
// ======================================================

export interface TwitterUser {
  id: string;
  screen_name: string;
  name: string;
  description?: string;
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
  likes_count: number;
  profile_image_url?: string;
  profile_banner_url?: string;
  created_at?: string;
  verified?: boolean;
  blue_verified?: boolean;
  location?: string;
  url?: string;
  protected?: boolean;
}

// ======================================================
// ブックマーク
// ======================================================

export interface Bookmark {
  id: string;
  tweet: Tweet;
  created_at: string;
}

// ======================================================
// リスト
// ======================================================

export interface TwitterList {
  id: string;
  name: string;
  description: string;
  member_count: number;
  subscriber_count: number;
  mode: 'public' | 'private';
  created_at: string;
  user?: TweetUser;
}

// ======================================================
// 通知
// ======================================================

export interface Notification {
  id: string;
  type: 'like' | 'retweet' | 'reply' | 'follow' | 'quote' | 'mention';
  text: string;
  user: TweetUser;
  tweet?: Tweet;
  created_at: string;
  read: boolean;
}

export type NotificationFilter = 'all' | 'mentions' | 'likes' | 'retweets' | 'follows';

// ======================================================
// DM
// ======================================================

export interface DM {
  id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  media_urls?: string[];
  created_at: string;
  direction?: 'in' | 'out';
}

export interface DMConversation {
  id: string;
  participants: TweetUser[];
  last_message: DM;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

// ======================================================
// スペース（X Spaces）
// ======================================================

export interface Space {
  id: string;
  title: string;
  creator: TweetUser;
  participants: TweetUser[];
  state: 'live' | 'scheduled' | 'ended';
  scheduled_start?: string;
  started_at?: string;
  ended_at?: string;
  participant_count: number;
  listener_count: number;
}

// ======================================================
// トレンド
// ======================================================

export interface Trend {
  name: string;
  tweet_count?: number;
  category?: string;
}

// ======================================================
// D1エンティティ
// ======================================================

export interface Account {
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

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

// ======================================================
// 設定関連
// ======================================================

export interface TwitterApiConfig {
  cookies: Record<string, string>;
  username: string;
}

export interface RateLimitConfig {
  max: number;
  window: number;
}

export interface ContentSettings {
  sensitive_media: boolean;
  sensitive_search: boolean;
  autoplay_video: boolean;
  autoplay_gif: boolean;
}
