// build: tommygee-v23-paper-pixels
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

  // ---- paper: fine grain + soft mottling + fibres + specks (one 512 px tile) ----
  function buildGrain() {
    const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
    const x = c.getContext('2d');
    // soft mottling (cloudy paper density)
    for (let i = 0; i < 45; i++) {
      const px = rnd() * S, py = rnd() * S, r = R(50, 140), dark = rnd() < 0.5;
      const gr = x.createRadialGradient(px, py, 0, px, py, r);
      gr.addColorStop(0, dark ? 'rgba(60,55,50,0.022)' : 'rgba(255,255,255,0.045)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { x.save(); x.translate(ox, oy); x.fillStyle = gr; x.fillRect(px - r, py - r, r * 2, r * 2); x.restore(); }
    }
    // fine grain
    const im = x.getImageData(0, 0, S, S), d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = rnd(); const dark = v < 0.5;
      const a = Math.abs(v - 0.5) * 2 * 20;            // up to ~20/255
      const tone = dark ? 40 : 255;
      const k = a / 255, ia = d[i + 3] / 255;
      d[i] = (tone * k + d[i] * ia * (1 - k)) / Math.max(1e-6, k + ia * (1 - k));
      d[i + 1] = d[i]; d[i + 2] = d[i];
      d[i + 3] = Math.min(255, (k + ia * (1 - k)) * 255);
    }
    x.putImageData(im, 0, 0);
    // fibres
    x.lineCap = 'round';
    for (let i = 0; i < 70; i++) {
      const px = rnd() * S, py = rnd() * S, len = R(6, 26), a = rnd() * Math.PI * 2, bend = R(-0.6, 0.6);
      x.strokeStyle = `rgba(70,65,60,${R(0.05, 0.12)})`; x.lineWidth = R(0.4, 0.9);
      x.beginPath(); x.moveTo(px, py);
      x.quadraticCurveTo(px + Math.cos(a + bend) * len / 2, py + Math.sin(a + bend) * len / 2, px + Math.cos(a) * len, py + Math.sin(a) * len); x.stroke();
    }
    // specks
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(50,45,40,${R(0.12, 0.3)})`; x.beginPath(); x.arc(rnd() * S, rnd() * S, R(0.4, 1.1), 0, Math.PI * 2); x.fill(); }
    grain = g.createPattern(c, 'repeat');
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
  const hash = (a, b, c) => { let h = Math.imul(a ^ 0x9E3779B1, 0x85EBCA6B) ^ Math.imul(b + 0x632BE5AB, 0xC2B2AE35) ^ Math.imul(c | 0, 0x27D4EB2F); h ^= h >>> 15; h = Math.imul(h, 0x2C1B3C6D); h ^= h >>> 12; return (h >>> 0) / 4294967296; };
  const dots = { phase: 'idle', t0: performance.now(), wait: R(4, 10) * 1000 };
  // a patch of square pixels on a grid: dense/solid at one edge, dissolving to scattered single pixels
  function newEmergence(now) {
    const cell = Math.round(R(7, 11)), cols = Math.round(R(W * 0.28, W * 0.6) / cell), rows = Math.round(R(H * 0.22, H * 0.5) / cell);
    const dir = Math.floor(rnd() * 4);                     // which edge is solid
    const seed = (Math.random() * 1e9) | 0, nz = vnoise(seed);
    const solid = R(0.12, 0.35), curve = R(1.2, 2.4);       // how much is solid, how fast it dissolves
    Object.assign(dots, {
      phase: 'rise', t0: now, rise: R(4, 8) * 1000, hold: R(4, 9) * 1000, fall: R(6, 12) * 1000,
      cell, cols, rows, dir, seed, nz, solid, curve,
      x0: R(0, Math.max(1, W - cols * cell)), y0: R(0, Math.max(1, H - rows * cell)) + (window.scrollY || 0) * MID,
    });
  }
  function dotsAmount(now) {
    const d = dots, t = now - d.t0;
    if (d.phase === 'idle') { if (t > d.wait) newEmergence(now); return 0; }
    if (d.phase === 'rise') { if (t > d.rise) { d.phase = 'hold'; d.t0 = now; } return Math.min(1, t / d.rise); }
    if (d.phase === 'hold') { if (t > d.hold) { d.phase = 'fall'; d.t0 = now; } return 1; }
    if (t > d.fall) { d.phase = 'idle'; d.t0 = now; d.wait = R(14, 35) * 1000; return 0; }
    return 1 - t / d.fall;
  }
  function drawDots(now, amount, scrollY) {
    const d = dots, c = d.cell, sq = Math.max(2, c - 2), z = now / 1000 * 0.05;
    const yOff = d.y0 - scrollY * MID;
    g.fillStyle = `rgba(${INK},0.16)`;
    for (let j = 0; j < d.rows; j++) {
      const y = yOff + j * c; if (y < -c || y > H) continue;
      for (let i = 0; i < d.cols; i++) {
        const x = d.x0 + i * c;
        // position across the patch from the solid edge (0) to the far edge (1)
        let u = d.dir === 0 ? i / d.cols : d.dir === 1 ? 1 - i / d.cols : d.dir === 2 ? j / d.rows : 1 - j / d.rows;
        u += (d.nz(i / 9, j / 9, z) - 0.5) * 0.35;           // ragged, slowly evolving front
        const dens = u < d.solid ? 0.92 : Math.pow(Math.max(0, 1 - (u - d.solid) / (1 - d.solid)), d.curve) * 0.85;
        const r = hash(i, j, d.seed);                          // each pixel's own moment to appear / vanish
        if (r < dens * amount) g.fillRect(x, y, sq, sq);
      }
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
