/* ==========================================
   SAPTARA — SVG Radar Chart Component
   "Radar Kompas Karakter"
   ========================================== */

const RadarChart = {
  /**
   * Render radar chart SVG
   * @param {Object} habits - {habitId: score} (scores 0-100)
   * @param {Object} options - {size, showLabels, animated, colorScheme}
   */
  render(habitScores, options = {}) {
    const {
      size = 280,
      showLabels = true,
      animated = true,
      id = 'radar-main'
    } = options;

    const center = size / 2;
    const radius = (size / 2) - 40;
    const levels = 5; // concentric rings
    const habits = HABITS;
    const angleStep = (2 * Math.PI) / habits.length;
    // Start from top (- PI/2)
    const startAngle = -Math.PI / 2;

    // Build SVG
    let svg = `<svg viewBox="0 0 ${size} ${size}" class="radar-svg" id="${id}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Defs: gradients & filters
    svg += `
      <defs>
        <radialGradient id="radar-gradient">
          <stop offset="0%" stop-color="rgba(0, 212, 170, 0.6)" />
          <stop offset="100%" stop-color="rgba(0, 180, 216, 0.2)" />
        </radialGradient>
        <filter id="radar-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="radar-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
    `;

    // Background concentric rings
    for (let i = levels; i > 0; i--) {
      const r = (radius / levels) * i;
      const opacity = 0.05 + (i * 0.03);
      svg += `<circle cx="${center}" cy="${center}" r="${r}" 
                fill="none" stroke="rgba(255,255,255,${opacity})" stroke-width="1" 
                stroke-dasharray="4 4" />`;
    }

    // Axis lines
    habits.forEach((h, i) => {
      const angle = startAngle + (i * angleStep);
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" 
                stroke="rgba(255,255,255,0.1)" stroke-width="1" />`;
    });

    // Data polygon (the filled shape)
    const points = habits.map((h, i) => {
      const score = (habitScores[h.id] || 0) / 100;
      const angle = startAngle + (i * angleStep);
      const x = center + radius * score * Math.cos(angle);
      const y = center + radius * score * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    const pathLength = animated ? 'stroke-dasharray="1000" stroke-dashoffset="1000"' : '';
    const animClass = animated ? 'style="animation: radarDraw 1.5s ease forwards 0.3s"' : '';

    svg += `<polygon points="${points}" 
              fill="url(#radar-gradient)" 
              stroke="var(--wave-cyan, #00D4AA)" stroke-width="2.5" 
              filter="url(#radar-glow)"
              ${pathLength} ${animClass}
              opacity="0.9" />`;

    // Data points (dots) at each vertex
    habits.forEach((h, i) => {
      const score = (habitScores[h.id] || 0) / 100;
      const angle = startAngle + (i * angleStep);
      const x = center + radius * score * Math.cos(angle);
      const y = center + radius * score * Math.sin(angle);
      const delay = animated ? `animation-delay: ${0.5 + i * 0.1}s` : '';
      
      svg += `<circle cx="${x}" cy="${y}" r="5" 
                fill="${h.color}" stroke="white" stroke-width="2"
                filter="url(#radar-shadow)"
                class="${animated ? 'animate-pop-in' : ''}" 
                style="opacity: 0; ${delay}; animation-fill-mode: forwards;" />`;
    });

    // Labels (emoji + name)
    if (showLabels) {
      habits.forEach((h, i) => {
        const angle = startAngle + (i * angleStep);
        const labelRadius = radius + 26;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        
        svg += `<text x="${x}" y="${y - 6}" text-anchor="middle" 
                  font-size="16" dominant-baseline="middle">${h.icon}</text>`;
        svg += `<text x="${x}" y="${y + 10}" text-anchor="middle" 
                  fill="rgba(255,255,255,0.7)" font-size="8" font-weight="600"
                  font-family="Nunito, sans-serif">${h.name.split(' ')[0]}</text>`;
      });
    }

    // Center dot
    svg += `<circle cx="${center}" cy="${center}" r="3" fill="rgba(255,255,255,0.5)" />`;

    svg += '</svg>';
    return svg;
  },

  /**
   * Render radar with legend below
   */
  renderWithLegend(student, options = {}) {
    const habitScores = student.habits;
    const avgScore = Math.round(
      Object.values(habitScores).reduce((a, b) => a + b, 0) / Object.keys(habitScores).length
    );

    let html = `
      <div class="radar-container">
        ${this.render(habitScores, options)}
        <div class="radar-center-label">
          <span class="radar-score">${avgScore}</span>
          <span class="radar-label">Rata-rata</span>
        </div>
      </div>
      <div class="radar-legend">
    `;

    HABITS.forEach((h, i) => {
      const score = habitScores[h.id] || 0;
      const color = Helpers.getScoreColor(score);
      html += `
        <div class="radar-legend-item animate-fade-up" style="${Helpers.staggerDelay(i, 80)}">
          <span class="legend-icon">${h.icon}</span>
          <span class="legend-name">${h.name}</span>
          <div class="legend-bar">
            <div class="legend-bar-fill" style="width: ${score}%; background: ${color};"></div>
          </div>
          <span class="legend-score" style="color: ${color}">${score}%</span>
        </div>
      `;
    });

    html += '</div>';
    return html;
  }
};
