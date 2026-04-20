/* ==========================================
   SAPTARA — Utility / Helper Functions
   ========================================== */

const Helpers = {
  // Format number with separator
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },

  // Get greeting based on time
  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 10) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  },

  // Format date to Indonesian
  formatDate(dateStr) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const date = new Date(dateStr);
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  },

  // Format time
  formatTime(timeStr) {
    return timeStr;
  },

  // Calculate percentage
  percentage(value, max) {
    return Math.min(100, Math.round((value / max) * 100));
  },

  // Get color based on score
  getScoreColor(score) {
    if (score >= 80) return 'var(--seaweed-green)';
    if (score >= 60) return 'var(--gold-coin)';
    if (score >= 40) return 'var(--gold-warm)';
    return 'var(--sunset-coral)';
  },

  // Create toast notification
  showToast(message, icon = '✨') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
  },

  // Simple createElement helper
  el(tag, attrs = {}, children = '') {
    const element = document.createElement(tag);
    Object.entries(attrs).forEach(([key, val]) => {
      if (key === 'className') element.className = val;
      else if (key === 'innerHTML') element.innerHTML = val;
      else if (key === 'onclick') element.onclick = val;
      else if (key === 'style') Object.assign(element.style, val);
      else element.setAttribute(key, val);
    });
    if (typeof children === 'string') {
      element.innerHTML = children;  
    }
    return element;
  },

  // Stagger animation delay
  staggerDelay(index, base = 50) {
    return `animation-delay: ${index * base}ms`;
  },

  // Check if habit is completed today
  isCompletedToday(student, habitId) {
    return student.completedToday.includes(habitId);
  },

  // Get rank emoji
  getRankEmoji(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  },

  // Get ship emoji by level
  getShipEmoji(level) {
    const ships = { 1: '🪵', 2: '🚣', 3: '⛵', 4: '🚢' };
    return ships[level] || '🪵';
  },

  // Vibrate (haptic feedback)
  vibrate(ms = 30) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }
};
