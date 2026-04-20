/* ==========================================
   SAPTARA — Mock Data & State Management
   Sapta Karakter Anak Nusantara
   ========================================== */

// ── 7 Kebiasaan (Habits) — Pulau Misi ──
const HABITS = [
  {
    id: 1,
    name: 'Bangun Pagi',
    icon: '🌅',
    island: 'Pulau Fajar',
    badge: 'Lencana Fajar',
    badgeIcon: '🌄',
    color: '#FFB703',
    description: 'Bangun pagi sebelum matahari terbit dan rapikan tempat tidur',
    position: { x: 50, y: 13 }  // center top
  },
  {
    id: 2,
    name: 'Beribadah',
    icon: '🕌',
    island: 'Pulau Ibadah',
    badge: 'Lencana Ibadah',
    badgeIcon: '🌙',
    color: '#8338EC',
    description: 'Beribadah tepat waktu dan berdoa sebelum & sesudah beraktivitas',
    position: { x: 78, y: 30 }  // top right
  },
  {
    id: 3,
    name: 'Berolahraga',
    icon: '🏃',
    island: 'Pulau Perkasa',
    badge: 'Lencana Perkasa',
    badgeIcon: '💪',
    color: '#E76F51',
    description: 'Berolahraga atau bermain aktif minimal 30 menit sehari',
    position: { x: 80, y: 52 }  // right
  },
  {
    id: 4,
    name: 'Makan Sehat dan Bergizi',
    icon: '🥗',
    island: 'Pulau Rendang',
    badge: 'Lencana Rendang',
    badgeIcon: '🍛',
    color: '#06D6A0',
    description: 'Makan makanan bergizi: sayur, buah, lauk pauk, dan minum air putih',
    position: { x: 72, y: 75 }  // bottom right
  },
  {
    id: 5,
    name: 'Belajar Mandiri',
    icon: '📚',
    island: 'Pulau Cerdas',
    badge: 'Lencana Cerdas',
    badgeIcon: '🎓',
    color: '#118AB2',
    description: 'Membaca buku atau mengerjakan tugas secara mandiri tanpa disuruh',
    position: { x: 45, y: 88 }  // bottom center
  },
  {
    id: 6,
    name: 'Bermasyarakat',
    icon: '🤝',
    island: 'Pulau Gotong Royong',
    badge: 'Lencana Gotong Royong',
    badgeIcon: '👐',
    color: '#EF476F',
    description: 'Membantu orang tua, bergotong royong, dan berbuat baik kepada sesama',
    position: { x: 20, y: 68 }  // left
  },
  {
    id: 7,
    name: 'Tidur Cepat',
    icon: '😴',
    island: 'Pulau Mimpi',
    badge: 'Lencana Mimpi',
    badgeIcon: '⭐',
    color: '#6C63FF',
    description: 'Tidur cepat sebelum jam 9 malam agar bangun segar esok hari',
    position: { x: 22, y: 35 }   // top left
  }
];

// ── Ship Levels ──
const SHIP_LEVELS = [
  {
    level: 1,
    name: 'Rakit Bambu',
    emoji: '🪵',
    minXP: 0,
    maxXP: 100,
    description: 'Pemula — Awal petualanganmu!',
    range: '1-10',
    ship: 'raft'
  },
  {
    level: 2,
    name: 'Sampan Dayung',
    emoji: '🚣',
    minXP: 100,
    maxXP: 300,
    description: 'Pejuang — Kamu mulai tangguh!',
    range: '11-20',
    ship: 'rowboat'
  },
  {
    level: 3,
    name: 'Kapal Pinisi',
    emoji: '⛵',
    minXP: 300,
    maxXP: 600,
    description: 'Penjelajah Nusantara — Sang Pelaut Agung!',
    range: '21-30',
    ship: 'pinisi'
  },
  {
    level: 4,
    name: 'Kapten Saptara',
    emoji: '🚢',
    minXP: 600,
    maxXP: 1000,
    description: 'Legenda Samudra — Penguasa Tujuh Lautan!',
    range: '31-40',
    ship: 'saptara'
  }
];

// ── Registered Classes (Kapal Terdaftar) ──
const REGISTERED_CLASSES = [
  {
    id: 1,
    teacherName: 'Bu Sari',
    schoolName: 'SD Nusantara 01',
    classCode: '4A',
    shipName: 'Kapal Nusantara 4A',
    createdAt: '2026-04-01'
  }
];

// ── Ship Accessories (Toko) ──
const SHIP_ACCESSORIES = [
  { id: 'flag-merah', name: 'Bendera Merah Putih', icon: '🇮🇩', price: 50, type: 'flag' },
  { id: 'flag-bajak', name: 'Bendera Bajak Laut', icon: '🏴‍☠️', price: 30, type: 'flag' },
  { id: 'layar-biru', name: 'Layar Biru Laut', icon: '🔵', price: 40, type: 'sail' },
  { id: 'layar-emas', name: 'Layar Emas', icon: '🟡', price: 80, type: 'sail' },
  { id: 'meriam', name: 'Meriam Konfeti', icon: '🎆', price: 100, type: 'weapon' },
  { id: 'telescope', name: 'Teropong Ajaib', icon: '🔭', price: 60, type: 'tool' },
  { id: 'anchor-gold', name: 'Jangkar Emas', icon: '⚓', price: 120, type: 'anchor' },
  { id: 'parrot', name: 'Burung Nuri Pendamping', icon: '🦜', price: 90, type: 'pet' },
];

// ── Mock Students ──
const STUDENTS = [
  {
    id: 1,
    name: 'Arya Pratama',
    avatar: '🧒',
    class: '4A',
    xp: 245,
    coins: 180,
    level: 2,
    nauticalMiles: 245,
    streak: 12,
    habits: { 1: 85, 2: 90, 3: 65, 4: 70, 5: 80, 6: 55, 7: 75 },
    completedToday: [1, 2, 3, 5],
    badges: ['Lencana Fajar', 'Lencana Ibadah'],
    accessories: ['flag-merah'],
    weeklyData: [
      { day: 'Sen', completed: 5 },
      { day: 'Sel', completed: 7 },
      { day: 'Rab', completed: 6 },
      { day: 'Kam', completed: 4 },
      { day: 'Jum', completed: 7 },
      { day: 'Sab', completed: 5 },
      { day: 'Min', completed: 6 }
    ]
  },
  {
    id: 2,
    name: 'Bunga Lestari',
    avatar: '👧',
    class: '4A',
    xp: 380,
    coins: 250,
    level: 3,
    nauticalMiles: 380,
    streak: 21,
    habits: { 1: 95, 2: 92, 3: 88, 4: 90, 5: 85, 6: 78, 7: 90 },
    completedToday: [1, 2, 3, 4, 5, 6, 7],
    badges: ['Lencana Fajar', 'Lencana Ibadah', 'Lencana Rendang', 'Lencana Gotong Royong'],
    accessories: ['flag-merah', 'layar-emas'],
    weeklyData: [
      { day: 'Sen', completed: 7 },
      { day: 'Sel', completed: 6 },
      { day: 'Rab', completed: 7 },
      { day: 'Kam', completed: 7 },
      { day: 'Jum', completed: 6 },
      { day: 'Sab', completed: 7 },
      { day: 'Min', completed: 7 }
    ]
  },
  {
    id: 3,
    name: 'Cahyo Wibowo',
    avatar: '👦',
    class: '4A',
    xp: 150,
    coins: 90,
    level: 2,
    nauticalMiles: 150,
    streak: 5,
    habits: { 1: 60, 2: 75, 3: 45, 4: 55, 5: 70, 6: 80, 7: 50 },
    completedToday: [1, 6],
    badges: ['Lencana Perkasa'],
    accessories: [],
    weeklyData: [
      { day: 'Sen', completed: 3 },
      { day: 'Sel', completed: 5 },
      { day: 'Rab', completed: 4 },
      { day: 'Kam', completed: 2 },
      { day: 'Jum', completed: 6 },
      { day: 'Sab', completed: 4 },
      { day: 'Min', completed: 3 }
    ]
  },
  {
    id: 4,
    name: 'Dewi Anggraeni',
    avatar: '👧',
    class: '4A',
    xp: 310,
    coins: 200,
    level: 3,
    nauticalMiles: 310,
    streak: 15,
    habits: { 1: 88, 2: 85, 3: 92, 4: 80, 5: 75, 6: 65, 7: 88 },
    completedToday: [1, 2, 3, 7],
    badges: ['Lencana Rendang', 'Lencana Fajar', 'Lencana Mimpi'],
    accessories: ['layar-biru'],
    weeklyData: [
      { day: 'Sen', completed: 6 },
      { day: 'Sel', completed: 5 },
      { day: 'Rab', completed: 7 },
      { day: 'Kam', completed: 6 },
      { day: 'Jum', completed: 5 },
      { day: 'Sab', completed: 6 },
      { day: 'Min', completed: 7 }
    ]
  },
  {
    id: 5,
    name: 'Eko Nugroho',
    avatar: '🧒',
    class: '4A',
    xp: 85,
    coins: 45,
    level: 1,
    nauticalMiles: 85,
    streak: 2,
    habits: { 1: 40, 2: 55, 3: 35, 4: 45, 5: 60, 6: 70, 7: 30 },
    completedToday: [6],
    badges: [],
    accessories: [],
    weeklyData: [
      { day: 'Sen', completed: 2 },
      { day: 'Sel', completed: 3 },
      { day: 'Rab', completed: 1 },
      { day: 'Kam', completed: 4 },
      { day: 'Jum', completed: 3 },
      { day: 'Sab', completed: 2 },
      { day: 'Min', completed: 1 }
    ]
  },
  {
    id: 6,
    name: 'Fitri Rahmawati',
    avatar: '👧',
    class: '4A',
    xp: 420,
    coins: 300,
    level: 3,
    nauticalMiles: 420,
    streak: 28,
    habits: { 1: 95, 2: 98, 3: 90, 4: 95, 5: 92, 6: 85, 7: 95 },
    completedToday: [1, 2, 3, 4, 5, 6, 7],
    badges: ['Lencana Fajar', 'Lencana Ibadah', 'Lencana Rendang', 'Lencana Gotong Royong', 'Lencana Cerdas'],
    accessories: ['flag-merah', 'layar-emas', 'telescope', 'parrot'],
    weeklyData: [
      { day: 'Sen', completed: 7 },
      { day: 'Sel', completed: 7 },
      { day: 'Rab', completed: 7 },
      { day: 'Kam', completed: 6 },
      { day: 'Jum', completed: 7 },
      { day: 'Sab', completed: 7 },
      { day: 'Min', completed: 7 }
    ]
  }
];

// ── Mock Logbook Entries (Photo Verification) ──
const LOGBOOK_ENTRIES = [
  {
    id: 1,
    studentId: 1,
    habitId: 1,
    date: '2026-04-17',
    time: '05:45',
    photoUrl: null,
    caption: 'Tempat tidurku sudah rapi, Kapten!',
    status: 'verified',  // 'pending', 'verified', 'needs_revision'
    teacherComment: 'Bagus sekali Arya! Tempat tidurmu sangat rapi! 🌟',
    teacherSticker: '💎',
    xpEarned: 15
  },
  {
    id: 2,
    studentId: 1,
    habitId: 2,
    date: '2026-04-17',
    time: '06:00',
    photoUrl: null,
    caption: 'Sudah beribadah pagi ini',
    status: 'verified',
    teacherComment: 'Anak sholeh! Terus jaga ya!',
    teacherSticker: '🪙',
    xpEarned: 15
  },
  {
    id: 3,
    studentId: 2,
    habitId: 3,  // Berolahraga
    date: '2026-04-17',
    time: '12:30',
    photoUrl: null,
    caption: 'Lari pagi keliling lapangan 5 putaran',
    status: 'verified',
    teacherComment: 'Wah makanannya bergizi lengkap! 👏',
    teacherSticker: '🏆',
    xpEarned: 15
  },
  {
    id: 4,
    studentId: 3,
    habitId: 6,
    date: '2026-04-17',
    time: '16:00',
    photoUrl: null,
    caption: 'Bantu bersih-bersih lingkungan bersama tetangga',
    status: 'pending',
    teacherComment: null,
    teacherSticker: null,
    xpEarned: 0
  },
  {
    id: 5,
    studentId: 4,
    habitId: 4,  // Makan Sehat dan Bergizi
    date: '2026-04-17',
    time: '17:30',
    photoUrl: null,
    caption: 'Makan siang dengan sayur bayam, tempe, dan buah',
    status: 'pending',
    teacherComment: null,
    teacherSticker: null,
    xpEarned: 0
  },
  {
    id: 6,
    studentId: 5,
    habitId: 5,
    date: '2026-04-16',
    time: '19:00',
    photoUrl: null,
    caption: 'Belajar matematika sendiri',
    status: 'needs_revision',
    teacherComment: 'Coba foto bukunya juga ya, biar Guru bisa lihat! ☁️',
    teacherSticker: null,
    xpEarned: 0
  },
  {
    id: 7,
    studentId: 6,
    habitId: 7,
    date: '2026-04-17',
    time: '20:45',
    photoUrl: null,
    caption: 'Sudah siap tidur cepat malam ini!',
    status: 'verified',
    teacherComment: 'Kapten Fitri selalu tepat waktu! Luar biasa! ⭐',
    teacherSticker: '💎',
    xpEarned: 15
  }
];

// ── Mascot Tips ──
const MASCOT_TIPS = [
  { mascot: 'kaka', text: 'Halo Kapten! Jangan lupa makan sayur agar energimu penuh untuk berlayar! 🥬' },
  { mascot: 'kaka', text: 'Wah, cuaca cerah hari ini! Yuk selesaikan semua misi! ☀️' },
  { mascot: 'momo', text: 'Grrrr! Momo bangga padamu, Kapten! Terus berjuang! 💪' },
  { mascot: 'kaka', text: 'Kaka dengar ada harta karun di Pulau Cerdas! Sudah belajar hari ini? 📖' },
  { mascot: 'momo', text: 'Momo sudah berolahraga pagi ini! Kapten juga dong! 🏃' },
  { mascot: 'kaka', text: 'Ingat ya Kapten, tidur cepat agar besok bisa berlayar lagi! 🌙' },
  { mascot: 'momo', text: 'Terima kasih sudah bermasyarakat dan bantu sesama! Kamu hebat, Kapten! 🤗' },
  { mascot: 'kaka', text: 'Ayo kita jelajahi samudra bersama! Setiap langkah berarti! 🗺️' },
];

// ── Weekly Summary Templates ──
const WEEKLY_BADGES = [
  { id: 'bintang-laut', name: 'Lencana Bintang Laut', icon: '⭐', requirement: 'Fluktuasi stabil selama seminggu' },
  { id: 'ombak-tenang', name: 'Ombak Tenang', icon: '🌊', requirement: 'Minimal 5/7 kebiasaan setiap hari' },
  { id: 'kapten-konsisten', name: 'Kapten Konsisten', icon: '🏅', requirement: 'Streak 7 hari berturut-turut' },
];

// ── App State (simulates logged-in user) ──
const AppState = {
  currentRole: null,          // 'student' | 'teacher'
  currentStudentId: 1,        // Active student (for student view)
  currentPage: 'landing',     // Current active page
  
  // Get current student data
  getCurrentStudent() {
    return STUDENTS.find(s => s.id === this.currentStudentId);
  },
  
  // Get student by ID
  getStudent(id) {
    return STUDENTS.find(s => s.id === id);
  },
  
  // Get logbook entries for a student
  getStudentLogbook(studentId) {
    return LOGBOOK_ENTRIES.filter(e => e.studentId === studentId);
  },
  
  // Get pending entries (for teacher)
  getPendingEntries() {
    return LOGBOOK_ENTRIES.filter(e => e.status === 'pending');
  },
  
  // Get all entries (for teacher feed)
  getAllEntries() {
    return LOGBOOK_ENTRIES.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB - dateA;
    });
  },
  
  // Get ship level info
  getShipLevel(xp) {
    if (xp >= 600) return SHIP_LEVELS[3];
    if (xp >= 300) return SHIP_LEVELS[2];
    if (xp >= 100) return SHIP_LEVELS[1];
    return SHIP_LEVELS[0];
  },
  
  // Get leaderboard (sorted by nautical miles)
  getLeaderboard() {
    return [...STUDENTS].sort((a, b) => b.nauticalMiles - a.nauticalMiles);
  },

  // Get today's missions for a student
  getTodayMissions(studentId) {
    const student = this.getStudent(studentId);
    if (!student) return [];
    return HABITS.map(h => ({
      ...h,
      completed: student.completedToday.includes(h.id),
      score: student.habits[h.id] || 0
    }));
  },

  // Toggle habit completion (for demo)
  toggleHabit(studentId, habitId) {
    const student = this.getStudent(studentId);
    if (!student) return;
    const idx = student.completedToday.indexOf(habitId);
    if (idx > -1) {
      student.completedToday.splice(idx, 1);
      student.xp = Math.max(0, student.xp - 10);
      student.nauticalMiles = student.xp;
    } else {
      student.completedToday.push(habitId);
      student.xp += 10;
      student.nauticalMiles = student.xp;
      student.coins += 5;
    }
  },

  // Approve entry (for teacher)
  approveEntry(entryId, sticker, comment) {
    const entry = LOGBOOK_ENTRIES.find(e => e.id === entryId);
    if (entry) {
      entry.status = 'verified';
      entry.teacherSticker = sticker || '🪙';
      entry.teacherComment = comment || 'Bagus, Kapten!';
      entry.xpEarned = 15;
    }
  },

  // Reject entry (for teacher)
  rejectEntry(entryId, comment) {
    const entry = LOGBOOK_ENTRIES.find(e => e.id === entryId);
    if (entry) {
      entry.status = 'needs_revision';
      entry.teacherComment = comment || 'Coba lagi ya, Kapten!';
    }
  },

  // Random mascot tip
  getRandomTip() {
    return MASCOT_TIPS[Math.floor(Math.random() * MASCOT_TIPS.length)];
  }
};
