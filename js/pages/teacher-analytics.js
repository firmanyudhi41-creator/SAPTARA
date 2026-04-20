/* ==========================================
   SAPTARA — Teacher Analytics Page
   "Analitik Radar Kelas"
   ========================================== */

const TeacherAnalyticsPage = {
  selectedStudentId: 1,

  render(container) {
    const student = AppState.getStudent(this.selectedStudentId);
    const shipLevel = AppState.getShipLevel(student.xp);
    const avgScore = Math.round(
      Object.values(student.habits).reduce((a, b) => a + b, 0) / 7
    );
    const completedToday = student.completedToday.length;

    container.innerHTML = `
      <div class="page teacher-page">
        <!-- Header -->
        <div class="teacher-header animate-fade-up">
          <div>
            <h1>📊 Analitik Radar</h1>
            <p style="font-size:12px; opacity:0.5; margin-top:2px;">Kompas Karakter Per Murid</p>
          </div>
        </div>

        <!-- Student Selector -->
        <div class="analytics-selector animate-fade-up" style="animation-delay:0.05s;">
          <select class="student-select" id="student-select" 
                  onchange="TeacherAnalyticsPage.onSelectStudent(this.value)">
            ${STUDENTS.map(s => `
              <option value="${s.id}" ${s.id === this.selectedStudentId ? 'selected' : ''}>
                ${s.avatar} ${s.name} — Kelas ${s.class}
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Quick Stats -->
        <div class="analytics-cards animate-fade-up" style="animation-delay:0.1s;">
          <div class="analytics-stat">
            <div class="stat-icon">🧭</div>
            <div class="stat-value">${avgScore}%</div>
            <div class="stat-label">Skor Rata-rata</div>
          </div>
          <div class="analytics-stat">
            <div class="stat-icon">${shipLevel.emoji}</div>
            <div class="stat-value">${student.nauticalMiles}</div>
            <div class="stat-label">Mil Laut</div>
          </div>
          <div class="analytics-stat">
            <div class="stat-icon">🔥</div>
            <div class="stat-value">${student.streak}</div>
            <div class="stat-label">Hari Streak</div>
          </div>
          <div class="analytics-stat">
            <div class="stat-icon">📋</div>
            <div class="stat-value">${completedToday}/7</div>
            <div class="stat-label">Misi Hari Ini</div>
          </div>
        </div>

        <!-- Radar Chart -->
        <div class="analytics-radar-card animate-fade-up" style="animation-delay:0.2s;">
          <h4 style="font-size:14px; margin-bottom:4px; text-align:center;">
            🧭 Kompas Karakter: ${student.name.split(' ')[0]}
          </h4>
          <p style="font-size:11px; opacity:0.4; text-align:center; margin-bottom:8px;">
            Bentuk semakin bulat = karakter semakin stabil
          </p>
          ${RadarChart.renderWithLegend(student, { id: 'teacher-radar', size: 260 })}
        </div>

        <!-- Weekly Trend -->
        <div class="analytics-trend animate-fade-up" style="animation-delay:0.3s;">
          <div class="trend-title">📈 Tren Mingguan</div>
          <div class="trend-chart" style="margin-bottom:24px;">
            ${student.weeklyData.map((d, i) => {
              const pct = (d.completed / 7) * 100;
              return `
                <div class="trend-bar" style="height: ${Math.max(8, pct)}%;">
                  <span class="bar-value">${d.completed}</span>
                  <span class="bar-label">${d.day}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Per-Habit Breakdown -->
        <div style="padding: 0 16px; margin-bottom:16px;">
          <h4 style="font-size:14px; margin-bottom:12px;">🔍 Detail per Kebiasaan</h4>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${HABITS.map(h => {
              const score = student.habits[h.id] || 0;
              const color = Helpers.getScoreColor(score);
              const status = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
              return `
                <div style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.04); border-radius:10px; padding:10px;">
                  <span style="font-size:20px;">${h.icon}</span>
                  <div style="flex:1;">
                    <div style="font-size:13px; font-weight:600;">${h.name}</div>
                    <div class="progress-bar" style="height:6px; margin-top:4px;">
                      <div class="progress-fill" style="width:${score}%; background:${color};"></div>
                    </div>
                  </div>
                  <span style="font-size:12px;">${status}</span>
                  <span style="font-family:var(--font-accent); font-weight:700; color:${color}; min-width:35px; text-align:right;">${score}%</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Recommendation -->
        <div style="padding: 0 16px; margin-bottom:16px;">
          ${this.renderRecommendation(student)}
        </div>

        <div style="height: 24px;"></div>
      </div>
    `;

    Navbar.mount('teacher');
  },

  renderRecommendation(student) {
    const scores = HABITS.map(h => ({ ...h, score: student.habits[h.id] || 0 }));
    const weakest = scores.sort((a, b) => a.score - b.score)[0];
    const strongest = scores.sort((a, b) => b.score - a.score)[0];

    return `
      <div style="background:rgba(255,183,3,0.08); border:1px solid rgba(255,183,3,0.15); border-radius:12px; padding:14px;">
        <h4 style="font-size:13px; margin-bottom:8px;">💡 Rekomendasi Bimbingan</h4>
        <p style="font-size:12px; opacity:0.7; line-height:1.6;">
          <strong style="color:var(--sunset-coral);">Perlu perhatian:</strong> ${weakest.name} (${weakest.score}%) — ${weakest.icon} area ini membutuhkan dorongan lebih.
        </p>
        <p style="font-size:12px; opacity:0.7; line-height:1.6; margin-top:6px;">
          <strong style="color:var(--seaweed-green);">Kekuatan:</strong> ${strongest.name} (${strongest.score}%) — ${strongest.icon} terus dukung agar tetap konsisten!
        </p>
      </div>
    `;
  },

  onSelectStudent(id) {
    this.selectedStudentId = parseInt(id);
    Helpers.vibrate();
    const container = document.getElementById('page-content');
    this.render(container);
  }
};
