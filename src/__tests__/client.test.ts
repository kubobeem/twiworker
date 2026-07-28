/**
 * twiworker v0.2.0 — TwitterClient ユニットテスト
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test helpers
function createMockEnv() {
  return {
    TWITTER_COOKIES: JSON.stringify({
      auth_token: 'test_auth_token',
      ct0: 'test_ct0',
      twid: 'u%3D12345',
      kdt: 'test_kdt',
      lang: 'ja',
      _twitter_sess: 'test_session',
    }),
    KV: {} as any,
    DB: {} as any,
  };
}

describe('TwitterClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize from cookies', async () => {
    const { TwitterClient } = await import('../client');
    const client = new TwitterClient(createMockEnv() as any);
    expect(client.isInitialized).toBe(false);
    await client.initialize();
    expect(client.isInitialized).toBe(true);
  });

  it('should not initialize without cookies', async () => {
    const { TwitterClient } = await import('../client');
    const client = new TwitterClient({} as any);
    await client.initialize();
    expect(client.isInitialized).toBe(false);
  });

  it('should throw when not initialized', async () => {
    const { TwitterClient } = await import('../client');
    const client = new TwitterClient({} as any);
    await expect(client.postTweet('test')).rejects.toThrow('Twitter client not initialized');
  });
});

describe('D1Store', () => {
  it('should report unavailable when DB is missing', async () => {
    const { D1Store } = await import('../storage/d1');
    const store = new D1Store({} as any);
    expect(store.available).toBe(false);
  });

  it('should report available when DB is present', async () => {
    const { D1Store } = await import('../storage/d1');
    const store = new D1Store({ DB: {} } as any);
    expect(store.available).toBe(true);
  });
});

describe('RateLimiter', () => {
  it('should allow health check without rate limiting', async () => {
    const { RateLimiter } = await import('../middleware/ratelimit');
    const limiter = new RateLimiter({} as any);
    const result = await limiter.check('GET', '/api/health', '127.0.0.1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(999);
  });

  it('should use default limits for unknown endpoints', async () => {
    const { RateLimiter } = await import('../middleware/ratelimit');
    const limiter = new RateLimiter({} as any);
    const result = await limiter.check('GET', '/api/unknown', '127.0.0.1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(60);
  });
});

describe('AdminHandler', () => {
  it('should report version 0.2.0', async () => {
    const { AdminHandler } = await import('../handlers/admin');
    const handler = new AdminHandler(
      { isInitialized: true } as any,
      {} as any,
      { available: true } as any,
      { available: true } as any,
    );
    const health = await handler.health();
    expect(health.version).toBe('0.2.0');
    expect(health.status).toBe('ok');
  });

  it('should report status with version', async () => {
    const { AdminHandler } = await import('../handlers/admin');
    const handler = new AdminHandler(
      { isInitialized: true } as any,
      { ACCOUNT_USERNAME: 'test' } as any,
      { available: true } as any,
      { available: true } as any,
    );
    const status = await handler.status();
    expect(status.version).toBe('0.2.0');
    expect(status.config.account_username).toBe('test');
  });
});
