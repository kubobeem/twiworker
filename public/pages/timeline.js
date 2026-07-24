/* ======================================================
   twiworker — タイムライン（無限スクロール対応）
   ====================================================== */

registerPage('timeline', function initTimelinePage() {
  const container = document.getElementById('page-timeline');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>📰 タイムライン</h1>
      <p>ホームタイムライン（無限スクロール）</p>
    </div>
    <div style="display: flex; gap: 12px; margin-bottom: 20px;">
      <button class="btn btn-primary" id="timeline-refresh-btn">🔄 先頭に戻る</button>
    </div>
    <div id="timeline-tweets" class="tweet-list">
      <div class="loading"><div class="spinner"></div>読み込み中...</div>
    </div>
  `;

  const tweetList = document.getElementById('timeline-tweets');

  // 初期読み込み
  async function fetchPage(cursor) {
    const q = cursor ? `?count=20&cursor=${encodeURIComponent(cursor)}` : '?count=20';
    return await api('GET', `/api/timeline${q}`);
  }

  // 最初の読み込み
  (async () => {
    try {
      const initial = await fetchPage(undefined);
      tweetList.innerHTML = '';
      if (initial.tweets.length === 0) {
        tweetList.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px">ツイートがありません</p>';
        return;
      }
      initial.tweets.forEach(t => tweetList.appendChild(renderTweet(t)));

      // 無限スクロール設定
      let cleanup = setupInfiniteScroll(tweetList, async (cur) => {
        return await fetchPage(cur);
      });

      // 更新ボタンでリセット
      document.getElementById('timeline-refresh-btn').addEventListener('click', () => {
        if (cleanup) cleanup();
        tweetList.innerHTML = '<div class="loading"><div class="spinner"></div>読み込み中...</div>';
        // 再初期化
        fetchPage(undefined).then(data => {
          tweetList.innerHTML = '';
          data.tweets.forEach(t => tweetList.appendChild(renderTweet(t)));
          cleanup = setupInfiniteScroll(tweetList, async (cur) => {
            return await fetchPage(cur);
          });
        }).catch(err => {
          tweetList.innerHTML = `<div class="error-state"><span class="icon">⚠️</span><h3>読み込み失敗</h3><p>${esc(err.message)}</p></div>`;
        });
      });
    } catch (err) {
      tweetList.innerHTML = `<div class="error-state"><span class="icon">⚠️</span><h3>読み込みに失敗しました</h3><p>${esc(err.message)}</p></div>`;
    }
  })();
});
