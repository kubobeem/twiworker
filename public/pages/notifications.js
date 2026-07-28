/* ======================================================
   twiworker v0.2.0 — 通知
   ====================================================== */

registerPage('notifications', function initNotifications() {
  const container = document.getElementById('page-notifications');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>🔔 通知</h1>
    </div>
    <div class="notif-filters">
      <div class="notif-filter active" data-filter="all" onclick="loadNotifFilter(this)">すべて</div>
      <div class="notif-filter" data-filter="likes" onclick="loadNotifFilter(this)">いいね</div>
      <div class="notif-filter" data-filter="retweets" onclick="loadNotifFilter(this)">リポスト</div>
      <div class="notif-filter" data-filter="follows" onclick="loadNotifFilter(this)">フォロー</div>
      <div class="notif-filter" data-filter="mentions" onclick="loadNotifFilter(this)">メンション</div>
    </div>
    <div id="notifications-list" class="tweet-list">
      <div class="loading"><div class="spinner"></div>読み込み中...</div>
    </div>`;

  let cleanup = null;

  window.loadNotifFilter = function(el) {
    document.querySelectorAll('.notif-filter').forEach(f => f.classList.remove('active'));
    el.classList.add('active');
    loadNotifications(el.dataset.filter);
  };

  async function loadNotifications(filter) {
    const list = document.getElementById('notifications-list');
    list.innerHTML = '<div class="loading"><div class="spinner"></div>読み込み中...</div>';
    if (cleanup) cleanup();

    try {
      const params = filter && filter !== 'all' ? `?filter=${filter}` : '';
      const data = await api('GET', `/api/notifications${params}`);
      list.innerHTML = '';

      if (!data.notifications?.length) {
        list.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted)">通知はありません</p>';
        return;
      }

      data.notifications.forEach(n => {
        const card = document.createElement('div');
        card.className = 'notif-card';
        const iconMap = {
          like: '❤️', retweet: '🔄', reply: '💬', follow: '👤', mention: '💬', quote: '🔁'
        };
        card.innerHTML = `
          <div class="notif-icon">${iconMap[n.type] || '🔔'}</div>
          <div class="notif-body">
            <div class="notif-text">
              <strong>${esc(n.user?.name || '')}</strong> ${esc(n.text)}
            </div>
            <div class="notif-time">${fmtRel(n.created_at)}</div>
            ${n.tweet ? `<div class="notif-tweet-preview">${esc(n.tweet.text.substring(0, 100))}</div>` : ''}
          </div>`;
        list.appendChild(card);
      });

      if (data.cursor) {
        cleanup = setupInfiniteScroll(list, async (cur) => {
          const p = filter && filter !== 'all' ? `?filter=${filter}&cursor=${cur}` : `?cursor=${cur}`;
          return await api('GET', `/api/notifications${p}`);
        });
      }
    } catch (err) {
      list.innerHTML = `<div class="error-state"><span class="icon">⚠️</span><h3>読み込み失敗</h3><p>${esc(err.message)}</p></div>`;
    }
  }

  loadNotifications('all');
});
