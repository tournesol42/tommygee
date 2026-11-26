// build: tommygee-v35-counter
// TGCounter — red 7-segment counter (TRACK · MIN · SEC · BPM · LEVEL) that is also the track switch.
// Scroll / swipe (iPhone) / arrow keys move one track; the TRACK digits roll with the gesture like an
// odometer, overshoot and spring back; the other fields scramble on a change. The picture gets a small
// elastic nudge. Colour is set from the console (Transport colours → Counter).
(function () {
  'use strict';
  const el = document.getElementById('tg-counter');
  if (!el || !window.TGDeck) return;
  const cv = document.createElement('canvas');
  el.appendChild(cv);
  const g = cv.getContext('2d');

  let color = '#FF2A1A';
  const THRESH_WHEEL = 140, THRESH_TOUCH = 70;   // gesture distance for one track

  // --- 7-segment geometry (unit cell 10 x 18) ---
  const SEG = { a: [[1.6,0.6],[8.4,0.6],[7.2,1.9],[2.8,1.9]], b: [[8.6,1],[9.4,1.8],[9.4,8.4],[8.6,8.9],[7.4,8],[7.4,2.2]],
    c: [[8.6,9.1],[9.4,9.6],[9.4,16.2],[8.6,17],[7.4,15.8],[7.4,10]], d: [[2.8,16.1],[7.2,16.1],[8.4,17.4],[1.6,17.4]],
    e: [[1.4,9.1],[2.6,10],[2.6,15.8],[1.4,17],[0.6,16.2],[0.6,9.6]], f: [[1.4,1],[2.6,2.2],[2.6,8],[1.4,8.9],[0.6,8.4],[0.6,1.8]],
    g: [[1.6,9],[2.8,8.35],[7.2,8.35],[8.4,9],[7.2,9.65],[2.8,9.65]] };
  const DIG = ['abcdef','bc','abged','abgcd','fgbc','afgcd','afgedc','abc','abcdefg','abcdfg'];
  function digit(x, y, s, d, lit) {
    const on = d === null ? '' : DIG[d];
    for (const k in SEG) {
      const isOn = on.indexOf(k) >= 0;
      if (isOn !== lit) continue;
      g.beginPath();
      SEG[k].forEach(([px, py], i) => { const X = x + (px + (17 - py) * 0.09) * s, Y = y + py * s; i ? g.lineTo(X, Y) : g.moveTo(X, Y); });
      g.closePath(); g.fill();
    }
  }
  // draw one digit cell; v = float value (rolling between floor(v) and floor(v)+1)
  function rollDigit(x, y, s, v, blur) {
    const h = 18 * s, d0 = ((Math.floor(v) % 10) + 10) % 10, fr = v - Math.floor(v);
    g.save(); g.beginPath(); g.rect(x - 2, y - 1, 11 * s + 4, h + 2); g.clip();
    // unlit ghost 8
    g.globalAlpha = 0.13; g.shadowBlur = 0; digit(x, y, s, 8, false); digit(x, y, s, 8, true);
    g.globalAlpha = 1; g.shadowColor = color; g.shadowBlur = 8 * s;
    if (blur > 0.2) g.filter = 'blur(' + Math.min(3, blur).toFixed(1) + 'px)';
    digit(x, y - fr * h * 1.1, s, d0, true);
    if (fr > 0.001) digit(x, y + h * 1.1 - fr * h * 1.1, s, (d0 + 1) % 10, true);
    g.restore();
  }
  function staticDigit(x, y, s, d) {
    g.save(); g.globalAlpha = 0.13; digit(x, y, s, 8, false); digit(x, y, s, 8, true);
    g.globalAlpha = 1; g.shadowColor = color; g.shadowBlur = 8 * s; if (d !== null) digit(x, y, s, d, true); g.restore();
  }

  // --- state ---
  const filled = i => { const sl = TGDeck.slots[i]; return !!(sl && (sl.media || sl.audio)); };
  let shown = TGDeck.index;          // float track position drawn (0-based)
  let vel = 0;                        // spring velocity
  let drag = 0;                       // live gesture offset in tracks (-1..1)
  let dragging = false, lastIndex = TGDeck.index, scrambleUntil = 0, lockUntil = 0;
  let lvlEnv = 0, lvlPeak = 0.02;

  function commit(dir) {
    if (performance.now() < lockUntil) return;
    lockUntil = performance.now() + 550;      // swallow trackpad inertia
    const before = TGDeck.index;
    if (dir > 0) TGDeck.next(); else TGDeck.prev();
    if (TGDeck.index === before) { drag = 0; return; }   // only one song: just spring back
  }
  TGDeck.onChange(() => {
    if (TGDeck.index !== lastIndex) {
      // carry the visible roll over to the new target so it keeps moving the right way
      const dir = Math.sign(drag) || (TGDeck.index > lastIndex ? 1 : -1);
      shown = lastIndex + drag; drag = 0; dragging = false;
      if (Math.abs(TGDeck.index - shown) > 1.5) shown = TGDeck.index - dir * 0.6;   // wrap-around: roll a short way
      vel = dir * 6;
      lastIndex = TGDeck.index; scrambleUntil = performance.now() + 380;
    }
  });

  // --- gestures (only when the console is closed and not in move mode) ---
  const blocked = e => {
    const cp = document.getElementById('tg-console-panel');
    if (cp && cp.classList.contains('open')) return true;
    if (e && (e.shiftKey || e.altKey)) return true;
    const t = e && e.target;
    return !!(t && t.closest && t.closest('#tg-console-panel, #tg-seq, .overlay, input, textarea, select, [id^="tg-fp"], .tg-cp'));
  };
  let wheelAcc = 0, wheelTimer = 0;
  window.addEventListener('wheel', e => {
    if (blocked(e)) return;
    if (performance.now() < lockUntil) { e.preventDefault(); return; }
    wheelAcc += e.deltaY; dragging = true;
    drag = Math.tanh(wheelAcc / THRESH_WHEEL * 0.9) * 0.95;
    if (Math.abs(wheelAcc) > THRESH_WHEEL) { const d = Math.sign(wheelAcc); wheelAcc = 0; commit(d); }
    clearTimeout(wheelTimer); wheelTimer = setTimeout(() => { wheelAcc = 0; dragging = false; }, 160);
    e.preventDefault();
  }, { passive: false });
  let ty0 = null;
  window.addEventListener('touchstart', e => { if (blocked(e) || e.touches.length !== 1) { ty0 = null; return; } ty0 = e.touches[0].clientY; dragging = true; }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (ty0 === null) return;
    const dy = ty0 - e.touches[0].clientY;            // finger up = next
    drag = Math.tanh(dy / THRESH_TOUCH * 0.8) * 0.95;
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', e => {
    if (ty0 === null) return;
    const dy = ty0 - (e.changedTouches[0] ? e.changedTouches[0].clientY : ty0); ty0 = null; dragging = false;
    if (Math.abs(dy) > THRESH_TOUCH) commit(Math.sign(dy));
  }, { passive: true });
  window.addEventListener('keydown', e => {
    if (blocked(e) || e.metaKey || e.ctrlKey) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { commit(1); e.preventDefault(); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { commit(-1); e.preventDefault(); }
  });

  // --- draw loop ---
  let prevT = performance.now();
  const prog = () => document.getElementById('tg-program-container');
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - prevT) / 1000); prevT = now;
    if (!dragging) drag += (0 - drag) * Math.min(1, dt * 14);          // let go: spring back
    const target = TGDeck.index + drag;
    if (dragging) { shown += (target - shown) * Math.min(1, dt * 30); vel = 0; }
    else { vel += ((target - shown) * 210 - vel * 15) * dt; shown += vel * dt; }

    // elastic nudge of the picture
    const p = prog();
    if (p) {
      const nudge = -(shown - TGDeck.index) * 46;
      p.style.setProperty('--tg-nudge', nudge.toFixed(1) + 'px');
      p.style.scale = (1 - Math.min(0.03, Math.abs(shown - TGDeck.index) * 0.03)).toFixed(4);
    }

    // canvas size
    const r = el.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(10, Math.round(r.width * dpr)), H = Math.max(10, Math.round(r.height * dpr));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    g.clearRect(0, 0, W, H);
    g.fillStyle = color;

    // layout: labels row + digits row
    const labH = H * 0.2, s = Math.min((H - labH) / 19.5, W / 125);
    const cw = 11 * s, gap = 6 * s, y = labH + (H - labH - 18 * s) / 2;
    const scr = now < scrambleUntil, rnd = () => Math.floor(Math.random() * 10);
    const dur = TGDeck.duration, t = TGDeck.playing ? (TGDeck.progress * dur) : 0;
    const mm = Math.floor(t / 60) % 100, ss = Math.floor(t) % 60;
    const sl = TGDeck.slots[TGDeck.index] || {}, bpm = Math.max(0, Math.min(999, Math.round(+sl.bpm || 0)));
    const lvl = TGDeck.lowLevel ? TGDeck.lowLevel() : 0;
    lvlPeak = Math.max(lvl, lvlPeak * Math.exp(-dt / 8), 0.02); lvlEnv = Math.max(lvl / lvlPeak, lvlEnv * Math.exp(-dt / 0.18));
    const lv = TGDeck.playing ? Math.min(99, Math.round(lvlEnv * 99)) : 0;

    const groups = [
      { lab: 'TRACK', n: 2, roll: true },
      { lab: 'MIN', n: 2, v: mm }, { lab: 'SEC', n: 2, v: ss },
      { lab: 'BPM', n: 3, v: bpm, blank: !bpm }, { lab: 'LEVEL', n: 2, v: lv },
    ];
    let x = 0;
    g.font = Math.round(labH * 0.62) + 'px Jost, "Helvetica Neue", sans-serif'; g.textBaseline = 'top';
    groups.forEach(gr => {
      g.save(); g.globalAlpha = 0.85; g.shadowBlur = 0; g.fillText(gr.lab, x, 0);
      g.fillRect(x, labH * 0.78, gr.n * cw - 2 * s, Math.max(1, s * 0.35)); g.restore();
      if (gr.roll) {
        const num = Math.max(0, shown + 1), blur = Math.abs(vel) * 0.25 + (dragging ? 0.8 : 0);
        for (let i = 0; i < gr.n; i++) {
          const p10 = Math.pow(10, gr.n - 1 - i), whole = Math.floor(num), frac = num - whole;
          const lower = whole % p10, carry = (p10 === 1 || lower === p10 - 1) ? frac : 0;
          rollDigit(x + i * cw, y, s, Math.floor(whole / p10) + carry, blur);
        }
      } else {
        const str = String(gr.v || 0).padStart(gr.n, '0');
        for (let i = 0; i < gr.n; i++) staticDigit(x + i * cw, y, s, scr ? rnd() : (gr.blank ? null : +str[i]));
      }
      x += gr.n * cw + gap;
    });
  }
  requestAnimationFrame(frame);

  window.TGCounter = { setColor(c) { if (/^#[0-9a-f]{6}$/i.test(c)) color = c; }, get color() { return color; } };
})();
