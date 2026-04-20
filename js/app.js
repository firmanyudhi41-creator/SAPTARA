/* ==========================================
   SAPTARA — Main Application
   Sapta Karakter Anak Nusantara
   Ekspedisi Tujuh Samudra — v1.0
   ========================================== */

const App = {
  init() {
    // Register all routes
    this.registerRoutes();

    // Initialize router
    Router.init();

    // If no hash, show landing
    if (!window.location.hash || window.location.hash === '#/') {
      LandingPage.render(document.getElementById('page-content'));
    }

    console.log('⛵ SAPTARA — Ekspedisi Tujuh Samudra loaded!');
  },

  registerRoutes() {
    // Landing
    Router.register('/', (container) => {
      LandingPage.render(container);
    });

    // ── Student Routes ──
    Router.register('/student/map', (container) => {
      AppState.currentRole = 'student';
      StudentMapPage.render(container);
      Mascot.mount();
      MessageBottle.mount(AppState.currentStudentId);
    });

    Router.register('/student/logbook', (container) => {
      AppState.currentRole = 'student';
      StudentLogbookPage.render(container);
      Mascot.mount();
      MessageBottle.mount(AppState.currentStudentId);
    });

    Router.register('/student/compass', (container) => {
      AppState.currentRole = 'student';
      StudentCompassPage.render(container);
      Mascot.mount();
      MessageBottle.remove();
    });

    Router.register('/student/ship', (container) => {
      AppState.currentRole = 'student';
      StudentShipPage.render(container);
      Mascot.mount();
      MessageBottle.remove();
    });

    Router.register('/student/leaderboard', (container) => {
      AppState.currentRole = 'student';
      StudentLeaderboardPage.render(container);
      Mascot.remove();
      MessageBottle.remove();
    });

    // ── Teacher Routes ──
    Router.register('/teacher/feed', (container) => {
      AppState.currentRole = 'teacher';
      TeacherFeedPage.render(container);
      Mascot.remove();
      MessageBottle.remove();
    });

    Router.register('/teacher/analytics', (container) => {
      AppState.currentRole = 'teacher';
      TeacherAnalyticsPage.render(container);
      Mascot.remove();
      MessageBottle.remove();
    });

    Router.register('/teacher/rewards', (container) => {
      AppState.currentRole = 'teacher';
      TeacherRewardsPage.render(container);
      Mascot.remove();
      MessageBottle.remove();
    });

    Router.register('/teacher/crew', (container) => {
      AppState.currentRole = 'teacher';
      TeacherCrewPage.render(container);
      Mascot.remove();
      MessageBottle.remove();
    });
  }
};

// ── Boot Application ──
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
