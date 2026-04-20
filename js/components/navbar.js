/* ==========================================
   SAPTARA — Navigation Component
   Bottom Tab Bar (Mobile)
   ========================================== */

const Navbar = {
  // Render student bottom navigation
  renderStudent() {
    const tabs = [
      { route: '/student/map', icon: '🗺️', label: 'Peta' },
      { route: '/student/logbook', icon: '📸', label: 'Jejak Hebat' },
      { route: '/student/compass', icon: '🧭', label: 'Radar' },
      { route: '/student/ship', icon: '⛵', label: 'Kapal' },
      { route: '/student/leaderboard', icon: '🏆', label: 'Peta Arus' }
    ];

    const currentHash = window.location.hash.slice(1);

    return `
      <nav class="bottom-nav" id="student-nav" role="navigation" aria-label="Navigasi Murid">
        ${tabs.map(tab => `
          <div class="nav-item ${currentHash === tab.route ? 'active' : ''}" 
               data-route="${tab.route}"
               onclick="Router.navigate('${tab.route}'); Helpers.vibrate();"
               role="tab"
               aria-selected="${currentHash === tab.route}"
               aria-label="${tab.label}">
            <span class="nav-icon">${tab.icon}</span>
            <span class="nav-label">${tab.label}</span>
          </div>
        `).join('')}
      </nav>
    `;
  },

  // Render teacher bottom navigation
  renderTeacher() {
    const tabs = [
      { route: '/teacher/feed', icon: '🔦', label: 'Menara Suar' },
      { route: '/teacher/analytics', icon: '📊', label: 'Analitik' },
      { route: '/teacher/rewards', icon: '🏅', label: 'Stiker' },
      { route: '/teacher/crew', icon: '👥', label: 'Kru' }
    ];

    const currentHash = window.location.hash.slice(1);

    return `
      <nav class="bottom-nav teacher-nav" id="teacher-nav" role="navigation" aria-label="Navigasi Guru">
        ${tabs.map(tab => `
          <div class="nav-item ${currentHash === tab.route ? 'active' : ''}" 
               data-route="${tab.route}"
               onclick="Router.navigate('${tab.route}'); Helpers.vibrate();"
               role="tab"
               aria-selected="${currentHash === tab.route}"
               aria-label="${tab.label}">
            <span class="nav-icon">${tab.icon}</span>
            <span class="nav-label">${tab.label}</span>
          </div>
        `).join('')}
      </nav>
    `;
  },

  // Remove navigation
  remove() {
    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.remove();
  },

  // Insert navigation into DOM
  mount(role) {
    this.remove();
    const html = role === 'teacher' ? this.renderTeacher() : this.renderStudent();
    document.getElementById('app').insertAdjacentHTML('beforeend', html);
  }
};
