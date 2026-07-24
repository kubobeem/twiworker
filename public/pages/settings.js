/* ======================================================
   twiworker — 設定
   ====================================================== */

registerPage('settings', function initSettingsPage() {
  const container = document.getElementById('page-settings');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>⚙️ 設定</h1>
      <p>twiworker の設定を確認・管理します</p>
    </div>

    <div class="card" style="margin-bottom: 16px;">
      <div class="card-header">
        <h3>🔌 接続状態</h3>
      </div>
      <div id="settings-status">
        <div class="loading"><div class="spinner"></div>読み込み中...</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 16px;">
      <div class="card-header">
        <h3>🤖 Cron ジョブ</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button class="btn btn-secondary" id="cron-trends-btn">📈 トレンドを今すぐ保存</button>
        <button class="btn btn-secondary" id="cron-schedule-btn">📅 予約ツイートを今すぐ実行</button>
        <button class="btn btn-secondary" id="cron-cleanup-btn">🧹 古いログをクリーンアップ</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>📋 API エンドポイント一覧</h3>
      </div>
      <div style="font-size: 14px; color: var(--text-secondary); line-height: 2;">
        <code style="color: var(--accent);">GET  /api/health</code> — ヘルスチェック<br>
        <code style="color: var(--accent);">GET  /api/status</code> — ステータス<br>
        <code style="color: var(--accent);">POST /api/tweet</code> — ツイート投稿<br>
        <code style="color: var(--accent);">POST /api/thread</code> — スレッド投稿<br>
        <code style="color: var(--accent);">GET  /api/search</code> — 検索<br>
        <code style="color: var(--accent);">GET  /api/timeline</code> — タイムライン<br>
        <code style="color: var(--accent);">GET  /api/user/:id</code> — ユーザー情報<br>
        <code style="color: var(--accent);">GET  /api/dm</code> — DM一覧<br>
        <code style="color: var(--accent);">POST /api/dm</code> — DM送信<br>
        <code style="color: var(--accent);">POST /api/follow/:id</code> — フォロー<br>
        <code style="color: var(--accent);">POST /api/unfollow/:id</code> — アンフォロー<br>
        <code style="color: var(--accent);">GET  /api/trends</code> — トレンド<br>
      </div>
    </div>
  `;

  // ステータス読み込み
  async function loadStatus() {
    const container = document.getElementById('settings-status');
    try {
      const data = await api('GET', '/api/status');
      container.innerHTML = `
        <div style="display: grid; grid-template-columns: 140px 1fr; gap: 8px; font-size: 14px;">
          <span style="color: var(--text-muted);">Twitter</span>
          <span style="color: ${data.twitter?.initialized ? 'var(--success)' : 'var(--error)'}">
            ${data.twitter?.initialized ? '✅ 接続済み' : '❌ 未接続'}
          </span>
          <span style="color: var(--text-muted);">アカウント</span>
          <span>@${esc(data.config?.account_username || '未設定')}</span>
          <span style="color: var(--text-muted);">KV</span>
          <span style="color: ${data.storage?.kv_available ? 'var(--success)' : 'var(--text-muted)'}">
            ${data.storage?.kv_available ? '✅ 利用可能' : '❌ 未設定'}
          </span>
          <span style="color: var(--text-muted);">D1</span>
          <span style="color: ${data.storage?.d1_available ? 'var(--success)' : 'var(--text-muted)'}">
            ${data.storage?.d1_available ? '✅ 利用可能' : '❌ 未設定'}
          </span>
          <span style="color: var(--text-muted);">バージョン</span>
          <span>v${esc(data.version)}</span>
        </div>`;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--error);">⚠️ ${esc(err.message)}</p>`;
    }
  }

  // Cron ジョブボタン
  document.getElementById('cron-trends-btn').addEventListener('click', async () => {
    try {
      await api('POST', '/api/cron/trends');
      showToast('トレンドを保存しました', '', 'success');
    } catch (err) {
      showToast('エラー', err.message, 'error');
    }
  });
  document.getElementById('cron-schedule-btn').addEventListener('click', async () => {
    try {
      const res = await api('POST', '/api/cron/scheduled-tweets');
      showToast('予約ツイートを実行しました', `${res.processed}件処理`, 'success');
    } catch (err) {
      showToast('エラー', err.message, 'error');
    }
  });
  document.getElementById('cron-cleanup-btn').addEventListener('click', async () => {
    try {
      await api('POST', '/api/cron/cleanup');
      showToast('ログをクリーンアップしました', '', 'success');
    } catch (err) {
      showToast('エラー', err.message, 'error');
    }
  });

  loadStatus();
});
