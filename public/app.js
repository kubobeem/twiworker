/* ======================================================
   twiworker — 共通 JavaScript
   ナビゲーション・API・UI改善
   ====================================================== */

const API_BASE = window.location.origin;
let twitterStatus = false;
let currentPage = 'dashboard';

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
// トースト
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
  }, 4000);
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
  return day < 7 ? `${day}日前` : fmtDate(s);
}

function renderTweet(t) {
  const u = t.user || {};
  const id = t.id;
  const card = document.createElement('div');
  card.className = 'tweet-card';
  card.innerHTML = `
    <div class="tweet-header">
      <div class="tweet-avatar">${esc((u.name || u.screen_name || '?')[0])}</div>
      <div>
        <div class="tweet-user">${esc(u.name || u.screen_name || '不明')}</div>
        <div class="tweet-screen-name">@${esc(u.screen_name || '')}</div>
      </div>
      <div style="margin-left:auto;font-size:12px;color:var(--text-muted)">${fmtRel(t.created_at)}</div>
    </div>
    <div class="tweet-text">${esc(t.text)}</div>
    <div class="tweet-meta">
      <span class="tweet-action" data-action="reply" data-id="${id}">💬 ${fmtNum(t.reply_count)}</span>
      <span class="tweet-action" data-action="retweet" data-id="${id}">🔄 ${fmtNum(t.retweet_count)}</span>
      <span class="tweet-action" data-action="like" data-id="${id}">❤️ ${fmtNum(t.like_count)}</span>
      ${t.view_count ? `<span>👁️ ${fmtNum(t.view_count)}</span>` : ''}
    </div>
    <div class="tweet-actions" style="display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);gap:6px">
      <input class="form-input" id="reply-input-${id}" placeholder="返信を入力..." maxlength="280" style="flex:1;padding:8px 12px;font-size:13px">
      <button class="btn btn-primary btn-sm reply-send" data-id="${id}">送信</button>
    </div>`;

  // いいねトグル
  let liked = false;
  card.querySelector('[data-action="like"]')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const el = e.currentTarget;
    el.style.opacity = '0.5';
    try {
      let count = t.like_count || 0;
      if (liked) {
        await api('POST', `/api/tweet/${id}/unlike`);
        liked = false;
        el.innerHTML = `❤️ ${fmtNum(count)}`;
      } else {
        await api('POST', `/api/tweet/${id}/like`);
        liked = true;
        el.innerHTML = `💖 ${fmtNum(count + 1)}`;
      }
    } catch (err) {
      showToast('エラー', err.message, 'error');
    }
    el.style.opacity = '1';
  });

  // リポストクリック
  card.querySelector('[data-action="retweet"]')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const el = e.currentTarget;
    el.style.opacity = '0.5';
    try {
      await api('POST', `/api/tweet/${id}/retweet`);
      el.innerHTML = `🔄 ${fmtNum((t.retweet_count || 0) + 1)}`;
      showToast('リポストしました', '', 'success');
    } catch (err) {
      showToast('エラー', err.message, 'error');
    }
    el.style.opacity = '1';
  });

  // 返信クリック → 返信フォーム表示Toggle
  const replySection = card.querySelector('.tweet-actions');
  card.querySelector('[data-action="reply"]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (replySection) {
      replySection.style.display = replySection.style.display === 'none' ? 'flex' : 'none';
      const input = replySection.querySelector('input');
      if (input && replySection.style.display === 'flex') input.focus();
    }
  });

  // 返信送信
  card.querySelector('.reply-send')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const input = document.getElementById(`reply-input-${id}`);
    if (!input || !input.value.trim()) return;
    btn.disabled = true;
    btn.textContent = '送信中...';
    try {
      await api('POST', '/api/tweet', { text: input.value.trim(), reply_to: id });
      showToast('返信しました', '', 'success');
      input.value = '';
      if (replySection) replySection.style.display = 'none';
    } catch (err) {
      showToast('エラー', err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '送信';
    }
  });

  return card;
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
  } catch {
    el.className = 'sidebar-status offline';
    el.innerHTML = '<span class="dot"></span><span>API オフライン</span>';
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

  // サイドバー閉じる（モバイル）
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('open');

  // ナビゲーションアクティブ更新
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // ページ表示切替
  document.querySelectorAll('.page-content').forEach(el => {
    const show = el.id === `page-${page}`;
    if (show) {
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  });

  // ページ初期化（初回のみ）
  if (PAGE_INIT_FNS[page]) {
    const fn = PAGE_INIT_FNS[page];
    delete PAGE_INIT_FNS[page];
    fn();
  }
}

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) navigateTo(page);
    });
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
  const pages = ['dashboard', 'compose', 'search', 'timeline', 'dm', 'schedule', 'trends', 'settings'];
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key >= '1' && e.key <= '8') {
      e.preventDefault();
      navigateTo(pages[parseInt(e.key) - 1]);
      return;
    }
    if (e.key === 'n' || e.key === 'N') { e.preventDefault(); navigateTo('compose'); }
    if (e.key === '/') { e.preventDefault(); navigateTo('search'); setTimeout(() => {
      const q = document.getElementById('search-query');
      if (q) q.focus();
    }, 100); }
    if (e.key === 'r' || e.key === 'R') {
      const active = document.querySelector('.nav-item.active');
      if (active) {
        const page = active.dataset.page;
        if (page) navigateTo(page);
      }
    }
  });

  // ショートカットヒント表示（初回のみ）
  let hintShown = false;
  document.addEventListener('keydown', () => {
    if (!hintShown) {
      hintShown = true;
      const hint = document.getElementById('shortcut-hint');
      if (hint) {
        hint.classList.add('visible');
        setTimeout(() => hint.classList.remove('visible'), 5000);
      }
    }
  });
}

// ======================================================
// 無限スクロール
// ======================================================

/**
 * IntersectionObserver を使った無限スクロール
 * @param containerEl ツイートを追加する要素
 * @param fetchMore 追加データを取得する非同期関数。{tweets, cursor} を返す
 * @returns クリーンアップ関数
 */
function setupInfiniteScroll(containerEl, fetchMore) {
  let cursor = undefined;
  let loading = false;
  let hasMore = true;
  let observer = null;

  // インジケーター要素
  const sentinel = document.createElement('div');
  sentinel.className = 'loading';
  sentinel.id = 'infinite-scroll-sentinel';
  sentinel.innerHTML = '<div class="spinner"></div><span>読み込み中...</span>';
  containerEl.after(sentinel);

  function showSentinel(show) {
    sentinel.style.display = show ? 'flex' : 'none';
  }
  showSentinel(false);

  async function loadMore() {
    if (loading || !hasMore) return;
    loading = true;
    showSentinel(true);
    try {
      const result = await fetchMore(cursor);
      if (!result || !result.tweets || result.tweets.length === 0) {
        hasMore = false;
        showSentinel(false);
        return;
      }
      result.tweets.forEach(t => containerEl.appendChild(renderTweet(t)));
      cursor = result.cursor;
      if (!cursor) hasMore = false;
    } catch (err) {
      hasMore = false;
      sentinel.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:16px">これ以上読み込めません</p>';
    } finally {
      loading = false;
      showSentinel(hasMore);
    }
  }

  function reset(newHasMore = true) {
    cursor = undefined;
    hasMore = newHasMore;
    loading = false;
    containerEl.innerHTML = '';
    showSentinel(false);
  }

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore();
  }, { rootMargin: '200px' });
  observer.observe(sentinel);

  // クリーンアップ関数を返す
  return function cleanup() {
    if (observer) observer.disconnect();
    sentinel.remove();
    reset(false);
  };
}

// ======================================================
// スケルトン
// ======================================================

function skeletonCard(count = 3) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `<div class="skeleton-card"><div class="skeleton skeleton-avatar"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line"></div></div>`;
  }
  return html;
}

// ======================================================
// 初期化
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  updateConnectionStatus();

  // 定期的に接続状態を更新
  setInterval(updateConnectionStatus, 60000);

  // トーストコンテナ
  const tc = document.createElement('div');
  tc.id = 'toast-container';
  tc.className = 'toast-container';
  document.body.appendChild(tc);

  // ダッシュボードを初期化
  if (PAGE_INIT_FNS['dashboard']) {
    const fn = PAGE_INIT_FNS['dashboard'];
    delete PAGE_INIT_FNS['dashboard'];
    setTimeout(fn, 100);
  }

  // 初回アクセス免責同意モーダル
  if (!localStorage.getItem('twiworker_disclaimer_accepted')) {
    const modal = document.getElementById('disclaimer-modal');
    const agreeBtn = document.getElementById('disclaimer-agree-btn');
    const declineBtn = document.getElementById('disclaimer-decline-btn');
    if (modal && agreeBtn) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      function closeModal(agreed) {
        if (agreed) {
          localStorage.setItem('twiworker_disclaimer_accepted', 'true');
        }
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }

      function closeModalAndCleanup(agreed) {
        closeModal(agreed);
        document.removeEventListener('keydown', onEscape);
      }

      agreeBtn.addEventListener('click', () => closeModalAndCleanup(true));

      declineBtn?.addEventListener('click', () => {
        window.location.href = 'https://www.google.com';
      });

      // Escapeキーで同意しない
      function onEscape(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          declineBtn?.click();
        }
      }
      document.addEventListener('keydown', onEscape);
    }
  }
});
