// build: tommygee-v16-main-bass-mod
// Main — shows the current deck slot's image/video as a plain rectangle (contain-fit to its container).
// Params (shown in the page console, Program section):
//   brightness  0 = black, 0.5 = untouched, 1 = white (picture only)
//   modAmount   how much the bass (<50 Hz) pushes brightness: + = brighter, − = darker, 0 = off
//   modRelease  seconds the brightness takes to fall back after a bass hit
window.TG_PROGRAMS = window.TG_PROGRAMS || {};
window.TG_PROGRAMS.main = {
  name: 'Main',
  create(container) {
    'use strict';
    const STORE_KEY = 'tommygee.main.cfg.v1';
    const CFG_DEFAULT = { bg: '#a7a7a7', brightness: 0.5, modAmount: 0, modRelease: 0.25 };
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

    // ---- bass envelope follower: instant attack, adjustable release, auto-levelled ----
    let env = 0, peak = 0.02, lastT = performance.now();
    function updateEnv(now) {
      const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
      const lvl = deck && deck.lowLevel ? deck.lowLevel() : 0;
      peak = Math.max(lvl, peak * Math.exp(-dt / 8), 0.02);          // slow-falling reference (≈8 s)
      const hit = Math.min(1, Math.max(0, (lvl / peak - 0.35) / 0.65)); // only the upper part of the level counts
      if (hit > env) env = hit;
      else env *= Math.exp(-dt / Math.max(0.01, CFG.modRelease / 3));   // ~95% gone after modRelease
      if (env < 0.001) env = 0;
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
      const b = Math.min(1, Math.max(0, CFG.brightness + CFG.modAmount * env));
      if (Math.abs(b - 0.5) > 0.002) {
        g.fillStyle = b < 0.5 ? `rgba(0,0,0,${(0.5 - b) * 2})` : `rgba(255,255,255,${(b - 0.5) * 2})`;
        g.fillRect(x, y, w, h);
      }
    }

    let raf = 0;
    function loop(now) {
      const v = deck && deck.visual;
      if (v instanceof HTMLVideoElement && !v.paused) dirty = true;
      if (CFG.modAmount !== 0) { const before = env; updateEnv(now); if (env !== before) dirty = true; }
      if (dirty) { dirty = false; draw(); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    // controls shown by the page console (Program section)
    const controls = [
      { key: 'brightness', label: 'Brightness', min: 0, max: 1, step: 0.001, def: 0.5 },
      { key: 'modAmount', label: 'Bass → brightness', min: -1, max: 1, step: 0.01, def: 0 },
      { key: 'modRelease', label: 'Bass release (s)', min: 0.02, max: 2, step: 0.01, def: 0.25 },
    ];

    function getParams() { return { cfg: { ...CFG } }; }
    function setParams(obj) {
      if (obj && obj.cfg) { CFG = { ...CFG, ...obj.cfg }; saveCFG(); dirty = true; }
    }
    function destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      offDeck();
      canvas.remove();
    }
    return { destroy, getParams, setParams, onKey() {}, resize, controls };
  },
};
