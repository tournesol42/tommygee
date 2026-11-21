// build: tommygee-v22-atmosphere
// TGAtmosphere — calm background behind the fixed player. The page scrolls; layers move at different speeds.
//   far  layer: film-frame CAD lines (1.85 / 2.39 frame lines, safe areas, registration marks), soft blur, slow parallax
//   mid  layer: tick rulers + crosses + tiny timecodes, lighter blur, faster parallax
//   dots      : an abstract halftone field that surfaces now and then, unevenly, different every time
//   shadow    : soft shadow under the player picture (window.TGStage rect), a little deeper as you scroll
//   grain     : very faint paper grain
// All grey on the page background, very low contrast.
(function () {
  'use strict';
  const INK = '40,40,48';           // rgb of all line work
  const FAR = 0.25, MID = 0.55;     // parallax factors (share of scroll speed)
  const SCROLL_SCREENS = 4;         // page height in screens

  // ---- page height so the page can scroll ----
  const spacer = document.createElement('div');
  spacer.id = 'tg-scroll-space';
  spacer.style.cssText = `height:${SCROLL_SCREENS * 100}vh;pointer-events:none;`;
  document.body.appendChild(spacer);

  const cv = document.createElement('canvas');
  cv.id = 'tg-atmosphere';
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
  document.body.insertBefore(cv, document.body.firstChild);
  const g = cv.getContext('2d');

  let W = 1, H = 1, dpr = 1, far = null, mid = null, grain = null;
  const rnd = (() => { let a = (Math.random() * 1e9) | 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
  const R = (a, b) => a + rnd() * (b - a);

  function layerCanvas(h) { const c = document.createElement('canvas'); c.width = Math.ceil(W * dpr); c.height = Math.ceil(h * dpr); const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return [c, x]; }
  function maxScroll() { return Math.max(0, document.documentElement.scrollHeight - innerHeight); }

  // ---- far layer: frame lines ----
  function buildFar() {
    const h = H + maxScroll() * FAR + 40;
    const [c, x] = layerCanvas(h);
    const sketch = document.createElement('canvas'); sketch.width = c.width; sketch.height = c.height;
    const s = sketch.getContext('2d'); s.setTransform(dpr, 0, 0, dpr, 0, 0);
    s.strokeStyle = `rgba(${INK},0.16)`; s.lineWidth = 1;
    const n = Math.round(h / H * 3);
    for (let i = 0; i < n; i++) {
      const ar = rnd() < 0.5 ? 2.39 : 1.85;
      const fw = R(W * 0.25, W * 0.6), fh = fw / ar;
      const fx = R(-fw * 0.3, W - fw * 0.7), fy = R(0, h - fh);
      s.strokeRect(fx, fy, fw, fh);
      // safe area (90%) dashed
      s.setLineDash([2, 5]); s.strokeRect(fx + fw * 0.05, fy + fh * 0.05, fw * 0.9, fh * 0.9); s.setLineDash([]);
      // centre cross
      const cx = fx + fw / 2, cy = fy + fh / 2;
      s.beginPath(); s.moveTo(cx - 8, cy); s.lineTo(cx + 8, cy); s.moveTo(cx, cy - 8); s.lineTo(cx, cy + 8); s.stroke();
      // corner marks
      [[fx, fy, 1, 1], [fx + fw, fy, -1, 1], [fx, fy + fh, 1, -1], [fx + fw, fy + fh, -1, -1]].forEach(([px, py, dx, dy]) => {
        s.beginPath(); s.moveTo(px - dx * 10, py); s.lineTo(px - dx * 3, py); s.moveTo(px, py - dy * 10); s.lineTo(px, py - dy * 3); s.stroke();
      });
      s.font = '9px "Helvetica Neue", Arial, sans-serif'; s.fillStyle = `rgba(${INK},0.2)`;
      s.fillText(ar.toFixed(2) + ' : 1', fx + 4, fy - 5);
    }
    x.filter = 'blur(1.4px)'; x.drawImage(sketch, 0, 0, W, h); x.filter = 'none';
    far = c;
  }

  // ---- mid layer: rulers, registration marks, timecodes ----
  function tc() { const f = n => String(n).padStart(2, '0'); return `${f(Math.floor(R(0, 2)))}:${f(Math.floor(R(0, 60)))}:${f(Math.floor(R(0, 60)))}:${f(Math.floor(R(0, 24)))}`; }
  function buildMid() {
    const h = H + maxScroll() * MID + 40;
    const [c, x] = layerCanvas(h);
    const sketch = document.createElement('canvas'); sketch.width = c.width; sketch.height = c.height;
    const s = sketch.getContext('2d'); s.setTransform(dpr, 0, 0, dpr, 0, 0);
    s.strokeStyle = `rgba(${INK},0.22)`; s.lineWidth = 0.75;
    s.font = '8px Menlo, Monaco, monospace';
    const n = Math.round(h / H * 4);
    for (let i = 0; i < n; i++) {
      const kind = rnd();
      const px = R(0, W), py = R(0, h);
      if (kind < 0.45) {                       // tick ruler
        const len = R(W * 0.12, W * 0.35), vert = rnd() < 0.3, step = 6;
        s.beginPath();
        if (!vert) { s.moveTo(px, py); s.lineTo(px + len, py); for (let t = 0, k = 0; t <= len; t += step, k++) { const l = k % 10 === 0 ? 7 : k % 5 === 0 ? 4 : 2; s.moveTo(px + t, py); s.lineTo(px + t, py + l); } }
        else { s.moveTo(px, py); s.lineTo(px, py + len); for (let t = 0, k = 0; t <= len; t += step, k++) { const l = k % 10 === 0 ? 7 : k % 5 === 0 ? 4 : 2; s.moveTo(px, py + t); s.lineTo(px + l, py + t); } }
        s.stroke();
        s.fillStyle = `rgba(${INK},0.24)`; s.fillText(tc(), vert ? px + 10 : px, vert ? py - 4 : py - 5);
      } else if (kind < 0.8) {                 // registration mark
        const r = R(5, 11);
        s.beginPath(); s.arc(px, py, r, 0, Math.PI * 2); s.moveTo(px - r * 1.8, py); s.lineTo(px + r * 1.8, py); s.moveTo(px, py - r * 1.8); s.lineTo(px, py + r * 1.8); s.stroke();
      } else {                                 // long hairline with end dots
        const len = R(W * 0.2, W * 0.5), a = rnd() < 0.7 ? 0 : Math.PI / 2;
        const ex = px + Math.cos(a) * len, ey = py + Math.sin(a) * len;
        s.setLineDash([1, 3]); s.beginPath(); s.moveTo(px, py); s.lineTo(ex, ey); s.stroke(); s.setLineDash([]);
        s.fillStyle = `rgba(${INK},0.3)`; [[px, py], [ex, ey]].forEach(([qx, qy]) => { s.beginPath(); s.arc(qx, qy, 1.4, 0, Math.PI * 2); s.fill(); });
      }
    }
    x.filter = 'blur(0.5px)'; x.drawImage(sketch, 0, 0, W, h); x.filter = 'none';
    mid = c;
  }

  // ---- grain tile ----
  function buildGrain() {
    const c = document.createElement('canvas'); c.width = c.height = 160;
    const x = c.getContext('2d'), im = x.createImageData(160, 160);
    for (let i = 0; i < im.data.length; i += 4) { const v = rnd() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 7; }
    x.putImageData(im, 0, 0); grain = g.createPattern(c, 'repeat');
  }

  // ---- dot field: surfaces now and then, different each time ----
  function vnoise(seed) {           // smooth 3D value noise
    const P = new Uint8Array(512); const base = [...Array(256).keys()];
    let a = seed | 0; const r = () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [base[i], base[j]] = [base[j], base[i]]; }
    for (let i = 0; i < 512; i++) P[i] = base[i & 255];
    const V = new Float32Array(256).map(() => r());
    const sm = t => t * t * (3 - 2 * t), L = (a, b, t) => a + (b - a) * t;
    const h = (x, y, z) => V[P[P[P[x & 255] + (y & 255)] + (z & 255)]];
    return (x, y, z) => {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = sm(x - xi), yf = sm(y - yi), zf = sm(z - zi);
      return L(L(L(h(xi, yi, zi), h(xi + 1, yi, zi), xf), L(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), xf), yf),
               L(L(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), xf), L(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), xf), yf), zf);
    };
  }
  const dots = { phase: 'idle', t0: performance.now(), wait: R(12, 30) * 1000, rise: 0, hold: 0, fall: 0, noise: null, cx: 0, cy: 0, dir: 0, cell: 10, square: false };
  function newEmergence(now) {
    Object.assign(dots, {
      phase: 'rise', t0: now, rise: R(6, 11) * 1000, hold: R(3, 8) * 1000, fall: R(9, 16) * 1000,
      noise: vnoise((Math.random() * 1e9) | 0), cx: R(0.1, 0.9), cy: R(0.15, 0.85), dir: R(0, Math.PI * 2),
      rad: R(0.25, 0.5), cell: Math.round(R(8, 13)), square: rnd() < 0.5, scale: R(5, 11),
    });
  }
  function dotsAmount(now) {
    const d = dots, t = now - d.t0;
    if (d.phase === 'idle') { if (t > d.wait) newEmergence(now); return 0; }
    if (d.phase === 'rise') { if (t > d.rise) { d.phase = 'hold'; d.t0 = now; } return Math.min(1, t / d.rise); }
    if (d.phase === 'hold') { if (t > d.hold) { d.phase = 'fall'; d.t0 = now; } return 1; }
    if (t > d.fall) { d.phase = 'idle'; d.t0 = now; d.wait = R(35, 90) * 1000; return 0; }
    return 1 - t / d.fall;
  }
  function drawDots(now, amount, scrollY) {
    const d = dots, c = d.cell, z = now / 1000 * 0.04;          // slow evolution
    const off = (scrollY * MID) % c;
    const ox = d.cx * W, oy = d.cy * H, rad = d.rad * Math.max(W, H);
    const dx = Math.cos(d.dir), dy = Math.sin(d.dir);
    g.fillStyle = `rgba(${INK},0.13)`;
    for (let y = -off; y < H + c; y += c) for (let x = c / 2; x < W; x += c) {
      const ux = (x - ox) / rad, uy = (y - oy) / rad;
      const dist = Math.hypot(ux, uy);
      if (dist > 1.6) continue;
      const n = d.noise(x / c / d.scale, (y + scrollY * MID) / c / d.scale, z);
      const grad = 0.5 + 0.5 * (ux * dx + uy * dy);            // uneven: denser on one side
      const v = n * (1.25 - dist * 0.7) * (0.55 + 0.6 * grad) - (1 - amount) * 1.1 - 0.25;
      if (v <= 0) continue;
      const r = Math.min(c * 0.46, v * c * 0.9);
      if (r < 0.5) continue;
      if (d.square) g.fillRect(x - r, y - r, r * 2, r * 2);
      else { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    }
  }

  // ---- frame ----
  function resize() {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr);
    buildFar(); buildMid(); buildGrain();
  }
  let rt = 0; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  resize();

  let last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || now - last < 33) return;   // ~30 fps is plenty
    last = now;
    const sy = window.scrollY || 0, sFrac = maxScroll() ? sy / maxScroll() : 0;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    if (far) g.drawImage(far, 0, sy * FAR * dpr, far.width, H * dpr, 0, 0, W, H);
    const amt = dotsAmount(now); if (amt > 0.001) drawDots(now, amt, sy);
    if (mid) g.drawImage(mid, 0, sy * MID * dpr, mid.width, H * dpr, 0, 0, W, H);
    // shadow under the player picture
    const st = window.TGStage;
    if (st && st.w > 0) {
      g.save();
      g.shadowColor = `rgba(0,0,0,${0.13 + 0.07 * sFrac})`;
      g.shadowBlur = 50 + 30 * sFrac; g.shadowOffsetY = 22 + 18 * sFrac;
      g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--tg-page-bg').trim() || '#f5f5ff';
      g.fillRect(st.x, st.y, st.w, st.h);
      g.restore();
    }
    g.fillStyle = grain; g.fillRect(0, 0, W, H);
  }
  requestAnimationFrame(frame);

  window.TGAtmosphere = { rebuild: resize, surface() { newEmergence(performance.now()); } };
})();
