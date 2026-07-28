/* ======================================================
   twiworker v0.2.0 — 共通 JavaScript
   X（Twitter）風 UI / 3カラムレイアウト / 全機能
   ====================================================== */

const API_BASE = window.location.origin;
let twitterStatus = false;
let currentPage = 'timeline';
let accountInfo = null;

// ======================================================
// API
// ======================================================

async function api(method, path, body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'API エラー');
  return data.data;
}

// ======================================================
// トースト（X風）
// ======================================================

function showToast(title, message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-title">${esc(title)}</div><div class="toast-message">${esc(message)}</div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ======================================================
// ユーティリティ
// ======================================================

function esc(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function fmtNum(n) {
  if (n === null || n === undefined) return '0';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function fmtRel(s) {
  if (!s) return '';
  const diff = Date.now() - new Date(s).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'たった今';
  if (min < 60) return `${min}分前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}時間前`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}日前`;
  return fmtDate(s);
}

function fmtShortTime(s) {
  if (!s) return '';
  const d = new Date(s);
  const now = new Date();
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
}

// ======================================================
// X風ツイートカードレンダリング
// ======================================================

function renderTweet(t) {
  const u = t.user || {};
  const id = t.id;
  const card = document.createElement('div');
  card.className = 'tweet-card';

  const mediaHtml = t.media_urls?.length
    ? `<div class="tweet-media">${t.media_urls.length === 1
        ? `<img src="${esc(t.media_urls[0])}" alt="" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="tweet-media-grid" style="grid-template-columns:repeat(${Math.min(t.media_urls.length, 2)},1fr)">${t.media_urls.map(u => `<img src="${esc(u)}" alt="" loading="lazy" onerror="this.style.display='none'">`).join('')}</div>`}</div>`
    : '';

  const pollHtml = t.poll ? renderPoll(t.poll, id) : '';

  const verifiedBadge = u.verified || u.blue_verified
    ? `<span class="verified-badge">${u.blue_verified ? '🔷' : '✅'}</span>`
    : '';

  const avatarHtml = u.profile_image_url
    ? `<div class="tweet-avatar" title="${esc(u.name || u.screen_name || '')}"><img src="${esc(u.profile_image_url)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='${esc((u.name || u.screen_name || '?')[0])}';"></div>`
    : `<div class="tweet-avatar" title="${esc(u.name || u.screen_name || '')}">${esc((u.name || u.screen_name || '?')[0])}</div>`;

  card.innerHTML = `
    ${avatarHtml}
    <div class="tweet-body">
      <div class="tweet-header">
        <span class="tweet-name">${esc(u.name || u.screen_name || '不明')}${verifiedBadge}</span>
        <span class="tweet-handle">@${esc(u.screen_name || '')}</span>
        <span class="tweet-time">${fmtRel(t.created_at)}</span>
        <span class="tweet-more" onclick="event.stopPropagation()">···</span>
      </div>
      <div class="tweet-text">${esc(t.text)}</div>
      ${mediaHtml}
      ${pollHtml}
      <div class="tweet-actions">
        <span class="tweet-action" data-action="reply" data-id="${id}">
          <span class="action-icon">💬</span> ${fmtNum(t.reply_count)}
        </span>
        <span class="tweet-action" data-action="retweet" data-id="${id}">
          <span class="action-icon">🔄</span> ${fmtNum(t.retweet_count)}
        </span>
        <span class="tweet-action" data-action="like" data-id="${id}" data-count="${t.like_count}">
          <span class="action-icon">❤️</span> ${fmtNum(t.like_count)}
        </span>
        <span class="tweet-action" data-action="bookmark" data-id="${id}">
          <span class="action-icon">🔖</span>
        </span>
        <span class="tweet-action" data-action="view" data-id="${id}">
          <span class="action-icon">👁️</span> ${t.view_count ? fmtNum(t.view_count) : ''}
        </span>
      </div>
      <div class="tweet-reply-area" data-reply-id="${id}">
        <input class="reply-input" placeholder="返信をポスト" maxlength="280">
        <button class="btn btn-sm btn-primary reply-send-btn">返信</button>
      </div>
    </div>`;

  // いいねトグル
  let liked = false;
  const likeEl = card.querySelector('[data-action="like"]');
  likeEl?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const icon = likeEl.querySelector('.action-icon');
    icon.textContent = liked ? '❤️' : '💖';
    likeEl.style.opacity = '0.6';
    try {
      if (liked) {
        await api('POST', `/api/tweet/${id}/unlike`);
        liked = false;
        likeEl.innerHTML = `<span class="action-icon">❤️</span> ${t.like_count || 0}`;
      } else {
        await api('POST', `/api/tweet/${id}/like`);
        liked = true;
        likeEl.innerHTML = `<span class="action-icon">💖</span> ${(t.like_count || 0) + 1}`;
      }
    } catch (err) {
      showToast('エラー', err.message, 'error');
    }
    likeEl.style.opacity = '1';
  });

  // リポスト
  const retweetEl = card.querySelector('[data-action="retweet"]');
  retweetEl?.addEventListener('click', async (e) => {
    e.stopPropagation();
    retweetEl.style.opacity = '0.6';
    try {
      await api('POST', `/api/tweet/${id}/retweet`);
      retweetEl.innerHTML = `<span class="action-icon">🔄</span> ${fmtNum((t.retweet_count || 0) + 1)}`;
      showToast('リポストしました', '', 'success');
    } catch (err) {
      showToast('エラー', err.message, 'error');
    }
    retweetEl.style.opacity = '1';
  });

  // 返信トグル
  const replyArea = card.querySelector('.tweet-reply-area');
  card.querySelector('[data-action="reply"]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    replyArea.classList.toggle('open');
    const input = replyArea.querySelector('input');
    if (replyArea.classList.contains('open') && input) input.focus();
  });

  // 返信送信
  replyArea.querySelector('.reply-send-btn')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const input = replyArea.querySelector('input');
    if (!input?.value.trim()) return;
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = '送信中...';
    try {
      await api('POST', '/api/tweet', { text: input.value.trim(), reply_to: id });
      showToast('返信しました', '', 'success');
      input.value = '';
      replyArea.classList.remove('open');
    } catch (err) {
      showToast('エラー', err.message, 'error');
    }
    btn.disabled = false;
    btn.textContent = '返信';
  });

  // ブックマーク
  card.querySelector('[data-action="bookmark"]')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
      await api('POST', '/api/bookmarks', { tweet_id: id });
      showToast('ブックマークに追加', '', 'success');
    } catch (err) {
      showToast('エラー', err.message, 'error');
    }
  });

  // 引用ツイートがある場合
  if (t.quoted_tweet) {
    const quoted = document.createElement('div');
    quoted.style.cssText = 'border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;margin:8px 0;font-size:13px;';
    const qu = t.quoted_tweet.user || {};
    quoted.innerHTML = `<strong>${esc(qu.name || '')}</strong> @${esc(qu.screen_name || '')}<br>${esc(t.quoted_tweet.text.substring(0, 140))}${t.quoted_tweet.text.length > 140 ? '...' : ''}`;
    card.querySelector('.tweet-body')?.insertBefore(quoted, card.querySelector('.tweet-actions'));
  }

  return card;
}

// ======================================================
// 投票レンダリング
// ======================================================

function renderPoll(poll, tweetId) {
  const total = poll.choices.reduce((s, c) => s + c.count, 0);
  let html = `<div class="poll-card">`;
  poll.choices.forEach((c, i) => {
    const pct = poll.percentage || (total > 0 ? Math.round((c.count / total) * 100) : 0);
    html += `
      <div class="poll-option" data-tweet-id="${tweetId}" data-choice="${i}" onclick="votePoll(this)">
        <div class="poll-bar" style="width:${pct}%"></div>
        <span class="poll-label">${esc(c.label)}</span>
        <span class="poll-pct">${pct}%</span>
      </div>`;
  });
  html += `<div class="poll-info">${fmtNum(total)} 票 · ${fmtRel(poll.end_datetime)} 終了</div>`;
  html += `</div>`;
  return html;
}

async function votePoll(el) {
  if (el.classList.contains('voted')) return;
  const tweetId = el.dataset.tweetId;
  const choice = parseInt(el.dataset.choice);
  el.style.opacity = '0.6';
  try {
    await api('POST', `/api/tweet/${tweetId}/vote`, { choice });
    el.closest('.poll-card')?.querySelectorAll('.poll-option').forEach(o => o.classList.add('voted'));
    showToast('投票しました', '', 'success');
  } catch (err) {
    showToast('エラー', err.message, 'error');
  }
  el.style.opacity = '1';
}

// ======================================================
// 接続状態
// ======================================================

async function updateConnectionStatus() {
  const el = document.getElementById('sidebar-status');
  if (!el) return;
  try {
    const health = await api('GET', '/api/health');
    twitterStatus = health.twitter_logged_in;
    el.className = `sidebar-status ${twitterStatus ? 'online' : 'offline'}`;
    el.innerHTML = `<span class="dot"></span><span>${twitterStatus ? 'Twitter 接続済み' : 'Twitter 未接続'}</span>`;

    // アカウント情報も更新
    if (twitterStatus && !accountInfo) {
      try {
        const status = await api('GET', '/api/status');
        const nameEl = document.getElementById('acc-name');
        const handleEl = document.getElementById('acc-handle');
        if (nameEl) nameEl.textContent = status.config?.account_username || 'ユーザー';
        if (handleEl) handleEl.textContent = `@${status.config?.account_username || ''}`;
        accountInfo = status;
      } catch {}
    }
  } catch {
    el.className = 'sidebar-status offline';
    el.innerHTML = '<span class="dot"></span><span>API オフライン</span>';
  }
}

// ======================================================
// 右カラム トレンド
// ======================================================

async function loadRightTrends(woeid, tabEl) {
  const list = document.getElementById('right-trends-list');
  if (!list) return;
  document.querySelectorAll('.trends-tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');
  list.innerHTML = '<div class="loading" style="padding:24px"><div class="spinner"></div></div>';
  try {
    const data = await api('GET', `/api/trends?woeid=${woeid}`);
    list.innerHTML = data.trends.slice(0, 5).map((t, i) => `
      <div class="trend-item" onclick="navigateTo('search')">
        <span class="rank">${i + 1}</span>
        <div class="content">
          <div class="trend-name">${esc(t.name)}</div>
          ${t.tweet_count ? `<div class="trend-count">${fmtNum(t.tweet_count)}件</div>` : ''}
        </div>
        <span class="trend-more">···</span>
      </div>
    `).join('');
  } catch {
    list.innerHTML = '<p style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px">トレンドを読み込めません</p>';
  }
}

// ======================================================
// ナビゲーション
// ======================================================

const PAGE_INIT_FNS = {};

function registerPage(page, fn) {
  PAGE_INIT_FNS[page] = fn;
}

function navigateTo(page) {
  currentPage = page;

  // モバイルサイドバーを閉じる
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('open');

  // ナビゲーションアクティブ更新
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // ページ表示切替
  document.querySelectorAll('.page-content').forEach(el => {
    el.style.display = el.id === `page-${page}` ? 'block' : 'none';
  });

  // ページ初期化
  if (PAGE_INIT_FNS[page]) {
    const fn = PAGE_INIT_FNS[page];
    delete PAGE_INIT_FNS[page];
    setTimeout(fn, 50);
  }

  // スクロールトップに戻す
  const main = document.getElementById('main-content');
  if (main) main.scrollTop = 0;
}

function initNavigation() {
  // ナビアイテムクリック
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) navigateTo(page);
    });
  });

  // ツイートボタン
  document.getElementById('sidebar-tweet-btn')?.addEventListener('click', () => {
    navigateTo('compose');
  });

  // モバイルメニュー
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('sidebar-overlay')?.classList.toggle('open');
  });
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('open');
  });

  // キーボードショートカット
  const pages = ['timeline', 'search', 'notifications', 'dm', 'lists', 'bookmarks', 'profile', 'compose', 'schedule', 'settings'];
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      navigateTo(pages[parseInt(e.key) - 1]);
      return;
    }
    if (e.key === '0') { e.preventDefault(); navigateTo('settings'); }
    if (e.key === 'n' || e.key === 'N') { e.preventDefault(); navigateTo('compose'); }
    if (e.key === '/') { e.preventDefault(); navigateTo('search'); }
    if (e.key === 'r' || e.key === 'R') {
      const active = document.querySelector('.nav-item.active');
      if (active?.dataset?.page) navigateTo(active.dataset.page);
    }
    if (e.key === 'b' || e.key === 'B') { e.preventDefault(); navigateTo('bookmarks'); }
    if (e.key === 'l' || e.key === 'L') { e.preventDefault(); navigateTo('lists'); }
  });
}

// ======================================================
// 無限スクロール
// ======================================================

function setupInfiniteScroll(containerEl, fetchMore) {
  let cursor = undefined;
  let loading = false;
  let hasMore = true;
  let observer = null;

  const sentinel = document.createElement('div');
  sentinel.className = 'loading';
  sentinel.innerHTML = '<div class="spinner"></div>';
  sentinel.style.padding = '24px';
  sentinel.style.display = 'none';
  containerEl.after(sentinel);

  async function loadMore() {
    if (loading || !hasMore) return;
    loading = true;
    sentinel.style.display = 'flex';
    try {
      const result = await fetchMore(cursor);
      if (!result?.tweets?.length) {
        hasMore = false;
        sentinel.style.display = 'none';
        return;
      }
      result.tweets.forEach(t => containerEl.appendChild(renderTweet(t)));
      cursor = result.cursor;
      if (!cursor) hasMore = false;
    } catch {
      hasMore = false;
    } finally {
      loading = false;
      sentinel.style.display = hasMore ? 'flex' : 'none';
    }
  }

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore();
  }, { rootMargin: '200px' });
  observer.observe(sentinel);

  return function cleanup() {
    if (observer) observer.disconnect();
    sentinel.remove();
  };
}

// ======================================================
// スケルトン
// ======================================================

function skeletonTweet(count = 3) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `<div class="skeleton-card"><div class="skeleton skeleton-avatar"></div><div class="skeleton-body"><div class="skeleton skeleton-line" style="width:30%"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line" style="width:80%"></div></div></div>`;
  }
  return html;
}

// ======================================================
// 初期化
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  updateConnectionStatus();

  // 定期的に状態更新
  setInterval(updateConnectionStatus, 60000);

  // トーストコンテナ
  const tc = document.createElement('div');
  tc.id = 'toast-container';
  tc.className = 'toast-container';
  document.body.appendChild(tc);

  // 右カラムのトレンド読み込み
  setTimeout(() => loadRightTrends(1, document.querySelector('.trends-tab')), 500);

  // ホーム初期化
  if (PAGE_INIT_FNS['timeline']) {
    const fn = PAGE_INIT_FNS['timeline'];
    delete PAGE_INIT_FNS['timeline'];
    setTimeout(fn, 100);
  }

  // 同意モーダル
  if (!localStorage.getItem('twiworker_disclaimer_accepted')) {
    const modal = document.getElementById('disclaimer-modal');
    const agreeBtn = document.getElementById('disclaimer-agree-btn');
    const declineBtn = document.getElementById('disclaimer-decline-btn');
    if (modal && agreeBtn) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      function closeModal(agreed) {
        if (agreed) localStorage.setItem('twiworker_disclaimer_accepted', 'true');
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }

      agreeBtn.addEventListener('click', () => closeModal(true));
      declineBtn?.addEventListener('click', () => { window.location.href = 'https://www.google.com'; });

      function onEscape(e) {
        if (e.key === 'Escape') { e.preventDefault(); declineBtn?.click(); }
      }
      document.addEventListener('keydown', onEscape);
    }
  }
});
