/* ==========================================
   SAPTARA — Teacher Crew Page
   "Daftar Kru — Manajemen Murid"
   + Tambah Crew feature
   ========================================== */

const TeacherCrewPage = {
  searchQuery: '',

  render(container) {
    let students = [...STUDENTS];
    
    // Filter by search
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      students = students.filter(s => s.name.toLowerCase().includes(q));
    }

    // Sort by XP descending
    students.sort((a, b) => b.xp - a.xp);

    const totalStudents = STUDENTS.length;
    const avgXP = Math.round(STUDENTS.reduce((a, s) => a + s.xp, 0) / (totalStudents || 1));
    const avgStreak = Math.round(STUDENTS.reduce((a, s) => a + s.streak, 0) / (totalStudents || 1));
    const teacherClass = AppState.loginClass || '4A';

    container.innerHTML = `
      <div class="page teacher-page">
        <!-- Header -->
        <div class="teacher-header animate-fade-up">
          <div>
            <h1>👥 Daftar Kru</h1>
            <p style="font-size:12px; opacity:0.5; margin-top:2px;">Kelas ${teacherClass} — ${totalStudents} Kapten Cilik</p>
          </div>
        </div>

        <!-- Class Stats -->
        <div class="analytics-cards animate-fade-up" style="animation-delay:0.05s;">
          <div class="analytics-stat">
            <div class="stat-icon">👥</div>
            <div class="stat-value">${totalStudents}</div>
            <div class="stat-label">Total Murid</div>
          </div>
          <div class="analytics-stat">
            <div class="stat-icon">🚢</div>
            <div class="stat-value">${avgXP}</div>
            <div class="stat-label">Rata-rata Mil</div>
          </div>
          <div class="analytics-stat">
            <div class="stat-icon">🔥</div>
            <div class="stat-value">${avgStreak}</div>
            <div class="stat-label">Rata-rata Streak</div>
          </div>
          <div class="analytics-stat">
            <div class="stat-icon">🏅</div>
            <div class="stat-value">${STUDENTS.reduce((a, s) => a + s.badges.length, 0)}</div>
            <div class="stat-label">Total Lencana</div>
          </div>
        </div>

        <!-- Add Crew Button -->
        <div class="animate-fade-up" style="padding: 0 16px; margin-bottom:12px; animation-delay:0.08s;">
          <button class="btn btn-gold btn-lg" style="width:100%; font-size:15px;" 
                  onclick="TeacherCrewPage.showAddCrew()" id="btn-add-crew">
            ➕ Tambah Crew Baru
          </button>
        </div>

        <!-- Search -->
        <div class="crew-search animate-fade-up" style="animation-delay:0.1s;">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" placeholder="Cari nama murid..." 
                   value="${this.searchQuery}"
                   oninput="TeacherCrewPage.onSearch(this.value)" id="crew-search">
          </div>
        </div>

        <!-- Student List -->
        <div class="crew-list animate-fade-up" style="animation-delay:0.15s;">
          ${students.length > 0 ? students.map((s, i) => {
            const shipLevel = AppState.getShipLevel(s.xp);
            const completedToday = s.completedToday.length;
            const todayPct = Math.round((completedToday / 7) * 100);

            return `
              <div class="crew-card animate-fade-up" style="${Helpers.staggerDelay(i, 50)}"
                   onclick="TeacherCrewPage.openStudentDetail(${s.id})">
                <div class="avatar-lg">${s.avatar}</div>
                <div class="crew-info">
                  <div class="crew-name">${s.name}</div>
                  <div class="crew-stats">
                    <span>🚢 ${s.nauticalMiles} Mil</span>
                    <span>🔥 ${s.streak} hari</span>
                    <span>📋 ${completedToday}/7</span>
                  </div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                  <span class="crew-level-badge level-${shipLevel.level}">
                    ${shipLevel.emoji} ${shipLevel.name.split(' ')[0]}
                  </span>
                  <div class="progress-bar" style="width:48px; height:4px;">
                    <div class="progress-fill" style="width:${todayPct}%; background:${todayPct === 100 ? 'var(--seaweed-green)' : 'var(--gold-coin)'}"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="empty-state">
              <div style="font-size:40px; margin-bottom:12px;">🔍</div>
              <p>Tidak ditemukan murid dengan nama "${this.searchQuery}"</p>
            </div>
          `}
        </div>

        <!-- Logout Button -->
        <div class="animate-fade-up" style="padding: 0 16px; margin-top:16px; animation-delay:0.3s;">
          <button class="btn btn-ghost" style="width:100%; font-size:14px; color:var(--sunset-coral); border:1px solid rgba(255,100,100,0.2);" 
                  onclick="TeacherCrewPage.logout()">
            🚪 Keluar (Log Out)
          </button>
        </div>

        <div style="height: 24px;"></div>
      </div>
    `;

    Navbar.mount('teacher');
  },

  // Show Add Crew Modal
  showAddCrew() {
    Helpers.vibrate();

    const teacherClass = AppState.loginClass || '4A';
    const avatarOptions = ['🧒', '👦', '👧', '🧑', '👱', '👶'];
    const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'add-crew-modal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
      <div class="modal-content" style="max-width:380px; max-height:90vh; overflow-y:auto;">
        <div class="modal-header">
          <div style="font-size:48px; margin-bottom:8px;">⚓</div>
          <h3>Tambah Crew Baru</h3>
          <p style="font-size:12px; opacity:0.6; margin-top:4px;">Daftarkan murid baru ke Kelas ${teacherClass}</p>
        </div>

        <!-- Avatar Selection -->
        <div style="margin-bottom:14px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">😊 Pilih Avatar:</label>
          <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;" id="avatar-selector">
            ${avatarOptions.map((av, i) => `
              <div class="avatar-option ${i === 0 ? 'selected' : ''}" 
                   onclick="TeacherCrewPage.selectAvatar('${av}', this)"
                   data-avatar="${av}"
                   style="
                     width:48px; height:48px; border-radius:50%; font-size:28px;
                     display:flex; align-items:center; justify-content:center;
                     background: ${i === 0 ? 'rgba(255,183,3,0.3)' : 'rgba(255,255,255,0.1)'};
                     border: 2px solid ${i === 0 ? 'var(--gold-coin)' : 'transparent'};
                     cursor:pointer; transition: all 0.2s ease;
                   ">${av}</div>
            `).join('')}
          </div>
        </div>

        <!-- Student Name -->
        <div style="margin-bottom:14px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">👤 Nama Murid:</label>
          <input type="text" class="input-field" id="crew-name-input" 
                 placeholder="Contoh: Ahmad Rizki"
                 style="color: var(--foam-white); font-size:15px; padding:12px 16px;"
                 autocomplete="name">
        </div>

        <!-- Class Code (auto-filled from teacher login) -->
        <div style="margin-bottom:20px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">🏫 Kode Kelas:</label>
          <input type="text" class="input-field" id="crew-class-input" 
                 value="${teacherClass}"
                 style="color: var(--foam-white); font-size:15px; padding:12px 16px; text-transform:uppercase;"
                 maxlength="10">
        </div>

        <!-- Submit -->
        <button class="btn btn-gold btn-lg" style="width:100%; font-size:15px;" 
                onclick="TeacherCrewPage.submitAddCrew()">
          ⚓ Daftarkan Crew
        </button>

        <button class="btn btn-ghost" style="width:100%; margin-top:8px; font-size:13px;" 
                onclick="document.getElementById('add-crew-modal').remove()">
          ← Batal
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Store selected avatar
    this.selectedAvatar = avatarOptions[0];

    // Auto-focus name
    setTimeout(() => {
      document.getElementById('crew-name-input')?.focus();
    }, 300);

    // Enter key to submit
    setTimeout(() => {
      const inputs = modal.querySelectorAll('.input-field');
      inputs.forEach(input => {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') TeacherCrewPage.submitAddCrew();
        });
      });
    }, 100);
  },

  selectedAvatar: '🧒',

  selectAvatar(avatar, element) {
    Helpers.vibrate();
    this.selectedAvatar = avatar;

    // Update visual selection
    document.querySelectorAll('#avatar-selector .avatar-option').forEach(opt => {
      opt.style.background = 'rgba(255,255,255,0.1)';
      opt.style.borderColor = 'transparent';
      opt.classList.remove('selected');
    });
    element.style.background = 'rgba(255,183,3,0.3)';
    element.style.borderColor = 'var(--gold-coin)';
    element.classList.add('selected');
  },

  submitAddCrew() {
    const nameInput = document.getElementById('crew-name-input');
    const classInput = document.getElementById('crew-class-input');

    const name = nameInput?.value?.trim() || '';
    const classCode = classInput?.value?.trim().toUpperCase() || '';

    // Validate
    if (!name) {
      Helpers.showToast('Isi nama murid dulu! 👤', '⚠️');
      nameInput?.focus();
      nameInput.style.border = '2px solid var(--sunset-coral)';
      setTimeout(() => { nameInput.style.border = ''; }, 2000);
      return;
    }

    if (name.length < 2) {
      Helpers.showToast('Nama minimal 2 huruf! ✍️', '⚠️');
      nameInput?.focus();
      return;
    }

    if (!classCode) {
      Helpers.showToast('Isi kode kelas! 🏫', '⚠️');
      classInput?.focus();
      return;
    }

    // Check for duplicate name
    const exists = STUDENTS.find(s => s.name.toLowerCase() === name.toLowerCase() && s.class === classCode);
    if (exists) {
      Helpers.showToast(`"${name}" sudah terdaftar di kelas ${classCode}!`, '⚠️');
      return;
    }

    // Create new student
    const newId = Math.max(...STUDENTS.map(s => s.id), 0) + 1;
    const newStudent = {
      id: newId,
      name: name,
      avatar: this.selectedAvatar,
      class: classCode,
      level: 1,
      xp: 0,
      coins: 0,
      nauticalMiles: 0,
      streak: 0,
      badges: [],
      accessories: [],
      completedToday: [],
      habits: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
      },
      weeklyData: [
        { day: 'Sen', completed: 0 },
        { day: 'Sel', completed: 0 },
        { day: 'Rab', completed: 0 },
        { day: 'Kam', completed: 0 },
        { day: 'Jum', completed: 0 },
        { day: 'Sab', completed: 0 },
        { day: 'Min', completed: 0 }
      ]
    };

    // Add to STUDENTS array
    STUDENTS.push(newStudent);

    Helpers.vibrate(100);
    Helpers.showToast(`${this.selectedAvatar} ${name} berhasil didaftarkan di kelas ${classCode}! ⚓`, '✅');

    // Close modal
    document.getElementById('add-crew-modal').remove();

    // Re-render crew page
    const container = document.getElementById('page-content');
    this.render(container);
  },

  onSearch(query) {
    this.searchQuery = query;
    // Debounce re-render
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      const container = document.getElementById('page-content');
      this.render(container);
      // Re-focus search input
      const input = document.getElementById('crew-search');
      if (input) {
        input.focus();
        input.setSelectionRange(query.length, query.length);
      }
    }, 200);
  },

  openStudentDetail(studentId) {
    Helpers.vibrate();
    const student = AppState.getStudent(studentId);
    const shipLevel = AppState.getShipLevel(student.xp);
    const avgScore = Math.round(Object.values(student.habits).reduce((a, b) => a + b, 0) / 7);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'crew-detail-modal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
      <div class="modal-content" style="max-height:85vh; overflow-y:auto;">
        <!-- Student Info -->
        <div style="text-align:center; margin-bottom:16px;">
          <div style="font-size:56px; margin-bottom:8px;">${student.avatar}</div>
          <h3>${student.name}</h3>
          <p style="font-size:12px; opacity:0.5;">Kelas ${student.class} • ${shipLevel.name}</p>
        </div>

        <!-- Stats -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-bottom:16px;">
          <div style="text-align:center; background:rgba(255,255,255,0.1); border-radius:10px; padding:8px;">
            <div style="font-family:var(--font-accent); font-size:18px; font-weight:800; color:var(--gold-coin);">${student.nauticalMiles}</div>
            <div style="font-size:9px; opacity:0.5;">Mil Laut</div>
          </div>
          <div style="text-align:center; background:rgba(255,255,255,0.1); border-radius:10px; padding:8px;">
            <div style="font-family:var(--font-accent); font-size:18px; font-weight:800; color:var(--seaweed-green);">${avgScore}%</div>
            <div style="font-size:9px; opacity:0.5;">Skor Karakter</div>
          </div>
          <div style="text-align:center; background:rgba(255,255,255,0.1); border-radius:10px; padding:8px;">
            <div style="font-family:var(--font-accent); font-size:18px; font-weight:800; color:var(--sunset-coral);">${student.streak}</div>
            <div style="font-size:9px; opacity:0.5;">Streak</div>
          </div>
        </div>

        <!-- Mini Radar -->
        <div style="margin-bottom:16px;">
          ${RadarChart.render(student.habits, { size: 200, showLabels: true, animated: false, id: 'modal-radar' })}
        </div>

        <!-- Habits Breakdown -->
        <div style="margin-bottom:16px;">
          ${HABITS.map(h => {
            const score = student.habits[h.id] || 0;
            const color = Helpers.getScoreColor(score);
            return `
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="font-size:16px; width:24px; text-align:center;">${h.icon}</span>
                <div style="flex:1;">
                  <div class="progress-bar" style="height:6px;">
                    <div class="progress-fill" style="width:${score}%; background:${color};"></div>
                  </div>
                </div>
                <span style="font-size:11px; font-weight:700; color:${color}; width:32px; text-align:right;">${score}%</span>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Actions -->
        <div style="display:flex; gap:8px; margin-bottom:8px;">
          <button class="btn btn-primary" style="flex:1; font-size:13px;" 
                  onclick="document.getElementById('crew-detail-modal').remove(); TeacherAnalyticsPage.selectedStudentId=${studentId}; Router.navigate('/teacher/analytics');">
            📊 Analitik
          </button>
          <button class="btn btn-gold" style="flex:1; font-size:13px;" 
                  onclick="document.getElementById('crew-detail-modal').remove(); TeacherRewardsPage.selectedStudentId=${studentId}; Router.navigate('/teacher/rewards');">
            🏅 Beri Hadiah
          </button>
        </div>

        <!-- Delete Crew -->
        <button class="btn btn-ghost" style="width:100%; font-size:12px; color:var(--sunset-coral);" 
                onclick="TeacherCrewPage.confirmDeleteCrew(${studentId})">
          🗑️ Hapus dari Crew
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  },

  // Confirm delete crew member
  confirmDeleteCrew(studentId) {
    const student = STUDENTS.find(s => s.id === studentId);
    if (!student) return;

    Helpers.vibrate();

    const confirmed = confirm(`Yakin hapus ${student.name} dari crew?\nData murid ini akan dihapus.`);
    if (confirmed) {
      // Remove from STUDENTS array
      const idx = STUDENTS.findIndex(s => s.id === studentId);
      if (idx > -1) {
        STUDENTS.splice(idx, 1);
      }

      document.getElementById('crew-detail-modal')?.remove();
      Helpers.showToast(`${student.name} telah dihapus dari crew.`, '🗑️');

      // Re-render
      const container = document.getElementById('page-content');
      this.render(container);
    }
  },

  // Logout
  logout() {
    Helpers.vibrate(50);

    // Clear state
    AppState.currentRole = null;
    AppState.loginName = '';
    AppState.loginClass = '';
    AppState.loginSchool = '';
    AppState.loginShipName = '';

    // Remove UI elements
    Navbar.remove();
    Mascot.remove();
    MessageBottle.remove();

    // Directly render landing page
    const container = document.getElementById('page-content');
    if (container) {
      LandingPage.render(container);
    }

    // Update hash without triggering router
    window.location.hash = '/';

    Helpers.showToast('Sampai jumpa, Laksamana! 👋', '🚪');
  }
};
