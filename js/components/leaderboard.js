/* ==========================================
   SAPTARA — Leaderboard Component
   "Peta Arus — Papan Kapten Tergiat"
   ========================================== */

const Leaderboard = {
  render(currentStudentId) {
    const ranked = AppState.getLeaderboard();

    // Top 3 podium
    const top3 = ranked.slice(0, 3);
    const rest = ranked.slice(3);
    const crowns = ['👑', '', ''];
    const medals = ['🥇', '🥈', '🥉'];

    let html = `
      <!-- Podium -->
      <div class="leaderboard-podium">
        ${top3.map((s, i) => {
          const rank = i + 1;
          return `
            <div class="podium-item rank-${rank} animate-fade-up" style="${Helpers.staggerDelay(i, 150)}">
              <div class="podium-avatar">
                <div class="avatar-xl">${s.avatar}</div>
                ${rank === 1 ? '<div class="podium-crown">👑</div>' : ''}
              </div>
              <div class="podium-name">${s.name.split(' ')[0]}</div>
              <div class="podium-miles">${s.nauticalMiles} Mil</div>
              <div class="podium-bar">${medals[i]}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Full Rankings -->
      <div style="padding: 0 16px; margin-bottom: 8px;">
        <h3 style="font-size: 16px; margin-bottom: 4px;">🏆 Peta Arus Kapten</h3>
        <p style="font-size: 12px; opacity: 0.6;">Siapa yang kapalnya paling jauh melaju?</p>
      </div>

      <div class="leaderboard-list">
        ${ranked.map((s, i) => {
          const rank = i + 1;
          const isSelf = s.id === currentStudentId;
          const topClass = rank <= 3 ? `top-${rank}` : '';
          const selfClass = isSelf ? 'self' : '';
          const ship = AppState.getShipLevel(s.xp);

          return `
            <div class="leaderboard-row ${topClass} ${selfClass} animate-fade-up" 
                 style="${Helpers.staggerDelay(i, 60)}">
              <div class="leaderboard-rank">
                ${Helpers.getRankEmoji(rank)}
              </div>
              <div class="avatar">${s.avatar}</div>
              <div class="leaderboard-info">
                <div class="leaderboard-name">
                  ${s.name} ${isSelf ? '(Kamu)' : ''}
                </div>
                <div class="leaderboard-xp">
                  ${s.nauticalMiles} Mil Laut • 🔥 ${s.streak} hari
                </div>
              </div>
              <div class="leaderboard-ship">${ship.emoji}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    return html;
  }
};
