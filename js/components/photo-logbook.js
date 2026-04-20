/* ==========================================
   SAPTARA — Photo Logbook Component
   "Buku Log Kapten"
   Live Camera + Gallery Upload
   ========================================== */

const PhotoLogbook = {
  selectedMission: null,
  capturedPhotoData: null,
  cameraStream: null,

  render(student) {
    const entries = AppState.getStudentLogbook(student.id);
    
    let html = `
      <!-- Upload Area -->
      <div class="logbook-upload-area" onclick="PhotoLogbook.openUpload()" id="upload-area">
        <div class="upload-icon">📸</div>
        <div class="upload-text">Ambil Foto Misi</div>
        <div class="upload-hint">Ketuk untuk membuka kamera</div>
      </div>

      <!-- Photo Grid -->
      <div class="logbook-grid">
        ${entries.length > 0 ? entries.map((entry, i) => {
          const habit = HABITS.find(h => h.id === entry.habitId);
          const statusClass = entry.status.replace('_', '-');
          const statusText = {
            'verified': '✅ Terverifikasi',
            'pending': '⏳ Menunggu',
            'needs_revision': '☁️ Ulangi'
          }[entry.status];

          return `
            <div class="photo-card animate-fade-up" style="${Helpers.staggerDelay(i, 100)}"
                 onclick="PhotoLogbook.openEntry(${entry.id})">
              <div class="photo-frame">
                ${entry.photoUrl 
                  ? `<img src="${entry.photoUrl}" alt="${entry.caption}" style="filter: sepia(0.5) contrast(0.9) brightness(1.05);">`
                  : habit.icon
                }
              </div>
              <div class="photo-info">
                <div class="photo-caption">${entry.caption}</div>
                <div class="photo-meta">
                  <span class="photo-status ${statusClass}">${statusText}</span>
                </div>
                <div class="photo-meta" style="margin-top:4px;">
                  <span>${entry.time}</span>
                  <span>•</span>
                  <span>${habit.name}</span>
                </div>
                ${entry.teacherSticker ? `
                  <div style="margin-top:6px; font-size:20px;">${entry.teacherSticker}</div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('') : `
          <div class="empty-state" style="grid-column: span 2;">
            <div class="emoji-icon">📖</div>
            <p>Logbook masih kosong.<br>Mulai dokumentasikan petualanganmu!</p>
          </div>
        `}
      </div>
    `;

    return html;
  },

  openUpload() {
    Helpers.vibrate();
    this.capturedPhotoData = null;
    this.stopCamera();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'upload-modal';

    // Clean up camera on modal close
    modal.onclick = (e) => {
      if (e.target === modal) {
        PhotoLogbook.stopCamera();
        modal.remove();
      }
    };

    modal.innerHTML = `
      <div class="modal-content" style="max-height:90vh; overflow-y:auto;">
        <div class="modal-header">
          <div style="font-size:48px; margin-bottom:8px;">📸</div>
          <h3>Rekam Misimu!</h3>
          <p style="font-size:13px; opacity:0.7; margin-top:4px;">Pilih misi, ambil foto, dan ceritakan!</p>
        </div>
        
        <!-- Step 1: Pick Mission -->
        <div style="margin-bottom:16px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:8px;">1️⃣ Pilih Misi:</label>
          <div style="display:flex; flex-direction:column; gap:6px; max-height:200px; overflow-y:auto;">
            ${HABITS.map(h => `
              <div class="mission-card" onclick="PhotoLogbook.selectMission(${h.id}, this)" 
                   style="cursor:pointer;" data-habit="${h.id}">
                <div class="mission-icon" style="width:36px; height:36px; font-size:18px; background:${h.color}22;">
                  ${h.icon}
                </div>
                <div class="mission-info">
                  <div class="mission-name" style="font-size:13px;">${h.name}</div>
                </div>
                <div class="custom-checkbox" id="check-${h.id}"></div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Step 2: Live Camera / Photo -->
        <div style="margin-bottom:16px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:8px;">2️⃣ Ambil Foto Bukti:</label>
          
          <!-- Camera / Preview Area -->
          <div id="photo-preview-area" style="
            width:100%; aspect-ratio:4/3; border-radius:12px; overflow:hidden;
            background: rgba(0,0,0,0.4); border:2px solid rgba(255,255,255,0.15);
            display:flex; flex-direction:column; align-items:center; justify-content:center;
            transition: all 0.3s ease; margin-bottom:8px; position:relative;
          ">
            <!-- Placeholder (shown initially) -->
            <div id="photo-placeholder" style="text-align:center;">
              <div style="font-size:48px; margin-bottom:8px; opacity:0.6;">📷</div>
              <div style="font-size:14px; font-weight:600;">Ketuk Kamera atau Galeri</div>
              <div style="font-size:11px; opacity:0.4; margin-top:4px;">Foto langsung dari kamera atau pilih dari galeri HP</div>
            </div>
            
            <!-- Live Camera Video (hidden initially) -->
            <video id="camera-video" autoplay playsinline muted style="
              display:none; width:100%; height:100%; object-fit:cover;
            "></video>

            <!-- Captured Photo Preview (hidden initially) -->
            <img id="photo-preview-img" src="" alt="Preview" style="
              display:none; width:100%; height:100%; object-fit:cover;
              filter: sepia(0.4) contrast(0.95) brightness(1.05);
            ">

            <!-- Shutter Button (shown when camera is active) -->
            <button id="camera-capture-btn" onclick="PhotoLogbook.captureFromCamera()" style="
              display:none; position:absolute; bottom:12px; left:50%; transform:translateX(-50%);
              width:64px; height:64px; border-radius:50%; border:4px solid rgba(255,255,255,0.9);
              background: rgba(255,59,48,0.85); cursor:pointer; z-index:10;
              box-shadow: 0 4px 20px rgba(0,0,0,0.5);
              transition: transform 0.15s ease, box-shadow 0.15s ease;
              display:none; align-items:center; justify-content:center;
            ">
              <div style="width:26px; height:26px; background:white; border-radius:50%;"></div>
            </button>

            <!-- Flip Camera Button (switch front/rear) -->
            <button id="camera-flip-btn" onclick="PhotoLogbook.flipCamera()" style="
              display:none; position:absolute; top:8px; left:8px;
              background: rgba(0,0,0,0.5); color:white; border:none;
              border-radius:50%; width:36px; height:36px; font-size:16px;
              cursor:pointer; backdrop-filter: blur(4px); z-index:10;
            ">🔄</button>

            <!-- Retake button (shown when photo is captured) -->
            <button id="retake-btn" onclick="PhotoLogbook.retakePhoto()" style="
              display:none; position:absolute; top:8px; right:8px;
              background: rgba(0,0,0,0.6); color:white; border:none;
              border-radius:20px; padding:6px 14px; font-size:12px; cursor:pointer;
              backdrop-filter: blur(4px); z-index:10;
            ">🔄 Foto Ulang</button>
          </div>
          
          <!-- Camera/Gallery buttons -->
          <div style="display:flex; gap:8px;" id="camera-gallery-btns">
            <button class="btn btn-primary" style="flex:1; font-size:13px;" id="btn-open-camera" onclick="PhotoLogbook.openLiveCamera()">
              📸 Kamera
            </button>
            <button class="btn btn-ghost" style="flex:1; font-size:13px;" onclick="PhotoLogbook.triggerGallery()">
              🖼️ Galeri
            </button>
          </div>
        </div>

        <!-- Step 3: Caption -->
        <div style="margin-bottom:16px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:8px;">3️⃣ Ceritakan Misimu:</label>
          <textarea class="input-field" rows="2" placeholder="Contoh: Aku sudah membantu ibu memasak..." 
                    id="caption-input" style="color: var(--foam-white);"></textarea>
        </div>

        <!-- Submit -->
        <button class="btn btn-gold btn-lg" style="width:100%;" onclick="PhotoLogbook.submitEntry()" id="submit-btn">
          🚀 Kirim Jejak Misi
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  },

  // Current camera facing mode
  currentFacingMode: 'environment',

  // Open live camera viewfinder
  async openLiveCamera() {
    Helpers.vibrate();
    
    const video = document.getElementById('camera-video');
    const placeholder = document.getElementById('photo-placeholder');
    const captureBtn = document.getElementById('camera-capture-btn');
    const flipBtn = document.getElementById('camera-flip-btn');
    const previewImg = document.getElementById('photo-preview-img');
    const retakeBtn = document.getElementById('retake-btn');
    const previewArea = document.getElementById('photo-preview-area');
    const cameraBtn = document.getElementById('btn-open-camera');

    if (!video || !placeholder) return;

    // Hide preview if retaking
    previewImg.style.display = 'none';
    retakeBtn.style.display = 'none';

    // Stop any existing stream
    this.stopCamera();

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });

      this.cameraStream = stream;
      video.srcObject = stream;
      
      // Show video + capture button, hide placeholder
      placeholder.style.display = 'none';
      video.style.display = 'block';
      captureBtn.style.display = 'flex';
      flipBtn.style.display = 'flex';
      
      // Update styling
      previewArea.style.border = '2px solid var(--wave-cyan)';
      previewArea.style.boxShadow = '0 0 24px rgba(0, 180, 216, 0.3)';
      
      if (cameraBtn) {
        cameraBtn.innerHTML = '🔴 Kamera Aktif';
        cameraBtn.disabled = true;
        cameraBtn.style.opacity = '0.5';
      }

      Helpers.showToast('Kamera aktif! Arahkan dan tekan tombol 🔴', '📸');

    } catch (err) {
      console.error('Camera error:', err);
      
      if (err.name === 'NotAllowedError') {
        Helpers.showToast('Izin kamera ditolak. Izinkan di pengaturan browser!', '⚠️');
      } else if (err.name === 'NotFoundError' || err.name === 'NotReadableError') {
        Helpers.showToast('Kamera tidak ditemukan. Gunakan Galeri 🖼️', '⚠️');
      } else {
        Helpers.showToast('Gagal akses kamera. Coba Galeri ya!', '⚠️');
      }
    }
  },

  // Flip between front and rear camera
  async flipCamera() {
    Helpers.vibrate();
    this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
    this.stopCamera();
    await this.openLiveCamera();
  },

  // Capture still frame from live camera
  captureFromCamera() {
    Helpers.vibrate(100);
    
    const video = document.getElementById('camera-video');
    const previewImg = document.getElementById('photo-preview-img');
    const captureBtn = document.getElementById('camera-capture-btn');
    const flipBtn = document.getElementById('camera-flip-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const previewArea = document.getElementById('photo-preview-area');
    const cameraBtn = document.getElementById('btn-open-camera');

    if (!video || !previewImg) return;

    // Flash effect
    previewArea.style.background = 'white';
    setTimeout(() => { previewArea.style.background = 'rgba(0,0,0,0.4)'; }, 100);

    // Create canvas and capture frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');

    // Mirror for front camera
    if (this.currentFacingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Save as JPEG
    this.capturedPhotoData = canvas.toDataURL('image/jpeg', 0.85);

    // Show captured image, hide video
    previewImg.src = this.capturedPhotoData;
    previewImg.style.display = 'block';
    video.style.display = 'none';
    captureBtn.style.display = 'none';
    flipBtn.style.display = 'none';
    retakeBtn.style.display = 'block';

    // Stop camera
    this.stopCamera();

    // Update styling
    previewArea.style.border = '3px solid var(--seaweed-green)';
    previewArea.style.boxShadow = '0 0 16px rgba(6, 214, 160, 0.3)';

    if (cameraBtn) {
      cameraBtn.innerHTML = '📸 Kamera';
      cameraBtn.disabled = false;
      cameraBtn.style.opacity = '1';
    }

    Helpers.showToast('Foto berhasil ditangkap! 📸', '✅');
  },

  // Retake photo
  retakePhoto() {
    Helpers.vibrate();
    this.capturedPhotoData = null;
    
    const previewImg = document.getElementById('photo-preview-img');
    const retakeBtn = document.getElementById('retake-btn');
    if (previewImg) previewImg.style.display = 'none';
    if (retakeBtn) retakeBtn.style.display = 'none';

    this.openLiveCamera();
  },

  // Stop camera stream
  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    const video = document.getElementById('camera-video');
    if (video) video.srcObject = null;
  },

  // Open gallery (file picker from phone gallery)
  triggerGallery() {
    Helpers.vibrate();

    // Stop camera if running
    this.stopCamera();

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // No capture attribute = opens gallery/file picker on mobile
    input.onchange = (e) => this.onGallerySelected(e);
    input.click();
  },

  // Handle photo from gallery
  onGallerySelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Helpers.showToast('Pilih file gambar ya, Kapten!', '⚠️');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Helpers.showToast('Foto terlalu besar! Maksimal 10MB', '⚠️');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.capturedPhotoData = e.target.result;
      
      const preview = document.getElementById('photo-preview-img');
      const placeholder = document.getElementById('photo-placeholder');
      const previewArea = document.getElementById('photo-preview-area');
      const video = document.getElementById('camera-video');
      const captureBtn = document.getElementById('camera-capture-btn');
      const flipBtn = document.getElementById('camera-flip-btn');
      const retakeBtn = document.getElementById('retake-btn');
      const cameraBtn = document.getElementById('btn-open-camera');
      
      if (preview && placeholder) {
        // Hide video & placeholder, show photo
        if (video) video.style.display = 'none';
        if (captureBtn) captureBtn.style.display = 'none';
        if (flipBtn) flipBtn.style.display = 'none';
        placeholder.style.display = 'none';

        preview.src = this.capturedPhotoData;
        preview.style.display = 'block';
        if (retakeBtn) retakeBtn.style.display = 'block';
        
        if (previewArea) {
          previewArea.style.border = '3px solid var(--seaweed-green)';
          previewArea.style.boxShadow = '0 0 16px rgba(6, 214, 160, 0.3)';
        }

        if (cameraBtn) {
          cameraBtn.innerHTML = '📸 Kamera';
          cameraBtn.disabled = false;
          cameraBtn.style.opacity = '1';
        }
      }

      Helpers.showToast('Foto dari galeri berhasil dipilih! 🖼️', '✅');
      Helpers.vibrate(50);
    };
    reader.readAsDataURL(file);
  },

  selectMission(habitId, element) {
    document.querySelectorAll('#upload-modal .custom-checkbox').forEach(cb => {
      cb.classList.remove('checked');
    });
    document.querySelectorAll('#upload-modal .mission-card').forEach(mc => {
      mc.style.borderColor = 'transparent';
    });
    
    document.getElementById(`check-${habitId}`).classList.add('checked');
    element.style.borderColor = 'var(--gold-coin)';
    this.selectedMission = habitId;
    Helpers.vibrate();
  },

  submitEntry() {
    if (!this.selectedMission) {
      Helpers.showToast('Pilih misi dulu, Kapten! ☝️', '⚠️');
      return;
    }

    if (!this.capturedPhotoData) {
      Helpers.showToast('Ambil foto dulu sebagai bukti! 📸', '⚠️');
      return;
    }

    const caption = document.getElementById('caption-input')?.value || '';
    if (!caption.trim()) {
      Helpers.showToast('Ceritakan misimu dulu ya! ✍️', '⚠️');
      return;
    }

    const student = AppState.getCurrentStudent();
    const habit = HABITS.find(h => h.id === this.selectedMission);

    const newEntry = {
      id: LOGBOOK_ENTRIES.length + 1,
      studentId: student.id,
      habitId: this.selectedMission,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      photoUrl: this.capturedPhotoData,
      caption: caption,
      status: 'pending',
      teacherComment: null,
      teacherSticker: null,
      xpEarned: 0
    };

    LOGBOOK_ENTRIES.unshift(newEntry);
    
    if (!student.completedToday.includes(this.selectedMission)) {
      AppState.toggleHabit(student.id, this.selectedMission);
    }

    // Clean up
    this.stopCamera();
    document.getElementById('upload-modal').remove();
    
    Helpers.showToast(`Jejak "${habit.name}" berhasil dikirim! ⏳`, '📸');
    Helpers.vibrate(100);

    const container = document.getElementById('page-content');
    if (typeof StudentLogbookPage !== 'undefined') {
      StudentLogbookPage.render(container);
    }

    this.selectedMission = null;
    this.capturedPhotoData = null;
  },

  openEntry(entryId) {
    const entry = LOGBOOK_ENTRIES.find(e => e.id === entryId);
    if (!entry) return;
    
    const habit = HABITS.find(h => h.id === entry.habitId);
    
    Helpers.vibrate();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'entry-modal';
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          ${entry.photoUrl 
            ? `<div style="width:100%; aspect-ratio:4/3; border-radius:12px; overflow:hidden; margin-bottom:12px; border:3px solid var(--sand-dark);">
                <img src="${entry.photoUrl}" alt="${entry.caption}" style="width:100%; height:100%; object-fit:cover; filter: sepia(0.4) contrast(0.95) brightness(1.05);">
              </div>`
            : `<div style="font-size:56px; margin-bottom:8px;">${habit.icon}</div>`
          }
          <h3>${habit.name}</h3>
          <p style="font-size:12px; opacity:0.6; margin-top:4px;">${entry.date} • ${entry.time}</p>
        </div>
        
        <p style="font-size:14px; margin-bottom:16px; text-align:center; line-height:1.6;">
          "${entry.caption}"
        </p>

        ${entry.teacherComment ? `
          <div style="background: rgba(255,255,255,0.1); border-radius:12px; padding:12px; margin-bottom:12px;">
            <div style="font-size:12px; opacity:0.6; margin-bottom:6px;">🍶 Pesan dalam Botol dari Guru:</div>
            <p style="font-size:14px; font-weight:600;">"${entry.teacherComment}"</p>
            ${entry.teacherSticker ? `<div style="font-size:32px; margin-top:8px;">${entry.teacherSticker}</div>` : ''}
          </div>
        ` : ''}

        ${entry.xpEarned > 0 ? `
          <div style="text-align:center; margin-bottom:12px;">
            <span class="badge badge-gold" style="font-size:14px; padding:6px 16px;">+${entry.xpEarned} Mil Laut 🎉</span>
          </div>
        ` : ''}

        <button class="btn btn-ghost btn-lg" style="width:100%;" onclick="document.getElementById('entry-modal').remove()">
          Tutup
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  }
};
