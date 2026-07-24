-- ======================================================
-- twiworker: 初期マイグレーション
-- 適用: wrangler d1 migrations apply twiworker-db
-- ======================================================

-- アカウント管理
CREATE TABLE IF NOT EXISTS accounts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT NOT NULL UNIQUE,
    display_name TEXT DEFAULT NULL,
    avatar_url   TEXT DEFAULT NULL,
    is_active    INTEGER NOT NULL DEFAULT 1,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ツイートログ
CREATE TABLE IF NOT EXISTS tweets (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    tweet_id     TEXT UNIQUE,
    account_id   INTEGER NOT NULL REFERENCES accounts(id),
    text         TEXT NOT NULL,
    media_urls   TEXT DEFAULT NULL,       -- JSON 配列
    tweet_type   TEXT NOT NULL DEFAULT 'tweet',  -- tweet | thread | reply
    status       TEXT NOT NULL DEFAULT 'posted', -- posted | scheduled | failed
    posted_at    DATETIME DEFAULT NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- スケジュールツイート
CREATE TABLE IF NOT EXISTS scheduled_tweets (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id   INTEGER NOT NULL REFERENCES accounts(id),
    text         TEXT NOT NULL,
    media_urls   TEXT DEFAULT NULL,       -- JSON 配列
    is_thread    INTEGER NOT NULL DEFAULT 0,
    thread_group_id INTEGER DEFAULT NULL, -- スレッドグループID
    schedule_at  DATETIME NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending', -- pending | posted | cancelled | failed
    error_msg    TEXT DEFAULT NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- トレンドログ
CREATE TABLE IF NOT EXISTS trends_log (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    location_woeid INTEGER NOT NULL DEFAULT 1,
    trends_data  TEXT NOT NULL,           -- JSON 配列
    fetched_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- DMログ
CREATE TABLE IF NOT EXISTS dm_log (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    dm_id        TEXT UNIQUE,
    account_id   INTEGER NOT NULL REFERENCES accounts(id),
    sender_id    TEXT NOT NULL,
    sender_name  TEXT NOT NULL,
    text         TEXT NOT NULL,
    direction    TEXT NOT NULL DEFAULT 'in', -- in | out
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- APIログ
CREATE TABLE IF NOT EXISTS api_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint        TEXT NOT NULL,
    method          TEXT NOT NULL,
    ip_address      TEXT DEFAULT NULL,
    status_code     INTEGER DEFAULT NULL,
    response_time_ms INTEGER DEFAULT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_tweets_account_id ON tweets(account_id);
CREATE INDEX IF NOT EXISTS idx_tweets_tweet_id ON tweets(tweet_id);
CREATE INDEX IF NOT EXISTS idx_tweets_posted_at ON tweets(posted_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_status ON scheduled_tweets(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_schedule_at ON scheduled_tweets(schedule_at);
CREATE INDEX IF NOT EXISTS idx_dm_log_account_id ON dm_log(account_id);
CREATE INDEX IF NOT EXISTS idx_api_log_created_at ON api_log(created_at);
CREATE INDEX IF NOT EXISTS idx_trends_log_fetched_at ON trends_log(fetched_at);
