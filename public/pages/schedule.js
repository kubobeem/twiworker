/* ======================================================
   twiworker — スケジュール管理
   ====================================================== */

registerPage('schedule', function initSchedulePage() {
  const container = document.getElementById('page-schedule');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>📅 スケジュール管理</h1>
      <p>予約ツイートの作成と管理</p>
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <div class="card-header">
        <h3>📝 予約ツイートを作成</h3>
      </div>
      <div class="form-group">
        <label>ツイート内容</label>
        <textarea id="schedule-text" class="form-textarea" placeholder="ツイート内容" maxlength="280"></textarea>
        <div class="char-count" id="schedule-char-count">0 / 280</div>
      </div>
      <div class="form-group">
        <label>予約日時</label>
        <input type="datetime-local" id="schedule-datetime" class="form-input">
      </div>
      <button class="btn btn-primary" id="schedule-create-btn">📅 予約する</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>📋 予約一覧</h3>
        <button class="btn btn-secondary btn-sm" id="schedule-refresh-btn">🔄 更新</button>
      </div>
      <div id="schedule-list">
        <p style="color: var(--text-muted); text-align: center; padding: 40px;">予約ツイートはまだありません</p>
      </div>
    </div>
  `;

  document.getElementById('schedule-text').addEventListener('input', () => {
    const len = document.getElementById('schedule-text').value.length;
    const count = document.getElementById('schedule-char-count');
    count.textContent = `${len} / 280`;
    count.className = `char-count${len > 260 ? ' warning' : ''}${len >= 280 ? ' error' : ''}`;
  });

  document.getElementById('schedule-create-btn').addEventListener('click', async () => {
    const text = document.getElementById('schedule-text').value.trim();
    const datetime = document.getElementById('schedule-datetime').value;

    if (!text) {
      showToast('エラー', 'ツイート内容を入力してください', 'error');
      return;
    }
    if (!datetime) {
      showToast('エラー', '予約日時を設定してください', 'error');
      return;
    }

    try {
      await api('POST', '/api/tweet', { text, schedule_at: new Date(datetime).toISOString() });
      showToast('予約しました', datetime, 'success');
      document.getElementById('schedule-text').value = '';
      document.getElementById('schedule-char-count').textContent = '0 / 280';
    } catch (err) {
      showToast('予約に失敗しました', err.message, 'error');
    }
  });
});
