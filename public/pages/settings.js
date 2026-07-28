/* ======================================================
   twiworker v0.2.0 — 設定
   ====================================================== */

registerPage('settings', function initSettings() {
  const container = document.getElementById('page-settings');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>⚙️ 設定</h1>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">🔌 接続状態</div>
      <div id="settings-status"><div class="loading"><div class="spinner"></div></div></div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">🤖 Cron ジョブ</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-secondary" id="cron-trends-btn" style="border-radius:var(--radius-full);justify-content:center">📈 トレンドを保存</button>
        <button class="btn btn-secondary" id="cron-schedule-btn" style="border-radius:var(--radius-full);justify-content:center">📅 予約ツイートを実行</button>
        <button class="btn btn-secondary" id="cron-cleanup-btn" style="border-radius:var(--radius-full);justify-content:center">🧹 古いログを削除</button>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">⚠️ 免責事項</div>
      <div style="font-size:13px;color:var(--text-muted);line-height:1.6">
        <p style="margin-bottom:4px;font-weight:700;color:var(--x-danger)">教育・研究目的で提供されています。</p>
        <ul style="padding-left:16px;margin-bottom:8px">
          <li>X Corp.（旧Twitter）とは一切関係ありません</li>
          <li>内部APIを利用した非公式クライアントです</li>
          <li>使用は自己責任です。アカウント停止のリスクがあります</li>
          <li>認証クッキーは機密情報です。公開しないでください</li>
          <li>「現状のまま」提供、一切の保証なし</li>
        </ul>
        <button class="btn btn-danger btn-sm" id="disclaimer-revoke-btn" style="width:100%;border-radius:var(--radius-full)">🔄 同意を取り消す</button>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">📋 API エンドポイント</div>
      <div style="font-size:13px;color:var(--text-muted);line-height:2">
        <code style="color:var(--x-blue)">GET  /api/health</code> ヘルスチェック<br>
        <code style="color:var(--x-blue)">GET  /api/status</code> ステータス<br>
        <code style="color:var(--x-blue)">POST /api/tweet</code> ツイート投稿<br>
        <code style="color:var(--x-blue)">POST /api/thread</code> スレッド投稿<br>
        <code style="color:var(--x-blue)">GET  /api/timeline</code> タイムライン<br>
        <code style="color:var(--x-blue)">GET  /api/search</code> 検索<br>
        <code style="color:var(--x-blue)">GET  /api/bookmarks</code> ブックマーク<br>
        <code style="color:var(--x-blue)">GET  /api/lists</code> リスト<br>
        <code style="color:var(--x-blue)">GET  /api/notifications</code> 通知<br>
        <code style="color:var(--x-blue)">GET  /api/user/:id</code> ユーザー情報<br>
        <code style="color:var(--x-blue)">GET  /api/dm</code> DM一覧<br>
        <code style="color:var(--x-blue)">POST /api/dm</code> DM送信<br>
        <code style="color:var(--x-blue)">POST /api/follow/:id</code> フォロー<br>
        <code style="color:var(--x-blue)">POST /api/unfollow/:id</code> アンフォロー<br>
        <code style="color:var(--x-blue)">GET  /api/trends</code> トレンド<br>
        <code style="color:var(--x-blue)">GET  /api/spaces/:id</code> スペース<br>
        <code style="color:var(--x-blue)">POST /api/tweet/:id/vote</code> 投票<br>
      </div>
    </div>`;

  // ステータス読み込み
  async function loadStatus() {
    const el = document.getElementById('settings-status');
    try {
      const data = await api('GET', '/api/status');
      el.innerHTML = `
        <div style="display:grid;grid-template-columns:120px 1fr;gap:8px;font-size:14px">
          <span style="color:var(--text-muted)">Twitter</span>
          <span style="color:${data.twitter?.initialized ? 'var(--x-success)' : 'var(--x-danger)'}">${data.twitter?.initialized ? '✅ 接続済み' : '❌ 未接続'}</span>
          <span style="color:var(--text-muted)">アカウント</span>
          <span>@${esc(data.config?.account_username || '未設定')}</span>
          <span style="color:var(--text-muted)">KV</span>
          <span>${data.storage?.kv_available ? '✅ 利用可能' : '❌ 未設定'}</span>
          <span style="color:var(--text-muted)">D1</span>
          <span>${data.storage?.d1_available ? '✅ 利用可能' : '❌ 未設定'}</span>
          <span style="color:var(--text-muted)">バージョン</span>
          <span>v${esc(data.version)}</span>
        </div>`;
    } catch (err) {
      el.innerHTML = `<p style="color:var(--x-danger)">⚠️ ${esc(err.message)}</p>`;
    }
  }

  // Cron ジョブ
  document.getElementById('cron-trends-btn').addEventListener('click', async () => {
    try { await api('POST', '/api/cron/trends'); showToast('トレンド保存完了', '', 'success'); }
    catch (err) { showToast('エラー', err.message, 'error'); }
  });
  document.getElementById('cron-schedule-btn').addEventListener('click', async () => {
    try { const r = await api('POST', '/api/cron/scheduled-tweets'); showToast('予約実行', `${r.processed}件処理`, 'success'); }
    catch (err) { showToast('エラー', err.message, 'error'); }
  });
  document.getElementById('cron-cleanup-btn').addEventListener('click', async () => {
    try { await api('POST', '/api/cron/cleanup'); showToast('クリーンアップ完了', '', 'success'); }
    catch (err) { showToast('エラー', err.message, 'error'); }
  });

  // 同意取り消し
  document.getElementById('disclaimer-revoke-btn')?.addEventListener('click', () => {
    localStorage.removeItem('twiworker_disclaimer_accepted');
    showToast('同意を取り消しました', '次回更新時に再表示されます', 'success');
  });

  loadStatus();
});
