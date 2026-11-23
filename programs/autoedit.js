// build: tommygee-v26-autoedit
// Auto edit — chops the current slot's video at its hard cuts and jumps between the slices.
//   Trigger  : bass hits (< 50 Hz, same auto-levelled detection as the sequencer) or a timer
//   Length   : play the whole slice until the next trigger, or only N beats (BPM per song, set in the slot list) then hold
//   Cuts     : found automatically in the browser the first time a video is used (fast scan), stored per video URL.
//              Until the scan is done, the video is cut into even 2-second slices.
window.TG_PROGRAMS = window.TG_PROGRAMS || {};
window.TG_PROGRAMS.autoedit = {
  name: 'Auto edit',
  create(container) {
    'use strict';
    const STORE_KEY = 'tommygee.autoedit.cfg.v1';
    const CUTS_KEY = 'tommygee.cuts.v1';
    const CFG_DEFAULT = {
      bg: '#a7a7a7',
      trigger: 'bass',      // 'bass' | 'timer'
      sens: 0.6,            // bass sensitivity (same meaning as the sequencer)
      gap: 0.3,             // min seconds between bass triggers
      every: 2,             // timer: seconds between jumps
      length: 'whole',      // 'whole' | 'beats'
      beats: 2,             // beats to play before holding (length = beats)
      cutSens: 0.5,         // cut detection sensitivity
    };
    let CFG = { ...CFG_DEFAULT };
    try { CFG = { ...CFG_DEFAULT, ...(JSON.parse(localStorage.getItem(STORE_KEY)) || {}) }; } catch (e) {}
    const saveCFG = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(CFG)); } catch (e) {} };

    const loadCuts = () => { try { return JSON.parse(localStorage.getItem(CUTS_KEY)) || {}; } catch (e) { return {}; } };
    const saveCuts = all => { try { localStorage.setItem(CUTS_KEY, JSON.stringify(all)); } catch (e) {} };

    // ---- canvas ----
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:100%;';
    container.appendChild(canvas);
    const g = canvas.getContext('2d');
    let dpr = 1, W = 1, H = 1;
    function resize() {
      dpr = window.devicePixelRatio || 1;
      W = Math.max(1, container.clientWidth); H = Math.max(1, container.clientHeight);
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
    }
    const ro = new ResizeObserver(resize); ro.observe(container); resize();

    const deck = window.TGDeck;
    let status = '';

    // ---- slices for the current video ----
    let curUrl = '', cuts = null, scanning = null;
    function mediaUrl() { const s = deck && deck.slots[deck.index]; return s ? s.media : ''; }
    function evenCuts(dur) { const c = []; for (let t = 0; t < dur - 0.5; t += 2) c.push(+t.toFixed(3)); return c.length ? c : [0]; }
    function slices() {
      const v = deck && deck.visual; const dur = v && v.duration;
      if (!(v instanceof HTMLVideoElement) || !dur || !isFinite(dur)) return null;
      const c = (cuts && cuts.length) ? cuts : evenCuts(dur);
      return c.map((t, i) => ({ start: t, end: i + 1 < c.length ? c[i + 1] : dur }));
    }
    function syncUrl() {
      const u = mediaUrl();
      if (u === curUrl) return;
      curUrl = u; cuts = null; current = -1; held = false;
      if (!u || !/\.(mp4|mov|m4v|webm)(\?|$)/i.test(u)) { status = 'no video in this slot'; return; }
      const stored = loadCuts()[u];
      if (stored && stored.sens === CFG.cutSens) { cuts = stored.cuts; status = cuts.length + ' slices'; }
      else scanCuts(u);
    }

    // ---- in-browser hard-cut detection: play a hidden copy fast, compare small frames ----
    function scanCuts(url) {
      if (scanning) scanning.cancel();
      const v = document.createElement('video');
      v.crossOrigin = 'anonymous'; v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
      const c = document.createElement('canvas'); c.width = 32; c.height = 18;
      const x = c.getContext('2d', { willReadFrequently: true });
      let prev = null, lastT = -1, found = [0], diffs = [], cancelled = false;
      const job = { cancel() { cancelled = true; try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {} } };
      scanning = job;
      status = 'finding cuts…';
      const minShot = 0.25;
      const thrAbs = 18 + (1 - CFG.cutSens) * 30;           // absolute floor (0–255 luma diff)
      const thrRel = 2.5 + (1 - CFG.cutSens) * 4;           // how far above the recent average
      function frame(now, meta) {
        if (cancelled) return;
        const t = meta ? meta.mediaTime : v.currentTime;
        try {
          x.drawImage(v, 0, 0, 32, 18);
          const d = x.getImageData(0, 0, 32, 18).data, lum = new Float32Array(576);
          for (let i = 0, j = 0; i < d.length; i += 4, j++) lum[j] = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
          if (prev && t > lastT) {
            let s = 0; for (let j = 0; j < 576; j++) s += Math.abs(lum[j] - prev[j]);
            const diff = s / 576;
            const recent = diffs.slice(-12), avg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : diff;
            if (diff > thrAbs && diff > avg * thrRel && t - found[found.length - 1] >= minShot) found.push(+t.toFixed(3));
            diffs.push(diff);
          }
          prev = lum; lastT = t;
          status = 'finding cuts… ' + Math.round(100 * t / (v.duration || 1)) + '%';
        } catch (e) { status = 'cut scan blocked (CORS)'; job.cancel(); finish(); return; }
        if (!v.ended) next();
      }
      const next = () => ('requestVideoFrameCallback' in v) ? v.requestVideoFrameCallback(frame) : setTimeout(() => frame(0, null), 30);
      function finish() {
        if (cancelled && status.startsWith('cut scan blocked')) { scanning = null; return; }
        if (scanning !== job) return;
        scanning = null;
        if (url !== curUrl) return;
        cuts = found;
        const all = loadCuts(); all[url] = { cuts: found, sens: CFG.cutSens, dur: v.duration }; saveCuts(all);
        status = found.length + ' slices';
        try { v.removeAttribute('src'); v.load(); } catch (e) {}
      }
      v.addEventListener('ended', finish);
      v.addEventListener('error', () => { if (scanning === job) { scanning = null; status = 'cut scan failed'; } });
      v.addEventListener('loadeddata', () => { v.playbackRate = 6; v.play().then(next).catch(() => { status = 'cut scan could not start'; scanning = null; }); }, { once: true });
    }

    // ---- triggering ----
    let current = -1, held = false, holdAt = 0, lastTrig = 0, timerAcc = 0;
    let aPeak = 0.02, aArmed = true;
    function jump(now) {
      const sl = slices(); const v = deck.visual;
      if (!sl || !sl.length) return;
      let k = Math.floor(Math.random() * sl.length);
      if (sl.length > 1 && k === current) k = (k + 1 + Math.floor(Math.random() * (sl.length - 1))) % sl.length;
      current = k; held = false; lastTrig = now;
      try { v.currentTime = sl[k].start; } catch (e) {}
      if (deck.playing && v.paused) v.play().catch(() => {});
      const bpm = +(deck.slots[deck.index].bpm) || 0;
      holdAt = (CFG.length === 'beats' && bpm > 0) ? now + CFG.beats * 60000 / bpm : 0;
    }

    function draw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const m = deck && deck.visual;
      if (!(m instanceof HTMLVideoElement || m instanceof HTMLImageElement)) { g.clearRect(0, 0, W, H); return; }
      const dw = m.videoWidth || m.naturalWidth, dh = m.videoHeight || m.naturalHeight;
      if (!dw || (m instanceof HTMLVideoElement && (m.readyState < 2 || m.seeking))) return;   // keep the last picture
      g.clearRect(0, 0, W, H);
      const s = Math.min(W / dw, H / dh), w = dw * s, h = dh * s;
      g.drawImage(m, (W - w) / 2, (H - h) / 2, w, h);
    }

    let raf = 0, prevT = performance.now();
    function loop(now) {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - prevT) / 1000); prevT = now;
      syncUrl();
      const v = deck && deck.visual;
      if (deck && deck.playing && v instanceof HTMLVideoElement) {
        if (current < 0) jump(now);
        if (CFG.trigger === 'timer') {
          timerAcc += dt; if (timerAcc >= CFG.every) { timerAcc = 0; jump(now); }
        } else {
          const lvl = deck.lowLevel ? deck.lowLevel() : 0;
          aPeak = Math.max(lvl, aPeak * Math.exp(-dt / 8), 0.02);
          const r = lvl / aPeak, on = 1 - CFG.sens * 0.85;
          if (aArmed && r >= on && (now - lastTrig) / 1000 >= CFG.gap) { aArmed = false; jump(now); }
          else if (r < on * 0.7) aArmed = true;
        }
        if (holdAt && now >= holdAt && !held) { held = true; v.pause(); }
      } else if (!(deck && deck.playing)) { current = -1; timerAcc = 0; }
      draw();
    }
    raf = requestAnimationFrame(loop);

    // controls shown by the page console (Program section)
    const controls = [
      { key: 'trigger', label: 'Trigger', type: 'select', options: [['bass', 'Bass hits'], ['timer', 'Timer']], def: 'bass' },
      { key: 'sens', label: 'Bass sensitivity', min: 0, max: 1, step: 0.01, def: 0.6, show: c => c.trigger === 'bass' },
      { key: 'gap', label: 'Min gap (s)', min: 0.05, max: 2, step: 0.05, def: 0.3, show: c => c.trigger === 'bass' },
      { key: 'every', label: 'Every (s)', min: 0.25, max: 8, step: 0.25, def: 2, show: c => c.trigger === 'timer' },
      { key: 'length', label: 'Slice length', type: 'select', options: [['whole', 'Whole slice'], ['beats', 'Beats (then hold)']], def: 'whole' },
      { key: 'beats', label: 'Beats', min: 0.25, max: 8, step: 0.25, def: 2, show: c => c.length === 'beats' },
      { key: 'cutSens', label: 'Cut detection', min: 0, max: 1, step: 0.05, def: 0.5 },
      { type: 'button', label: 'Find cuts again', act: () => { const all = loadCuts(); delete all[curUrl]; saveCuts(all); const u = curUrl; curUrl = ''; } },
      { type: 'info', label: 'Slices', text: () => {
          const bpm = deck && +(deck.slots[deck.index].bpm);
          return status + (CFG.length === 'beats' && !bpm ? ' · set a BPM for this song in the slot list' : '');
        } },
    ];

    function getParams() { return { cfg: { ...CFG } }; }
    function setParams(obj) {
      if (!obj || !obj.cfg) return;
      const sensChanged = obj.cfg.cutSens !== undefined && obj.cfg.cutSens !== CFG.cutSens;
      CFG = { ...CFG, ...obj.cfg }; saveCFG();
      if (sensChanged) curUrl = '';   // re-check stored cuts (re-scan if they were made with another sensitivity)
    }
    function destroy() {
      cancelAnimationFrame(raf);
      if (scanning) scanning.cancel();
      const v = deck && deck.visual;
      if (v instanceof HTMLVideoElement && deck.playing && v.paused) v.play().catch(() => {});
      ro.disconnect(); canvas.remove();
    }
    return { destroy, getParams, setParams, onKey() {}, resize, controls };
  },
};
