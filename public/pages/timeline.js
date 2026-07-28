/* ======================================================
   twiworker v0.2.0 — ホームタイムライン
   ====================================================== */

registerPage('timeline', function initTimeline() {
  const list = document.getElementById('timeline-tweets');
  if (!list) return;

  let cleanup = null;

  async function fetchPage(cursor) {
    const q = cursor ? `?count=20&cursor=${encodeURIComponent(cursor)}` : '?count=20';
    return await api('GET', `/api/timeline${q}`);
  }

  (async () => {
    try {
      const initial = await fetchPage(undefined);
      list.innerHTML = '';
      if (!initial.tweets?.length) {
        list.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted)">ツイートがありません。<br><br><button class="btn btn-primary" onclick="navigateTo(\'compose\')">最初のツイートをする</button></p>';
        return;
      }
      initial.tweets.forEach(t => list.appendChild(renderTweet(t)));
      cleanup = setupInfiniteScroll(list, async (cur) => await fetchPage(cur));
    } catch (err) {
      list.innerHTML = `<div class="error-state"><span class="icon">⚠️</span><h3>読み込み失敗</h3><p>${esc(err.message)}</p><button class="btn btn-primary" onclick="navigateTo('timeline')">再試行</button></div>`;
    }
  })();
});
