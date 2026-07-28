/* ======================================================
   twiworker v0.2.0 — プロフィール
   ====================================================== */

registerPage('profile', function initProfile() {
  const container = document.getElementById('page-profile');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <h1>👤 プロフィール</h1>
    </div>
    <div id="profile-content">
      <div class="loading"><div class="spinner"></div>読み込み中...</div>
    </div>`;

  (async () => {
    try {
      const status = await api('GET', '/api/status');
      const username = status.config?.account_username;
      if (!username) throw new Error('アカウント名が設定されていません');

      const userInfo = await api('GET', `/api/user/${encodeURIComponent(username)}`);
      const content = document.getElementById('profile-content');
      content.innerHTML = `
        <div class="profile-banner">
          ${userInfo.profile_banner_url ? `<img src="${esc(userInfo.profile_banner_url)}" style="width:100%;height:100%;object-fit:cover" alt="">` : ''}
        </div>
        <div class="profile-info">
          <div class="profile-avatar" style="background-image:${userInfo.profile_image_url ? `url(${esc(userInfo.profile_image_url)})` : 'linear-gradient(135deg,var(--x-blue),#8b5cf6)'};background-size:cover;background-position:center">
            ${userInfo.profile_image_url ? '' : esc((userInfo.name || '?')[0])}
          </div>
          <div style="display:flex;justify-content:flex-end;padding:4px 0">
            <button class="btn btn-outline btn-sm">プロフィール編集</button>
          </div>
          <div class="profile-name">${esc(userInfo.name)} ${userInfo.blue_verified ? '🔷' : ''}</div>
          <div class="profile-handle">@${esc(userInfo.screen_name)}</div>
          ${userInfo.description ? `<div class="profile-bio">${esc(userInfo.description)}</div>` : ''}
          ${userInfo.location ? `<div class="profile-meta"><span>📍 ${esc(userInfo.location)}</span></div>` : ''}
          <div class="profile-meta" style="margin-top:4px">
            <span>📅 ${fmtDate(userInfo.created_at)}</span>
          </div>
          <div class="profile-stats">
            <span class="profile-stat"><strong>${fmtNum(userInfo.tweet_count)}</strong> ツイート</span>
            <span class="profile-stat"><strong>${fmtNum(userInfo.following_count)}</strong> フォロー中</span>
            <span class="profile-stat"><strong>${fmtNum(userInfo.followers_count)}</strong> フォロワー</span>
            <span class="profile-stat"><strong>${fmtNum(userInfo.likes_count)}</strong> いいね</span>
          </div>
          <div class="profile-tabs">
            <div class="profile-tab active" data-tab="tweets" onclick="switchProfileTab(this)">ツイート</div>
            <div class="profile-tab" data-tab="likes" onclick="switchProfileTab(this)">いいね</div>
          </div>
          <div id="profile-tab-content"></div>
        </div>`;

      window.switchProfileTab = async function(el) {
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        const tabContent = document.getElementById('profile-tab-content');
        tabContent.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        try {
          const tab = el.dataset.tab;
          const data = tab === 'likes'
            ? await api('GET', `/api/user/${userInfo.id}/likes?count=20`)
            : await api('GET', `/api/user/${userInfo.id}/tweets?count=20`);
          const tweets = data.tweets || [];
          tabContent.innerHTML = '';
          if (!tweets.length) {
            tabContent.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted)">ツイートがありません</p>';
            return;
          }
          tweets.forEach(t => tabContent.appendChild(renderTweet(t)));
        } catch (err) {
          tabContent.innerHTML = `<p style="text-align:center;padding:24px;color:var(--error)">⚠️ ${esc(err.message)}</p>`;
        }
      };

      // Load initial tweets
      setTimeout(() => {
        const firstTab = document.querySelector('.profile-tab.active');
        if (firstTab) window.switchProfileTab(firstTab);
      }, 100);
    } catch (err) {
      const content = document.getElementById('profile-content');
      content.innerHTML = `<div class="error-state"><span class="icon">⚠️</span><h3>読み込み失敗</h3><p>${esc(err.message)}</p></div>`;
    }
  })();
});
