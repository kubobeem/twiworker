/* ======================================================
   twiworker — トレンド
   ====================================================== */

registerPage('trends', function initTrendsPage() {
  const container = document.getElementById('page-trends');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>📈 トレンド</h1>
      <p>X（Twitter）のトレンドを表示します</p>
    </div>

    <div style="display: flex; gap: 12px; margin-bottom: 20px;">
      <button class="btn btn-primary" id="trends-world-btn">🌍 全世界</button>
      <button class="btn btn-secondary" id="trends-japan-btn">🗾 日本</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 id="trends-title">🌍 全世界のトレンド</h3>
      </div>
      <div id="trends-list"></div>
    </div>
  `;

  async function loadTrends(woeid, label) {
    const list = document.getElementById('trends-list');
    const title = document.getElementById('trends-title');
    title.textContent = label;
    list.innerHTML = '<div class="loading"><div class="spinner"></div>読み込み中...</div>';

    try {
      const data = await api('GET', `/api/trends?woeid=${woeid}`);
      list.innerHTML = '';

      if (data.trends.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">トレンドがありません</p>';
        return;
      }

      data.trends.forEach((trend, i) => {
        const item = document.createElement('div');
        item.style.cssText = `
          display: flex; align-items: center; gap: 16px;
          padding: 14px 0; border-bottom: 1px solid var(--border);
        `;
        if (i === data.trends.length - 1) item.style.borderBottom = 'none';
        item.innerHTML = `
          <span style="font-size: 14px; font-weight: 700; color: var(--text-muted); width: 28px;">${i + 1}</span>
          <div style="flex: 1;">
            <div style="font-weight: 600;">${esc(trend.name)}</div>
            ${trend.tweet_count ? `<div style="font-size: 13px; color: var(--text-muted);">${fmtNum(trend.tweet_count)}件のツイート</div>` : ''}
          </div>
          ${trend.category ? `<span style="font-size: 12px; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px;">${esc(trend.category)}</span>` : ''}`;
        list.appendChild(item);
      });
    } catch (err) {
      list.innerHTML = `
        <div class="error-state">
          <span class="icon">⚠️</span>
          <h3>読み込みに失敗しました</h3>
          <p>${esc(err.message)}</p>
        </div>`;
    }
  }

  document.getElementById('trends-world-btn').addEventListener('click', () => loadTrends(1, '🌍 全世界のトレンド'));
  document.getElementById('trends-japan-btn').addEventListener('click', () => loadTrends(23424856, '🗾 日本のトレンド'));

  // デフォルトで全世界を表示
  loadTrends(1, '🌍 全世界のトレンド');
});
