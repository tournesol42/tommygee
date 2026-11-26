// build: tommygee-v36-nav
// TGNav — one big graphical element that moves when you scroll/swipe between tracks.
// Styles (console → Page → "Track scroll look"):
//   strip      – full-height colour column at the right edge with a still of every track; it slides, the current one sits in the marker
//   shutter    – a solid colour block wipes up over the picture on each track change, with the big track number on it
//   number     – one giant track number that rolls up/down
//   paternoster– the pictures sit in a vertical stack; the next track's picture slides in from below
//   none       – only a small elastic nudge of the picture
// Reads the gesture state from TGCounter (counter.js). Settings: localStorage 'tommygee.nav.v1' {style, color}.
(function () {
  'use strict';
  if (!window.TGDeck || !window.TGCounter) return;
  const KEY = 'tommygee.nav.v1';
  let cfg = { style: 'strip', color: '#FF2A1A' };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} };

  const cv = document.createElement('canvas');
  cv.id = 'tg-nav-canvas';
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:5;pointer-events:none';
  document.body.appendChild(cv);
  const g = cv.getContext('2d');

  // ---- stills of every track (for strip + paternoster) ----
  const thumbs = {};   // url -> canvas
  function thumbFor(url) {
    if (!url) return null;
    if (thumbs[url] !== undefined) return thumbs[url];
    thumbs[url] = null;
    const c = document.createElement('canvas'); c.width = 480; c.height = 270;
    const cx = c.getContext('2d');
    const draw = src => {
      const sw = src.videoWidth || src.naturalWidth, sh = src.videoHeight || src.naturalHeight; if (!sw || !sh) return;
      const k = Math.max(c.width / sw, c.height / sh);
      cx.drawImage(src, (c.width - sw * k) / 2, (c.height - sh * k) / 2, sw * k, sh * k); thumbs[url] = c;
    };
    if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(url)) {
      const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => draw(im); im.src = url;
    } else {
      const v = document.createElement('video'); v.crossOrigin = 'anonymous'; v.muted = true; v.playsInline = true; v.preload = 'auto';
      v.addEventListener('loadeddata', () => { v.currentTime = Math.min(2, (v.duration || 4) * 0.25); }, { once: true });
      v.addEventListener('seeked', () => { draw(v); v.removeAttribute('src'); v.load(); }, { once: true });
      v.src = url;
    }
    return null;
  }
  const filledList = () => TGDeck.slots.map((s, i) => (s.media || s.audio) ? i : -1).filter(i => i >= 0);
  // slot position (float) -> position in the list of filled slots (float)
  function listPos(x, L) {
    if (!L.length) return 0;
    if (x <= L[0]) return x - L[0];
    for (let k = 0; k < L.length - 1; k++) if (x <= L[k + 1]) return k + (x - L[k]) / (L[k + 1] - L[k]);
    return L.length - 1 + (x - L[L.length - 1]);
  }

  // ---- shutter animation state ----
  let lastIndex = TGDeck.index, wipeT = 1, wipeDir = 1;
  TGDeck.onChange(() => {
    if (TGDeck.index !== lastIndex) { wipeDir = Math.sign(TGCounter.drag) || (TGDeck.index > lastIndex ? 1 : -1); lastIndex = TGDeck.index; wipeT = 0; }
  });

  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  let prevT = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - prevT) / 1000); prevT = now;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.round(innerWidth * dpr), H = Math.round(innerHeight * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, innerWidth, innerHeight);

    const prog = document.getElementById('tg-program-container');
    const shown = TGCounter.shown, idx = TGDeck.index, off = shown - idx;
    const L = filledList(), p = listPos(shown, L), pi = listPos(idx, L);
    const shift = parseFloat(css('--tg-shift')) || 0;

    // picture movement
    let pr = prog ? prog.getBoundingClientRect() : null;
    if (prog) {
      const curNudge = parseFloat(prog.style.getPropertyValue('--tg-nudge')) || 0;
      const top = pr.top - curNudge, ph = pr.height;
      let nudge = -(p - pi) * 46, sc = 1 - Math.min(0.03, Math.abs(p - pi) * 0.03);
      if (cfg.style === 'paternoster') { nudge = -(p - pi) * ph; sc = 1; }
      prog.style.setProperty('--tg-nudge', nudge.toFixed(1) + 'px');
      prog.style.scale = sc.toFixed(4);
      pr = { left: pr.left, top, width: pr.width, height: ph };
    }
    if (!pr || cfg.style === 'none') return;
    const col = cfg.color;

    if (cfg.style === 'strip') {
      const tw = Math.min(innerWidth * 0.16, 300), th = tw * 9 / 16, gap = 12, pad = 14;
      const colW = tw + pad * 2, x0 = innerWidth - colW, mid = pr.top + pr.height / 2;
      g.fillStyle = col; g.fillRect(x0, 0, colW, innerHeight);
      L.forEach((slot, k) => {
        const y = mid + (k - p) * (th + gap) - th / 2;
        if (y > innerHeight || y + th < 0) return;
        const t = thumbFor(TGDeck.slots[slot].media);
        g.globalAlpha = Math.abs(k - p) < 0.5 ? 1 : 0.55;
        if (t) g.drawImage(t, x0 + pad, y, tw, th); else { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x0 + pad, y, tw, th); }
        g.globalAlpha = 1; g.fillStyle = '#000'; g.font = '700 ' + Math.round(th * 0.2) + 'px "Helvetica Neue", Helvetica, sans-serif';
        g.textBaseline = 'top'; g.fillText(String(slot + 1).padStart(2, '0'), x0 + pad + 6, y + 5);
      });
      // fixed marker (the "gate")
      g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeRect(x0 + pad - 5, mid - th / 2 - 5, tw + 10, th + 10);
    }

    if (cfg.style === 'number') {
      const h = pr.height * 0.62, x = pr.left + innerWidth * 0.04, y = pr.top + (pr.height - h) / 2;
      const n = Math.max(0, shown + 1), n0 = Math.floor(n), fr = n - n0;
      g.save(); g.beginPath(); g.rect(x - 10, y - h * 0.08, innerWidth * 0.6, h * 1.16); g.clip();
      g.fillStyle = col; g.font = '700 ' + Math.round(h) + 'px "Helvetica Neue", Helvetica, sans-serif'; g.textBaseline = 'top';
      g.fillText(String(n0).padStart(2, '0'), x, y - fr * h * 1.1);
      g.fillText(String(n0 + 1).padStart(2, '0'), x, y + h * 1.1 - fr * h * 1.1);
      g.restore();
    }

    if (cfg.style === 'shutter') {
      wipeT = Math.min(1, wipeT + dt / 0.8);
      const { left, top, width, height } = pr;
      let a = 0, b = 0;   // covered band [a,b] as fraction from the leading side
      if (wipeT < 1) {
        const t = wipeT, e = x => 1 - Math.pow(1 - x, 3);
        if (t < 0.3) { a = 0; b = e(t / 0.3); } else { a = e((t - 0.3) / 0.7); b = 1; }
      } else if (Math.abs(TGCounter.drag) > 0.01) { a = 0; b = Math.min(0.45, Math.abs(TGCounter.drag) * 0.5); wipeDir = Math.sign(TGCounter.drag); }
      if (b > a) {
        const y1 = wipeDir > 0 ? top + height * (1 - b) : top + height * a;
        const y2 = wipeDir > 0 ? top + height * (1 - a) : top + height * b;
        g.fillStyle = col; g.fillRect(left, y1, width, y2 - y1);
        g.save(); g.beginPath(); g.rect(left, y1, width, y2 - y1); g.clip();
        g.fillStyle = '#000'; g.font = '700 ' + Math.round(height * 0.5) + 'px "Helvetica Neue", Helvetica, sans-serif'; g.textBaseline = 'middle';
        g.fillText(String(idx + 1).padStart(2, '0'), left + width * 0.04, top + height / 2);
        g.restore();
      }
    }

    if (cfg.style === 'paternoster') {
      const k = Math.round(pi), d = p - pi;
      [-1, 1].forEach(s => {
        const slot = L[((k + s) % L.length + L.length) % L.length]; if (slot === undefined || L.length < 2) return;
        const t = thumbFor(TGDeck.slots[slot].media);
        const y = pr.top + (s - d) * pr.height;
        if (y > innerHeight || y + pr.height < 0) return;
        if (t) g.drawImage(t, pr.left, y, pr.width, pr.height); else { g.fillStyle = col; g.fillRect(pr.left, y, pr.width, pr.height); }
      });
    }
  }
  requestAnimationFrame(frame);

  window.TGNav = {
    get style() { return cfg.style; }, set style(v) { cfg.style = v; save(); },
    get color() { return cfg.color; }, set color(v) { if (/^#[0-9a-f]{6}$/i.test(v)) { cfg.color = v; save(); } },
  };
})();
