(function () {
  if (document.getElementById('obs-sticky-panel')) return;

  const SVG_LOCKED   = `<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  const SVG_UNLOCKED = `<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`;
  const DIRS = ['n','s','w','e','nw','ne','sw','se'];

  const panel = document.createElement('div');
  panel.id = 'obs-sticky-panel';
  panel.className = 'hidden';
  panel.innerHTML = `
    ${DIRS.map(d => `<div class="obs-rh obs-rh-${d}" data-dir="${d}"></div>`).join('')}
    <div id="obs-sticky-header">
      <span id="obs-sticky-title">Obsidian</span>
      <button id="obs-sticky-lock" title="固定 / 移動">${SVG_UNLOCKED}</button>
    </div>
    <div id="obs-sticky-body">
      <textarea id="obs-sticky-textarea" placeholder="メモを入力…"></textarea>
      <div id="obs-sticky-status"></div>
      <div id="obs-sticky-footer">
        <span id="obs-sticky-hint">⌘ Enter で保存</span>
        <button id="obs-sticky-save">保存</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  const header   = document.getElementById('obs-sticky-header');
  const lockBtn  = document.getElementById('obs-sticky-lock');
  const textarea = document.getElementById('obs-sticky-textarea');
  const saveBtn  = document.getElementById('obs-sticky-save');
  const status   = document.getElementById('obs-sticky-status');

  let locked = false;
  lockBtn.addEventListener('click', () => {
    locked = !locked;
    lockBtn.innerHTML = locked ? SVG_LOCKED : SVG_UNLOCKED;
    header.classList.toggle('locked', locked);
  });

  let dragging = false, ox = 0, oy = 0;
  header.addEventListener('mousedown', e => {
    if (locked) return;
    dragging = true;
    const r = panel.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  let resizing = false, rDir = '', rSX = 0, rSY = 0, rSW = 0, rSH = 0, rSL = 0, rST = 0;
  const MIN_W = 180, MIN_H = 140;
  panel.querySelectorAll('.obs-rh').forEach(el => {
    el.addEventListener('mousedown', e => {
      resizing = true; rDir = el.dataset.dir;
      rSX = e.clientX; rSY = e.clientY;
      const r = panel.getBoundingClientRect();
      rSW = r.width; rSH = r.height; rSL = r.left; rST = r.top;
      panel.style.right = 'auto';
      document.body.style.userSelect = 'none';
      e.preventDefault(); e.stopPropagation();
    });
  });

  document.addEventListener('mousemove', e => {
    if (dragging) {
      const vw = window.innerWidth, vh = window.innerHeight;
      panel.style.left  = Math.round(Math.max(0, Math.min(e.clientX - ox, vw - panel.offsetWidth)))  + 'px';
      panel.style.top   = Math.round(Math.max(0, Math.min(e.clientY - oy, vh - panel.offsetHeight))) + 'px';
      panel.style.right = 'auto';
      return;
    }
    if (!resizing) return;
    const dx = e.clientX - rSX, dy = e.clientY - rSY;
    let w = rSW, h = rSH, l = rSL, t = rST;
    if (rDir.includes('e')) w = Math.max(MIN_W, rSW + dx);
    if (rDir.includes('s')) h = Math.max(MIN_H, rSH + dy);
    if (rDir.includes('w')) { w = Math.max(MIN_W, rSW - dx); l = rSL + rSW - w; }
    if (rDir.includes('n')) { h = Math.max(MIN_H, rSH - dy); t = rST + rSH - h; }
    panel.style.width  = Math.round(w) + 'px'; panel.style.height = Math.round(h) + 'px';
    panel.style.left   = Math.round(l) + 'px'; panel.style.top    = Math.round(t) + 'px';
  });

  document.addEventListener('mouseup', () => {
    dragging = resizing = false;
    document.body.style.userSelect = '';
  });

  async function save() {
    const text = textarea.value.trim();
    if (!text) return;
    try {
      const res = await fetch('http://127.0.0.1:27184/append', { method: 'POST', body: text });
      if (res.ok) {
        status.textContent = '✓ 保存しました';
        textarea.value = '';
        setTimeout(() => { status.textContent = ''; }, 1500);
      } else {
        status.textContent = 'エラーが発生しました';
      }
    } catch {
      status.textContent = 'サーバーに接続できません';
    }
  }

  saveBtn.addEventListener('click', save);
  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
  });

  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === 'toggle') {
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden')) textarea.focus();
    }
  });
})();
