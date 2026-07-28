/* ======================================================
   twiworker v0.2.0 — ブックマーク
   ====================================================== */

registerPage('bookmarks', function initBookmarks() {
  const container = document.getElementById('page-bookmarks');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>🔖 ブックマーク</h1>
    </div>
    <div id="bookmarks-list" class="tweet-list">
      <div class="loading"><div class="spinner"></div>読み込み中...</div>
    </div>`;

  const list = document.getElementById('bookmarks-list');
  let cleanup = null;

  async function fetchBookmarks(cursor) {
    const q = cursor ? `?count=20&cursor=${encodeURIComponent(cursor)}` : '?count=20';
    const data = await api('GET', `/api/bookmarks${q}`);
    return { tweets: data.bookmarks?.map(b => b.tweet) || [], cursor: data.cursor };
  }

  (async () => {
    try {
      const initial = await fetchBookmarks(undefined);
      list.innerHTML = '';
      if (!initial.tweets?.length) {
        list.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted)">ブックマークはまだありません<br><span style="font-size:13px">ツイートの🔖をクリックして保存しましょう</span></p>';
        return;
      }
      initial.tweets.forEach(t => list.appendChild(renderTweet(t)));
      cleanup = setupInfiniteScroll(list, async (cur) => await fetchBookmarks(cur));
    } catch (err) {
      list.innerHTML = `<div class="error-state"><span class="icon">⚠️</span><h3>読み込み失敗</h3><p>${esc(err.message)}</p></div>`;
    }
  })();
});
