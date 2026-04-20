/* ==========================================
   SAPTARA — Ocean Map Component
   7 Pulau Interaktif
   ========================================== */

const OceanMap = {
  render(student) {
    const missions = AppState.getTodayMissions(student.id);
    const completedCount = missions.filter(m => m.completed).length;
    
    // Determine ship position (at last completed island or center)
    const lastCompleted = missions.filter(m => m.completed).pop();
    const shipPos = lastCompleted 
      ? { x: lastCompleted.position.x, y: lastCompleted.position.y - 8 }
      : { x: 50, y: 48 };

    let html = `
      <div class="ocean-map-container">
        <div class="ocean-map-bg"></div>
        
        <!-- Decorative wave lines -->
        <svg class="ocean-deco-waves" viewBox="0 0 100 100" 
             style="position:absolute; inset:0; width:100%; height:100%; opacity:0.08; pointer-events:none;">
          <path d="M0,30 Q25,25 50,30 T100,30" fill="none" stroke="white" stroke-width="0.3"/>
          <path d="M0,50 Q25,45 50,50 T100,50" fill="none" stroke="white" stroke-width="0.3"/>
          <path d="M0,70 Q25,65 50,70 T100,70" fill="none" stroke="white" stroke-width="0.3"/>
        </svg>

        <!-- Islands -->
        ${missions.map((m, i) => `
          <div class="island-marker ${m.completed ? 'completed' : 'pending'} animate-bounce-in"
               style="left: ${m.position.x}%; top: ${m.position.y}%; transform: translate(-50%, -50%); ${Helpers.staggerDelay(i, 100)}"
               onclick="OceanMap.onIslandClick(${m.id})"
               id="island-${m.id}">
            <div class="island-icon-wrap" style="background: ${m.completed ? m.color : 'rgba(255,255,255,0.1)'};">
              ${m.completed ? `<span class="island-check">✓</span>` : ''}
              <span>${m.icon}</span>
            </div>
            <span class="island-name">${m.island.replace('Pulau ', '')}</span>
          </div>
        `).join('')}

        <!-- Ship -->
        <div class="map-ship" style="left: ${shipPos.x}%; top: ${shipPos.y}%; transform: translate(-50%, -50%);">
          ${Helpers.getShipEmoji(student.level)}
        </div>
      </div>

      <!-- Progress Card -->
      <div class="map-progress">
        <div class="map-progress-card">
          <div class="map-progress-header">
            <h4>⛵ Misi Hari Ini</h4>
            <span class="progress-count">${completedCount}/7</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(completedCount / 7) * 100}%"></div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top: 6px;">
            <span style="font-size:11px; opacity:0.6;">🏁 ${completedCount} pulau dikunjungi</span>
            <span style="font-size:11px; opacity:0.6;">${7 - completedCount} tersisa</span>
          </div>
        </div>
      </div>
    `;

    return html;
  },

  onIslandClick(habitId) {
    const student = AppState.getCurrentStudent();
    const habit = HABITS.find(h => h.id === habitId);
    const isCompleted = student.completedToday.includes(habitId);
    
    Helpers.vibrate(50);

    // Show island mission modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'island-modal';
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    modal.innerHTML = `
      <div class="modal-content" style="position:relative;">
        <div class="modal-header">
          <div style="font-size:48px; margin-bottom:8px;">${habit.icon}</div>
          <h3>${habit.island}</h3>
          <p style="font-size:13px; opacity:0.7; margin-top:4px;">${habit.name}</p>
        </div>
        <p style="font-size:14px; text-align:center; opacity:0.8; margin-bottom:20px;">
          ${habit.description}
        </p>
        <div style="text-align:center; margin-bottom:16px;">
          ${isCompleted 
            ? '<span class="badge badge-green" style="font-size:14px; padding:6px 16px;">✅ Misi Selesai!</span>'
            : '<span class="badge" style="font-size:14px; padding:6px 16px;">⏳ Belum Dikerjakan</span>'
          }
        </div>
        <div style="display:flex; gap:8px;">
          ${!isCompleted ? `
            <button class="btn btn-gold btn-lg" style="flex:1;" onclick="OceanMap.completeIsland(${habitId})">
              📸 Selesaikan Misi
            </button>
          ` : `
            <button class="btn btn-ghost btn-lg" style="flex:1;" onclick="document.getElementById('island-modal').remove()">
              Tutup
            </button>
          `}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  completeIsland(habitId) {
    // Close island modal
    document.getElementById('island-modal').remove();
    
    const habit = HABITS.find(h => h.id === habitId);
    Helpers.vibrate(100);

    // Open the photo upload modal with this mission pre-selected
    PhotoLogbook.capturedPhotoData = null;
    PhotoLogbook.selectedMission = habitId;
    PhotoLogbook.openUpload();

    // Auto-select this mission in the upload modal after it renders
    setTimeout(() => {
      const missionCard = document.querySelector(`#upload-modal .mission-card[data-habit="${habitId}"]`);
      const checkbox = document.getElementById(`check-${habitId}`);
      if (missionCard && checkbox) {
        checkbox.classList.add('checked');
        missionCard.style.borderColor = 'var(--gold-coin)';
      }

      // Scroll modal to the photo section
      const photoArea = document.getElementById('photo-preview-area');
      if (photoArea) {
        photoArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  }
};
