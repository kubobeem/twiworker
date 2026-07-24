/**
 * twiworker — Pages Functions API エントリポイント
 *
 * [[route]].ts は /api/* 以下のすべてのパスをキャッチし、
 * Hono アプリケーションにルーティングを委譲する。
 */

import type { Env } from '../../src/types';
import { app } from '../../src/index';

export async function onRequest(context: EventContext<Env, any, Record<string, unknown>>) {
  const { request, env } = context;
  return app.fetch(request, env);
}
