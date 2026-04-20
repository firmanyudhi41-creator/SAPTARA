/* ==========================================
   SAPTARA — Student Map Page
   "Peta Navigasi — Dashboard Utama Murid"
   ========================================== */

const StudentMapPage = {
  render(container) {
    const student = AppState.getCurrentStudent();
    const shipLevel = AppState.getShipLevel(student.xp);
    const missions = AppState.getTodayMissions(student.id);
    const completedCount = missions.filter(m => m.completed).length;

    container.innerHTML = `
      <div class="page map-page">
        <!-- Header -->
        <div class="map-header animate-fade-up">
          <div class="greeting">
            ${Helpers.getGreeting()}, Kapten!
            <strong>${student.name.split(' ')[0]} ${Helpers.getShipEmoji(student.level)}</strong>
          </div>
          <div class="header-right">
            <div class="coin-display">
              <span class="coin-icon">🪙</span>
              <span>${student.coins}</span>
            </div>
            <div class="avatar" onclick="StudentMapPage.showProfile()">
              ${student.avatar}
            </div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar animate-fade-up" style="animation-delay: 0.1s;">
          <div class="stat-item">
            <span class="stat-icon">🚢</span>
            <div>
              <div class="stat-value">${student.nauticalMiles}</div>
              <div class="stat-label">Mil Laut</div>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🔥</span>
            <div>
              <div class="stat-value">${student.streak}</div>
              <div class="stat-label">Hari Streak</div>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🏅</span>
            <div>
              <div class="stat-value">${student.badges.length}</div>
              <div class="stat-label">Lencana</div>
            </div>
          </div>
        </div>

        <!-- Ocean Map -->
        <div class="animate-fade-up" style="animation-delay: 0.2s;">
          ${OceanMap.render(student)}
        </div>

        <!-- Today's Mission List -->
        <div style="padding: 0 16px; margin-bottom: 8px;">
          <h3 style="font-size: 16px;">📋 Daftar Misi Hari Ini</h3>
        </div>
        <div class="mission-list">
          ${missions.map((m, i) => `
            <div class="mission-card ${m.completed ? 'completed' : 'pending'} animate-fade-up" 
                 style="${Helpers.staggerDelay(i + 3, 60)}"
                 onclick="OceanMap.onIslandClick(${m.id})">
              <div class="mission-icon" style="background: ${m.completed ? m.color : 'rgba(255,255,255,0.1)'};">
                ${m.icon}
              </div>
              <div class="mission-info">
                <div class="mission-name">${m.name}</div>
                <div class="mission-desc">${m.description}</div>
              </div>
              <div class="mission-status">
                ${m.completed ? '✅' : '⬜'}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="height: 24px;"></div>
      </div>
    `;

    // Update nav
    Navbar.mount('student');
  },

  showProfile() {
    const student = AppState.getCurrentStudent();
    const shipLevel = AppState.getShipLevel(student.xp);
    
    Helpers.vibrate();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'profile-modal';
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    modal.innerHTML = `
      <div class="modal-content" style="text-align:center;">
        <div style="font-size:64px; margin-bottom:12px;">${student.avatar}</div>
        <h3 style="margin-bottom:4px;">${student.name}</h3>
        <p style="font-size:13px; opacity:0.6; margin-bottom:16px;">Kelas ${student.class} • ${shipLevel.name}</p>
        
        <div style="display:flex; gap:8px; margin-bottom:20px;">
          <div style="flex:1; background:rgba(255,255,255,0.1); border-radius:12px; padding:10px;">
            <div style="font-size:20px;">🚢</div>
            <div style="font-family:var(--font-accent); font-weight:700; font-size:18px; color:var(--gold-coin);">${student.nauticalMiles}</div>
            <div style="font-size:10px; opacity:0.5;">Mil Laut</div>
          </div>
          <div style="flex:1; background:rgba(255,255,255,0.1); border-radius:12px; padding:10px;">
            <div style="font-size:20px;">🪙</div>
            <div style="font-family:var(--font-accent); font-weight:700; font-size:18px; color:var(--gold-coin);">${student.coins}</div>
            <div style="font-size:10px; opacity:0.5;">Koin</div>
          </div>
          <div style="flex:1; background:rgba(255,255,255,0.1); border-radius:12px; padding:10px;">
            <div style="font-size:20px;">🔥</div>
            <div style="font-family:var(--font-accent); font-weight:700; font-size:18px; color:var(--gold-coin);">${student.streak}</div>
            <div style="font-size:10px; opacity:0.5;">Streak</div>
          </div>
        </div>

        ${student.badges.length > 0 ? `
          <div style="text-align:left; margin-bottom:16px;">
            <div style="font-size:13px; font-weight:700; margin-bottom:8px;">🏅 Koleksi Lencana</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              ${student.badges.map(b => {
                const habit = HABITS.find(h => h.badge === b);
                return `<span class="badge badge-gold" style="font-size:12px;">${habit ? habit.badgeIcon : '🏅'} ${b.replace('Lencana ', '')}</span>`;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <button class="btn btn-ghost" style="width:100%; margin-bottom:8px;" onclick="document.getElementById('profile-modal').remove(); Router.navigate('/');">
          🚪 Kembali ke Pelabuhan
        </button>
        <button class="btn btn-ghost" style="width:100%;" onclick="document.getElementById('profile-modal').remove()">
          Tutup
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  }
};
