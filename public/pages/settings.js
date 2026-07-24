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

    <div class="card" style="margin-bottom: 16px; border-color: rgba(239, 68, 68, 0.15);">
      <div class="card-header">
        <h3>⚠️ 免責事項</h3>
      </div>
      <div style="font-size: 12px; color: var(--text-muted); line-height: 1.8;">
        <p style="margin-bottom: 8px; font-weight: 600; color: var(--warning);">このソフトウェアは教育・研究目的で提供されています。</p>
        <ul style="padding-left: 16px; margin-bottom: 8px;">
          <li style="margin-bottom: 4px;"><strong>X Corp.とは無関係</strong> — 本ソフトウェアは X Corp.（旧Twitter）の公式製品ではなく、公認・承認・支援されたものではありません。</li>
          <li style="margin-bottom: 4px;"><strong>非公式クライアント</strong> — Twitter/X の内部APIを利用した非公式クライアントです。</li>
          <li style="margin-bottom: 4px;"><strong>自己責任</strong> — 使用により生じたアカウント停止・損害について開発者は一切責任を負いません。</li>
          <li style="margin-bottom: 4px;"><strong>利用規約遵守</strong> — X Corp. の<a href="https://x.com/tos" target="_blank" rel="noopener" style="color: var(--accent);">利用規約</a>を遵守する責任があります。</li>
          <li style="margin-bottom: 4px;"><strong>クッキー取扱い</strong> — 認証クッキーは機密情報です。公開しないでください。</li>
          <li style="margin-bottom: 4px;"><strong>アカウント停止リスク</strong> — 内部API使用はポリシー違反の可能性があり、停止リスクがあります。</li>
          <li style="margin-bottom: 4px;"><strong>無保証</strong> — 「現状のまま（AS-IS）」提供、一切の保証なし。</li>
        </ul>
        <p style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); text-align: center; font-size: 11px; opacity: 0.7;">For Educational and Research Purposes Only | Not affiliated with X Corp.</p>
        <button class="btn btn-danger btn-sm" id="disclaimer-revoke-btn" style="margin-top: 10px; width: 100%;">🔄 同意を取り消す（最初のポップアップを再表示）</button>
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

  // 同意取消ボタン
  document.getElementById('disclaimer-revoke-btn')?.addEventListener('click', () => {
    localStorage.removeItem('twiworker_disclaimer_accepted');
    showToast('同意を取り消しました', '次回ページ更新時にポップアップが再表示されます', 'success');
  });

  loadStatus();
});
