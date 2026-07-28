/* ======================================================
   twiworker v0.2.0 — ツイート投稿（X風）
   ====================================================== */

let composeMediaUrls = [];
let composePollOptions = [];

registerPage('compose', function initCompose() {
  const container = document.getElementById('page-compose');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>✍️ ポストする</h1>
    </div>
    <div style="padding:16px">
      <div style="display:flex;gap:12px">
        <div class="tweet-avatar" style="width:48px;height:48px;font-size:20px">U</div>
        <div style="flex:1">
          <textarea id="compose-text" class="form-textarea" placeholder="いまどうしてる？" maxlength="280" style="min-height:120px;border:none;font-size:18px;background:transparent;resize:none;padding:8px 0"></textarea>
          <div class="char-count" id="compose-char-count" style="text-align:right;font-size:14px;padding:0 4px">0</div>

          <div class="media-preview" id="media-preview"></div>

          <div id="poll-section" style="display:none;margin:12px 0;padding:12px;border:1px solid var(--border);border-radius:var(--radius)">
            <div class="poll-option" style="margin:4px 0"><input class="form-input poll-option-input" placeholder="選択肢 1" maxlength="25" style="padding:8px 12px"></div>
            <div class="poll-option" style="margin:4px 0"><input class="form-input poll-option-input" placeholder="選択肢 2" maxlength="25" style="padding:8px 12px"></div>
            <button class="btn btn-sm btn-ghost" id="add-poll-option">＋ 選択肢を追加</button>
            <div style="margin-top:8px;display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted)">
              <span>投票期間:</span>
              <select id="poll-duration" class="form-select" style="width:auto;padding:4px 8px;font-size:13px">
                <option value="5">5分</option>
                <option value="30">30分</option>
                <option value="60" selected>1時間</option>
                <option value="1440">24時間</option>
                <option value="10080">7日間</option>
              </select>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:4px;padding:8px 0;border-top:1px solid var(--border);margin-top:8px">
            <span class="tweet-action" id="add-media-btn" title="メディア追加"><span class="action-icon">🖼️</span></span>
            <span class="tweet-action" id="add-poll-btn" title="投票追加"><span class="action-icon">📊</span></span>
            <div style="flex:1"></div>
            <div id="compose-len-warn" style="font-size:13px;color:var(--text-muted);margin-right:8px"></div>
            <button class="btn btn-primary" id="compose-submit-btn" style="border-radius:var(--radius-full);padding:8px 20px" disabled>ポスト</button>
          </div>
        </div>
      </div>
    </div>`;

  setupComposeEvents();
});

function setupComposeEvents() {
  const textarea = document.getElementById('compose-text');
  const charCount = document.getElementById('compose-char-count');
  const submitBtn = document.getElementById('compose-submit-btn');
  const addMediaBtn = document.getElementById('add-media-btn');
  const addPollBtn = document.getElementById('add-poll-btn');
  const pollSection = document.getElementById('poll-section');

  if (!textarea) return;

  // 文字数カウント
  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    const remaining = 280 - len;
    charCount.textContent = remaining;
    charCount.style.color = remaining < 0 ? 'var(--x-danger)' : remaining < 20 ? 'var(--x-warning)' : 'var(--text-muted)';
    submitBtn.disabled = !textarea.value.trim() || remaining < 0;
  });
  textarea.dispatchEvent(new Event('input'));

  // メディア追加
  addMediaBtn?.addEventListener('click', () => {
    const url = prompt('画像URLを入力:');
    if (!url) return;
    composeMediaUrls.push(url.trim());
    const preview = document.getElementById('media-preview');
    const img = document.createElement('img');
    img.src = url.trim();
    img.onerror = () => img.remove();
    preview?.appendChild(img);
  });

  // 投票追加
  let pollActive = false;
  addPollBtn?.addEventListener('click', () => {
    pollActive = !pollActive;
    pollSection.style.display = pollActive ? 'block' : 'none';
    addPollBtn.style.color = pollActive ? 'var(--x-blue)' : '';
  });

  document.getElementById('add-poll-option')?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.poll-option-input');
    if (inputs.length >= 4) return;
    const div = document.createElement('div');
    div.className = 'poll-option';
    div.style.margin = '4px 0';
    div.innerHTML = `<input class="form-input poll-option-input" placeholder="選択肢 ${inputs.length + 1}" maxlength="25" style="padding:8px 12px">`;
    pollSection?.insertBefore(div, document.getElementById('add-poll-option'));
  });

  // 投稿
  submitBtn?.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text) return;
    submitBtn.disabled = true;
    submitBtn.textContent = '投稿中...';

    try {
      // 投票があるかチェック
      let pollOptions = null;
      if (pollActive) {
        const inputs = document.querySelectorAll('.poll-option-input');
        const options = Array.from(inputs).map(i => i.value.trim()).filter(Boolean);
        if (options.length >= 2) {
          const duration = parseInt(document.getElementById('poll-duration')?.value || '60');
          pollOptions = { options, duration_minutes: duration };
        }
      }

      const body = { text, media_urls: composeMediaUrls.length ? composeMediaUrls : undefined };
      if (pollOptions) body.poll = pollOptions;

      const result = await api('POST', '/api/tweet', body);
      showToast('ポストしました', result.tweetId ? `ID: ${result.tweetId.substring(0, 12)}...` : '', 'success');
      resetCompose();
    } catch (err) {
      showToast('投稿失敗', err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'ポスト';
    }
  });

  // Ctrl+Enterでも投稿
  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submitBtn?.click();
  });
}

function resetCompose() {
  const t = document.getElementById('compose-text');
  if (t) t.value = '';
  const cc = document.getElementById('compose-char-count');
  if (cc) { cc.textContent = '280'; cc.style.color = 'var(--text-muted)'; }
  const mp = document.getElementById('media-preview');
  if (mp) mp.innerHTML = '';
  composeMediaUrls = [];
  const ps = document.getElementById('poll-section');
  if (ps) ps.style.display = 'none';
}
