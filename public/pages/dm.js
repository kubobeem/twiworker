/* ======================================================
   twiworker v0.2.0 — DM（2ペインレイアウト）
   ====================================================== */

registerPage('dm', function initDM() {
  const container = document.getElementById('page-dm');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>✉️ メッセージ</h1>
    </div>
    <div class="dm-layout">
      <div class="dm-conversations" id="dm-conv-list">
        <div class="loading" style="padding:24px"><div class="spinner"></div></div>
      </div>
      <div class="dm-main" id="dm-main">
        <div class="dm-header" id="dm-header">メッセージを選択</div>
        <div class="dm-messages" id="dm-messages">
          <p style="text-align:center;color:var(--text-muted);padding:40px">左の会話を選択してください</p>
        </div>
        <div class="dm-input-area" style="display:none" id="dm-input-area">
          <input type="text" id="dm-input" placeholder="DMを入力..." maxlength="1000">
          <button class="btn btn-sm btn-primary" id="dm-send-btn">送信</button>
        </div>
      </div>
    </div>`;

  let currentConvId = null;

  async function loadConversations() {
    const list = document.getElementById('dm-conv-list');
    try {
      const data = await api('GET', '/api/dm/conversations');
      list.innerHTML = '';
      if (!data.conversations?.length) {
        list.innerHTML = '<p style="padding:16px;text-align:center;color:var(--text-muted);font-size:14px">会話がありません</p>';
        return;
      }
      data.conversations.forEach(conv => {
        const el = document.createElement('div');
        el.className = 'dm-conversation';
        const last = conv.last_message || {};
        el.innerHTML = `
          <div class="dm-conv-avatar">?</div>
          <div class="dm-conv-info">
            <div class="dm-conv-name">会話</div>
            <div class="dm-conv-preview">${esc(last.text || '').substring(0, 40)}</div>
          </div>
          <div class="dm-conv-time">${fmtShortTime(conv.updated_at)}</div>`;
        el.addEventListener('click', () => openConversation(conv.id));
        list.appendChild(el);
      });
    } catch (err) {
      list.innerHTML = `<p style="padding:16px;text-align:center;color:var(--error);font-size:14px">⚠️ ${esc(err.message)}</p>`;
    }
  }

  async function openConversation(convId) {
    currentConvId = convId;
    document.querySelectorAll('.dm-conversation').forEach(el => el.classList.remove('active'));
    const header = document.getElementById('dm-header');
    const msgs = document.getElementById('dm-messages');
    const inputArea = document.getElementById('dm-input-area');
    header.textContent = 'メッセージ';
    msgs.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    inputArea.style.display = 'flex';

    try {
      const data = await api('GET', `/api/dm/conversation/${convId}`);
      msgs.innerHTML = '';
      if (data.messages?.length) {
        data.messages.forEach(m => {
          const div = document.createElement('div');
          div.className = `dm-message ${m.direction === 'out' ? 'out' : 'in'}`;
          div.textContent = m.text;
          msgs.appendChild(div);
        });
        msgs.scrollTop = msgs.scrollHeight;
      } else {
        msgs.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px">メッセージがありません</p>';
      }
    } catch (err) {
      msgs.innerHTML = `<p style="text-align:center;color:var(--error);padding:20px">⚠️ ${esc(err.message)}</p>`;
    }
  }

  document.getElementById('dm-send-btn')?.addEventListener('click', async () => {
    const input = document.getElementById('dm-input');
    if (!input?.value.trim() || !currentConvId) return;
    const text = input.value.trim();
    input.value = '';
    try {
      await api('POST', '/api/dm', { user_id: currentConvId, text });
      const msgs = document.getElementById('dm-messages');
      const div = document.createElement('div');
      div.className = 'dm-message out';
      div.textContent = text;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    } catch (err) {
      showToast('エラー', err.message, 'error');
    }
  });

  document.getElementById('dm-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('dm-send-btn')?.click();
  });

  loadConversations();
});
