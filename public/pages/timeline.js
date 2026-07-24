/* ======================================================
   twiworker — タイムライン
   ====================================================== */

registerPage('timeline', function initTimelinePage() {
  const container = document.getElementById('page-timeline');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>📰 タイムライン</h1>
      <p>ホームタイムラインを表示します</p>
    </div>
    <div style="display: flex; gap: 12px; margin-bottom: 20px;">
      <button class="btn btn-primary" id="timeline-refresh-btn">🔄 更新</button>
    </div>
    <div id="timeline-tweets" class="tweet-list">
      <div class="loading"><div class="spinner"></div>読み込み中...</div>
    </div>
  `;

  async function loadTimeline() {
    const el = document.getElementById('timeline-tweets');
    el.innerHTML = '<div class="loading"><div class="spinner"></div>読み込み中...</div>';

    try {
      const data = await api('GET', '/api/timeline?type=home&count=20');
      el.innerHTML = '';

      if (data.tweets.length === 0) {
        el.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">ツイートがありません</p>';
        return;
      }

      data.tweets.forEach(tweet => el.appendChild(renderTweet(tweet)));
    } catch (err) {
      el.innerHTML = `
        <div class="error-state">
          <span class="icon">⚠️</span>
          <h3>読み込みに失敗しました</h3>
          <p>${esc(err.message)}</p>
        </div>`;
    }
  }

  document.getElementById('timeline-refresh-btn').addEventListener('click', loadTimeline);
  loadTimeline();
});
