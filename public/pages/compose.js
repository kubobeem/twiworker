/* ======================================================
   twiworker — ツイート投稿
   ====================================================== */

let composeThreadMode = false;
let composeMediaUrls = [];

registerPage('compose', function initComposePage() {
  const container = document.getElementById('page-compose');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header"><h1>✍️ ツイート投稿</h1><p>新しいツイートを投稿します</p></div>
    <div class="card">
      <div class="form-group">
        <label>ツイート内容</label>
        <textarea id="compose-text" class="form-textarea" placeholder="いまどうしてる？" maxlength="280" style="min-height:100px"></textarea>
        <div class="char-count" id="compose-char-count">0 / 280</div>
      </div>
      <div class="form-group">
        <label>画像URL（省略可）</label>
        <div class="media-upload" id="media-upload-btn"><span class="icon">🖼️</span>画像URLを追加する</div>
        <div class="media-preview" id="media-preview"></div>
      </div>
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:12px">
          <span>スレッドモード</span>
          <label class="toggle-switch"><input type="checkbox" id="compose-thread-toggle"><span class="toggle-slider"></span></label>
        </label>
      </div>
      <div id="thread-tweets" style="display:none">
        <div class="card" style="padding:12px;margin-bottom:8px">
          <textarea class="form-textarea thread-input" placeholder="スレッド1つ目" maxlength="280" style="min-height:60px"></textarea>
        </div>
        <button class="btn btn-secondary btn-sm" id="add-thread-btn">＋ ツイートを追加</button>
      </div>
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn btn-primary btn-lg" id="compose-submit-btn" style="flex:1">ツイートする</button>
        <button class="btn btn-ghost" id="compose-clear-btn">クリア</button>
      </div>
    </div>`;

  setupComposeEvents();
});

function setupComposeEvents() {
  const textarea = document.getElementById('compose-text');
  const charCount = document.getElementById('compose-char-count');
  const submitBtn = document.getElementById('compose-submit-btn');
  const clearBtn = document.getElementById('compose-clear-btn');
  const threadToggle = document.getElementById('compose-thread-toggle');
  const threadSection = document.getElementById('thread-tweets');
  const addThreadBtn = document.getElementById('add-thread-btn');
  const mediaUploadBtn = document.getElementById('media-upload-btn');

  if (!textarea) return;

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = `${len} / 280`;
    charCount.className = `char-count${len > 260 ? ' warning' : ''}${len >= 280 ? ' error' : ''}`;
  });

  threadToggle?.addEventListener('change', () => {
    composeThreadMode = threadToggle.checked;
    threadSection.style.display = composeThreadMode ? 'block' : 'none';
    if (threadSection) {
      const first = threadSection.querySelector('.thread-input');
      if (first) {
        textarea.placeholder = composeThreadMode ? 'スレッドの最初のツイート' : 'いまどうしてる？';
      }
    }
  });

  addThreadBtn?.addEventListener('click', () => {
    const card = threadSection?.querySelector('.card');
    if (!card) return;
    const div = document.createElement('div');
    div.className = 'form-group';
    div.style.marginBottom = '8px';
    div.innerHTML = '<textarea class="form-textarea thread-input" placeholder="続きのツイート" maxlength="280" style="min-height:60px"></textarea>';
    card.appendChild(div);
  });

  mediaUploadBtn?.addEventListener('click', () => {
    const url = prompt('画像URLを入力（複数はカンマ区切り）:');
    if (!url) return;
    const preview = document.getElementById('media-preview');
    url.split(',').map(u => u.trim()).filter(Boolean).forEach(u => {
      composeMediaUrls.push(u);
      const img = document.createElement('img');
      img.src = u;
      img.onerror = () => { img.style.display = 'none'; };
      preview?.appendChild(img);
    });
  });

  submitBtn?.addEventListener('click', async () => {
    submitBtn.disabled = true;
    submitBtn.textContent = '投稿中...';
    try {
      if (composeThreadMode) {
        const inputs = document.querySelectorAll('.thread-input');
        const tweets = [{ text: textarea.value }];
        inputs.forEach(i => { if (i.value.trim()) tweets.push({ text: i.value }); });
        const r = await api('POST', '/api/thread', { tweets });
        showToast('スレッド投稿完了', `${r.tweets.length}件`, 'success');
      } else {
        const text = textarea.value.trim();
        if (!text) { showToast('エラー', '内容を入力してください', 'error'); return; }
        const r = await api('POST', '/api/tweet', { text, media_urls: composeMediaUrls.length ? composeMediaUrls : undefined });
        showToast('ツイート投稿完了', `ID: ${r.tweetId}`, 'success');
      }
      resetCompose();
    } catch (err) {
      showToast('投稿失敗', err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'ツイートする';
    }
  });

  clearBtn?.addEventListener('click', resetCompose);
}

function resetCompose() {
  const t = document.getElementById('compose-text');
  if (t) t.value = '';
  const cc = document.getElementById('compose-char-count');
  if (cc) cc.textContent = '0 / 280';
  const tt = document.getElementById('compose-thread-toggle');
  if (tt) tt.checked = false;
  const ts = document.getElementById('thread-tweets');
  if (ts) ts.style.display = 'none';
  const mp = document.getElementById('media-preview');
  if (mp) mp.innerHTML = '';
  composeMediaUrls = [];
  composeThreadMode = false;
}
