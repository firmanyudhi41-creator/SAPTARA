/* ==========================================
   SAPTARA — Landing Page
   Splash Screen + Role Selection + Login
   + "Daftarkan Kapalmu" (Class Registration)
   ========================================== */

const LandingPage = {
  render(container) {
    // Remove nav and mascot on landing
    Navbar.remove();
    Mascot.remove();
    MessageBottle.remove();

    container.innerHTML = `
      <div class="landing-page" id="landing-page">
        <!-- Animated waves background -->
        <div class="ocean-waves" style="z-index:0;">
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>

        <!-- Logo -->
        <div class="landing-logo" style="position:relative; z-index:1;">
          <img src="assets/logo-7kaih.png" alt="Gerakan Tujuh Kebiasaan" 
               style="width:120px; height:120px; border-radius:50%; object-fit:cover; 
                      box-shadow: 0 4px 20px rgba(0,0,0,0.3); background:white;">
        </div>

        <!-- Title -->
        <h1 class="landing-title" style="position:relative; z-index:1;">SAPTARA</h1>
        <p class="landing-subtitle" style="position:relative; z-index:1; color:#FFFFFF;">Sapta Karakter Anak Nusantara</p>
        <p class="landing-tagline" style="position:relative; z-index:1; color:#FFFFFF;">
          "Ekspedisi Tujuh Samudra — Kumpulkan 7 Mustika Nusantara!"
        </p>

        <!-- Ship Animation -->
        <div class="landing-ship" style="position:relative; z-index:1;">⛵</div>

        <!-- Role Selection Buttons -->
        <div class="landing-buttons" style="position:relative; z-index:1;">
          <button class="btn btn-xl btn-primary" id="btn-student" onclick="LandingPage.showLogin('student')">
            🧒 Kapten Cilik
          </button>
          <button class="btn btn-xl btn-gold" id="btn-teacher" onclick="LandingPage.showTeacherOptions()">
            👨‍🏫 Laksamana
          </button>
        </div>

        <!-- Version -->
        <p style="position:relative; z-index:1; font-size:11px; opacity:0.3; margin-top:32px;">
          Versi 1.0 — Ekspedisi Tujuh Samudra
        </p>
      </div>
    `;
  },

  // ═══════════════════════════════════
  // Teacher: Show options (Login or Register)
  // ═══════════════════════════════════
  showTeacherOptions() {
    Helpers.vibrate(50);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'teacher-options-modal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
      <div class="modal-content" style="max-width:340px;">
        <div class="modal-header">
          <div style="font-size:56px; margin-bottom:8px;">🔦</div>
          <h3 style="font-size:18px;">👨‍🏫 Laksamana</h3>
          <p style="font-size:12px; opacity:0.6; margin-top:4px;">Pilih aksi untuk melanjutkan</p>
        </div>

        <!-- Login to existing class -->
        <button class="btn btn-gold btn-lg" style="width:100%; font-size:15px; margin-bottom:10px;" 
                onclick="document.getElementById('teacher-options-modal').remove(); LandingPage.showLogin('teacher')">
          🔑 Masuk Kelas
        </button>

        <!-- Register new class -->
        <button class="btn btn-primary btn-lg" style="width:100%; font-size:15px; margin-bottom:10px;" 
                onclick="document.getElementById('teacher-options-modal').remove(); LandingPage.showRegisterClass()">
          ⛵ Daftarkan Kapalmu
        </button>

        <!-- Registered classes count -->
        <div style="text-align:center; font-size:11px; opacity:0.4; margin-bottom:12px;">
          ${REGISTERED_CLASSES.length} kelas terdaftar
        </div>

        <button class="btn btn-ghost" style="width:100%; font-size:13px;" 
                onclick="document.getElementById('teacher-options-modal').remove()">
          ← Kembali
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  },

  // ═══════════════════════════════════
  // "Daftarkan Kapalmu" — Register New Class
  // ═══════════════════════════════════
  showRegisterClass() {
    Helpers.vibrate(50);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'register-class-modal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
      <div class="modal-content" style="max-width:380px; max-height:90vh; overflow-y:auto;">
        <div class="modal-header">
          <div style="font-size:56px; margin-bottom:8px;">⛵</div>
          <h3 style="font-size:20px;">Daftarkan Kapalmu!</h3>
          <p style="font-size:12px; opacity:0.6; margin-top:4px;">Buat kelas baru untuk memulai ekspedisi bersama murid-muridmu</p>
        </div>

        <!-- Teacher Name -->
        <div style="margin-bottom:14px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">
            👤 Nama Guru:
          </label>
          <input type="text" class="input-field" id="reg-teacher-name" 
                 placeholder="Contoh: Bu Sari"
                 style="color: var(--foam-white); font-size:15px; padding:12px 16px;"
                 autocomplete="name">
        </div>

        <!-- School Name -->
        <div style="margin-bottom:14px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">
            🏫 Nama Sekolah:
          </label>
          <input type="text" class="input-field" id="reg-school-name" 
                 placeholder="Contoh: SD Nusantara 01"
                 style="color: var(--foam-white); font-size:15px; padding:12px 16px;"
                 autocomplete="organization">
        </div>

        <!-- Class Code -->
        <div style="margin-bottom:14px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">
            📋 Kode Kelas:
          </label>
          <input type="text" class="input-field" id="reg-class-code" 
                 placeholder="Contoh: 4A"
                 style="color: var(--foam-white); font-size:15px; padding:12px 16px; text-transform:uppercase;"
                 maxlength="10">
          <div style="font-size:10px; opacity:0.4; margin-top:4px;">Kode unik untuk kelas ini (murid akan menggunakan kode ini untuk login)</div>
        </div>

        <!-- Ship Name -->
        <div style="margin-bottom:20px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">
            🚢 Nama Kapal (Opsional):
          </label>
          <input type="text" class="input-field" id="reg-ship-name" 
                 placeholder="Contoh: Kapal Perkasa 4A"
                 style="color: var(--foam-white); font-size:15px; padding:12px 16px;">
          <div style="font-size:10px; opacity:0.4; margin-top:4px;">Nama kapal untuk kelas ini — bisa nama yang seru!</div>
        </div>

        <!-- Submit -->
        <button class="btn btn-gold btn-lg" style="width:100%; font-size:16px;" 
                onclick="LandingPage.submitRegisterClass()">
          ⚓ Daftarkan Kapal!
        </button>

        <button class="btn btn-ghost" style="width:100%; margin-top:8px; font-size:13px;" 
                onclick="document.getElementById('register-class-modal').remove(); LandingPage.showTeacherOptions();">
          ← Kembali
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Auto-focus
    setTimeout(() => {
      document.getElementById('reg-teacher-name')?.focus();
    }, 300);

    // Enter key
    setTimeout(() => {
      modal.querySelectorAll('.input-field').forEach(input => {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') LandingPage.submitRegisterClass();
        });
      });
    }, 100);
  },

  // Submit class registration
  submitRegisterClass() {
    const teacherName = document.getElementById('reg-teacher-name')?.value?.trim() || '';
    const schoolName = document.getElementById('reg-school-name')?.value?.trim() || '';
    const classCode = document.getElementById('reg-class-code')?.value?.trim().toUpperCase() || '';
    const shipName = document.getElementById('reg-ship-name')?.value?.trim() || '';

    // Validate
    if (!teacherName || teacherName.length < 2) {
      Helpers.showToast('Isi nama guru minimal 2 huruf! 👤', '⚠️');
      document.getElementById('reg-teacher-name')?.focus();
      return;
    }

    if (!schoolName || schoolName.length < 3) {
      Helpers.showToast('Isi nama sekolah minimal 3 huruf! 🏫', '⚠️');
      document.getElementById('reg-school-name')?.focus();
      return;
    }

    if (!classCode) {
      Helpers.showToast('Isi kode kelas! 📋', '⚠️');
      document.getElementById('reg-class-code')?.focus();
      return;
    }

    // Check duplicate class code
    const exists = REGISTERED_CLASSES.find(c => c.classCode === classCode && c.schoolName.toLowerCase() === schoolName.toLowerCase());
    if (exists) {
      Helpers.showToast(`Kelas ${classCode} di ${schoolName} sudah terdaftar!`, '⚠️');
      return;
    }

    // Auto-generate ship name if empty
    const finalShipName = shipName || `Kapal ${schoolName.split(' ').slice(-1)[0]} ${classCode}`;

    // Create new class
    const newClass = {
      id: Math.max(...REGISTERED_CLASSES.map(c => c.id), 0) + 1,
      teacherName: teacherName,
      schoolName: schoolName,
      classCode: classCode,
      shipName: finalShipName,
      createdAt: new Date().toISOString().split('T')[0]
    };

    REGISTERED_CLASSES.push(newClass);
    Helpers.vibrate(100);

    // Close register modal
    document.getElementById('register-class-modal').remove();

    // Show success
    LandingPage.showRegistrationSuccess(newClass);
  },

  // Show registration success with class details
  showRegistrationSuccess(classInfo) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'register-success-modal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
      <div class="modal-content" style="max-width:360px;">
        <div class="modal-header">
          <div style="font-size:64px; margin-bottom:8px; animation: shipBob 2s ease-in-out infinite;">🚢</div>
          <h3 style="font-size:20px; color:var(--gold-coin);">Kapal Berhasil Didaftarkan!</h3>
          <p style="font-size:12px; opacity:0.6; margin-top:4px;">Kapalmu siap berlayar bersama para Kapten Cilik!</p>
        </div>

        <!-- Class Info Card -->
        <div style="background:rgba(255,255,255,0.08); border-radius:14px; padding:16px; margin-bottom:16px; border:1px solid rgba(255,183,3,0.2);">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
            <div style="font-size:36px;">⛵</div>
            <div>
              <div style="font-family:var(--font-heading); font-size:16px; color:var(--gold-coin);">${classInfo.shipName}</div>
              <div style="font-size:11px; opacity:0.5;">${classInfo.schoolName}</div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div style="background:rgba(255,255,255,0.06); border-radius:10px; padding:10px; text-align:center;">
              <div style="font-size:10px; opacity:0.4; margin-bottom:2px;">Guru</div>
              <div style="font-size:13px; font-weight:700;">${classInfo.teacherName}</div>
            </div>
            <div style="background:rgba(255,255,255,0.06); border-radius:10px; padding:10px; text-align:center;">
              <div style="font-size:10px; opacity:0.4; margin-bottom:2px;">Kode Kelas</div>
              <div style="font-family:var(--font-accent); font-size:20px; font-weight:900; color:var(--gold-coin);">${classInfo.classCode}</div>
            </div>
          </div>
        </div>

        <div style="background:rgba(255,183,3,0.1); border-radius:10px; padding:10px; margin-bottom:16px; font-size:11px; text-align:center; border:1px dashed rgba(255,183,3,0.3);">
          📣 Bagikan kode <strong style="color:var(--gold-coin); font-size:14px;">${classInfo.classCode}</strong> ke murid-muridmu agar mereka bisa login sebagai Kapten Cilik!
        </div>

        <!-- Enter as teacher -->
        <button class="btn btn-gold btn-lg" style="width:100%; font-size:15px;" 
                onclick="document.getElementById('register-success-modal').remove(); LandingPage.enterAsTeacher('${classInfo.teacherName}', '${classInfo.classCode}');">
          🔦 Masuk Sebagai Laksamana
        </button>

        <button class="btn btn-ghost" style="width:100%; margin-top:8px; font-size:13px;" 
                onclick="document.getElementById('register-success-modal').remove();">
          ← Kembali ke Beranda
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  },

  // Direct enter as teacher (after registration)
  enterAsTeacher(teacherName, classCode) {
    AppState.currentRole = 'teacher';
    AppState.loginName = teacherName;
    AppState.loginClass = classCode;

    Helpers.vibrate(100);
    Helpers.showToast(`Selamat datang, ${teacherName}! 🔦`, '👋');

    const page = document.getElementById('landing-page');
    if (page) {
      page.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      page.style.opacity = '0';
      page.style.transform = 'scale(0.95)';
    }

    setTimeout(() => {
      Navbar.mount('teacher');
      Router.navigate('/teacher/feed');
    }, 400);
  },

  // ═══════════════════════════════════
  // Login Modal (Student or Teacher)
  // ═══════════════════════════════════
  showLogin(role) {
    Helpers.vibrate(50);

    const isStudent = role === 'student';
    const title = isStudent ? '🧒 Ahoy, Kapten Cilik!' : '🔑 Masuk Kelas';
    const subtitle = isStudent 
      ? 'Masukkan nama dan kode kelasmu untuk mulai berlayar!'
      : 'Masukkan nama guru dan kode kelas untuk masuk ke Menara Suar!';
    const icon = isStudent ? '⛵' : '🔦';
    const btnColor = isStudent ? 'btn-primary' : 'btn-gold';
    const btnText = isStudent ? '🚀 Mulai Berlayar!' : '🔦 Masuk Menara Suar';

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'login-modal';
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    modal.innerHTML = `
      <div class="modal-content" style="max-width:340px;">
        <div class="modal-header">
          <div style="font-size:56px; margin-bottom:8px;">${icon}</div>
          <h3 style="font-size:18px;">${title}</h3>
          <p style="font-size:12px; opacity:0.6; margin-top:4px;">${subtitle}</p>
        </div>

        <!-- Name Input -->
        <div style="margin-bottom:14px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">
            ${isStudent ? '👤 Nama Kapten:' : '👤 Nama Guru:'}
          </label>
          <input type="text" class="input-field" id="login-name" 
                 placeholder="${isStudent ? 'Contoh: Arya Pratama' : 'Contoh: Bu Sari'}"
                 style="color: var(--foam-white); font-size:15px; padding:12px 16px;"
                 autocomplete="name">
        </div>

        <!-- Class Code Input -->
        <div style="margin-bottom:20px;">
          <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">
            🏫 Kode Kelas:
          </label>
          <input type="text" class="input-field" id="login-class" 
                 placeholder="Contoh: 4A"
                 style="color: var(--foam-white); font-size:15px; padding:12px 16px; text-transform:uppercase;"
                 autocomplete="off"
                 maxlength="10">
        </div>

        <!-- Login Button -->
        <button class="btn ${btnColor} btn-lg" style="width:100%; font-size:16px;" 
                onclick="LandingPage.submitLogin('${role}')" id="login-submit-btn">
          ${btnText}
        </button>

        <!-- Back Button -->
        <button class="btn btn-ghost" style="width:100%; margin-top:8px; font-size:13px;" 
                onclick="document.getElementById('login-modal').remove()${isStudent ? '' : '; LandingPage.showTeacherOptions()'}">
          ← Kembali
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Auto-focus name input
    setTimeout(() => {
      document.getElementById('login-name')?.focus();
    }, 300);

    // Enter key submits
    setTimeout(() => {
      modal.querySelectorAll('.input-field').forEach(input => {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') LandingPage.submitLogin(role);
        });
      });
    }, 100);
  },

  // ═══════════════════════════════════
  // Submit Login
  // ═══════════════════════════════════
  submitLogin(role) {
    const nameInput = document.getElementById('login-name');
    const classInput = document.getElementById('login-class');
    
    const name = nameInput?.value?.trim() || '';
    const classCode = classInput?.value?.trim().toUpperCase() || '';

    // Validate name
    if (!name) {
      Helpers.showToast('Isi namamu dulu ya! 👤', '⚠️');
      nameInput?.focus();
      nameInput.style.border = '2px solid var(--sunset-coral)';
      setTimeout(() => { nameInput.style.border = ''; }, 2000);
      return;
    }

    if (name.length < 2) {
      Helpers.showToast('Nama minimal 2 huruf ya! ✍️', '⚠️');
      nameInput?.focus();
      return;
    }

    // Validate class code
    if (!classCode) {
      Helpers.showToast('Isi kode kelas dulu ya! 🏫', '⚠️');
      classInput?.focus();
      classInput.style.border = '2px solid var(--sunset-coral)';
      setTimeout(() => { classInput.style.border = ''; }, 2000);
      return;
    }

    // ── Student Login ──
    if (role === 'student') {
      const matchedStudent = STUDENTS.find(s => 
        s.name.toLowerCase() === name.toLowerCase() && 
        s.class.toUpperCase() === classCode
      );

      if (!matchedStudent) {
        Helpers.showToast('Nama atau kode kelas tidak ditemukan! Hubungi gurumu 🏫', '❌');
        nameInput?.focus();
        nameInput.style.border = '2px solid var(--sunset-coral)';
        classInput.style.border = '2px solid var(--sunset-coral)';
        setTimeout(() => {
          nameInput.style.border = '';
          classInput.style.border = '';
        }, 3000);
        return;
      }

      AppState.currentStudentId = matchedStudent.id;
      AppState.currentRole = 'student';
      AppState.loginName = matchedStudent.name;
      AppState.loginClass = classCode;

      Helpers.vibrate(100);
      document.getElementById('login-modal').remove();
      Helpers.showToast(`Selamat berlayar, Kapten ${matchedStudent.name.split(' ')[0]}! ⛵`, '🎉');

      const page = document.getElementById('landing-page');
      if (page) {
        page.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        page.style.opacity = '0';
        page.style.transform = 'scale(0.95)';
      }

      setTimeout(() => {
        Navbar.mount('student');
        Mascot.mount();
        MessageBottle.mount(matchedStudent.id);
        Router.navigate('/student/map');
      }, 400);

    // ── Teacher Login ──
    } else {
      // Validate teacher against registered classes
      const matchedClass = REGISTERED_CLASSES.find(c => 
        c.teacherName.toLowerCase() === name.toLowerCase() && 
        c.classCode === classCode
      );

      if (!matchedClass) {
        Helpers.showToast('Kelas tidak ditemukan! Daftarkan kelasmu terlebih dahulu ⛵', '❌');
        nameInput?.focus();
        nameInput.style.border = '2px solid var(--sunset-coral)';
        classInput.style.border = '2px solid var(--sunset-coral)';
        setTimeout(() => {
          nameInput.style.border = '';
          classInput.style.border = '';
        }, 3000);
        return;
      }

      AppState.currentRole = 'teacher';
      AppState.loginName = matchedClass.teacherName;
      AppState.loginClass = classCode;
      AppState.loginSchool = matchedClass.schoolName;
      AppState.loginShipName = matchedClass.shipName;

      Helpers.vibrate(100);
      document.getElementById('login-modal').remove();
      Helpers.showToast(`Selamat datang, ${matchedClass.teacherName}! 🔦`, '👋');

      const page = document.getElementById('landing-page');
      if (page) {
        page.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        page.style.opacity = '0';
        page.style.transform = 'scale(0.95)';
      }

      setTimeout(() => {
        Navbar.mount('teacher');
        Router.navigate('/teacher/feed');
      }, 400);
    }
  }
};
