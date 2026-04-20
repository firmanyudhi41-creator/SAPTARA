/* ==========================================
   SAPTARA — Student Logbook Page
   "Jejak Hebat"
   ========================================== */

const StudentLogbookPage = {
  render(container) {
    const student = AppState.getCurrentStudent();
    const entries = AppState.getStudentLogbook(student.id);
    const verifiedCount = entries.filter(e => e.status === 'verified').length;
    const pendingCount = entries.filter(e => e.status === 'pending').length;

    container.innerHTML = `
      <div class="page logbook-page">
        <!-- Header -->
        <div class="page-header animate-fade-up">
          <h1>📸 Jejak Hebat</h1>
          <p>Buku Log Petualangan Kapten ${student.name.split(' ')[0]}</p>
        </div>

        <!-- Stats -->
        <div class="stats-bar animate-fade-up" style="animation-delay:0.1s;">
          <div class="stat-item">
            <span class="stat-icon">📸</span>
            <div>
              <div class="stat-value">${entries.length}</div>
              <div class="stat-label">Total Jejak</div>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-icon">✅</span>
            <div>
              <div class="stat-value">${verifiedCount}</div>
              <div class="stat-label">Terverifikasi</div>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⏳</span>
            <div>
              <div class="stat-value">${pendingCount}</div>
              <div class="stat-label">Menunggu</div>
            </div>
          </div>
        </div>

        <!-- Logbook Content -->
        <div class="animate-fade-up" style="animation-delay:0.2s;">
          ${PhotoLogbook.render(student)}
        </div>

        <div style="height: 24px;"></div>
      </div>
    `;

    Navbar.mount('student');
  }
};
