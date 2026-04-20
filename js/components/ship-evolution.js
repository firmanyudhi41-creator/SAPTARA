/* ==========================================
   SAPTARA — Ship Evolution Component
   ========================================== */

const ShipEvolution = {
  // Get detailed ship display
  getShipDisplay(level) {
    const ships = {
      1: {
        art: '🪵',
        waves: '🌊',
        description: 'Rakit sederhana dari bambu. Awal dari petualangan besar!',
        bgGradient: 'linear-gradient(180deg, rgba(139,90,43,0.2) 0%, transparent 100%)'
      },
      2: {
        art: '🚣',
        waves: '🌊',
        description: 'Sampan yang kokoh dengan dayung. Kamu semakin tangguh!',
        bgGradient: 'linear-gradient(180deg, rgba(0,150,199,0.2) 0%, transparent 100%)'
      },
      3: {
        art: '⛵',
        waves: '🌊',
        description: 'Kapal Pinisi legendaris Nusantara! Sang Penjelajah Agung!',
        bgGradient: 'linear-gradient(180deg, rgba(255,183,3,0.2) 0%, transparent 100%)'
      }
    };
    return ships[level] || ships[1];
  },

  render(student) {
    const shipLevel = AppState.getShipLevel(student.xp);
    const shipDisplay = this.getShipDisplay(shipLevel.level);
    const nextLevel = SHIP_LEVELS[shipLevel.level]; // next level data (if exists)
    const xpProgress = ((student.xp - shipLevel.minXP) / (shipLevel.maxXP - shipLevel.minXP)) * 100;

    let html = `
      <!-- Ship Display -->
      <div class="ship-display" style="background: ${shipDisplay.bgGradient};">
        <div class="ship-model">${shipDisplay.art}</div>
        <h2 class="ship-name">${shipLevel.name}</h2>
        <p class="ship-level-text">${shipDisplay.description}</p>
        
        <div class="ship-xp-bar">
          <div class="progress-bar progress-bar-gold">
            <div class="progress-fill" style="width: ${Math.min(100, xpProgress)}%; background: linear-gradient(90deg, var(--gold-coin), var(--gold-warm));"></div>
          </div>
          <div class="ship-xp-labels">
            <span>${student.xp} Mil Laut</span>
            <span>${shipLevel.maxXP} Mil</span>
          </div>
        </div>
      </div>

      <!-- Ship Level Cards -->
      <div style="padding: 0 16px; margin-bottom: 16px;">
        <h3 style="font-size: 16px; margin-bottom: 12px;">🗺️ Evolusi Kapal</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${SHIP_LEVELS.map((sl, i) => {
            const current = sl.level === shipLevel.level;
            const unlocked = student.xp >= sl.minXP;
            return `
              <div class="glass-card${current ? '' : ''}" style="
                display: flex; align-items: center; gap: 12px; padding: 12px;
                ${current ? 'border: 2px solid var(--gold-coin); box-shadow: var(--shadow-gold);' : ''}
                ${!unlocked ? 'opacity: 0.4;' : ''}
              ">
                <span style="font-size: 32px;">${sl.emoji}</span>
                <div style="flex: 1;">
                  <div style="font-weight: 700; font-size: 14px;">${sl.name}</div>
                  <div style="font-size: 11px; opacity: 0.6;">Level ${sl.range} • ${sl.minXP}-${sl.maxXP} Mil</div>
                </div>
                ${current ? '<span class="badge badge-gold">Saat Ini</span>' : ''}
                ${unlocked && !current ? '<span style="color: var(--seaweed-green);">✓</span>' : ''}
                ${!unlocked ? '<span style="font-size: 16px;">🔒</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Accessories Shop -->
      <div class="ship-accessories-section">
        <div class="accessories-title">
          🛒 Toko Aksesori
          <span class="coin-display" style="margin-left: auto;">
            <span class="coin-icon">🪙</span>
            ${student.coins}
          </span>
        </div>
        <div class="accessories-grid">
          ${SHIP_ACCESSORIES.map(acc => {
            const owned = student.accessories.includes(acc.id);
            const canAfford = student.coins >= acc.price;
            return `
              <div class="accessory-card ${owned ? 'owned' : ''}" 
                   onclick="ShipEvolution.onAccessoryClick('${acc.id}', ${owned}, ${canAfford})">
                <div class="accessory-icon">${acc.icon}</div>
                <div class="accessory-name">${acc.name}</div>
                <div class="accessory-price">
                  ${owned ? '✅ Dimiliki' : `🪙 ${acc.price}`}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    return html;
  },

  onAccessoryClick(accId, owned, canAfford) {
    if (owned) {
      Helpers.showToast('Aksesori ini sudah kamu miliki!', '✅');
      return;
    }
    
    const acc = SHIP_ACCESSORIES.find(a => a.id === accId);
    if (!canAfford) {
      Helpers.showToast(`Koin tidak cukup! Butuh ${acc.price} 🪙`, '😅');
      Helpers.vibrate(200);
      return;
    }

    // Purchase
    const student = AppState.getCurrentStudent();
    student.coins -= acc.price;
    student.accessories.push(accId);
    
    Helpers.showToast(`${acc.name} berhasil dibeli!`, '🎉');
    Helpers.vibrate(100);

    // Re-render
    const container = document.getElementById('page-content');
    if (typeof StudentShipPage !== 'undefined') {
      StudentShipPage.render(container);
    }
  }
};
