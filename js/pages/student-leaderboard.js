/* ==========================================
   SAPTARA — Student Leaderboard Page
   "Peta Arus — Perjalanan Kapten"
   (Tanpa Peringkat — Fokus Progress Pribadi)
   ========================================== */

const StudentLeaderboardPage = {
  render(container) {
    const student = AppState.getCurrentStudent();
    const shipLevel = AppState.getShipLevel(student.xp);
    const missions = AppState.getTodayMissions(student.id);
    const completedToday = missions.filter(m => m.completed).length;
    const avgScore = Math.round(Object.values(student.habits).reduce((a, b) => a + b, 0) / 7);

    container.innerHTML = `
      <div class="page leaderboard-page">
        <!-- Header -->
        <div class="page-header animate-fade-up">
          <h1>⛵ Peta Arus</h1>
          <p>Perjalanan & Pencapaianmu, Kapten!</p>
        </div>

        <!-- Journey Stats -->
        <div class="glass-card animate-fade-up" style="margin: 0 16px 16px; animation-delay:0.1s;">
          <div style="text-align:center; margin-bottom:16px;">
            <div style="font-size:64px; margin-bottom:8px; animation: shipBob 3s ease-in-out infinite;">${shipLevel.emoji}</div>
            <div style="font-family:var(--font-heading); font-size:20px; color:var(--gold-coin);">${shipLevel.name}</div>
            <div style="font-size:12px; opacity:0.6; margin-top:2px;">${shipLevel.description}</div>
          </div>

          <div style="display:flex; gap:8px; margin-bottom:16px;">
            <div style="flex:1; background:rgba(255,255,255,0.08); border-radius:12px; padding:12px; text-align:center;">
              <div style="font-size:24px;">🚢</div>
              <div style="font-family:var(--font-accent); font-weight:800; font-size:22px; color:var(--gold-coin);">${student.nauticalMiles}</div>
              <div style="font-size:10px; opacity:0.5;">Mil Laut</div>
            </div>
            <div style="flex:1; background:rgba(255,255,255,0.08); border-radius:12px; padding:12px; text-align:center;">
              <div style="font-size:24px;">🔥</div>
              <div style="font-family:var(--font-accent); font-weight:800; font-size:22px; color:var(--gold-coin);">${student.streak}</div>
              <div style="font-size:10px; opacity:0.5;">Hari Streak</div>
            </div>
            <div style="flex:1; background:rgba(255,255,255,0.08); border-radius:12px; padding:12px; text-align:center;">
              <div style="font-size:24px;">🪙</div>
              <div style="font-family:var(--font-accent); font-weight:800; font-size:22px; color:var(--gold-coin);">${student.coins}</div>
              <div style="font-size:10px; opacity:0.5;">Koin</div>
            </div>
          </div>

          <!-- XP Progress to next ship -->
          <div style="margin-bottom:6px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
              <span style="opacity:0.6;">Progres Kapal</span>
              <span style="color:var(--gold-coin); font-weight:700;">${student.xp}/${shipLevel.maxXP} Mil</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(100, (student.xp / shipLevel.maxXP) * 100)}%"></div>
            </div>
          </div>
        </div>

        <!-- Today's Progress -->
        <div style="padding: 0 16px; margin-bottom: 8px;">
          <h3 style="font-size: 16px;">📋 Progress Hari Ini</h3>
        </div>
        <div class="glass-card animate-fade-up" style="margin: 0 16px 16px; animation-delay:0.2s;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
            <span style="font-size:14px; font-weight:700;">Misi Selesai</span>
            <span style="font-family:var(--font-accent); font-size:20px; font-weight:800; color:var(--gold-coin);">${completedToday}/7</span>
          </div>
          <div class="progress-bar" style="margin-bottom:12px;">
            <div class="progress-fill" style="width: ${(completedToday / 7) * 100}%; background: ${completedToday === 7 ? 'var(--seaweed-green)' : 'var(--wave-cyan)'};"></div>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${missions.map(m => `
              <div style="
                display:flex; align-items:center; gap:6px; 
                padding:6px 12px; border-radius:20px; font-size:12px;
                background: ${m.completed ? m.color + '22' : 'rgba(255,255,255,0.06)'};
                border: 1px solid ${m.completed ? m.color + '44' : 'rgba(255,255,255,0.1)'};
                ${m.completed ? '' : 'opacity:0.5;'}
              ">
                ${m.icon} 
                <span style="font-weight:${m.completed ? '700' : '400'};">${m.name.split(' ').slice(0,2).join(' ')}</span>
                ${m.completed ? '✅' : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Weekly Trend -->
        <div style="padding: 0 16px; margin-bottom: 8px;">
          <h3 style="font-size: 16px;">📊 Tren Mingguan</h3>
        </div>
        <div class="glass-card animate-fade-up" style="margin: 0 16px 16px; animation-delay:0.3s;">
          <div style="display:flex; align-items:flex-end; justify-content:space-between; gap:6px; height:120px; padding-bottom:8px;">
            ${student.weeklyData.map((d, i) => {
              const height = (d.completed / 7) * 100;
              const isToday = i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0);
              return `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
                  <div style="font-size:10px; font-weight:700; color:${isToday ? 'var(--gold-coin)' : 'rgba(255,255,255,0.5)'};">${d.completed}</div>
                  <div style="
                    width:100%; border-radius:8px 8px 4px 4px; 
                    height:${Math.max(8, height)}%; min-height:8px;
                    background: ${isToday 
                      ? 'linear-gradient(180deg, var(--gold-coin), var(--gold-warm))' 
                      : d.completed >= 5 
                        ? 'linear-gradient(180deg, var(--seaweed-green), #048a6b)' 
                        : 'rgba(255,255,255,0.15)'};
                    transition: height 0.5s ease;
                  "></div>
                  <div style="font-size:9px; font-weight:600; opacity:${isToday ? '1' : '0.5'}; color:${isToday ? 'var(--gold-coin)' : 'inherit'};">${d.day}</div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="text-align:center; font-size:11px; opacity:0.5; margin-top:8px;">
            Rata-rata: ${Math.round(student.weeklyData.reduce((a, b) => a + b.completed, 0) / 7)} misi/hari
          </div>
        </div>

        <!-- Badges Collection -->
        <div style="padding: 0 16px; margin-bottom: 8px;">
          <h3 style="font-size: 16px;">🏅 Koleksi Lencana</h3>
        </div>
        <div class="glass-card animate-fade-up" style="margin: 0 16px 16px; animation-delay:0.4s;">
          ${student.badges.length > 0 ? `
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${student.badges.map((b, i) => {
                const habit = HABITS.find(h => h.badge === b);
                return `
                  <div class="animate-fade-up" style="
                    display:flex; align-items:center; gap:8px;
                    padding:8px 14px; border-radius:12px;
                    background: rgba(255, 183, 3, 0.12); border:1px solid rgba(255, 183, 3, 0.25);
                    ${Helpers.staggerDelay(i, 80)}
                  ">
                    <span style="font-size:20px;">${habit ? habit.badgeIcon : '🏅'}</span>
                    <span style="font-size:12px; font-weight:700;">${b.replace('Lencana ', '')}</span>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="text-align:center; padding:16px;">
              <div style="font-size:32px; opacity:0.3; margin-bottom:8px;">🏅</div>
              <p style="font-size:13px; opacity:0.5;">Belum ada lencana. Selesaikan misi untuk mengumpulkan!</p>
            </div>
          `}
          
          <!-- Locked badges -->
          ${HABITS.filter(h => !student.badges.includes(h.badge)).length > 0 ? `
            <div style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.08);">
              <div style="font-size:11px; opacity:0.4; margin-bottom:8px;">Belum Terbuka:</div>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${HABITS.filter(h => !student.badges.includes(h.badge)).map(h => `
                  <div style="
                    display:flex; align-items:center; gap:6px;
                    padding:6px 10px; border-radius:10px;
                    background: rgba(255,255,255,0.04); border:1px dashed rgba(255,255,255,0.1);
                    opacity:0.4;
                  ">
                    <span style="font-size:16px; filter:grayscale(1);">${h.badgeIcon}</span>
                    <span style="font-size:11px;">${h.badge.replace('Lencana ', '')}</span>
                    <span style="font-size:10px;">🔒</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div style="height: 24px;"></div>
      </div>
    `;

    Navbar.mount('student');
  }
};
