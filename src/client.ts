/**
 * Twitter/X クライアント
 *
 * twikit の実際のソースコードを参考にした GraphQL API クライアント。
 * クッキーベースの認証で Twitter の内部 API を呼び出す。
 */

import type { Env, TwitterUser, Tweet, Trend } from '../types';

const TWITTER_BASE = 'https://x.com';

/** GraphQL エンドポイント定義（twikit v2.3.1 準拠） */
const ENDPOINTS = {
  CreateTweet:      `${TWITTER_BASE}/i/api/graphql/SiM_cAu83R0wnrpmKQQSEw/CreateTweet`,
  DeleteTweet:      `${TWITTER_BASE}/i/api/graphql/VaenaVgh5q5ih7kvyVjgtg/DeleteTweet`,
  SearchTimeline:   `${TWITTER_BASE}/i/api/graphql/flaR-PUMshxFWZWPNpq4zA/SearchTimeline`,
  HomeTimeline:     `${TWITTER_BASE}/i/api/graphql/-X_hcgQzmHGl29-UXxz4sw/HomeTimeline`,
  UserByScreenName: `${TWITTER_BASE}/i/api/graphql/NimuplG1OB7Fd2btCLdBOw/UserByScreenName`,
  UserTweets:       `${TWITTER_BASE}/i/api/graphql/QWF3SzpHmykQHsQMixG0cg/UserTweets`,
  TweetDetail:      `${TWITTER_BASE}/i/api/graphql/U0HTv-bAWTBYylwEMT7x5A/TweetDetail`,
  Followers:        `${TWITTER_BASE}/i/api/graphql/gC_lyAxZOptAMLCJX5UhWw/Followers`,
  Following:        `${TWITTER_BASE}/i/api/graphql/2vUj-_Ek-UmBVDNtd8OnQA/Following`,
};

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

/** 共通リクエストヘッダー */
function headers(cookies: Record<string, string>, ct0: string): Record<string, string> {
  const cookieStr = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  return {
    'Authorization': `Bearer ${BEARER_TOKEN}`,
    'Cookie': cookieStr,
    'X-Csrf-Token': ct0,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'X-Twitter-Active-User': 'yes',
    'X-Twitter-Client-Language': 'ja',
    'Referer': 'https://x.com/',
  };
}

/** CreateTweet 用 features（twikit の FEATURES 定数から抜粋） */
const TWEET_FEATURES: Record<string, boolean> = {
  c9s_tweet_anatomy_moderator_badge_enabled: true,
  freedom_of_speech_not_reach_fetch_enable: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
  longform_notetweets_consumption_enabled: false,
  responsive_web_twitter_article_tweet_consumption_enabled: false,
  tweet_with_visibility_results_prefer_gql_media_interstitial_enabled: false,
  responsive_web_graphql_exclude_directive_enabled: true,
  verified_phone_label_enabled: false,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_media_download_video_enabled: false,
  highlights_tweets_tab_ui_enabled: true,
  responsive_web_twitter_article_related_tweets_enabled: false,
  responsive_web_enhance_cards_enabled: false,
};

/** 汎用 features */
const GENERAL_FEATURES: Record<string, boolean> = {
  ...TWEET_FEATURES,
  creator_subscriptions_tweet_preview_api_enabled: true,
  hide_verification_badge: false,
  graphql_timeline_v2_bookmark_timeline: true,
  rweb_tipjar_consumption_enabled: true,
  responsive_web_graphql_hide_community_tweet: false,
  immersive_reading_experiment_enabled: false,
  super_follow_exclusive_tweet_notifications_enabled: false,
  blue_business_profile_image_shape_enabled: false,
};

export class TwitterClient {
  private cookies: Record<string, string> = {};
  private ct0 = '';
  private _initialized = false;

  constructor(private env: Env) {}

  get isInitialized(): boolean { return this._initialized; }

  async initialize(): Promise<void> {
    const raw = this.env.TWITTER_COOKIES;
    if (raw) {
      try {
        this.cookies = JSON.parse(raw);
        this.ct0 = this.cookies['ct0'] ?? '';
        this._initialized = true;
      } catch { /* ignore */ }
    }
  }

  private get hdrs(): Record<string, string> {
    return headers(this.cookies, this.ct0);
  }

  private assertInit(): void {
    if (!this._initialized) throw new Error('Twitter client not initialized');
  }

  /** GET GraphQL */
  private async get<T>(url: string, variables: Record<string, unknown>, features?: Record<string, boolean>): Promise<T> {
    this.assertInit();
    const params = new URLSearchParams({
      variables: JSON.stringify(variables),
      features: JSON.stringify(features ?? GENERAL_FEATURES),
    });
    const res = await fetch(`${url}?${params}`, { method: 'GET', headers: this.hdrs });
    if (!res.ok) throw new Error(`Twitter API error: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as any;
    if (data.errors) throw new Error(`Twitter API error: ${data.errors[0]?.message ?? 'unknown'}`);
    return data as T;
  }

  /** POST GraphQL（twikit の gql_post と同じ形式） */
  private async post<T>(url: string, variables: Record<string, unknown>, features?: Record<string, boolean>): Promise<T> {
    this.assertInit();
    // queryId は URL の最後から2番目のセグメント（例: /{queryId}/CreateTweet）
    const parts = url.split('/');
    const queryId = parts[parts.length - 2]?.split('?')[0] ?? '';
    const body: Record<string, unknown> = { variables, queryId };
    if (features) body.features = features;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.hdrs,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Twitter API error: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as any;
    if (data.errors) throw new Error(`Twitter API error: ${data.errors[0]?.message ?? 'unknown'}`);
    return data as T;
  }

  // ============================================================
  // ツイート投稿（twikit の create_tweet と同じ variables 構造）
  // ============================================================

  async postTweet(text: string, mediaIds?: string[], replyTo?: string): Promise<{ tweetId: string; text: string }> {
    this.assertInit();
    const variables: Record<string, unknown> = {
      tweet_text: text,
      dark_request: false,
      media: {
        media_entities: (mediaIds ?? []).map(id => ({ media_id: id, tagged_users: [] })),
        possibly_sensitive: false,
      },
      semantic_annotation_ids: [],
    };
    if (replyTo) {
      variables.reply = { in_reply_to_tweet_id: replyTo, exclude_reply_user_ids: [] };
    }
    const data = await this.post<any>(ENDPOINTS.CreateTweet, variables, TWEET_FEATURES);
    const result = data?.data?.create_tweet?.tweet_results?.result;
    return { tweetId: result?.rest_id ?? '', text: result?.legacy?.full_text ?? text };
  }

  async deleteTweet(tweetId: string): Promise<void> {
    this.assertInit();
    await this.post(ENDPOINTS.DeleteTweet, { tweet_id: tweetId, dark_request: false });
  }

  // ============================================================
  // 検索・タイムライン
  // ============================================================

  async searchTweets(query: string, count = 20, product: 'Top' | 'Latest' | 'Media' = 'Top'): Promise<Tweet[]> {
    this.assertInit();
    const variables: Record<string, unknown> = {
      rawQuery: query,
      count,
      querySource: 'typed_query',
      product,
    };
    const data = await this.get<any>(ENDPOINTS.SearchTimeline, variables, GENERAL_FEATURES);
    const instructions = data?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions ?? [];
    return this.extractTweets(instructions);
  }

  async getHomeTimeline(count = 20): Promise<Tweet[]> {
    this.assertInit();
    const variables: Record<string, unknown> = {
      count,
      includePromotedContent: true,
      latestControlAvailable: true,
      requestContext: 'launch',
    };
    const data = await this.get<any>(ENDPOINTS.HomeTimeline, variables, GENERAL_FEATURES);
    const instructions = data?.data?.home?.home_timeline_urt?.instructions ?? [];
    return this.extractTweets(instructions);
  }

  // ============================================================
  // ユーザー情報
  // ============================================================

  async getUserInfo(screenName: string): Promise<TwitterUser> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.UserByScreenName, {
      screen_name: screenName, withSafetyModeUserFields: false,
    });
    const user = data?.data?.user?.result;
    if (!user) throw new Error(`User not found: ${screenName}`);
    return {
      id: user.rest_id ?? '',
      screen_name: user.legacy?.screen_name ?? screenName,
      name: user.legacy?.name ?? '',
      description: user.legacy?.description,
      followers_count: user.legacy?.followers_count ?? 0,
      following_count: user.legacy?.friends_count ?? 0,
      tweet_count: user.legacy?.statuses_count ?? 0,
      profile_image_url: user.legacy?.profile_image_url_https,
      verified: user.legacy?.verified ?? false,
    };
  }

  async getUserTweets(userId: string, count = 20): Promise<Tweet[]> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.UserTweets, {
      userId,
      count,
      includePromotedContent: true,
      withQuickPromoteEligibilityTweetFields: true,
      withVoice: true,
      withV2Timeline: true,
    });
    const instructions = data?.data?.user?.result?.timeline_v2?.timeline?.instructions ?? [];
    return this.extractTweets(instructions);
  }

  async getTweet(tweetId: string): Promise<Tweet> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.TweetDetail, {
      focalTweetId: tweetId, with_rux_injections: false, includePromotedContent: true,
      withCommunity: true, withQuickPromoteEligibilityTweetFields: true,
      withBirdwatchNotes: true, withVoice: true, withV2Timeline: true,
    });
    // TweetDetail の応答からツイートを抽出
    const instructions = data?.data?.threaded_conversation_with_injections_v2?.instructions ?? [];
    for (const inst of instructions) {
      for (const entry of inst?.entries ?? []) {
        const result = entry?.content?.itemContent?.tweet_results?.result;
        if (result?.rest_id === tweetId || result?.legacy?.id_str === tweetId) {
          return this.tweetToObject(result);
        }
      }
    }
    throw new Error(`Tweet not found: ${tweetId}`);
  }

  // ============================================================
  // DM
  // ============================================================

  async sendDM(userId: string, text: string): Promise<void> {
    this.assertInit();
    const body = {
      event: {
        type: 'message_create',
        message_create: {
          target: { recipient_id: userId },
          message_data: { text },
        },
      },
    };
    const res = await fetch('https://api.twitter.com/1.1/direct_messages/events/new.json', {
      method: 'POST',
      headers: this.hdrs,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`DM send failed: ${res.status} ${errText.substring(0, 200)}`);
    }
  }

  // ============================================================
  // トレンド（v1.1 REST API）
  // ============================================================

  async getTrends(woeid = 1): Promise<Trend[]> {
    this.assertInit();
    const res = await fetch(`https://api.twitter.com/1.1/trends/place.json?id=${woeid}`, { headers: this.hdrs });
    if (!res.ok) throw new Error(`Trends API error: ${res.status}`);
    const json = (await res.json()) as any[];
    return (json[0]?.trends ?? []).map((t: any) => ({
      name: t.name, tweet_count: t.tweet_volume ?? undefined, category: t.category,
    }));
  }

  // ============================================================
  // ヘルパー
  // ============================================================

  private extractTweets(instructions: any[]): Tweet[] {
    const tweets: Tweet[] = [];
    for (const inst of instructions) {
      for (const entry of inst?.entries ?? []) {
        const result = entry?.content?.itemContent?.tweet_results?.result;
        if (result?.legacy) tweets.push(this.tweetToObject(result));
      }
    }
    return tweets;
  }

  private tweetToObject(result: any): Tweet {
    const legacy = result.legacy ?? {};
    const user = legacy.user ?? result.core?.user_results?.result?.legacy ?? {};
    return {
      id: result.rest_id ?? legacy.id_str ?? '',
      text: legacy.full_text ?? legacy.text ?? '',
      user: user.screen_name ? {
        id: user.id_str ?? '',
        screen_name: user.screen_name,
        name: user.name ?? '',
      } : undefined,
      created_at: legacy.created_at ?? '',
      retweet_count: legacy.retweet_count ?? 0,
      like_count: legacy.favorite_count ?? 0,
      reply_count: legacy.reply_count ?? 0,
      view_count: legacy.ext_views?.count ?? legacy.views?.count,
      lang: legacy.lang,
      media_urls: legacy.entities?.media?.map((m: any) => m.media_url_https ?? m.media_url) ?? [],
      is_retweet: !!legacy.retweeted_status_result,
    };
  }
}
