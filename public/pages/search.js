/* ======================================================
   twiworker — 検索
   ====================================================== */

registerPage('search', function initSearchPage() {
  const container = document.getElementById('page-search');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>🔍 ツイート検索</h1>
      <p>キーワードでツイートを検索します</p>
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <div class="form-group">
        <label>検索キーワード</label>
        <input type="text" id="search-query" class="form-input" placeholder="例: Cloudflare Workers">
      </div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <div class="form-group" style="flex: 1; min-width: 120px;">
          <label>タイプ</label>
          <select id="search-type" class="form-select">
            <option value="top">Top</option>
            <option value="latest">最新</option>
            <option value="media">メディア</option>
          </select>
        </div>
        <div class="form-group" style="flex: 1; min-width: 100px;">
          <label>言語</label>
          <select id="search-lang" class="form-select">
            <option value="">すべて</option>
            <option value="ja">日本語</option>
            <option value="en">英語</option>
          </select>
        </div>
        <div class="form-group" style="flex: 0 0 80px;">
          <label>件数</label>
          <select id="search-count" class="form-select">
            <option value="10">10</option>
            <option value="20" selected>20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary" id="search-btn" style="width: 100%; margin-top: 8px;">🔍 検索</button>
    </div>

    <div id="search-results">
      <div class="tweet-list"></div>
    </div>
  `;

  document.getElementById('search-btn').addEventListener('click', async () => {
    const query = document.getElementById('search-query').value.trim();
    if (!query) {
      showToast('エラー', '検索キーワードを入力してください', 'error');
      return;
    }

    const type = document.getElementById('search-type').value;
    const lang = document.getElementById('search-lang').value;
    const count = document.getElementById('search-count').value;

    const resultsContainer = document.querySelector('#search-results .tweet-list');
    resultsContainer.innerHTML = '<div class="loading"><div class="spinner"></div>検索中...</div>';

    try {
      const params = new URLSearchParams({ q: query, type, count });
      if (lang) params.set('lang', lang);

      const data = await api('GET', `/api/search?${params}`);
      resultsContainer.innerHTML = '';

      if (data.tweets.length === 0) {
        resultsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">検索結果が見つかりませんでした</p>';
        return;
      }

      data.tweets.forEach(tweet => resultsContainer.appendChild(renderTweet(tweet)));
    } catch (err) {
      resultsContainer.innerHTML = `
        <div class="error-state">
          <span class="icon">⚠️</span>
          <h3>検索に失敗しました</h3>
          <p>${esc(err.message)}</p>
        </div>`;
    }
  });
});
