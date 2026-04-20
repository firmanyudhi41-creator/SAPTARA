/* ==========================================
   SAPTARA — Student Ship Page
   "Galangan Kapal"
   ========================================== */

const StudentShipPage = {
  render(container) {
    const student = AppState.getCurrentStudent();

    container.innerHTML = `
      <div class="page ship-page">
        <!-- Header -->
        <div class="page-header animate-fade-up">
          <h1>⛵ Galangan Kapal</h1>
          <p>Evolusi kapal & aksesori</p>
        </div>

        <!-- Ship Content -->
        <div class="animate-fade-up" style="animation-delay:0.1s;">
          ${ShipEvolution.render(student)}
        </div>

        <div style="height: 24px;"></div>
      </div>
    `;

    Navbar.mount('student');
  }
};
