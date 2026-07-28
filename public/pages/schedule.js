/* ======================================================
   twiworker v0.2.0 — スケジュール管理
   ====================================================== */

registerPage('schedule', function initSchedule() {
  const container = document.getElementById('page-schedule');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>📅 スケジュール</h1>
    </div>
    <div style="padding:16px;border-bottom:1px solid var(--border)">
      <textarea id="schedule-text" class="form-textarea" placeholder="予約するツイート内容" maxlength="280" style="min-height:80px"></textarea>
      <div class="char-count" id="schedule-char-count">0 / 280</div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <input type="datetime-local" id="schedule-datetime" class="form-input" style="flex:1">
        <button class="btn btn-primary" id="schedule-create-btn">📅 予約</button>
      </div>
    </div>
    <div id="schedule-list" class="tweet-list">
      <p style="text-align:center;padding:40px;color:var(--text-muted)">予約ツイートはまだありません</p>
    </div>`;

  // 文字数カウント
  document.getElementById('schedule-text').addEventListener('input', () => {
    const len = document.getElementById('schedule-text').value.length;
    const cc = document.getElementById('schedule-char-count');
    cc.textContent = `${len} / 280`;
    cc.className = `char-count${len > 260 ? ' warning' : ''}${len >= 280 ? ' error' : ''}`;
  });

  // 予約作成
  document.getElementById('schedule-create-btn').addEventListener('click', async () => {
    const text = document.getElementById('schedule-text').value.trim();
    const datetime = document.getElementById('schedule-datetime').value;
    if (!text) return showToast('エラー', 'ツイート内容を入力してください', 'error');
    if (!datetime) return showToast('エラー', '日時を設定してください', 'error');

    try {
      await api('POST', '/api/tweet', { text, schedule_at: new Date(datetime).toISOString() });
      showToast('予約しました', new Date(datetime).toLocaleString('ja-JP'), 'success');
      document.getElementById('schedule-text').value = '';
      document.getElementById('schedule-char-count').textContent = '0 / 280';
    } catch (err) {
      showToast('予約失敗', err.message, 'error');
    }
  });
});
