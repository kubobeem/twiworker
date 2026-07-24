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
  const card = document.createElement('div');
  card.className = 'tweet-card';
  card.innerHTML = `
    <div class="tweet-header">
      <div class="tweet-avatar">${esc((u.name || u.screen_name || '?')[0])}</div>
      <div>
        <div class="tweet-user">${esc(u.name || u.screen_name || '不明')}</div>
        <div class="tweet-screen-name">@${esc(u.screen_name || '')}</div>
      </div>
    </div>
    <div class="tweet-text">${esc(t.text)}</div>
    <div class="tweet-meta">
      <span>❤️ ${fmtNum(t.like_count)}</span>
      <span>🔄 ${fmtNum(t.retweet_count)}</span>
      <span>💬 ${fmtNum(t.reply_count)}</span>
      ${t.view_count ? `<span>👁️ ${fmtNum(t.view_count)}</span>` : ''}
      <span>🕐 ${fmtRel(t.created_at)}</span>
    </div>`;
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
});
