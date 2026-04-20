/* ==========================================
   SAPTARA — Student Compass Page
   "Radar Karakter"
   ========================================== */

const StudentCompassPage = {
  currentView: 'radar', // 'radar' or 'weekly'

  render(container) {
    const student = AppState.getCurrentStudent();
    const avgScore = Math.round(
      Object.values(student.habits).reduce((a, b) => a + b, 0) / 7
    );

    // Determine compass shape status
    let compassStatus = '';
    let compassEmoji = '';
    const scores = Object.values(student.habits);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const diff = max - min;

    if (diff <= 15) {
      compassStatus = 'Lingkaran Sempurna! Karaktermu sangat stabil! 🌟';
      compassEmoji = '⭐';
    } else if (diff <= 30) {
      compassStatus = 'Hampir bulat! Tingkatkan sedikit lagi, Kapten! 💪';
      compassEmoji = '💪';
    } else {
      compassStatus = 'Kompas agak penyok. Ada area yang perlu diperkuat! 🎯';
      compassEmoji = '🎯';
    }

    container.innerHTML = `
      <div class="page compass-page">
        <!-- Header -->
        <div class="page-header animate-fade-up">
          <h1>🧭 Radar Karakter</h1>
          <p>Kompas 7 Kebiasaan Baik</p>
        </div>

        <!-- View Toggle -->
        <div class="chip-group" style="padding: 0 16px; margin-bottom: 16px;">
          <div class="chip ${this.currentView === 'radar' ? 'active' : ''}" 
               onclick="StudentCompassPage.switchView('radar')">
            🧭 Kompas Radar
          </div>
          <div class="chip ${this.currentView === 'weekly' ? 'active' : ''}" 
               onclick="StudentCompassPage.switchView('weekly')">
            📊 Arus Mingguan
          </div>
        </div>

        ${this.currentView === 'radar' ? `
          <!-- Compass Status -->
          <div class="glass-card animate-fade-up" style="margin: 0 16px 16px; text-align:center;">
            <span style="font-size:24px;">${compassEmoji}</span>
            <p style="font-size:13px; margin-top:4px; font-weight:600;">${compassStatus}</p>
          </div>

          <!-- Radar Chart -->
          <div class="animate-fade-up" style="animation-delay: 0.2s;">
            ${RadarChart.renderWithLegend(student)}
          </div>
        ` : `
          <!-- Weekly View -->
          <div class="animate-fade-up" style="padding: 0 16px;">
            <div class="glass-card" style="margin-bottom: 16px;">
              <h4 style="font-size:14px; margin-bottom:12px;">🌊 Arus Gelombang Mingguan</h4>
              <div style="display:flex; align-items:flex-end; gap:6px; height:120px;">
                ${student.weeklyData.map((d, i) => {
                  const pct = (d.completed / 7) * 100;
                  const color = pct >= 85 ? 'var(--seaweed-green)' : pct >= 57 ? 'var(--gold-coin)' : 'var(--sunset-coral)';
                  return `
                    <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end;">
                      <div style="font-size:10px; font-weight:700; color:${color}; margin-bottom:4px;">${d.completed}/7</div>
                      <div style="width:100%; border-radius:6px 6px 0 0; background:linear-gradient(180deg, ${color}, ${color}88); transition:height 0.5s ease; height:${pct}%;" class="animate-fade-up" data-delay="${i}"></div>
                      <div style="font-size:10px; opacity:0.5; margin-top:4px;">${d.day}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Weekly Summary -->
            <div class="glass-card" style="margin-bottom:16px;">
              <h4 style="font-size:14px; margin-bottom:8px;">📊 Ringkasan Minggu Ini</h4>
              <div style="display:flex; gap:8px; margin-bottom:12px;">
                <div style="flex:1; text-align:center; background:rgba(255,255,255,0.1); border-radius:10px; padding:10px;">
                  <div style="font-family:var(--font-accent); font-size:24px; font-weight:800; color:var(--gold-coin);">
                    ${student.weeklyData.reduce((a, b) => a + b.completed, 0)}
                  </div>
                  <div style="font-size:10px; opacity:0.5;">Misi Selesai</div>
                </div>
                <div style="flex:1; text-align:center; background:rgba(255,255,255,0.1); border-radius:10px; padding:10px;">
                  <div style="font-family:var(--font-accent); font-size:24px; font-weight:800; color:var(--seaweed-green);">
                    ${Math.round(student.weeklyData.reduce((a, b) => a + b.completed, 0) / 7 * 100 / 7)}%
                  </div>
                  <div style="font-size:10px; opacity:0.5;">Rata-rata</div>
                </div>
                <div style="flex:1; text-align:center; background:rgba(255,255,255,0.1); border-radius:10px; padding:10px;">
                  <div style="font-family:var(--font-accent); font-size:24px; font-weight:800; color:var(--wave-cyan);">
                    ${avgScore}
                  </div>
                  <div style="font-size:10px; opacity:0.5;">Skor Total</div>
                </div>
              </div>
              
              <!-- Badge check -->
              ${student.weeklyData.every(d => d.completed >= 5) ? `
                <div style="text-align:center; background:rgba(255,183,3,0.15); border-radius:12px; padding:12px;">
                  <div style="font-size:32px; margin-bottom:4px;">⭐</div>
                  <div style="font-weight:700; font-size:14px; color:var(--gold-coin);">Lencana Bintang Laut!</div>
                  <div style="font-size:11px; opacity:0.6;">Fluktuasi stabil selama seminggu</div>
                </div>
              ` : `
                <div style="text-align:center; background:rgba(255,255,255,0.05); border-radius:12px; padding:12px;">
                  <div style="font-size:24px; margin-bottom:4px;">🎯</div>
                  <div style="font-size:13px; opacity:0.6;">Selesaikan 5+ misi setiap hari untuk dapat Lencana Bintang Laut!</div>
                </div>
              `}
            </div>
          </div>
        `}

        <div style="height: 24px;"></div>
      </div>
    `;

    Navbar.mount('student');
  },

  switchView(view) {
    this.currentView = view;
    Helpers.vibrate();
    const container = document.getElementById('page-content');
    this.render(container);
  }
};
