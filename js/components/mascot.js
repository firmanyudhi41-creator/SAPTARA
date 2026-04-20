/* ==========================================
   SAPTARA — Mascot Component
   Kaka si Kakak Tua & Momo si Komodo
   ========================================== */

const Mascot = {
  visible: false,
  bubbleVisible: false,

  render() {
    const tip = AppState.getRandomTip();
    const mascotEmoji = tip.mascot === 'kaka' ? '🦜' : '🦎';
    
    return `
      <div class="mascot-container" id="mascot-container">
        ${this.bubbleVisible ? `
          <div class="mascot-bubble" id="mascot-bubble" onclick="Mascot.hideBubble()">
            ${tip.text}
          </div>
        ` : ''}
        <div class="mascot-avatar" onclick="Mascot.toggleBubble()" title="${tip.mascot === 'kaka' ? 'Kaka si Kakak Tua' : 'Momo si Komodo'}">
          ${mascotEmoji}
        </div>
      </div>
    `;
  },

  mount() {
    this.remove();
    const container = document.getElementById('app');
    if (container) {
      container.insertAdjacentHTML('beforeend', this.render());
    }
  },

  remove() {
    const el = document.getElementById('mascot-container');
    if (el) el.remove();
  },

  toggleBubble() {
    this.bubbleVisible = !this.bubbleVisible;
    Helpers.vibrate();
    this.mount();
  },

  hideBubble() {
    this.bubbleVisible = false;
    const bubble = document.getElementById('mascot-bubble');
    if (bubble) bubble.remove();
  },

  // Show mascot with a specific message
  showMessage(text) {
    this.bubbleVisible = true;
    this.mount();
    const bubble = document.getElementById('mascot-bubble');
    if (bubble) {
      bubble.textContent = text;
    }
  }
};

/* ==========================================
   SAPTARA — Message Bottle Component
   ========================================== */

const MessageBottle = {
  messages: [],

  init(studentId) {
    const entries = AppState.getStudentLogbook(studentId);
    this.messages = entries
      .filter(e => e.teacherComment && e.status === 'verified')
      .map(e => ({
        id: e.id,
        comment: e.teacherComment,
        sticker: e.teacherSticker,
        habitId: e.habitId
      }));
  },

  render() {
    if (this.messages.length === 0) return '';
    
    const unread = this.messages.length;
    
    return `
      <div class="bottle-container" id="bottle-container" onclick="MessageBottle.openBottle()">
        <div class="bottle-icon">🍶</div>
        ${unread > 0 ? `<div class="bottle-badge">${unread}</div>` : ''}
      </div>
    `;
  },

  mount(studentId) {
    this.remove();
    this.init(studentId);
    const container = document.getElementById('app');
    if (container && this.messages.length > 0) {
      container.insertAdjacentHTML('beforeend', this.render());
    }
  },

  remove() {
    const el = document.getElementById('bottle-container');
    if (el) el.remove();
  },

  openBottle() {
    if (this.messages.length === 0) return;
    
    Helpers.vibrate(50);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'bottle-modal';
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div style="font-size:56px; margin-bottom:8px;">🍶</div>
          <h3>Pesan dalam Botol</h3>
          <p style="font-size:12px; opacity:0.7; margin-top:4px;">Pesan dari Guru untukmu</p>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
          ${this.messages.map(msg => {
            const habit = HABITS.find(h => h.id === msg.habitId);
            return `
              <div style="background: rgba(255,255,255,0.1); border-radius:12px; padding:12px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                  <span style="font-size:20px;">${habit ? habit.icon : '📝'}</span>
                  <span style="font-size:12px; opacity:0.6;">${habit ? habit.name : 'Umum'}</span>
                  ${msg.sticker ? `<span style="font-size:20px; margin-left:auto;">${msg.sticker}</span>` : ''}
                </div>
                <p style="font-size:14px; font-weight:500; line-height:1.5;">"${msg.comment}"</p>
              </div>
            `;
          }).join('')}
        </div>

        <button class="btn btn-ghost btn-lg" style="width:100%;" onclick="document.getElementById('bottle-modal').remove()">
          Tutup Botol
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  }
};
