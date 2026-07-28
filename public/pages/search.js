/* ======================================================
   twiworker v0.2.0 — 探索（検索）
   ====================================================== */

registerPage('search', function initSearch() {
  const container = document.getElementById('page-search');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>🔍 探索</h1>
    </div>
    <div style="padding:12px 16px;border-bottom:1px solid var(--border)">
      <div style="position:relative">
        <input type="text" id="search-query" class="form-input" placeholder="キーワードを検索" style="border-radius:var(--radius-full);padding-left:44px;font-size:16px">
        <span style="position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:18px;color:var(--text-muted)">🔍</span>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-sm ${'btn-primary'}" id="search-type-top" onclick="setSearchType('top')">Top</button>
        <button class="btn btn-sm btn-secondary" id="search-type-latest" onclick="setSearchType('latest')">最新</button>
        <button class="btn btn-sm btn-secondary" id="search-type-media" onclick="setSearchType('media')">メディア</button>
        <select id="search-lang" class="form-select" style="width:auto;margin-left:auto;padding:6px 12px;font-size:13px">
          <option value="">すべて</option>
          <option value="ja">日本語</option>
          <option value="en">英語</option>
        </select>
      </div>
    </div>
    <div id="search-results" class="tweet-list"></div>`;

  let searchType = 'top';
  let cleanup = null;

  window.setSearchType = function(type) {
    searchType = type;
    ['top','latest','media'].forEach(t => {
      const btn = document.getElementById(`search-type-${t}`);
      if (btn) btn.className = `btn btn-sm ${t === type ? 'btn-primary' : 'btn-secondary'}`;
    });
    doSearch();
  };

  async function doSearch() {
    const query = document.getElementById('search-query').value.trim();
    if (!query) return;
    const results = document.getElementById('search-results');
    results.innerHTML = '<div class="loading"><div class="spinner"></div>検索中...</div>';
    if (cleanup) cleanup();

    try {
      const lang = document.getElementById('search-lang').value;
      const params = new URLSearchParams({ q: query, type: searchType, count: '20' });
      if (lang) params.set('lang', lang);
      const data = await api('GET', `/api/search?${params}`);
      results.innerHTML = '';
      if (!data.tweets?.length) {
        results.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted)">検索結果が見つかりませんでした</p>';
        return;
      }
      data.tweets.forEach(t => results.appendChild(renderTweet(t)));
      if (data.cursor) {
        cleanup = setupInfiniteScroll(results, async (cur) => {
          const p = new URLSearchParams({ q: query, type: searchType, count: '20', cursor: cur });
          if (lang) p.set('lang', lang);
          return await api('GET', `/api/search?${p}`);
        });
      }
    } catch (err) {
      results.innerHTML = `<div class="error-state"><span class="icon">⚠️</span><h3>検索失敗</h3><p>${esc(err.message)}</p></div>`;
    }
  }

  document.getElementById('search-query').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  // フォーカスしたら検索実行
  setTimeout(() => document.getElementById('search-query')?.focus(), 200);
});
