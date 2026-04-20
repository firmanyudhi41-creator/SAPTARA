/* ==========================================
   SAPTARA — Teacher Feed Page
   "Menara Suar — Pos Pemeriksaan Laksamana"
   ========================================== */

const TeacherFeedPage = {
  selectedEntries: new Set(),
  filterStatus: 'all', // 'all', 'pending', 'verified', 'needs_revision'

  render(container) {
    const allEntries = AppState.getAllEntries();
    const pendingCount = allEntries.filter(e => e.status === 'pending').length;
    
    let filteredEntries = allEntries;
    if (this.filterStatus !== 'all') {
      filteredEntries = allEntries.filter(e => e.status === this.filterStatus);
    }

    container.innerHTML = `
      <div class="page teacher-page">
        <!-- Header -->
        <div class="teacher-header animate-fade-up">
          <div>
            <h1>🔦 Menara Suar</h1>
            <p style="font-size:12px; opacity:0.5; margin-top:2px;">Verifikasi Bukti Misi Murid</p>
          </div>
          ${pendingCount > 0 ? `
            <span class="teacher-badge">${pendingCount} Menunggu</span>
          ` : `
            <span class="badge badge-green">Semua Terverifikasi ✓</span>
          `}
        </div>

        <!-- Filter Chips -->
        <div class="chip-group" style="padding: 0 16px; margin-bottom: 12px;">
          <div class="chip ${this.filterStatus === 'all' ? 'active' : ''}" 
               onclick="TeacherFeedPage.setFilter('all')">📋 Semua</div>
          <div class="chip ${this.filterStatus === 'pending' ? 'active' : ''}" 
               onclick="TeacherFeedPage.setFilter('pending')">⏳ Menunggu</div>
          <div class="chip ${this.filterStatus === 'verified' ? 'active' : ''}" 
               onclick="TeacherFeedPage.setFilter('verified')">✅ Terverifikasi</div>
          <div class="chip ${this.filterStatus === 'needs_revision' ? 'active' : ''}" 
               onclick="TeacherFeedPage.setFilter('needs_revision')">☁️ Perlu Revisi</div>
        </div>

        <!-- Batch Approval Bar -->
        ${this.selectedEntries.size > 0 ? `
          <div class="batch-bar animate-fade-down">
            <span class="batch-count">${this.selectedEntries.size} dipilih</span>
            <div class="batch-actions">
              <button class="btn btn-success" style="font-size:13px; padding:6px 14px;" 
                      onclick="TeacherFeedPage.batchApprove()">
                👍 Approve Semua
              </button>
              <button class="btn btn-ghost" style="font-size:13px; padding:6px 14px;" 
                      onclick="TeacherFeedPage.clearSelection()">
                Batal
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Feed -->
        <div class="feed-container">
          ${filteredEntries.length > 0 ? filteredEntries.map((entry, i) => {
            const student = AppState.getStudent(entry.studentId);
            const habit = HABITS.find(h => h.id === entry.habitId);
            const statusClass = entry.status.replace('_', '-');
            const isSelected = this.selectedEntries.has(entry.id);
            const statusLabels = {
              'verified': '✅ Terverifikasi',
              'pending': '⏳ Menunggu Verifikasi',
              'needs_revision': '☁️ Perlu Perbaikan'
            };

            return `
              <div class="feed-card animate-fade-up" style="${Helpers.staggerDelay(i, 80)}" id="feed-${entry.id}">
                <!-- Card Header -->
                <div class="feed-card-header">
                  ${entry.status === 'pending' ? `
                    <div class="custom-checkbox ${isSelected ? 'checked' : ''}" 
                         onclick="TeacherFeedPage.toggleSelect(${entry.id})"></div>
                  ` : ''}
                  <div class="avatar">${student ? student.avatar : '👤'}</div>
                  <div class="feed-student-info">
                    <div class="feed-student-name">${student ? student.name : 'Unknown'}</div>
                    <div class="feed-student-meta">${entry.date} • ${entry.time}</div>
                  </div>
                  <span class="feed-status-badge ${statusClass}">${statusLabels[entry.status]}</span>
                </div>

                <!-- Photo Area -->
                <div class="feed-card-photo">
                  ${entry.photoUrl 
                    ? `<img src="${entry.photoUrl}" alt="${entry.caption}" style="filter: sepia(0.3) contrast(0.95) brightness(1.05);">`
                    : `${habit ? habit.icon : '📷'}<span class="photo-placeholder-text">Foto bukti misi</span>`
                  }
                </div>

                <!-- Card Body -->
                <div class="feed-card-body">
                  <span class="feed-habit-tag" style="background:${habit ? habit.color + '33' : 'rgba(255,255,255,0.1)'}; color:${habit ? habit.color : '#fff'};">
                    ${habit ? habit.icon : ''} ${habit ? habit.name : ''}
                  </span>
                  
                  <div class="feed-caption">"${entry.caption}"</div>

                  ${entry.teacherComment ? `
                    <div style="background:rgba(255,255,255,0.05); border-radius:10px; padding:10px; margin-bottom:10px;">
                      <div style="font-size:11px; opacity:0.4; margin-bottom:4px;">Komentar Guru:</div>
                      <div style="font-size:13px;">"${entry.teacherComment}"</div>
                      ${entry.teacherSticker ? `<div style="font-size:24px; margin-top:6px;">${entry.teacherSticker}</div>` : ''}
                    </div>
                  ` : ''}

                  ${entry.status === 'pending' ? `
                    <div class="feed-actions">
                      <button class="btn btn-success" onclick="TeacherFeedPage.openApproveModal(${entry.id})">
                        ✅ Verifikasi
                      </button>
                      <button class="btn btn-danger" onclick="TeacherFeedPage.openRejectModal(${entry.id})">
                        ☁️ Revisi
                      </button>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('') : `
            <div class="empty-state" style="padding:48px 16px;">
              <div style="font-size:48px; margin-bottom:12px;">🔦</div>
              <p style="font-size:14px; opacity:0.5;">Tidak ada entri ${this.filterStatus === 'pending' ? 'yang menunggu' : 'untuk filter ini'}</p>
            </div>
          `}
        </div>

        <div style="height: 24px;"></div>
      </div>
    `;

    Navbar.mount('teacher');
  },

  setFilter(status) {
    this.filterStatus = status;
    this.selectedEntries.clear();
    Helpers.vibrate();
    const container = document.getElementById('page-content');
    this.render(container);
  },

  toggleSelect(entryId) {
    if (this.selectedEntries.has(entryId)) {
      this.selectedEntries.delete(entryId);
    } else {
      this.selectedEntries.add(entryId);
    }
    Helpers.vibrate();
    const container = document.getElementById('page-content');
    this.render(container);
  },

  clearSelection() {
    this.selectedEntries.clear();
    const container = document.getElementById('page-content');
    this.render(container);
  },

  batchApprove() {
    this.selectedEntries.forEach(id => {
      AppState.approveEntry(id, '👍', 'Bagus, Kapten! Lanjutkan!');
    });
    Helpers.showToast(`${this.selectedEntries.size} entri berhasil diverifikasi!`, '✅');
    Helpers.vibrate(100);
    this.selectedEntries.clear();
    const container = document.getElementById('page-content');
    this.render(container);
  },

  openApproveModal(entryId) {
    Helpers.vibrate();
    const entry = LOGBOOK_ENTRIES.find(e => e.id === entryId);
    const student = AppState.getStudent(entry.studentId);
    const habit = HABITS.find(h => h.id === entry.habitId);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'approve-modal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div style="font-size:40px; margin-bottom:8px;">✅</div>
          <h3>Verifikasi Misi</h3>
          <p style="font-size:12px; opacity:0.6; margin-top:4px;">${student.name} — ${habit.name}</p>
        </div>

        <div style="margin-bottom:16px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:8px;">
            Pilih Stiker Harta Karun:
          </label>
          <div class="sticker-grid" id="sticker-grid">
            ${['🪙', '💎', '🏆', '⭐', '🌟', '💪'].map((s, i) => `
              <div class="sticker-item ${i === 0 ? 'selected' : ''}" 
                   onclick="TeacherFeedPage.selectSticker('${s}', this)">${s}</div>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:8px;">
            Tulis Komentar:
          </label>
          <textarea class="input-field" rows="2" id="teacher-comment" 
                    placeholder="Contoh: Hebat sekali, Kapten! Terus semangat!"
                    style="color: var(--foam-white);">Bagus sekali, Kapten! 🌟</textarea>
        </div>

        <button class="btn btn-success btn-lg" style="width:100%;" 
                onclick="TeacherFeedPage.submitApproval(${entryId})">
          ✅ Verifikasi & Kirim
        </button>
      </div>
    `;

    document.body.appendChild(modal);
    this.selectedSticker = '🪙';
  },

  selectedSticker: '🪙',

  selectSticker(sticker, element) {
    document.querySelectorAll('#sticker-grid .sticker-item').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    this.selectedSticker = sticker;
    Helpers.vibrate();
  },

  submitApproval(entryId) {
    const comment = document.getElementById('teacher-comment')?.value || 'Bagus, Kapten!';
    AppState.approveEntry(entryId, this.selectedSticker, comment);
    
    document.getElementById('approve-modal').remove();
    Helpers.showToast('Misi berhasil diverifikasi!', '✅');
    Helpers.vibrate(100);
    
    const container = document.getElementById('page-content');
    this.render(container);
  },

  openRejectModal(entryId) {
    Helpers.vibrate();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'reject-modal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div style="font-size:40px; margin-bottom:8px;">☁️</div>
          <h3>Awan Mendung</h3>
          <p style="font-size:12px; opacity:0.6; margin-top:4px;">Beri saran perbaikan dengan halus</p>
        </div>

        <div style="margin-bottom:16px;">
          <textarea class="input-field" rows="3" id="reject-comment" 
                    placeholder="Contoh: Coba foto dengan lebih jelas ya, Kapten!"
                    style="color: var(--foam-white);">Coba lagi ya, Kapten! Pastikan foto lebih jelas. 📸</textarea>
        </div>

        <button class="btn btn-danger btn-lg" style="width:100%;" 
                onclick="TeacherFeedPage.submitRejection(${entryId})">
          ☁️ Kirim Saran
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  },

  submitRejection(entryId) {
    const comment = document.getElementById('reject-comment')?.value || 'Coba lagi ya, Kapten!';
    AppState.rejectEntry(entryId, comment);
    
    document.getElementById('reject-modal').remove();
    Helpers.showToast('Saran perbaikan dikirim', '☁️');
    
    const container = document.getElementById('page-content');
    this.render(container);
  }
};
