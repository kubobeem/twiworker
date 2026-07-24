/* ======================================================
   twiworker — DM
   ====================================================== */

registerPage('dm', function initDMPage() {
  const container = document.getElementById('page-dm');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>✉️ DM</h1>
      <p>ダイレクトメッセージの表示と送信</p>
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <div class="card-header">
        <h3>📨 DMを送信</h3>
      </div>
      <div class="form-group">
        <label>送信先ユーザーID</label>
        <input type="text" id="dm-user-id" class="form-input" placeholder="例: 123456789">
      </div>
      <div class="form-group">
        <label>メッセージ</label>
        <textarea id="dm-text" class="form-textarea" placeholder="メッセージを入力" style="min-height: 80px;"></textarea>
      </div>
      <button class="btn btn-primary" id="dm-send-btn">送信</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>📥 DM一覧</h3>
        <button class="btn btn-secondary btn-sm" id="dm-refresh-btn">🔄 更新</button>
      </div>
      <div id="dm-list" class="tweet-list">
        <div class="loading"><div class="spinner"></div>読み込み中...</div>
      </div>
    </div>
  `;

  async function loadDMs() {
    const list = document.getElementById('dm-list');
    list.innerHTML = '<div class="loading"><div class="spinner"></div>読み込み中...</div>';

    try {
      const data = await api('GET', '/api/dm?limit=20');
      list.innerHTML = '';

      if (data.dms.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">DMはありません</p>';
        return;
      }

      data.dms.forEach(dm => {
        const card = document.createElement('div');
        card.className = 'tweet-card';
        card.innerHTML = `
          <div class="tweet-header">
            <div class="tweet-avatar">${esc((dm.sender_name || '?')[0])}</div>
            <div>
              <div class="tweet-user">${esc(dm.sender_name)}</div>
              <div class="tweet-screen-name">ID: ${esc(dm.sender_id)}</div>
            </div>
          </div>
          <div class="tweet-text">${esc(dm.text)}</div>
          <div class="tweet-meta">
            <span>🕐 ${fmtRel(dm.created_at)}</span>
          </div>`;
        list.appendChild(card);
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

  document.getElementById('dm-refresh-btn').addEventListener('click', loadDMs);
  document.getElementById('dm-send-btn').addEventListener('click', async () => {
    const userId = document.getElementById('dm-user-id').value.trim();
    const text = document.getElementById('dm-text').value.trim();

    if (!userId || !text) {
      showToast('エラー', 'ユーザーIDとメッセージを入力してください', 'error');
      return;
    }

    try {
      await api('POST', '/api/dm', { user_id: userId, text });
      showToast('DMを送信しました', '', 'success');
      document.getElementById('dm-text').value = '';
      loadDMs();
    } catch (err) {
      showToast('送信に失敗しました', err.message, 'error');
    }
  });

  loadDMs();
});
