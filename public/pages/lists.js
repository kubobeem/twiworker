/* ======================================================
   twiworker v0.2.0 — リスト（状態管理対応）
   ====================================================== */

let listsViewState = 'overview'; // 'overview' | 'tweets'

registerPage('lists', function initLists() {
  const container = document.getElementById('page-lists');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>📋 リスト</h1>
      <div style="margin-top:8px"><button class="btn btn-sm btn-primary" id="create-list-btn">＋ 作成</button></div>
    </div>
    <div id="lists-container" class="tweet-list">
      <div class="loading"><div class="spinner"></div>読み込み中...</div>
    </div>`;

  listsViewState = 'overview';
  loadLists();
});

async function loadLists() {
  const container = document.getElementById('lists-container');
  if (!container) return;
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await api('GET', '/api/lists');
    container.innerHTML = '';
    if (!data.lists?.length) {
      container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted)">リストがありません</p>';
      return;
    }
    data.lists.forEach(list => {
      const card = document.createElement('div');
      card.className = 'tweet-card';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:28px">📋</span>
          <div style="flex:1">
            <div style="font-weight:700;font-size:15px">${esc(list.name)}</div>
            <div style="font-size:13px;color:var(--text-muted)">${esc(list.description || '')}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:2px">メンバー ${fmtNum(list.member_count)}人</div>
          </div>
          <span class="badge" style="font-size:12px;padding:2px 8px;border-radius:var(--radius-full);background:var(--bg-hover)">${list.mode === 'private' ? '🔒' : '🌍'}</span>
        </div>`;
      card.addEventListener('click', () => showListTweets(list.id, list.name));
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<div class="error-state"><span class="icon">⚠️</span><h3>読み込み失敗</h3><p>${esc(err.message)}</p></div>`;
  }
}

async function showListTweets(listId, listName) {
  listsViewState = 'tweets';
  const container = document.getElementById('lists-container');
  if (!container) return;
  container.innerHTML = `<div style="padding:12px 0;display:flex;align-items:center;gap:8px">
    <button class="btn btn-sm btn-ghost" id="lists-back-btn">← 戻る</button>
    <strong style="font-size:16px">${esc(listName)}</strong>
  </div><div class="loading"><div class="spinner"></div></div>`;

  document.getElementById('lists-back-btn')?.addEventListener('click', () => {
    listsViewState = 'overview';
    loadLists();
  });

  try {
    const data = await api('GET', `/api/lists/${listId}/tweets`);
    if (data.tweets?.length) {
      data.tweets.forEach(t => container.appendChild(renderTweet(t)));
    } else {
      const msg = document.createElement('p');
      msg.style.cssText = 'text-align:center;padding:24px;color:var(--text-muted)';
      msg.textContent = 'このリストにはツイートがありません';
      container.appendChild(msg);
    }
  } catch (err) {
    container.innerHTML += `<div class="error-state"><span class="icon">⚠️</span><h3>読み込み失敗</h3><p>${esc(err.message)}</p></div>`;
  }
}

// Create list button handler (set up after DOM)
document.addEventListener('click', async (e) => {
  if (e.target?.id === 'create-list-btn') {
    const name = prompt('リスト名を入力:');
    if (!name?.trim()) return;
    try {
      const list = await api('POST', '/api/lists', { name: name.trim() });
      showToast('リストを作成しました', name, 'success');
      if (listsViewState === 'overview') loadLists();
    } catch (err) {
      showToast('エラー', err.message, 'error');
    }
  }
});
