/* ==========================================
   SAPTARA — Teacher Rewards Page
   "Stiker & Komentar — Beri Penghargaan"
   ========================================== */

const TeacherRewardsPage = {
  selectedStudentId: null,

  render(container) {
    container.innerHTML = `
      <div class="page teacher-page">
        <!-- Header -->
        <div class="teacher-header animate-fade-up">
          <div>
            <h1>🏅 Stiker & Komentar</h1>
            <p style="font-size:12px; opacity:0.5; margin-top:2px;">Beri stiker dan komentar untuk murid</p>
          </div>
        </div>

        ${this.selectedStudentId ? this.renderStudentReward() : this.renderStudentList()}

        <div style="height: 24px;"></div>
      </div>
    `;

    Navbar.mount('teacher');
  },

  renderStudentList() {
    return `
      <!-- Student List -->
      <div style="padding: 0 16px; margin-bottom:12px;">
        <p style="font-size:13px; opacity:0.6;">Pilih murid untuk memberi penghargaan:</p>
      </div>
      <div class="rewards-section">
        ${STUDENTS.map((s, i) => {
          const shipLevel = AppState.getShipLevel(s.xp);
          return `
            <div class="reward-student-card animate-fade-up" style="${Helpers.staggerDelay(i, 60)}"
                 onclick="TeacherRewardsPage.selectStudent(${s.id})">
              <div class="avatar-lg">${s.avatar}</div>
              <div class="student-info">
                <div class="student-name">${s.name}</div>
                <div class="student-badges">
                  ${shipLevel.emoji} ${shipLevel.name} • ${s.badges.length} lencana • 🔥 ${s.streak} hari
                </div>
              </div>
              <span class="student-arrow">›</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderStudentReward() {
    const student = AppState.getStudent(this.selectedStudentId);
    if (!student) return '';

    return `
      <!-- Back Button -->
      <div style="padding: 0 16px; margin-bottom:16px;">
        <button class="btn btn-ghost" style="font-size:13px;" onclick="TeacherRewardsPage.goBack()">
          ← Kembali ke daftar
        </button>
      </div>

      <!-- Student Info -->
      <div style="text-align:center; padding:0 16px; margin-bottom:20px;">
        <div style="font-size:48px; margin-bottom:8px;">${student.avatar}</div>
        <h3 style="margin-bottom:4px;">${student.name}</h3>
        <p style="font-size:12px; opacity:0.5;">Kelas ${student.class}</p>
      </div>

      <!-- Current Badges -->
      <div style="padding: 0 16px; margin-bottom:20px;">
        <h4 style="font-size:14px; margin-bottom:10px;">🏅 Lencana yang Dimiliki</h4>
        ${student.badges.length > 0 ? `
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${student.badges.map(b => {
              const habit = HABITS.find(h => h.badge === b);
              return `
                <span class="badge badge-gold" style="font-size:12px; padding:6px 12px;">
                  ${habit ? habit.badgeIcon : '🏅'} ${b.replace('Lencana ', '')}
                </span>
              `;
            }).join('')}
          </div>
        ` : `
          <p style="font-size:13px; opacity:0.4;">Belum ada lencana</p>
        `}
      </div>

      <!-- Award New Badge -->
      <div style="padding: 0 16px; margin-bottom:20px;">
        <h4 style="font-size:14px; margin-bottom:10px;">🎁 Beri Lencana Baru</h4>
        <div class="badges-collection">
          ${HABITS.map(h => {
            const owned = student.badges.includes(h.badge);
            return `
              <div class="badge-award-card ${owned ? 'selected' : ''}" 
                   onclick="${owned ? '' : `TeacherRewardsPage.awardBadge(${student.id}, '${h.badge}')`}"
                   style="${owned ? 'opacity:0.5;' : ''}">
                <span class="badge-icon">${h.badgeIcon}</span>
                <span class="badge-name">${h.badge.replace('Lencana ', '')}</span>
                ${owned ? '<span style="font-size:10px;">✅</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Send Sticker & Comment -->
      <div style="padding: 0 16px; margin-bottom:20px;">
        <h4 style="font-size:14px; margin-bottom:10px;">💌 Kirim Stiker & Komentar</h4>
        
        <div style="background:rgba(255,255,255,0.06); border-radius:12px; padding:16px; border:1px solid rgba(255,255,255,0.05);">
          <div style="margin-bottom:12px;">
            <div style="font-size:12px; opacity:0.5; margin-bottom:6px;">Pilih Stiker:</div>
            <div class="sticker-grid" id="reward-sticker-grid">
              ${['🪙', '💎', '🏆', '⭐', '🌟', '💪', '🎉', '❤️'].map((s, i) => `
                <div class="sticker-item ${i === 0 ? 'selected' : ''}" 
                     onclick="TeacherRewardsPage.selectSticker('${s}', this)">${s}</div>
              `).join('')}
            </div>
          </div>
          
          <div style="margin-bottom:12px;">
            <div style="font-size:12px; opacity:0.5; margin-bottom:6px;">Tulis Komentar:</div>
            <textarea class="input-field" rows="2" id="reward-comment" 
                      placeholder="Contoh: Kamu hebat! Terus berjuang, Kapten!"
                      style="color:var(--foam-white);"></textarea>
          </div>

          <button class="btn btn-gold btn-lg" style="width:100%;" onclick="TeacherRewardsPage.sendReward()">
            🍶 Kirim Pesan dalam Botol
          </button>
        </div>
      </div>
    `;
  },

  selectStudent(id) {
    this.selectedStudentId = id;
    Helpers.vibrate();
    const container = document.getElementById('page-content');
    this.render(container);
  },

  goBack() {
    this.selectedStudentId = null;
    const container = document.getElementById('page-content');
    this.render(container);
  },

  selectedSticker: '🪙',

  selectSticker(sticker, element) {
    document.querySelectorAll('#reward-sticker-grid .sticker-item').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    this.selectedSticker = sticker;
    Helpers.vibrate();
  },

  awardBadge(studentId, badge) {
    const student = AppState.getStudent(studentId);
    if (student && !student.badges.includes(badge)) {
      student.badges.push(badge);
      Helpers.showToast(`${badge} diberikan kepada ${student.name}!`, '🏅');
      Helpers.vibrate(100);
      const container = document.getElementById('page-content');
      this.render(container);
    }
  },

  sendReward() {
    const comment = document.getElementById('reward-comment')?.value;
    if (!comment || !comment.trim()) {
      Helpers.showToast('Tulis komentar dulu, Guru!', '✍️');
      return;
    }

    const student = AppState.getStudent(this.selectedStudentId);
    
    // Add as a logbook comment (simulate)
    const newEntry = {
      id: LOGBOOK_ENTRIES.length + 100,
      studentId: this.selectedStudentId,
      habitId: 1,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      photoUrl: null,
      caption: 'Pesan dari Guru',
      status: 'verified',
      teacherComment: comment,
      teacherSticker: this.selectedSticker,
      xpEarned: 10
    };
    LOGBOOK_ENTRIES.push(newEntry);

    Helpers.showToast(`Pesan dalam botol dikirim ke ${student.name}! 🍶`, '✅');
    Helpers.vibrate(100);

    document.getElementById('reward-comment').value = '';
  }
};
