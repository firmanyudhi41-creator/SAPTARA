/* ==========================================
   SAPTARA — Hash-Based SPA Router
   ========================================== */

const Router = {
  routes: {},
  currentRoute: null,

  // Register a route
  register(path, handler) {
    this.routes[path] = handler;
  },

  // Navigate to a route
  navigate(path) {
    window.location.hash = path;
  },

  // Handle route change
  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const route = this.routes[hash];
    
    if (route) {
      this.currentRoute = hash;
      const appContainer = document.getElementById('page-content');
      if (appContainer) {
        // Fade out, then render new page
        appContainer.style.opacity = '0';
        appContainer.style.transform = 'translateY(8px)';
        
        setTimeout(() => {
          route(appContainer);
          appContainer.style.opacity = '1';
          appContainer.style.transform = 'translateY(0)';
          
          // Update navigation active state
          this.updateNav(hash);
          
          // Scroll to top
          appContainer.scrollTop = 0;
          window.scrollTo(0, 0);
        }, 150);
      }
    } else {
      // Fallback to landing
      this.navigate('/');
    }
  },

  // Update active navigation
  updateNav(hash) {
    // Student nav
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
      const target = item.dataset.route;
      if (target && hash.startsWith(target)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  },

  // Initialize router
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    // Handle initial load
    this.handleRoute();
  }
};
