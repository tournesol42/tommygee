// build: tommygee-v26-slot-bpm
// TGDeck — page-level player: 10 slots, each = image/video + audio file.
// Shared by all programs (Main draws deck.visual; others can use it later).
// Audio: XHR + decodeAudioData + BufferSource (iOS-safe; no fetch, no createMediaElementSource).
(function () {
  'use strict';
  const SLOTS_KEY = 'tommygee.slots.v1';
  const N = 10;
  const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

  let slots = [];
  try { slots = JSON.parse(localStorage.getItem(SLOTS_KEY)) || []; } catch (e) {}
  if (!Array.isArray(slots)) slots = [];
  for (let i = 0; i < N; i++) slots[i] = Object.assign({ media: '', audio: '', title: '' }, slots[i] || {});
  // nothing loaded yet → show the Assemblage image in slot 1 so Main is never blank
  const DEFAULT_MEDIA = 'https://daysof93-cdn.b-cdn.net/assemblage.png';
  if (!slots.some(x => x.media || x.audio)) slots[0].media = DEFAULT_MEDIA;

  let index = 0, playing = false;
  let visual = null;              // HTMLImageElement | HTMLVideoElement | null
  let ctx = null, gain = null, source = null, startAt = 0;
  let lowAn = null, lowBuf = null;
  let buffer = null, bufferUrl = '', loadingUrl = '';
  const bufferCache = new Map();  // url -> AudioBuffer
  const listeners = new Set();
  const emit = () => listeners.forEach(fn => { try { fn(api); } catch (e) {} });

  function save() { try { localStorage.setItem(SLOTS_KEY, JSON.stringify(slots)); } catch (e) {} }
  const filled = i => !!(slots[i] && (slots[i].media || slots[i].audio));

  // ---- visual ----
  // When stopped, show the first frame that isn't (near) black — many clips fade in from black.
  const probe = document.createElement('canvas'); probe.width = 32; probe.height = 18;
  const pctx = probe.getContext('2d', { willReadFrequently: true });
  function frameLuma(v) {
    try { pctx.drawImage(v, 0, 0, 32, 18); const d = pctx.getImageData(0, 0, 32, 18).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; return s / (d.length / 4); }
    catch (e) { return 255; }
  }
  function showPosterFrame(v) {
    if (playing || !(v instanceof HTMLVideoElement)) return;
    const token = v._posterToken = (v._posterToken || 0) + 1;
    const limit = Math.min(6, (v.duration || 6) - 0.1);
    const check = () => {
      if (playing || v !== visual || token !== v._posterToken) return;
      if (frameLuma(v) > 14 || v.currentTime >= limit) { v._posterAt = v.currentTime; emit(); return; }
      v.addEventListener('seeked', check, { once: true });
      v.currentTime = Math.min(limit, v.currentTime + 0.25);
    };
    if (v.readyState >= 2 && !v.seeking) check(); else v.addEventListener('seeked', check, { once: true });
  }
  function loadVisual(url) {
    if (visual instanceof HTMLVideoElement) { visual.pause(); visual.removeAttribute('src'); visual.load(); }
    visual = null;
    if (!url) { emit(); return; }
    if (VIDEO_RE.test(url)) {
      const v = document.createElement('video');
      v.crossOrigin = 'anonymous';          // before src
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('playsinline', '');
      v.src = url;
      v.addEventListener('loadeddata', () => { emit(); showPosterFrame(v); }, { once: true });
      v.addEventListener('seeked', emit);           // redraw the first frame after Stop rewinds
      visual = v;
      if (playing) v.play().catch(() => {});
    } else {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = emit;
      im.onerror = () => { im.onerror = null; const im2 = new Image(); im2.onload = emit; im2.src = url; visual = im2; };
      im.src = url;
      visual = im;
    }
    emit();
  }

  // ---- audio ----
  function ensureCtx() {
    // must be called synchronously inside the user gesture
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      gain = ctx.createGain(); gain.connect(ctx.destination);
      // low band for envelope followers: two 2nd-order low-passes at 50 Hz (≈24 dB/oct) → analyser
      const lp1 = ctx.createBiquadFilter(), lp2 = ctx.createBiquadFilter();
      lp1.type = lp2.type = 'lowpass'; lp1.frequency.value = lp2.frequency.value = 50; lp1.Q.value = lp2.Q.value = 0.707;
      lowAn = ctx.createAnalyser(); lowAn.fftSize = 2048; lowBuf = new Float32Array(lowAn.fftSize);
      gain.connect(lp1); lp1.connect(lp2); lp2.connect(lowAn);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function loadAudio(url, then) {
    if (!url) { buffer = null; bufferUrl = ''; then && then(); return; }
    if (bufferCache.has(url)) { buffer = bufferCache.get(url); bufferUrl = url; then && then(); return; }
    if (!ctx) { bufferUrl = ''; buffer = null; then && then(); return; }   // decoded on first play
    loadingUrl = url;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status >= 400) { console.warn('[deck] audio HTTP', xhr.status, url); return; }
      ctx.decodeAudioData(xhr.response, b => {
        bufferCache.set(url, b);
        if (loadingUrl !== url) return;     // slot changed meanwhile
        buffer = b; bufferUrl = url; then && then();
      }, err => console.warn('[deck] decode failed', url, err));
    };
    xhr.onerror = () => console.warn('[deck] audio load failed (CORS?)', url);
    xhr.send();
  }
  function stopSource() {
    if (source) { source.onended = null; try { source.stop(); } catch (e) {} source.disconnect(); source = null; }
  }
  function startSource() {
    stopSource();
    if (!ctx || !buffer || !playing) return;
    source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.onended = () => { if (playing) next(); };
    startAt = ctx.currentTime;
    source.start();
  }

  // ---- slot ----
  function select(i) {
    index = ((i % N) + N) % N;
    const s = slots[index];
    loadVisual(s.media);
    stopSource(); buffer = null; bufferUrl = '';
    loadAudio(s.audio, () => { if (playing) startSource(); });
    emit();
  }

  // ---- transport ----
  function play() {
    ensureCtx();
    if (playing) return;
    if (!filled(index)) { const f = firstFilledFrom(index, 1); if (f < 0) return; select(f); }
    playing = true;
    if (visual instanceof HTMLVideoElement) { visual._posterToken = (visual._posterToken || 0) + 1; if (visual._posterAt) { visual.currentTime = 0; visual._posterAt = 0; } visual.play().catch(() => {}); }
    const url = slots[index].audio;
    if (url && bufferUrl === url && buffer) startSource();
    else loadAudio(url, () => startSource());
    emit();
  }
  function stop() {
    playing = false;
    stopSource();
    if (visual instanceof HTMLVideoElement) { visual.pause(); try { visual.currentTime = 0; } catch (e) {} showPosterFrame(visual); }
    emit();
  }
  function firstFilledFrom(start, dir) {
    for (let k = 0; k < N; k++) { const i = ((start + dir * k) % N + N) % N; if (filled(i)) return i; }
    return -1;
  }
  function step(dir) {
    if (playing) ensureCtx();
    const f = firstFilledFrom(index + dir, dir);
    select(f < 0 ? index + dir : f);
  }
  const next = () => step(1), prev = () => step(-1);

  function setSlot(i, data) {
    const before = slots[i] || {};
    slots[i] = Object.assign({ media: '', audio: '', title: '' }, slots[i], data);
    save();
    const reload = ('media' in data && data.media !== before.media) || ('audio' in data && data.audio !== before.audio);
    if (i === index && reload) select(index);   // title / BPM changes don't interrupt playback
    else emit();
  }

  const api = {
    N,
    get slots() { return slots.map(s => ({ ...s })); },
    get index() { return index; },
    get playing() { return playing; },
    get visual() { return visual; },
    get audioContext() { return ctx; },
    get duration() { return buffer ? buffer.duration : 0; },
    get progress() { return (playing && source && buffer && ctx) ? Math.min(1, Math.max(0, (ctx.currentTime - startAt) / buffer.duration)) : 0; },
    get title() {
      const sl = slots[index]; if (!sl) return '';
      if (sl.title) return sl.title;
      const u = sl.audio || sl.media; if (!u) return '';
      try { return decodeURIComponent(u.split('?')[0].split('/').pop()).replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' '); } catch (e) { return u; }
    },
    get output() { return gain; },
    // RMS level of the audio below 50 Hz, 0..~1 (0 when nothing plays)
    lowLevel() {
      if (!lowAn || !playing) return 0;
      lowAn.getFloatTimeDomainData(lowBuf);
      let sum = 0; for (let i = 0; i < lowBuf.length; i++) sum += lowBuf[i] * lowBuf[i];
      return Math.sqrt(sum / lowBuf.length);
    },
    play, stop, next, prev, select, setSlot,
    setSlots(arr) { if (!Array.isArray(arr)) return; for (let i = 0; i < N; i++) slots[i] = Object.assign({ media: '', audio: '', title: '' }, arr[i] || {}); save(); select(index); },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
  window.TGDeck = api;
  select(0);
})();
