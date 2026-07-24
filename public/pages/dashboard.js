/* ======================================================
   twiworker — ダッシュボード
   ====================================================== */

registerPage('dashboard', async function initDashboard() {
  const container = document.getElementById('stats-container');
  const tweetsList = document.getElementById('recent-tweets-list');

  // スケルトン表示
  container.innerHTML = `<div class="stats-grid">${'<div class="skeleton-card"><div class="skeleton skeleton-line" style="width:40%"></div><div class="skeleton skeleton-line" style="width:60%;height:28px"></div></div>'.repeat(6)}</div>`;
  tweetsList.innerHTML = skeletonCard(3);

  try {
    const status = await api('GET', '/api/status');
    const acct = status.twitter?.account || {};
    const cfg = status.config || {};

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="label">Twitter</div>
          <div class="value ${status.twitter?.initialized ? 'success' : ''}">
            ${status.twitter?.initialized ? '✅ 接続済み' : '❌ 未接続'}
          </div>
        </div>
        <div class="stat-card">
          <div class="label">フォロワー</div>
          <div class="value accent">${fmtNum(acct.followers_count)}</div>
        </div>
        <div class="stat-card">
          <div class="label">フォロー中</div>
          <div class="value accent">${fmtNum(acct.following_count)}</div>
        </div>
        <div class="stat-card">
          <div class="label">ツイート</div>
          <div class="value accent">${fmtNum(acct.tweet_count)}</div>
        </div>
        <div class="stat-card">
          <div class="label">KV</div>
          <div class="value ${status.storage?.kv_available ? 'success' : ''}">
            ${status.storage?.kv_available ? '✅ 稼働中' : '❌ 停止'}
          </div>
        </div>
        <div class="stat-card">
          <div class="label">D1</div>
          <div class="value ${status.storage?.d1_available ? 'success' : ''}">
            ${status.storage?.d1_available ? '✅ 稼働中' : '❌ 停止'}
          </div>
        </div>
      </div>
      ${acct.screen_name ? `
        <div class="card account-card" style="margin-bottom:20px">
          <div class="avatar">${esc(acct.name?.[0] || acct.screen_name[0])}</div>
          <div class="info">
            <div class="name">${esc(acct.name)}</div>
            <div class="screen-name">@${esc(acct.screen_name)}</div>
            ${acct.description ? `<div class="description">${esc(acct.description)}</div>` : ''}
          </div>
        </div>` : ''}
    `;

    tweetsList.innerHTML = '<p style="color:var(--text-muted);padding:24px;text-align:center">最近のツイートはまだありません</p>';
  } catch (err) {
    container.innerHTML = `<div class="error-state"><span class="icon">⚠️</span><h3>読み込み失敗</h3><p>${esc(err.message)}</p><button class="btn btn-primary" onclick="navigateTo('dashboard')">再試行</button></div>`;
    tweetsList.innerHTML = '';
  }
});
