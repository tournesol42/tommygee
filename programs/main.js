// build: tommygee-v05-main-player
// Main — shows the current deck slot's image/video as a plain rectangle (contain-fit to its container).
// Param: brightness (0 = black, 0.5 = untouched, 1 = white), applied to the picture only.
window.TG_PROGRAMS = window.TG_PROGRAMS || {};
window.TG_PROGRAMS.main = {
  name: 'Main',
  create(container) {
    'use strict';
    const STORE_KEY = 'tommygee.main.cfg.v1';
    const CFG_DEFAULT = { bg: '#a7a7a7', brightness: 0.5 };
    let CFG = { ...CFG_DEFAULT };
    try { CFG = { ...CFG_DEFAULT, ...(JSON.parse(localStorage.getItem(STORE_KEY)) || {}) }; } catch (e) {}
    const saveCFG = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(CFG)); } catch (e) {} };

    // ---- canvas ----
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:100%;';
    container.appendChild(canvas);
    const g = canvas.getContext('2d');
    let dpr = 1, W = 1, H = 1, dirty = true;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      W = Math.max(1, container.clientWidth); H = Math.max(1, container.clientHeight);
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
      dirty = true;
    }
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const deck = window.TGDeck;
    const offDeck = deck ? deck.onChange(() => { dirty = true; }) : () => {};

    function mediaDims(m) {
      if (!m) return null;
      if (m instanceof HTMLVideoElement) return m.videoWidth ? [m.videoWidth, m.videoHeight] : null;
      return m.naturalWidth ? [m.naturalWidth, m.naturalHeight] : null;
    }

    function draw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      g.fillStyle = CFG.bg; g.fillRect(0, 0, W, H);
      const m = deck && deck.visual, d = mediaDims(m);
      if (!d) return;
      const s = Math.min(W / d[0], H / d[1]);
      const w = d[0] * s, h = d[1] * s, x = (W - w) / 2, y = (H - h) / 2;
      g.drawImage(m, x, y, w, h);
      const b = CFG.brightness;
      if (Math.abs(b - 0.5) > 0.002) {
        g.fillStyle = b < 0.5 ? `rgba(0,0,0,${(0.5 - b) * 2})` : `rgba(255,255,255,${(b - 0.5) * 2})`;
        g.fillRect(x, y, w, h);
      }
    }

    let raf = 0;
    function loop() {
      const v = deck && deck.visual;
      if (v instanceof HTMLVideoElement && !v.paused) dirty = true;
      if (dirty) { dirty = false; draw(); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    // ---- own console (C toggles) ----
    const panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;top:16px;right:16px;width:260px;z-index:60;display:none;background:rgba(20,20,20,0.92);color:#ddd;border:1px solid #444;border-radius:6px;font:11px/1.3 "Helvetica Neue",Helvetica,Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,0.35);user-select:none;';
    panel.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-bottom:1px solid #333;font-weight:bold;letter-spacing:0.08em">MAIN<button data-x style="background:none;border:0;color:#aaa;cursor:pointer;font-size:14px">×</button></div>' +
      '<div style="display:grid;grid-template-columns:80px 1fr 40px;align-items:center;gap:6px;padding:8px 10px">' +
      '<label style="color:#aaa">Brightness</label><input data-b type="range" min="0" max="1" step="0.001" title="Double-click to reset" style="width:100%;accent-color:#a0d2ec">' +
      '<span data-v style="font-size:10px;text-align:right;color:#888;font-variant-numeric:tabular-nums"></span></div>';
    document.body.appendChild(panel);
    const bIn = panel.querySelector('[data-b]'), bVal = panel.querySelector('[data-v]');
    const syncInputs = () => { bIn.value = CFG.brightness; bVal.textContent = CFG.brightness.toFixed(2); };
    syncInputs();
    bIn.addEventListener('input', () => { CFG.brightness = parseFloat(bIn.value); syncInputs(); saveCFG(); dirty = true; });
    bIn.addEventListener('dblclick', () => { CFG.brightness = 0.5; syncInputs(); saveCFG(); dirty = true; });
    panel.querySelector('[data-x]').addEventListener('click', () => { panel.style.display = 'none'; });

    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = (e.code && e.code.startsWith('Key')) ? e.code.slice(3).toLowerCase() : (e.key || '').toLowerCase();
      if (k === 'c') panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    function getParams() { return { cfg: { ...CFG } }; }
    function setParams(obj) {
      if (obj && obj.cfg) { CFG = { ...CFG, ...obj.cfg }; saveCFG(); syncInputs(); dirty = true; }
    }
    function destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      offDeck();
      panel.remove();
      canvas.remove();
    }
    return { destroy, getParams, setParams, onKey, resize };
  },
};
