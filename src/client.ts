/**
 * twiworker v0.2.0 — Twitter/X GraphQL + REST クライアント
 *
 * 全機能対応:
 * - ツイート操作 (post/delete/search/timeline)
 * - インタラクション (like/retweet/follow)
 * - ブックマーク
 * - リスト管理
 * - 通知
 * - DM (会話一覧/メディア添付)
 * - スペース
 * - 投票
 * - ユーザー情報
 */

import type { Env, TwitterUser, Tweet, Trend, Bookmark, TwitterList, Notification, NotificationFilter, DM, DMConversation, Space, PollData, PollChoice } from './types';

const TWITTER_BASE = 'https://x.com';

/**
 * GraphQL クエリID一覧
 * twikit 最新ソースコード (https://github.com/d60/twikit) 準拠
 */
const ENDPOINTS = {
  // ---- ツイート ----
  CreateTweet:      `${TWITTER_BASE}/i/api/graphql/SiM_cAu83R0wnrpmKQQSEw/CreateTweet`,
  DeleteTweet:      `${TWITTER_BASE}/i/api/graphql/VaenaVgh5q5ih7kvyVjgtg/DeleteTweet`,
  SearchTimeline:   `${TWITTER_BASE}/i/api/graphql/flaR-PUMshxFWZWPNpq4zA/SearchTimeline`,
  HomeTimeline:     `${TWITTER_BASE}/i/api/graphql/-X_hcgQzmHGl29-UXxz4sw/HomeTimeline`,
  TweetDetail:      `${TWITTER_BASE}/i/api/graphql/U0HTv-bAWTBYylwEMT7x5A/TweetDetail`,

  // ---- ユーザー ----
  UserByScreenName: `${TWITTER_BASE}/i/api/graphql/NimuplG1OB7Fd2btCLdBOw/UserByScreenName`,
  UserByRestId:     `${TWITTER_BASE}/i/api/graphql/tD8zKvQzwY3kdx5yz6YmOw/UserByRestId`,
  UserTweets:       `${TWITTER_BASE}/i/api/graphql/QWF3SzpHmykQHsQMixG0cg/UserTweets`,
  UserLikes:        `${TWITTER_BASE}/i/api/graphql/IohM3gxQHfvWePH5E3KuNA/Likes`,
  Followers:        `${TWITTER_BASE}/i/api/graphql/gC_lyAxZOptAMLCJX5UhWw/Followers`,
  Following:        `${TWITTER_BASE}/i/api/graphql/2vUj-_Ek-UmBVDNtd8OnQA/Following`,

  // ---- インタラクション ----
  FavoriteTweet:    `${TWITTER_BASE}/i/api/graphql/lI07N6Otwv1PhnEgXILM7A/FavoriteTweet`,
  UnfavoriteTweet:  `${TWITTER_BASE}/i/api/graphql/ZYKSe-w7KEslx3JhSIk5LA/UnfavoriteTweet`,
  CreateRetweet:    `${TWITTER_BASE}/i/api/graphql/ojPdsZsimiJrUGLR1sjUtA/CreateRetweet`,
  DeleteRetweet:    `${TWITTER_BASE}/i/api/graphql/iQtK4dl5hBmXewYZuEOKVw/DeleteRetweet`,

  // ---- ブックマーク ----
  BookmarkTimeline:   `${TWITTER_BASE}/i/api/graphql/a1WpiCAt0aRqyPz7JN6hNQ/BookmarkTimeline`,
  CreateBookmark:     `${TWITTER_BASE}/i/api/graphql/P7oODXvqPHC5qCXaGXx2Xg/CreateBookmark`,
  DeleteBookmark:     `${TWITTER_BASE}/i/api/graphql/5ZgS1yDsRpCYvbQ9HxsZ_A/DeleteBookmark`,
  BookmarksAllDelete: `${TWITTER_BASE}/i/api/graphql/XRSiG-2B3qR0FQH5t1xFgA/BookmarksAllDelete`,

  // ---- リスト ----
  ListBySlug:                 `${TWITTER_BASE}/i/api/graphql/qjYFiJ7LHeMniPKLEzz8sA/ListBySlug`,
  ListCreation:               `${TWITTER_BASE}/i/api/graphql/4_NZLEwGPJmFp8vNZyOXpg/ListCreation`,
  ListDeletion:               `${TWITTER_BASE}/i/api/graphql/MR64LxF4FL_JlPBYTKFy8g/ListDeletion`,
  ListLatestTweetsTimeline:   `${TWITTER_BASE}/i/api/graphql/xHq9SlMxb3vEEUQJthD5wg/ListLatestTweetsTimeline`,
  ListMembers:                `${TWITTER_BASE}/i/api/graphql/86hP1YrCDXW3k9b96ZQpCg/ListMembers`,
  ListMemberships:            `${TWITTER_BASE}/i/api/graphql/BsQdMUsEFZnR1S_VxGNhXQ/ListMemberships`,
  ListsManagementPageTimeline:`${TWITTER_BASE}/i/api/graphql/9VrU5GjFtRE49HMYwzCGCA/ListsManagementPageTimeline`,
  ListAddMember:              `${TWITTER_BASE}/i/api/graphql/LZ40N6Kz2rSzmP1NSVNK9A/ListAddMember`,
  ListRemoveMember:           `${TWITTER_BASE}/i/api/graphql/8QHvcQqZAVODRjcqBJWbYw/ListRemoveMember`,
  ListSubscribe:              `${TWITTER_BASE}/i/api/graphql/n0XGKypQqF6lGQGMWmWG5A/ListSubscribe`,
  ListUnsubscribe:            `${TWITTER_BASE}/i/api/graphql/BL20mQ02zRbHLndCFZqcmw/ListUnsubscribe`,

  // ---- 通知 ----
  NotificationDetail:   `${TWITTER_BASE}/i/api/graphql/XIOH6e72Qjs1BYa8jnRpNQ/NotificationDetail`,
  NotificationsPage:    `${TWITTER_BASE}/i/api/graphql/0fnCSutDFGQj6tMmNeCVUg/NotificationsPage`,
  NotificationsMarkRead:`${TWITTER_BASE}/i/api/graphql/m7C1d8G5Yn3BxQ7QVG-GdQ/NotificationsMarkRead`,

  // ---- スペース ----
  SpaceById:    `${TWITTER_BASE}/i/api/graphql/4DXk2Z7e7lgg7iVVPZQ1oA/SpaceById`,
  SpaceSearch:  `${TWITTER_BASE}/i/api/graphql/ZqX9Z5HhU-eYHKysmdLhTQ/SpaceSearch`,

  // ---- 投票 ----
  Vote:       `${TWITTER_BASE}/i/api/graphql/pwmCg4kCFO5ToYm4z3VFSg/Vote`,
  TweetResult:`${TWITTER_BASE}/i/api/graphql/t8DzKvQzwY3kdx5yz6YmOw/TweetResultByRestId`,
};

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

/** 共通リクエストヘッダー */
function headers(cookies: Record<string, string>, ct0: string): Record<string, string> {
  const cookieStr = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  return {
    Authorization: `Bearer ${BEARER_TOKEN}`,
    Cookie: cookieStr,
    'X-Csrf-Token': ct0,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
    Origin: 'https://x.com',
    Referer: 'https://x.com/',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'X-Twitter-Active-User': 'yes',
    'X-Twitter-Client-Language': 'ja',
  };
}

/** ツイート投稿用 features */
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

  /** POST GraphQL */
  private async post<T>(url: string, variables: Record<string, unknown>, features?: Record<string, boolean>): Promise<T> {
    this.assertInit();
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
  // ツイート投稿
  // ============================================================

  async postTweet(text: string, mediaIds?: string[], replyTo?: string, poll?: { options: string[]; duration_minutes: number }): Promise<{ tweetId: string; text: string }> {
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
    if (poll) {
      variables.card_uri = this.makePollCardUri(poll.options, poll.duration_minutes);
    }
    const data = await this.post<any>(ENDPOINTS.CreateTweet, variables, TWEET_FEATURES);
    const result = data?.data?.create_tweet?.tweet_results?.result;
    return { tweetId: result?.rest_id ?? '', text: result?.legacy?.full_text ?? text };
  }

  private makePollCardUri(options: string[], durationMinutes: number): string {
    const choices = options.map(o => `{"choice_label":"${o.replace(/"/g, '\\"')}"}`);
    return `card://poll/${durationMinutes}min/${options.length}choices/[${choices.join(',')}]`;
  }

  async deleteTweet(tweetId: string): Promise<void> {
    this.assertInit();
    await this.post(ENDPOINTS.DeleteTweet, { tweet_id: tweetId, dark_request: false });
  }

  // ============================================================
  // 検索・タイムライン
  // ============================================================

  private extractCursor(instructions: any[]): string | undefined {
    for (const inst of instructions) {
      for (const entry of inst?.entries ?? []) {
        if (entry?.entryId?.startsWith('cursor-bottom') && entry?.content?.value) {
          return entry.content.value;
        }
        if (entry?.content?.cursorType === 'Bottom' && entry?.content?.value) {
          return entry.content.value;
        }
      }
    }
    return undefined;
  }

  async searchTweets(query: string, count = 20, product: 'Top' | 'Latest' | 'Media' = 'Top', cursor?: string): Promise<{ tweets: Tweet[]; cursor?: string }> {
    this.assertInit();
    const variables: Record<string, unknown> = {
      rawQuery: query,
      count,
      querySource: 'typed_query',
      product,
    };
    if (cursor) variables.cursor = cursor;
    const data = await this.get<any>(ENDPOINTS.SearchTimeline, variables, GENERAL_FEATURES);
    const instructions = data?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions ?? [];
    return {
      tweets: this.extractTweets(instructions),
      cursor: this.extractCursor(instructions),
    };
  }

  async getHomeTimeline(count = 20, cursor?: string): Promise<{ tweets: Tweet[]; cursor?: string }> {
    this.assertInit();
    const variables: Record<string, unknown> = {
      count,
      includePromotedContent: true,
      latestControlAvailable: true,
      requestContext: 'launch',
    };
    if (cursor) variables.cursor = cursor;
    const data = await this.get<any>(ENDPOINTS.HomeTimeline, variables, GENERAL_FEATURES);
    const instructions = data?.data?.home?.home_timeline_urt?.instructions ?? [];
    return {
      tweets: this.extractTweets(instructions),
      cursor: this.extractCursor(instructions),
    };
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
    return this.parseUserResult(user, screenName);
  }

  async getUserInfoById(userId: string): Promise<TwitterUser> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.UserByRestId, {
      userId, withSafetyModeUserFields: true,
    });
    const user = data?.data?.user?.result;
    if (!user) throw new Error(`User not found: ${userId}`);
    return this.parseUserResult(user);
  }

  async getUserTweets(userId: string, count = 20): Promise<Tweet[]> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.UserTweets, {
      userId, count, includePromotedContent: true,
      withQuickPromoteEligibilityTweetFields: true, withVoice: true, withV2Timeline: true,
    });
    const instructions = data?.data?.user?.result?.timeline_v2?.timeline?.instructions ?? [];
    return this.extractTweets(instructions);
  }

  async getUserLikes(userId: string, count = 20): Promise<Tweet[]> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.UserLikes, {
      userId, count, includePromotedContent: true,
    });
    const instructions = data?.data?.user?.result?.timeline_v2?.timeline?.instructions ?? [];
    return this.extractTweets(instructions);
  }

  async getFollowers(userId: string, count = 20): Promise<TwitterUser[]> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.Followers, {
      userId, count, includePromotedContent: false,
    });
    const instructions = data?.data?.user?.result?.timeline?.instructions ?? [];
    return this.extractUsers(instructions);
  }

  async getFollowing(userId: string, count = 20): Promise<TwitterUser[]> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.Following, {
      userId, count, includePromotedContent: false,
    });
    const instructions = data?.data?.user?.result?.timeline?.instructions ?? [];
    return this.extractUsers(instructions);
  }

  async getTweet(tweetId: string): Promise<Tweet> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.TweetDetail, {
      focalTweetId: tweetId, with_rux_injections: false, includePromotedContent: true,
      withCommunity: true, withQuickPromoteEligibilityTweetFields: true,
      withBirdwatchNotes: true, withVoice: true, withV2Timeline: true,
    });
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
  // インタラクション（いいね/リポスト/フォロー）
  // ============================================================

  async likeTweet(tweetId: string): Promise<void> {
    this.assertInit();
    await this.post(ENDPOINTS.FavoriteTweet, { tweet_id: tweetId });
  }

  async unlikeTweet(tweetId: string): Promise<void> {
    this.assertInit();
    await this.post(ENDPOINTS.UnfavoriteTweet, { tweet_id: tweetId });
  }

  async retweet(tweetId: string): Promise<{ retweetId: string }> {
    this.assertInit();
    const data = await this.post<any>(ENDPOINTS.CreateRetweet, { tweet_id: tweetId, dark_request: false });
    const result = data?.data?.create_retweet?.tweet_results?.result;
    return { retweetId: result?.rest_id ?? '' };
  }

  async unretweet(tweetId: string): Promise<void> {
    this.assertInit();
    await this.post(ENDPOINTS.DeleteRetweet, { source_tweet_id: tweetId, dark_request: false });
  }

  async followUser(userId: string): Promise<void> {
    this.assertInit();
    const res = await fetch(`https://api.twitter.com/1.1/friendships/create.json?user_id=${userId}`, {
      method: 'POST', headers: this.hdrs,
    });
    if (!res.ok) throw new Error(`Follow failed: ${res.status}`);
  }

  async unfollowUser(userId: string): Promise<void> {
    this.assertInit();
    const res = await fetch(`https://api.twitter.com/1.1/friendships/destroy.json?user_id=${userId}`, {
      method: 'POST', headers: this.hdrs,
    });
    if (!res.ok) throw new Error(`Unfollow failed: ${res.status}`);
  }

  // ============================================================
  // ブックマーク
  // ============================================================

  async getBookmarks(count = 20, cursor?: string): Promise<{ bookmarks: Bookmark[]; cursor?: string }> {
    this.assertInit();
    const variables: Record<string, unknown> = { count };
    if (cursor) variables.cursor = cursor;
    const data = await this.get<any>(ENDPOINTS.BookmarkTimeline, variables, GENERAL_FEATURES);
    const instructions = data?.data?.bookmark_timeline_v2?.timeline?.instructions ?? [];
    const tweets: Tweet[] = this.extractTweets(instructions);
    return {
      bookmarks: tweets.map(t => ({ id: t.id, tweet: t, created_at: t.created_at })),
      cursor: this.extractCursor(instructions),
    };
  }

  async createBookmark(tweetId: string): Promise<void> {
    this.assertInit();
    await this.post(ENDPOINTS.CreateBookmark, { tweet_id: tweetId });
  }

  async deleteBookmark(tweetId: string): Promise<void> {
    this.assertInit();
    await this.post(ENDPOINTS.DeleteBookmark, { tweet_id: tweetId });
  }

  // ============================================================
  // リスト
  // ============================================================

  async getMyLists(): Promise<TwitterList[]> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.ListsManagementPageTimeline, {});
    const instructions = data?.data?.user_result?.result?.timeline_response?.timeline?.instructions ?? [];
    return this.extractLists(instructions);
  }

  async getListBySlug(slug: string, screenName: string): Promise<TwitterList> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.ListBySlug, {
      slug, listSlug: slug, screen_name: screenName,
    });
    const list = data?.data?.list?.result;
    if (!list) throw new Error(`List not found: ${slug}`);
    return this.parseList(list);
  }

  async getListTweets(listId: string, count = 20, cursor?: string): Promise<{ tweets: Tweet[]; cursor?: string }> {
    this.assertInit();
    const variables: Record<string, unknown> = { listId, count };
    if (cursor) variables.cursor = cursor;
    const data = await this.get<any>(ENDPOINTS.ListLatestTweetsTimeline, variables, GENERAL_FEATURES);
    const instructions = data?.data?.list?.tweets_timeline?.timeline?.instructions ?? [];
    return {
      tweets: this.extractTweets(instructions),
      cursor: this.extractCursor(instructions),
    };
  }

  async createList(name: string, description?: string, isPrivate = false): Promise<TwitterList> {
    this.assertInit();
    const data = await this.post<any>(ENDPOINTS.ListCreation, {
      listName: name, description: description ?? '', isPrivate,
    });
    const list = data?.data?.list_creation?.result;
    if (!list) throw new Error('Failed to create list');
    return this.parseList(list);
  }

  async deleteList(listId: string): Promise<void> {
    this.assertInit();
    await this.post(ENDPOINTS.ListDeletion, { listId });
  }

  async getListMembers(listId: string, count = 20): Promise<TwitterUser[]> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.ListMembers, { listId, count });
    const instructions = data?.data?.list?.members_timeline?.timeline?.instructions ?? [];
    return this.extractUsers(instructions);
  }

  async addListMember(listId: string, userId: string): Promise<void> {
    this.assertInit();
    await this.post(ENDPOINTS.ListAddMember, { listId, userId });
  }

  async removeListMember(listId: string, userId: string): Promise<void> {
    this.assertInit();
    await this.post(ENDPOINTS.ListRemoveMember, { listId, userId });
  }

  // ============================================================
  // 通知
  // ============================================================

  async getNotifications(filter: NotificationFilter = 'all', cursor?: string): Promise<{ notifications: Notification[]; cursor?: string }> {
    this.assertInit();
    const variables: Record<string, unknown> = {};
    if (cursor) variables.cursor = cursor;
    const data = await this.get<any>(ENDPOINTS.NotificationsPage, variables, GENERAL_FEATURES);
    const instructions = data?.data?.viewer?.notifications_tab?.notifications?.timeline?.instructions ?? [];
    return {
      notifications: this.extractNotifications(instructions, filter),
      cursor: this.extractCursor(instructions),
    };
  }

  // ============================================================
  // DM
  // ============================================================

  async sendDM(userId: string, text: string, mediaUrls?: string[]): Promise<void> {
    this.assertInit();
    const messageData: any = { text };
    if (mediaUrls?.length) {
      messageData.attachment = { type: 'media', media: { id: mediaUrls[0] } };
    }
    const body = {
      event: {
        type: 'message_create',
        message_create: {
          target: { recipient_id: userId },
          message_data: messageData,
        },
      },
    };
    const res = await fetch('https://api.twitter.com/1.1/direct_messages/events/new.json', {
      method: 'POST', headers: this.hdrs, body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`DM send failed: ${res.status} ${errText.substring(0, 200)}`);
    }
    // D1 にログ
  }

  async getDMConversations(): Promise<DMConversation[]> {
    this.assertInit();
    const res = await fetch('https://api.twitter.com/1.1/direct_messages/events/list.json', {
      headers: this.hdrs,
    });
    if (!res.ok) throw new Error(`DM list failed: ${res.status}`);
    const data = (await res.json()) as any;
    return (data?.events ?? []).map((e: any) => this.parseDMConversation(e));
  }

  async getDMConversation(conversationId: string, count = 50): Promise<DM[]> {
    this.assertInit();
    const res = await fetch(
      `https://api.twitter.com/1.1/direct_messages/events/show.json?id=${conversationId}&count=${count}`,
      { headers: this.hdrs },
    );
    if (!res.ok) throw new Error(`DM conversation failed: ${res.status}`);
    const data = (await res.json()) as any;
    return (data?.events ?? []).map((e: any) => this.parseDM(e));
  }

  // ============================================================
  // トレンド
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
  // スペース
  // ============================================================

  async getSpace(spaceId: string): Promise<Space> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.SpaceById, { id: spaceId });
    const space = data?.data?.audio_space?.result;
    if (!space) throw new Error(`Space not found: ${spaceId}`);
    return this.parseSpace(space);
  }

  async searchSpaces(query: string, count = 20): Promise<Space[]> {
    this.assertInit();
    const data = await this.get<any>(ENDPOINTS.SpaceSearch, { query, count }, GENERAL_FEATURES);
    const instructions = data?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions ?? [];
    return this.extractSpaces(instructions);
  }

  // ============================================================
  // 投票
  // ============================================================

  async vote(tweetId: string, choiceIndex: number): Promise<void> {
    this.assertInit();
    await this.post(ENDPOINTS.Vote, {
      tweet_id: tweetId, card_id: '', choice_number: choiceIndex + 1, polling_card_type: 'poll2choice_text_only',
    });
  }

  // ============================================================
  // ヘルパー - パース
  // ============================================================

  private parseUserResult(user: any, fallbackScreenName?: string): TwitterUser {
    return {
      id: user.rest_id ?? '',
      screen_name: user.legacy?.screen_name ?? fallbackScreenName ?? '',
      name: user.legacy?.name ?? '',
      description: user.legacy?.description,
      followers_count: user.legacy?.followers_count ?? 0,
      following_count: user.legacy?.friends_count ?? 0,
      tweet_count: user.legacy?.statuses_count ?? 0,
      listed_count: user.legacy?.listed_count ?? 0,
      likes_count: user.legacy?.favourites_count ?? 0,
      profile_image_url: user.legacy?.profile_image_url_https,
      profile_banner_url: user.legacy?.profile_banner_url,
      created_at: user.legacy?.created_at,
      verified: user.legacy?.verified ?? false,
      blue_verified: !!(user.affiliates_highlighted_label?.label?.badge?.url),
      location: user.legacy?.location,
      url: user.legacy?.entities?.url?.urls?.[0]?.expanded_url,
      protected: user.legacy?.protected ?? false,
    };
  }

  private parseList(list: any): TwitterList {
    return {
      id: list.rest_id ?? '',
      name: list.name ?? '',
      description: list.description ?? '',
      member_count: list.member_count ?? 0,
      subscriber_count: list.subscriber_count ?? 0,
      mode: list.mode ?? 'public',
      created_at: list.created_at ?? '',
    };
  }

  private parseSpace(space: any): Space {
    const creator = space.creator_results?.result;
    return {
      id: space.rest_id ?? '',
      title: space.title ?? '',
      creator: creator ? this.parseUserResult(creator) : { id: '', screen_name: '', name: '' },
      participants: [],
      state: space.state ?? 'ended',
      scheduled_start: space.scheduled_start,
      started_at: space.started_at,
      ended_at: space.ended_at,
      participant_count: space.participant_count ?? 0,
      listener_count: space.listener_count ?? 0,
    };
  }

  private parseDM(event: any): DM {
    const msg = event?.message_create;
    return {
      id: event.id ?? '',
      sender_id: msg?.sender_id ?? '',
      sender_name: '',
      text: msg?.message_data?.text ?? '',
      media_urls: msg?.message_data?.attachment?.media?.media_url_https ? [msg.message_data.attachment.media.media_url_https] : [],
      created_at: new Date(event.created_timestamp).toISOString(),
    };
  }

  private parseDMConversation(event: any): DMConversation {
    const msg = event?.message_create;
    return {
      id: event.id ?? '',
      participants: [],
      last_message: this.parseDM(event),
      unread_count: 0,
      created_at: new Date(event.created_timestamp).toISOString(),
      updated_at: new Date(event.created_timestamp).toISOString(),
    };
  }

  // ============================================================
  // ヘルパー - 抽出
  // ============================================================

  private extractUsers(instructions: any[]): TwitterUser[] {
    const users: TwitterUser[] = [];
    for (const inst of instructions) {
      for (const entry of inst?.entries ?? []) {
        const result = entry?.content?.itemContent?.user_results?.result;
        if (result?.legacy) {
          users.push(this.parseUserResult(result));
        }
      }
    }
    return users;
  }

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

  private extractLists(instructions: any[]): TwitterList[] {
    const lists: TwitterList[] = [];
    for (const inst of instructions) {
      for (const entry of inst?.entries ?? []) {
        const result = entry?.content?.itemContent?.list_results?.result;
        if (result) lists.push(this.parseList(result));
      }
    }
    return lists;
  }

  private extractNotifications(instructions: any[], filter: NotificationFilter): Notification[] {
    const notifications: Notification[] = [];
    const filterMap: Record<string, string> = {
      mentions: 'mention',
      likes: 'like',
      retweets: 'retweet',
      follows: 'follow',
    };
    for (const inst of instructions) {
      for (const entry of inst?.entries ?? []) {
        const result = entry?.content?.itemContent?.notification?.result;
        if (result) {
          const n = this.parseNotification(result);
          if (filter === 'all' || n.type === filterMap[filter]) {
            notifications.push(n);
          }
        }
      }
    }
    return notifications;
  }

  private extractSpaces(instructions: any[]): Space[] {
    const spaces: Space[] = [];
    for (const inst of instructions) {
      for (const entry of inst?.entries ?? []) {
        const result = entry?.content?.itemContent?.audio_space_result?.result;
        if (result) spaces.push(this.parseSpace(result));
      }
    }
    return spaces;
  }

  // ============================================================
  // ヘルパー - 変換
  // ============================================================

  private tweetToObject(result: any): Tweet {
    const legacy = result.legacy ?? {};
    const user = legacy.user ?? result.core?.user_results?.result?.legacy ?? {};
    const entities = legacy.entities ?? {};
    const extendedEntities = legacy.extended_entities ?? {};
    const mediaEntities = extendedEntities.media ?? entities.media ?? [];

    // 投票情報の抽出
    const poll = this.extractPollData(result);

    // 引用ツイート
    let quotedTweet: Tweet | undefined;
    const quotedResult = result.quoted_status_result?.result;
    if (quotedResult?.legacy) {
      quotedTweet = this.tweetToObject(quotedResult);
    }

    return {
      id: result.rest_id ?? legacy.id_str ?? '',
      text: legacy.full_text ?? legacy.text ?? '',
      user: user.screen_name ? {
        id: user.id_str ?? '',
        screen_name: user.screen_name,
        name: user.name ?? '',
        profile_image_url: user.profile_image_url_https,
        verified: user.verified ?? false,
        blue_verified: !!(result.core?.user_results?.result?.affiliates_highlighted_label?.label?.badge?.url),
      } : undefined,
      created_at: legacy.created_at ?? '',
      retweet_count: legacy.retweet_count ?? 0,
      like_count: legacy.favorite_count ?? 0,
      reply_count: legacy.reply_count ?? 0,
      view_count: legacy.ext_views?.count ?? legacy.views?.count,
      lang: legacy.lang,
      media_urls: mediaEntities.map((m: any) => m.media_url_https ?? m.media_url).filter(Boolean),
      is_retweet: !!legacy.retweeted_status_result,
      is_quote: !!result.quoted_status_result,
      is_reply: !!legacy.in_reply_to_status_id_str,
      quoted_tweet: quotedTweet,
      poll,
      in_reply_to_screen_name: legacy.in_reply_to_screen_name,
      in_reply_to_tweet_id: legacy.in_reply_to_status_id_str,
      source: legacy.source,
    };
  }

  private extractPollData(result: any): PollData | undefined {
    try {
      const card = result?.card?.legacy;
      if (!card?.name?.startsWith('poll')) return undefined;
      const choices: PollChoice[] = [];
      for (let i = 1; i <= 4; i++) {
        const label = card.binding_values?.[`choice${i}_label`]?.string_value;
        const count = card.binding_values?.[`choice${i}_count`]?.string_value;
        if (!label) break;
        choices.push({
          label,
          count: parseInt(count ?? '0', 10),
          percentage: 0,
        });
      }
      const total = choices.reduce((s, c) => s + c.count, 0);
      choices.forEach(c => { c.percentage = total > 0 ? Math.round((c.count / total) * 100) : 0; });
      return {
        id: result.rest_id ?? '',
        choices,
        end_datetime: card.binding_values?.end_datetime?.string_value ?? '',
        duration_minutes: parseInt(card.binding_values?.duration_minutes?.string_value ?? '0', 10),
      };
    } catch {
      return undefined;
    }
  }

  private parseNotification(result: any): Notification {
    const template = result?.template ?? {};
    const userResults = template?.aggregateUserResultsV2?.user_results ?? [];
    const tweetResult = template?.tweet_results?.result;
    const firstUser = userResults[0]?.result;
    const user = firstUser ? this.parseUserResult(firstUser) : { id: '', screen_name: '', name: '' };

    // 通知タイプの判定
    let type: Notification['type'] = 'mention';
    const icon = result?.icon?.id ?? '';
    if (icon === 'like') type = 'like';
    else if (icon === 'retweet') type = 'retweet';
    else if (icon === 'follow') type = 'follow';
    else if (icon === 'reply') type = 'reply';

    // 通知テキストの生成
    const actionText: Record<string, string> = {
      like: 'さんがあなたのツイートをいいねしました',
      retweet: 'さんがあなたのツイートをリポストしました',
      reply: 'さんがあなたに返信しました',
      follow: 'さんがあなたをフォローしました',
      mention: 'さんがあなたに言及しました',
      quote: 'さんがあなたのツイートを引用しました',
    };

    return {
      id: result.id ?? '',
      type,
      text: `${user.name}${actionText[type] ?? 'さんからの通知'}`,
      user,
      tweet: tweetResult ? this.tweetToObject(tweetResult) : undefined,
      created_at: new Date(result.timestamp_ms ?? Date.now()).toISOString(),
      read: result.read ?? false,
    };
  }
}
