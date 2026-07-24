/**
 * twiworker — Pages Functions API ミドルウェア
 *
 * 全 /api/* ルートに CORS ヘッダーを付与する。
 */

import type { Env } from '../../src/types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

export async function onRequest(context: EventContext<Env, any, Record<string, unknown>>) {
  const { request, next } = context;

  // OPTIONS プリフライトは即時返却
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // レスポンスに CORS ヘッダーを付与
  const response = await next();
  const newResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    newResponse.headers.set(key, value);
  }

  return newResponse;
}
