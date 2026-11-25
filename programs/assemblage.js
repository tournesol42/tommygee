// build: tommygee-v13-dark-labels
window.TG_PROGRAMS = window.TG_PROGRAMS || {};
window.TG_PROGRAMS.assemblage = {
  name: 'Assemblage',
  create(container) {
    'use strict';

    const TEST_IMAGE = 'https://daysof93-cdn.b-cdn.net/assemblage.png';
    const STORE_KEY = 'tommygee.assemblage.cfg.v1';
    const FONT_SANS  = '"Helvetica Neue", Helvetica, Arial, sans-serif';
    const FONT_SERIF = '"Times New Roman", Times, Georgia, serif';
    const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX'];

    const CFG_DEFAULT = {
      bg: '#a7a7a7',
      textColor: '#1b1b1b', textAlpha: 0.9,
      notesColor: '#1b1b1b', notesAlpha: 0.8,
      uiTextColor: '#1b1b1b',
      lineColor: '#ececea', lineAlpha: 0.85,
      dotColor: '#3e3e3e',
      haloColor: '#a0d2ec', haloAlpha: 0.78,
      inkColor: '#1b1b1b',
      frameShow: false, frameColor: '#2271B3', frameAlpha: 1, frameWidth: 0.9, framePad: 59,
      trackLenV: 230, trackLenH: 300, trackWidth: 1.6, markerR: 14.5, numeralSize: 13.5, labelSize: 14,
      handleDot: 4.3, haloMult: 1.2, minHalo: 12.4, minDot: 2.6, showLeaders: true, leaderDash: 5.5,
      rayWidth: 0.75, rayAlpha: 0.31, rayDot: 0.85, rayDensity: 0.85, rayLength: 1,
      curveCount: 1.45, curveWidth: 1, curveAlpha: 0.17, guideAlpha: 1,
      showNotes: true, notesSize: 8, notesCount: 1,
      pieceW: 1.42, pieceH: 0.9, stackChance: 0.34, multiplyChance: 0.08, seed: 419,
      border: 'white', borderWidth: 0.25,
      seedSize: 136,
      washShow: true, washColor: '#b8e2f5', washAlpha: 0.29, washVar: 0.55,
      washAmount: 0.2, washSpread: 0.67, washBands: 4, washSkew: 0.93,
      followMotion: true, motionLen: 1.35,
    };
    const REGEN_KEYS = new Set(['seed','washAmount','washSpread','washBands','washSkew','rayDensity','rayLength','curveCount','notesCount','pieceW','pieceH','stackChance','multiplyChance']);

    const FORMATS = {
      '16:9': { W: 1920, H: 1080, axis: 'h' },
      '9:16': { W: 1080, H: 1920, axis: 'v' },
      '1:1':  { W: 1440, H: 1440, axis: 'h' },
    };
    const FMT_KEYS = Object.keys(FORMATS);
    const perFormat = fn => Object.fromEntries(FMT_KEYS.map(k => [k, fn(k)]));
    let format = '16:9';

    const FADER_DEFS = [
      { key: 'pieces',   lo: 'FEW',     hi: 'MANY',     v: 0.938, halo: 16 },
      { key: 'spread',   lo: 'ORDER',   hi: 'DRIFT',    v: 0.55,  halo: 20 },
      { key: 'displace', lo: 'WHOLE',   hi: 'SCATTER',  v: 0.06,  halo: 14 },
      { key: 'zoom',     lo: 'FULL',    hi: 'NEAR',     v: 0.00,  halo: 17 },
      { key: 'opacity',  lo: 'GHOST',   hi: 'SOLID',    v: 0.90,  halo: 24 },
      { key: 'mono',     lo: 'COLOUR',  hi: 'MONO',     v: 0.15,  halo: 15 },
      { key: 'lines',    lo: 'BARE',    hi: 'WIRED',    v: 0.40,  halo: 19 },
      { key: 'reveal',   lo: 'HIDDEN',  hi: 'REVEAL',   v: 0.00,  halo: 14 },
      { key: 'bright',   lo: 'BLACK',   hi: 'WHITE',    v: 0.50,  halo: 18 },
    ];
    const faders = FADER_DEFS.map((d, i) => ({ ...d, i, pos: {}, dots: [] }));

    const motion = {
      isMotion: true, pos: {},
      knobs: [
        { key: 'speed',   label: 'SPEED',   v: 0.204, halo: 18 },
        { key: 'travel',  label: 'TRAVEL',  v: 0.946, halo: 22 },
        { key: 'snap',    label: 'SNAP',    v: 0.263, halo: 14 },
        { key: 'breathe', label: 'BREATHE', v: 0.274, halo: 16 },
        { key: 'chaos',   label: 'CHAOS',   v: 0.272, halo: 12 },
      ],
    };
    const MV = () => Object.fromEntries(motion.knobs.map(k => [k.key, k.v]));
    let lastKnob = -1;

    const LAYOUT_169 = [[199.6,835.4],[360.7,858.8],[561.4,919.7],[776.5,852.4],[927.5,793.3],[1102.1,808.3],[1273.3,790.7],[1482.1,815.9],[1610,800]];
    const LAYOUT_916 = [[877.1,520.7],[813.8,651.9],[762.6,851.0],[839.9,995.9],[858.6,1179.8],[977.0,1317.8],[1042.1,1456.0],[983.0,1610.1],[877.1,390]];
    const seedCtl = {
      isSeed: true, pos: {}, on: true,
      rings: [{ v: 0.30, a0: -90 }, { v: 0.55, a0: -35 }, { v: 0.70, a0: 160 }],
    };

    function defaultFaderLayout() {
      faders.forEach((f, i) => {
        f.pos['16:9'] = { x: LAYOUT_169[i][0], y: LAYOUT_169[i][1] };
        f.pos['9:16'] = { x: LAYOUT_916[i][0], y: LAYOUT_916[i][1] };
        f.pos['1:1']  = { x: 170 + 960 * (i / 7), y: 960 };
      });
      motion.pos['16:9'] = { x: 1731.1, y: 860.2 };
      motion.pos['9:16'] = { x: 823.4, y: 1793 };
      motion.pos['1:1']  = { x: 1380, y: 930 };
      seedCtl.pos['16:9'] = { x: 1740, y: 220 };
      seedCtl.pos['9:16'] = { x: 220, y: 1700 };
      seedCtl.pos['1:1']  = { x: 220, y: 1220 };
    }
    defaultFaderLayout();

    const DEFAULT_FADER_SCALE = { '16:9': 0.9835570065555749, '9:16': 1, '1:1': 1 };
    const faderScale = { ...DEFAULT_FADER_SCALE };
    const faderPivot = { '16:9': { x: 960, y: 745 }, '9:16': { x: 690, y: 972.5 }, '1:1': { x: 650, y: 960 } };

    // ---- CFG ----
    let CFG = { ...CFG_DEFAULT };
    const CFG_REV = 4;
    const REV_DROP = { 2: ['seedSize','border','borderWidth'], 3: ['seedSize'], 4: ['textColor'] };
    try {
      const s = localStorage.getItem(STORE_KEY);
      if (s) {
        const saved = JSON.parse(s);
        const rev = saved._rev || 1;
        for (let r = rev + 1; r <= CFG_REV; r++) (REV_DROP[r] || []).forEach(k => delete saved[k]);
        CFG = { ...CFG_DEFAULT, ...saved };
      }
      CFG._rev = CFG_REV;
      localStorage.setItem(STORE_KEY, JSON.stringify(CFG));
    } catch (e) {}
    function saveCFG() { try { localStorage.setItem(STORE_KEY, JSON.stringify(CFG)); } catch (e) {} }

    // ---- helpers ----
    function rgba(hex, a) {
      const h = hex.replace('#','');
      const n = parseInt(h.length===3 ? h.split('').map(c=>c+c).join('') : h, 16);
      return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
    }
    function hexToHsl(hex) {
      const h = hex.replace('#','');
      const n = parseInt(h.length===3 ? h.split('').map(c=>c+c).join('') : h, 16);
      let r=((n>>16)&255)/255, g=((n>>8)&255)/255, b=(n&255)/255;
      const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2;
      let hh=0, s=0;
      if (mx!==mn) {
        const d=mx-mn;
        s=l>0.5?d/(2-mx-mn):d/(mx+mn);
        hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;
        hh*=60;
      }
      return {h:hh, s:s*100, l:l*100};
    }
    function mulberry32(a) {
      return function() {
        a|=0; a=a+0x6D2B79F5|0;
        let t=Math.imul(a^a>>>15,1|a);
        t=t+Math.imul(t^t>>>7,61|t)^t;
        return ((t^t>>>14)>>>0)/4294967296;
      };
    }
    function hash01(a,b) {
      let h=Math.imul((a|0)^0x9E3779B1,0x85EBCA6B)^Math.imul((b|0)+0x632BE5AB,0xC2B2AE35);
      h^=h>>>13; h=Math.imul(h,0x27D4EB2F); h^=h>>>16;
      return (h>>>0)/4294967296;
    }
    const TAU = Math.PI*2;
    function noise1(t,off,f) {
      return Math.sin(TAU*f*t+off)*0.5+Math.sin(TAU*f*2.17*t+off*1.3)*0.3+Math.sin(TAU*f*0.43*t+off*0.7)*0.2;
    }
    function tri(x) { const f=x-Math.floor(x); return f<0.5?f*4-1:3-f*4; }
    const easeOut = p => { const q=1-Math.min(1,Math.max(0,p)); return 1-q*q; };
    const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
    function shade(hex,dl,ds=0) { const h=hexToHsl(hex); return `hsl(${h.h},${clamp(h.s+ds,0,100)}%,${clamp(h.l+dl,0,100)}%)`; }

    // ---- decorative dots ----
    (() => {
      const r = mulberry32(93);
      faders.forEach(f => {
        const n = 2+Math.floor(r()*3);
        let tries=0;
        while (f.dots.length<n && tries++<200) {
          const t=0.06+r()*0.88;
          if (f.dots.some(d=>Math.abs(d.t-t)<0.16)) continue;
          f.dots.push({t, halo: r()<0.4?8+r()*2:0});
        }
      });
      [[1,'pieceW',1.42],[2,'pieceH',0.9]].forEach(([fi,key,ref]) => {
        const f=faders[fi];
        const top=f.dots.reduce((a,d)=>d.t>a.t?d:a,f.dots[0]);
        f.dots=f.dots.filter(d=>d!==top);
        f.h2={key, t0:top.t, ref, min:0.3, max:3};
      });
    })();
    function h2Value(h,v) {
      return v<=h.t0?h.ref*Math.pow(h.min/h.ref,(h.t0-v)/h.t0):h.ref*Math.pow(h.max/h.ref,(v-h.t0)/(1-h.t0));
    }
    function h2Pos(h,val) {
      val=clamp(val,h.min,h.max);
      return val<=h.ref?h.t0-h.t0*Math.log(val/h.ref)/Math.log(h.min/h.ref):h.t0+(1-h.t0)*Math.log(val/h.ref)/Math.log(h.max/h.ref);
    }

    // ---- canvas + state ----
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let dpr = 1, view = { s:1, ox:0, oy:0 };
    let img = null;
    let srcMap = { k:1, regCx:0, regCy:0 };
    let pieces=[], contours=[], guides=[], washes=[];
    let group = perFormat(() => ({ x:0, y:0, s:1 }));
    let frame = perFormat(() => null);
    let altHeld = false;
    let showControls = true;
    let drag = null;
    let message='', messageTime=0;
    let dirty=true, needsRegen=true;
    let pxScale=1;
    const BAR_H = 0;

    const P = () => Object.fromEntries(faders.map(f=>[f.key,f.v]));

    // ---- media loading ----
    function srcDims() {
      if (!img) return [1,1];
      if (img instanceof HTMLVideoElement) return [img.videoWidth||1, img.videoHeight||1];
      return [img.naturalWidth||img.width||1, img.naturalHeight||img.height||1];
    }
    function loadImage(src,cors) {
      const im=new Image();
      if (cors) im.crossOrigin='anonymous';
      im.onload=()=>{ img=im; needsRegen=true; dirty=true; };
      im.onerror=()=>{ if(cors) loadImage(src,false); };
      im.src=src;
    }
    // Source = the page player's current slot (image or video). Falls back to TEST_IMAGE when empty.
    const deck = window.TGDeck;
    let deckVisual;
    function useVisual(v) {
      if (deckVisual !== v) return;            // slot changed meanwhile
      img = v; needsRegen = true; dirty = true;
    }
    function syncDeck() {
      const v = deck ? deck.visual : null;
      if (v === deckVisual) return;
      deckVisual = v;
      if (!v) { loadImage(TEST_IMAGE, true); return; }
      if (v instanceof HTMLVideoElement) {
        if (v.readyState >= 2) useVisual(v);
        else v.addEventListener('loadeddata', () => useVisual(v), { once: true });
      } else if (v.complete && v.naturalWidth) useVisual(v);
      else v.addEventListener('load', () => useVisual(v), { once: true });
    }
    const offDeck = deck ? deck.onChange(syncDeck) : () => {};
    syncDeck();

    // ---- layout geometry ----
    function collageFrame() {
      if (format==='9:16') return {axis:'v', u0:170, L:1560, c:340};
      if (format==='1:1')  return {axis:'h', u0:170, L:1100, c:450};
      return {axis:'h', u0:210, L:1500, c:390};
    }
    function pivot() {
      const fr=collageFrame();
      return fr.axis==='h'?{x:fr.u0+fr.L/2, y:fr.c}:{x:fr.c, y:fr.u0+fr.L/2};
    }
    function toGroup(rb) {
      const G=group[format], c=pivot();
      return {x:c.x+G.x+(rb.x-c.x)*G.s, y:c.y+G.y+(rb.y-c.y)*G.s, w:rb.w*G.s, h:rb.h*G.s};
    }
    const R  = pc => toGroup(pc.cur||pc);
    const Rbase = pc => toGroup(pc);
    function areaBox() {
      if (!pieces.length) return null;
      let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
      pieces.forEach(pc=>{const r=Rbase(pc);x0=Math.min(x0,r.x);y0=Math.min(y0,r.y);x1=Math.max(x1,r.x+r.w);y1=Math.max(y1,r.y+r.h);});
      return {x:x0,y:y0,w:x1-x0,h:y1-y0};
    }
    function unionBox(a,b) {
      if (!a) return b; if (!b) return a;
      const x0=Math.min(a.x,b.x),y0=Math.min(a.y,b.y);
      return {x:x0,y:y0,w:Math.max(a.x+a.w,b.x+b.w)-x0,h:Math.max(a.y+a.h,b.y+b.h)-y0};
    }
    function frameRect() {
      if (frame[format]) return frame[format];
      let b=areaBox();
      if (showControls) {
        faders.forEach(f=>{b=unionBox(b,faderGeom(f).box);}); b=unionBox(b,motionGeom().box); b=unionBox(b,seedGeom().box);
      }
      if (!b) return null;
      const p=CFG.framePad;
      return {x:b.x-p, y:b.y-p, w:b.w+p*2, h:b.h+p*2};
    }

    // ---- generate ----
    function generate() {
      needsRegen=false;
      pieces=[]; contours=[]; guides=[]; washes=[];
      if (!img) return;
      const [IW,IH]=srcDims();
      const p=P();
      const seed=Math.round(CFG.seed);
      const rnd=mulberry32(seed*7919+17);
      const fr=collageFrame();
      const vert=fr.axis==='v';
      const N=Math.round(6+p.pieces*34);
      const along=vert?CFG.pieceH:CFG.pieceW;
      const across=vert?CFG.pieceW:CFG.pieceH;
      const sq=format==='1:1'?0.8:1;
      let walk=0;
      const raw=[];
      for (let i=0;i<N;i++) {
        const t=(i+0.5)/N;
        const u=fr.u0+t*fr.L+(rnd()-0.5)*(fr.L/N)*1.2;
        const a=(26+rnd()*120*(0.55+0.45*(1-p.pieces)))*(vert?1.3:1)*along*sq;
        const b=(70+rnd()*(vert?300:360))*across*sq;
        const lim=(vert?190:260)*sq;
        walk+=(rnd()-0.5)*p.spread*(vert?220:260)*sq;
        walk=Math.max(-lim,Math.min(lim,walk));
        raw.push({u,a,b,v:walk+(rnd()-0.5)*40});
        if (rnd()<CFG.stackChance) {
          const b2=(50+rnd()*(vert?140:200))*across*sq;
          const side=rnd()<0.5?-1:1;
          raw.push({u:u+(rnd()-0.5)*a*0.8,a:a*(0.5+rnd()*0.9),b:b2,v:walk+side*(b/2+b2/2-rnd()*40)});
        }
      }
      let bx0=Infinity,by0=Infinity,bx1=-Infinity,by1=-Infinity;
      raw.forEach(r=>{
        const w=vert?r.b:r.a,h=vert?r.a:r.b;
        const cx=vert?fr.c+r.v:r.u,cy=vert?r.u:fr.c+r.v;
        bx0=Math.min(bx0,cx-w/2);bx1=Math.max(bx1,cx+w/2);
        by0=Math.min(by0,cy-h/2);by1=Math.max(by1,cy+h/2);
      });
      const regW=bx1-bx0,regH=by1-by0;
      const zoom=1+p.zoom*2.5;
      srcMap={k:Math.min(IW/regW,IH/regH)/zoom, regCx:(bx0+bx1)/2, regCy:(by0+by1)/2};
      const mr=mulberry32(seed*977+3);
      raw.forEach((r,idx)=>{
        let x,y,w,h;
        if (!vert){w=r.a;h=r.b;x=r.u-w/2;y=fr.c+r.v-h/2;}
        else{w=r.b;h=r.a;x=fr.c+r.v-w/2;y=r.u-h/2;}
        const sdx=(rnd()-0.5)*p.displace*IW;
        const sdy=(rnd()-0.5)*p.displace*IH;
        const alpha=Math.min(1,(0.25+p.opacity*0.75)*(0.85+rnd()*0.15));
        const mono=Math.max(0,Math.min(1,p.mono+(rnd()-0.5)*0.3));
        const blend=rnd()<CFG.multiplyChance?'multiply':'source-over';
        const m={o1:mr()*1000,o2:mr()*1000,o3:mr()*1000,o4:mr()*1000,o5:mr()*1000,fq:0.06+mr()*0.22,au:0.4+mr()*0.9,av:mr(),slide:mr()<0.3,snapRoll:mr(),ghostRoll:mr(),intv:0.6+mr()*0.8};
        pieces.push({idx,x,y,w,h,sdx,sdy,alpha,mono,blend,m,rays:[],notes:[]});
      });
      const pick=()=>pieces[Math.floor(rnd()*pieces.length)];
      {
        const wr=mulberry32(seed*131+7);
        const S=CFG.washSpread;
        const XY=(u,v)=>vert?[fr.c+v,u]:[u,fr.c+v];
        const shade_w=()=>({s:wr()*2-1,s2:wr()*2-1,a:0.5+wr()*0.5});
        const centers=pieces.map(pc=>vert?{u:pc.y+pc.h/2,v:pc.x+pc.w/2-fr.c,a:pc.h,b:pc.w}:{u:pc.x+pc.w/2,v:pc.y+pc.h/2-fr.c,a:pc.w,b:pc.h});
        if (centers.length) {
          const strip=(u0,v0,ang,len,w0,w1)=>{
            const d=[Math.cos(ang),Math.sin(ang)],n=[-d[1],d[0]];
            const c0=(wr()-0.5)*w0*1.6,c1=(wr()-0.5)*w1*1.6;
            const u1=u0+d[0]*len,v1=v0+d[1]*len;
            return [[u0+n[0]*w0/2+d[0]*c0,v0+n[1]*w0/2+d[1]*c0],[u1+n[0]*w1/2,v1+n[1]*w1/2],[u1-n[0]*w1/2+d[0]*c1,v1-n[1]*w1/2+d[1]*c1],[u0-n[0]*w0/2,v0-n[1]*w0/2]];
          };
          const wSliver=0.4*CFG.washBands,wShard=0.7*CFG.washSkew,wPanel=0.45;
          const wSum=wSliver+wShard+wPanel||1;
          const total=Math.round(8+34*CFG.washAmount);
          for (let i=0;i<total;i++) {
            const ci=Math.floor(wr()*centers.length);
            const c=centers[ci];
            const t=wr()*wSum;
            let uv;
            if (t<wSliver) {
              const len=(150+wr()*480)*S,w0=(10+wr()*60)*S,w1=wr()<0.35?0.5:w0*(0.35+wr()*0.9);
              const u0=c.u+(wr()-0.5)*c.a*2-len*wr()*0.8,v0=c.v+(wr()-0.5)*(c.b+180*S)*1.4;
              uv=strip(u0,v0,(wr()-0.5)*0.24,len,w0,w1);
            } else if (t<wSliver+wShard) {
              const side=wr()<0.5?-1:1;
              const ang=(wr()<0.5?0:Math.PI)+side*(0.3+wr()*0.55)*(wr()<0.5?1:-1)*(wr()<0.5?1:-1);
              const len=(120+wr()*300)*S,w0=(24+wr()*70)*S,w1=w0*(0.25+wr()*0.9);
              uv=strip(c.u+(wr()-0.5)*c.a,c.v+side*c.b*(0.1+wr()*0.35),ang,len,w0,w1);
            } else {
              const A=(120+wr()*320)*S,B=(60+wr()*200)*S;
              const side=wr()<0.5?-1:1;
              const cu=c.u+(wr()-0.5)*c.a*1.5,cv=c.v+side*(c.b*0.3+wr()*B*0.7);
              const rot=(wr()-0.5)*0.3;
              let pts=[[-A/2,-B/2],[A/2,-B/2],[A/2,B/2],[-A/2,B/2]];
              const cuts=1+(wr()<0.45?1:0);
              for (let k=0;k<cuts;k++) {
                const cix=Math.floor(wr()*pts.length);
                const prev=pts[(cix+pts.length-1)%pts.length],cur=pts[cix],next=pts[(cix+1)%pts.length];
                const f1=0.25+wr()*0.5,f2=0.25+wr()*0.5;
                const a1=[cur[0]+(prev[0]-cur[0])*f1,cur[1]+(prev[1]-cur[1])*f1];
                const a2=[cur[0]+(next[0]-cur[0])*f2,cur[1]+(next[1]-cur[1])*f2];
                pts.splice(cix,1,a1,a2);
              }
              const cr=Math.cos(rot),sr=Math.sin(rot);
              uv=pts.map(([x,y])=>[cu+x*cr-y*sr+(wr()-0.5)*10*S,cv+x*sr+y*cr+(wr()-0.5)*10*S]);
            }
            washes.push({pts:uv.map(([u,v])=>XY(u,v)),pi:ci,...shade_w()});
          }
        }
      }
      const nAnchors=Math.round(p.lines*pieces.length*0.4*CFG.rayDensity);
      for (let i=0;i<nAnchors;i++) {
        const pc=pick(),au=rnd(),av=rnd(),nr=3+Math.floor(rnd()*4),baseAng=rnd()*Math.PI*2;
        for (let j=0;j<nr;j++) {
          const ang=baseAng+(rnd()-0.5)*1.8,len=(50+Math.pow(rnd(),1.6)*260)*CFG.rayLength;
          pc.rays.push({au,av,ex:Math.cos(ang)*len,ey:Math.sin(ang)*len,r:2+rnd()*1.6,hollow:rnd()<0.15});
        }
      }
      const nC=Math.round(p.lines*4*CFG.curveCount);
      for (let i=0;i<nC;i++) {
        const pts=[];
        for (let j=0;j<5;j++){const t=j/4;const al=fr.u0-170+t*(fr.L+340);const ac=fr.c+(rnd()-0.5)*520;pts.push(vert?[ac,al]:[al,ac]);}
        contours.push({pts,dashed:rnd()<0.35});
      }
      const nG=Math.round(p.lines*4*CFG.curveCount);
      for (let i=0;i<nG;i++) {
        const ac=fr.c+(rnd()-0.5)*480,s=fr.u0+rnd()*fr.L*0.5,e=s+160+rnd()*fr.L*0.45;
        guides.push(vert?[ac,s,ac,e]:[s,ac,e,ac]);
      }
      const WORDS=['fragment','sampled terrain','cut / overlay','established sequence','residual surface','procedural layer','archive extract','boundary condition'];
      const nN=Math.round((2+Math.floor(rnd()*2))*CFG.notesCount);
      for (let i=0;i<nN;i++) {
        const pc=pick();
        pc.notes.push({av:rnd(),text:WORDS[Math.floor(rnd()*WORDS.length)]+' '+String(Math.floor(rnd()*99)).padStart(2,'0')});
      }
      updateMotionRects();
    }

    // ---- motion ----
    let mt=0, mSpeedSm=1;
    function motionActive() {
      const M=MV();
      return M.speed>0.001&&(M.travel>0||M.snap>0||M.breathe>0||M.chaos>0);
    }
    function advanceMotion(dt) {
      const M=MV(),rt=performance.now()*0.001;
      const drv=Math.tanh((Math.sin(TAU*0.15*rt)*0.6+Math.sin(TAU*0.22*rt+1.3)*0.4)*1.2);
      const burst=(M.chaos>0.2&&Math.sin(TAU*0.1*rt+0.7)>0.85)?1.6:1;
      const target=Math.exp(drv*1.8*M.chaos)*burst;
      mSpeedSm+=(target-mSpeedSm)*0.1;
      mt+=dt*Math.pow(M.speed,1.6)*2.2*mSpeedSm;
    }
    function motionRect(pc,T) {
      const M=MV(),m=pc.m;
      if (!m||(M.travel<=0&&M.snap<=0&&M.breathe<=0&&M.chaos<=0)) return {x:pc.x,y:pc.y,w:pc.w,h:pc.h};
      const vert=FORMATS[format].axis==='v';
      let t=T;
      if (M.chaos>0&&hash01(pc.idx*31+7,Math.floor(T*1.5))<M.chaos*0.35) t=Math.floor(T*7)/7;
      const A=M.travel*230,Ac=M.travel*70;
      let du=m.slide?A*m.au*tri(t*m.fq*0.6+m.o1*0.001):A*m.au*noise1(t,m.o1,m.fq);
      let dv=Ac*m.av*noise1(t,m.o2,m.fq*1.3);
      if (m.snapRoll<M.snap) {
        const interval=(2.6-2.2*M.snap)*m.intv,tt=t+m.o4*0.01,k=Math.floor(tt/interval),tin=tt-k*interval;
        const cur=hash01(pc.idx,k)*2-1,prev=hash01(pc.idx,k-1)*2-1;
        const v=prev+(cur-prev)*easeOut(tin/0.12),A2=Math.max(A,70*M.snap);
        du=du*0.25+A2*1.3*v; dv+=Ac*0.5*v;
      }
      if (M.chaos>0) {
        const rint=7-5*M.chaos,k=Math.floor((t+m.o5*0.01)/rint);
        if (hash01(pc.idx+500,k)<M.chaos) du+=(hash01(pc.idx+700,k)-0.5)*2*(120+A);
      }
      const b=M.breathe*0.6;
      const sa=Math.max(0.25,1+b*noise1(t,m.o2+50,m.fq*0.8)),sc=Math.max(0.25,1+b*noise1(t,m.o3+90,m.fq*0.9));
      const dx=vert?dv:du,dy=vert?du:dv;
      const w=pc.w*(vert?sc:sa),h=pc.h*(vert?sa:sc);
      const cx=pc.x+pc.w/2+dx,cy=pc.y+pc.h/2+dy;
      return {x:cx-w/2,y:cy-h/2,w,h};
    }
    function updateMotionRects() { pieces.forEach(pc=>{pc.cur=motionRect(pc,mt);}); }

    // ---- fader/seed geometry ----
    function faderGeom(f) {
      const S=faderScale[format],c=faderPivot[format],b=f.pos[format];
      const m={x:c.x+(b.x-c.x)*S, y:c.y+(b.y-c.y)*S},mr=CFG.markerR*S;
      if (FORMATS[format].axis==='h') {
        const L=CFG.trackLenV*S,x=m.x,y0=m.y+mr+18*S,y1=y0+L;
        return {S,mr,vertical:true,mx:m.x,my:m.y,x0:x,y0,x1:x,y1,pt:t=>({x,y:y1-t*L}),val:(px,py)=>(y1-py)/L,box:{x:m.x-30*S,y:m.y-mr,w:100*S,h:(y1+26*S)-(m.y-mr)}};
      }
      const L=CFG.trackLenH*S,y=m.y,x0=m.x+mr+18*S,x1=x0+L;
      return {S,mr,vertical:false,mx:m.x,my:m.y,x0,y0:y,x1,y1:y,pt:t=>({x:x0+t*L,y}),val:(px)=>(px-x0)/L,box:{x:m.x-mr,y:m.y-34*S,w:(x1+26*S)-(m.x-mr),h:62*S}};
    }
    function motionGeom() {
      const S=faderScale[format],c=faderPivot[format],b=motion.pos[format];
      const m={x:c.x+(b.x-c.x)*S, y:c.y+(b.y-c.y)*S},mr=CFG.markerR*1.3*S;
      if (FORMATS[format].axis==='h') {
        const L=CFG.trackLenV*CFG.motionLen*S,x=m.x,y0=m.y+mr+18*S,y1=y0+L;
        return {S,mr,vertical:true,mx:m.x,my:m.y,x0:x,y0,x1:x,y1,pt:t=>({x,y:y1-t*L}),val:(px,py)=>(y1-py)/L,box:{x:m.x-50*S,y:m.y-mr,w:150*S,h:(y1+40*S)-(m.y-mr)}};
      }
      const L=CFG.trackLenH*CFG.motionLen*S,y=m.y,x0=m.x+mr+18*S,x1=x0+L;
      return {S,mr,vertical:false,mx:m.x,my:m.y,x0,y0:y,x1,y1:y,pt:t=>({x:x0+t*L,y}),val:(px)=>(px-x0)/L,box:{x:m.x-mr,y:m.y-40*S,w:(x1+26*S)-(m.x-mr),h:100*S}};
    }
    function faderAnchorPiece(i) {
      if (!pieces.length) return null;
      const sorted=pieces.slice().sort((a,b)=>FORMATS[format].axis==='h'?(a.x-b.x):(a.y-b.y));
      return sorted[Math.min(sorted.length-1,Math.floor((i+0.5)/faders.length*sorted.length))];
    }
    function seedGeom() {
      const S=faderScale[format],c=faderPivot[format],b=seedCtl.pos[format];
      const m={x:c.x+(b.x-c.x)*S, y:c.y+(b.y-c.y)*S};
      const Rr=CFG.seedSize*S,rc=Rr*0.065,r0=Rr*0.38;
      const W=[1,1,1.5],wSum=W.reduce((a,b)=>a+b,0);
      const edges=[r0]; W.forEach(w=>edges.push(edges[edges.length-1]+(Rr-r0)*w/wSum));
      const ring=i=>({inner:edges[i],outer:edges[i+1]});
      return {S,mx:m.x,my:m.y,R:Rr,rc,ring,box:{x:m.x-Rr,y:m.y-Rr,w:Rr*2,h:Rr*2+CFG.labelSize*2*S}};
    }

    // ---- drawing ----
    const scratch=document.createElement('canvas');
    const sctx=scratch.getContext('2d');
    function applyBrightness(cw,ch) {
      const b=P().bright;
      if (Math.abs(b-0.5)<0.002) return;
      sctx.globalCompositeOperation='source-atop';
      sctx.fillStyle=b<0.5?`rgba(0,0,0,${(0.5-b)*2})`:`rgba(255,255,255,${(b-0.5)*2})`;
      sctx.fillRect(0,0,cw,ch);
      sctx.globalCompositeOperation='source-over';
    }
    function drawPiece(g,pc,rb,alphaMul) {
      if (!img) return;
      const [iw,ih]=srcDims(),r=toGroup(rb);
      let sw=rb.w*srcMap.k,sh=rb.h*srcMap.k;
      const fit=Math.min(1,iw/sw,ih/sh); sw*=fit; sh*=fit;
      const scx=iw/2+(rb.x+rb.w/2-srcMap.regCx)*srcMap.k+pc.sdx;
      const scy=ih/2+(rb.y+rb.h/2-srcMap.regCy)*srcMap.k+pc.sdy;
      const sx=clamp(scx-sw/2,0,iw-sw),sy=clamp(scy-sh/2,0,ih-sh);
      const cw=Math.max(1,Math.ceil(r.w*pxScale)),ch=Math.max(1,Math.ceil(r.h*pxScale));
      if (scratch.width<cw||scratch.height<ch){scratch.width=Math.max(scratch.width,cw);scratch.height=Math.max(scratch.height,ch);}
      sctx.setTransform(1,0,0,1,0,0); sctx.globalAlpha=1; sctx.globalCompositeOperation='source-over';
      sctx.clearRect(0,0,cw,ch);
      sctx.drawImage(img,sx,sy,sw,sh,0,0,cw,ch);
      if (pc.mono>0.01){sctx.globalCompositeOperation='saturation';sctx.fillStyle=`rgba(128,128,128,${pc.mono})`;sctx.fillRect(0,0,cw,ch);}
      applyBrightness(cw,ch);
      g.save(); g.globalAlpha=pc.alpha*alphaMul; g.globalCompositeOperation=pc.blend;
      g.drawImage(scratch,0,0,cw,ch,r.x,r.y,r.w,r.h);
      g.restore();
    }
    function drawReveal(g,alpha) {
      const [iw,ih]=srcDims(),F=FORMATS[format],k=srcMap.k;
      const full=toGroup({x:srcMap.regCx-iw/2/k,y:srcMap.regCy-ih/2/k,w:iw/k,h:ih/k});
      const x0=Math.max(0,full.x),y0=Math.max(0,full.y);
      const x1=Math.min(F.W,full.x+full.w),y1=Math.min(F.H,full.y+full.h);
      if (x1<=x0||y1<=y0) return;
      const sx=(x0-full.x)/full.w*iw,sy=(y0-full.y)/full.h*ih;
      const sw=(x1-x0)/full.w*iw,sh=(y1-y0)/full.h*ih;
      const cw=Math.max(1,Math.ceil((x1-x0)*pxScale)),ch=Math.max(1,Math.ceil((y1-y0)*pxScale));
      if (scratch.width<cw||scratch.height<ch){scratch.width=Math.max(scratch.width,cw);scratch.height=Math.max(scratch.height,ch);}
      sctx.setTransform(1,0,0,1,0,0); sctx.globalAlpha=1; sctx.globalCompositeOperation='source-over';
      sctx.clearRect(0,0,cw,ch);
      sctx.drawImage(img,sx,sy,sw,sh,0,0,cw,ch);
      const mono=P().mono;
      if (mono>0.01){sctx.globalCompositeOperation='saturation';sctx.fillStyle=`rgba(128,128,128,${mono})`;sctx.fillRect(0,0,cw,ch);}
      applyBrightness(cw,ch);
      g.save(); g.globalAlpha=alpha;
      g.drawImage(scratch,0,0,cw,ch,x0,y0,x1-x0,y1-y0);
      g.restore();
    }
    function drawArt(g,opts) {
      const ink=CFG.inkColor,follow=CFG.followMotion;
      g.save();
      {const G=group[format],c=pivot();g.translate(c.x+G.x,c.y+G.y);g.scale(G.s,G.s);g.translate(-c.x,-c.y);g.lineWidth=CFG.curveWidth/G.s;}
      if (CFG.washShow) {
        const base=hexToHsl(CFG.washColor);
        washes.forEach(w=>{
          const l=Math.max(0,Math.min(100,base.l+w.s*CFG.washVar*14));
          const sat=Math.max(0,Math.min(100,base.s+(w.s2*0.5+0.25)*CFG.washVar*16));
          const h=base.h+w.s2*CFG.washVar*8;
          g.fillStyle=`hsla(${h},${sat}%,${l}%,${CFG.washAlpha*w.a})`;
          g.beginPath();
          w.pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));
          g.closePath(); g.fill();
        });
      }
      g.strokeStyle=rgba(ink,CFG.curveAlpha);
      contours.forEach(c=>{
        const pts=c.pts;
        g.setLineDash(c.dashed?[3,5]:[]);
        g.beginPath(); g.moveTo(pts[0][0],pts[0][1]);
        for (let i=1;i<pts.length-1;i++){const xc=(pts[i][0]+pts[i+1][0])/2,yc=(pts[i][1]+pts[i+1][1])/2;g.quadraticCurveTo(pts[i][0],pts[i][1],xc,yc);}
        g.lineTo(pts[pts.length-1][0],pts[pts.length-1][1]); g.stroke();
      });
      g.setLineDash([3,6]); g.strokeStyle=rgba(ink,CFG.guideAlpha);
      guides.forEach(s=>{g.beginPath();g.moveTo(s[0],s[1]);g.lineTo(s[2],s[3]);g.stroke();});
      g.restore();
      const reveal=P().reveal;
      if (reveal>0.001&&img) drawReveal(g,reveal);
      const M=MV();
      const ghostAmt=M.chaos>0.3&&M.speed>0?(M.chaos-0.3)/0.7:0;
      pieces.forEach(pc=>{
        if (ghostAmt>0&&pc.m.ghostRoll<ghostAmt){drawPiece(g,pc,motionRect(pc,mt-0.7),0.16);drawPiece(g,pc,motionRect(pc,mt-0.35),0.32);}
        drawPiece(g,pc,pc.cur||pc,1);
      });
      if (CFG.border!=='off') {
        g.save();
        g.strokeStyle={black:'#000000',white:'#ffffff',orange:'#FF6B00'}[CFG.border]||'#000000';
        g.lineWidth=CFG.borderWidth/pxScale;
        pieces.forEach(pc=>{const r=R(pc);g.strokeRect(r.x,r.y,r.w,r.h);});
        g.restore();
      }
      g.save();
      g.strokeStyle=rgba(ink,CFG.rayAlpha); g.fillStyle=rgba(ink,Math.min(1,CFG.rayAlpha+0.2)); g.lineWidth=CFG.rayWidth;
      const gs=group[format].s;
      pieces.forEach(pc=>{
        const r=follow?R(pc):Rbase(pc);
        pc.rays.forEach(q=>{
          const ax=r.x+q.au*r.w,ay=r.y+q.av*r.h,ex=ax+q.ex*gs,ey=ay+q.ey*gs;
          g.beginPath();g.moveTo(ax,ay);g.lineTo(ex,ey);g.stroke();
          if (CFG.rayDot>0){g.beginPath();g.arc(ex,ey,q.r*CFG.rayDot,0,Math.PI*2);q.hollow?g.stroke():g.fill();}
        });
      });
      if (CFG.showNotes) {
        g.font=`italic ${CFG.notesSize}px ${FONT_SERIF}`;
        g.fillStyle=rgba(CFG.notesColor,CFG.notesAlpha);
        pieces.forEach(pc=>{const r=follow?R(pc):Rbase(pc);pc.notes.forEach(n=>g.fillText(n.text,r.x+r.w+10,r.y+n.av*r.h));});
      }
      g.restore();
      if (!img){g.fillStyle=ink;g.font=`italic 22px ${FONT_SERIF}`;g.textAlign='center';g.fillText('loading image…',FORMATS[format].W/2,FORMATS[format].H/2);g.textAlign='left';}
      if (opts.controls) drawControls(g);
      if (CFG.frameShow){const fr=frameRect();if(fr){g.save();g.strokeStyle=rgba(CFG.frameColor,CFG.frameAlpha);g.lineWidth=CFG.frameWidth;g.strokeRect(fr.x,fr.y,fr.w,fr.h);g.restore();}}
    }

    function dotWithHalo(g,x,y,halo,dotR,S=1) {
      if (halo>0){g.fillStyle=rgba(CFG.haloColor,CFG.haloAlpha);g.beginPath();g.arc(x,y,Math.max(CFG.minHalo,halo)*S,0,Math.PI*2);g.fill();}
      g.fillStyle=CFG.dotColor;g.beginPath();g.arc(x,y,Math.max(CFG.minDot,dotR)*S,0,Math.PI*2);g.fill();
    }
    function drawLeader(g,G,pc,lineCol) {
      if (!pc) return;
      const r=R(pc),ax=G.vertical?r.x+r.w/2:r.x+r.w,ay=G.vertical?r.y+r.h:r.y+r.h/2;
      const d=Math.hypot(G.mx-ax,G.my-ay)||1;
      g.strokeStyle=lineCol; g.lineWidth=0.9;
      g.setLineDash([CFG.leaderDash,CFG.leaderDash+1]);
      g.beginPath(); g.moveTo(ax,ay); g.lineTo(G.mx-(G.mx-ax)/d*G.mr,G.my-(G.my-ay)/d*G.mr); g.stroke();
      g.setLineDash([]); g.fillStyle=lineCol; g.beginPath();g.arc(ax,ay,2,0,Math.PI*2);g.fill();
    }
    function drawControls(g) {
      const lineCol=rgba(CFG.lineColor,CFG.lineAlpha),textCol=rgba(CFG.textColor,CFG.textAlpha);
      faders.forEach(f=>{
        const G=faderGeom(f),S=G.S,mr=G.mr;
        g.save();
        if (CFG.showLeaders) drawLeader(g,G,faderAnchorPiece(f.i),lineCol);
        g.strokeStyle=lineCol; g.lineWidth=CFG.trackWidth;
        g.beginPath();g.arc(G.mx,G.my,mr,0,Math.PI*2);g.stroke();
        g.fillStyle=textCol; g.font=`${CFG.numeralSize*S}px ${FONT_SANS}`;
        g.textAlign='center'; g.textBaseline='middle'; g.fillText(ROMAN[f.i],G.mx,G.my+0.5);
        g.beginPath();
        if (G.vertical) g.moveTo(G.mx,G.my+mr); else g.moveTo(G.mx+mr,G.my);
        g.lineTo(G.x1,G.y1); g.stroke();
        f.dots.forEach(d=>{const q=G.pt(d.t);dotWithHalo(g,q.x,q.y,d.halo,CFG.minDot,S);});
        const h=G.pt(f.v); dotWithHalo(g,h.x,h.y,f.halo*CFG.haloMult,CFG.handleDot,S);
        if (f.h2){const q2=G.pt(h2Pos(f.h2,CFG[f.h2.key]));dotWithHalo(g,q2.x,q2.y,8.4,CFG.handleDot*0.8,S);}
        g.fillStyle=textCol; g.font=`${CFG.labelSize*S}px ${FONT_SANS}`;
        if (G.vertical){g.textAlign='left';g.textBaseline='middle';g.fillText(f.hi,G.x0+16*S,G.y0+4*S);g.fillText(f.lo,G.x0+16*S,G.y1-4*S);}
        else{g.textBaseline='bottom';g.textAlign='left';g.fillText(f.lo,G.x0,G.y0-16*S);g.textAlign='right';g.fillText(f.hi,G.x1,G.y0-16*S);}
        g.restore();
      });
      drawMotionFader(g,lineCol,textCol);
      drawSeedControl(g,lineCol,textCol);
    }
    function drawSeedControl(g,lineCol,textCol) {
      const G=seedGeom(),S=G.S;
      g.save();
      const ringLine=rgba(CFG.haloColor,1);
      seedCtl.rings.forEach((rg,i)=>{
        const {inner,outer}=G.ring(i),mid=(inner+outer)/2;
        const a0=rg.a0*Math.PI/180,a1=a0+rg.v*Math.PI*2;
        if (rg.v<0.998){g.strokeStyle=ringLine;g.lineWidth=0.9;g.beginPath();g.arc(G.mx,G.my,mid,a1,a0+Math.PI*2);g.stroke();}
        if (rg.v>0.002){g.fillStyle=[shade(CFG.haloColor,-16,4),shade(CFG.haloColor,-7,0),shade(CFG.haloColor,8,-18)][i]||CFG.haloColor;g.beginPath();g.arc(G.mx,G.my,outer,a0,a1);g.arc(G.mx,G.my,inner,a1,a0,true);g.closePath();g.fill();}
      });
      g.lineWidth=1.6*S; g.strokeStyle=CFG.dotColor; g.fillStyle=CFG.dotColor;
      g.beginPath();g.arc(G.mx,G.my,G.rc,0,Math.PI*2);
      seedCtl.on?g.fill():g.stroke();
      g.fillStyle=textCol; g.font=`${CFG.labelSize*S}px ${FONT_SANS}`;
      g.textAlign='center'; g.textBaseline='top';
      g.fillText(`SEED ${String(Math.round(CFG.seed)).padStart(3,'0')}`,G.mx,G.my+G.R+8*S);
      g.restore();
    }
    function drawMotionFader(g,lineCol,textCol) {
      const G=motionGeom(),S=G.S,mr=G.mr;
      g.save();
      if (CFG.showLeaders&&pieces.length){const mid=pieces.slice().sort((a,b)=>FORMATS[format].axis==='h'?(a.x-b.x):(a.y-b.y))[Math.floor(pieces.length/2)];drawLeader(g,G,mid,lineCol);}
      g.strokeStyle=lineCol; g.lineWidth=CFG.trackWidth;
      g.beginPath();g.arc(G.mx,G.my,mr,0,Math.PI*2);g.stroke();
      g.fillStyle=textCol; g.font=`${CFG.numeralSize*S}px ${FONT_SANS}`;
      g.textAlign='center'; g.textBaseline='middle'; g.fillText('M',G.mx,G.my+0.5);
      g.beginPath();
      if (G.vertical) g.moveTo(G.mx,G.my+mr); else g.moveTo(G.mx+mr,G.my);
      g.lineTo(G.x1,G.y1); g.stroke();
      g.font=`${CFG.labelSize*S}px ${FONT_SANS}`;
      if (G.vertical){g.textAlign='left';g.textBaseline='middle';g.fillText('MOTION',G.mx+mr+10*S,G.my);g.textAlign='center';g.fillText('STILL',G.x0,G.y1+22*S);}
      else{g.textAlign='left';g.textBaseline='bottom';g.fillText('MOTION',G.mx-mr,G.my-mr-8*S);}
      const ks=CFG.labelSize*0.82*S;
      g.font=`${ks}px ${FONT_SANS}`;
      motion.knobs.forEach(k=>{const q=G.pt(k.v);dotWithHalo(g,q.x,q.y,k.halo*CFG.haloMult,CFG.handleDot,S);});
      motion.knobs.forEach(k=>{
        const q=G.pt(k.v),hr=Math.max(CFG.minHalo,k.halo*CFG.haloMult)*S,tw=g.measureText(k.label).width;
        g.save(); g.translate(q.x,q.y+hr+4*S); g.rotate(Math.PI/2);
        if (G.vertical){g.fillStyle=CFG.bg;g.fillRect(-2*S,-ks/2-2*S,tw+4*S,ks+4*S);}
        g.fillStyle=textCol; g.textAlign='left'; g.textBaseline='middle'; g.fillText(k.label,0,0);
        g.restore();
      });
      g.restore();
    }

    // ---- render ----
    function render() {
      const F=FORMATS[format];
      const vw=canvas.width/dpr,vh=canvas.height/dpr;
      const margin=24;
      const s=Math.min((vw-margin*2)/F.W,(vh-margin*2)/F.H);
      view={s,ox:(vw-F.W*s)/2,oy:(vh-F.H*s)/2};
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,vw,vh);   // transparent: the page atmosphere shows through
      pxScale=s*dpr;
      ctx.setTransform(dpr*s,0,0,dpr*s,dpr*view.ox,dpr*view.oy);
      drawArt(ctx,{controls:showControls});
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }

    // ---- main loop ----
    let raf=null, lastT=performance.now();
    function loop(now) {
      const dt=Math.min(0.05,Math.max(0,(now-lastT)/1000)); lastT=now;
      if (needsRegen){generate();dirty=true;}
      if (motionActive()){advanceMotion(dt);dirty=true;}
      if (img instanceof HTMLVideoElement) dirty=true;
      if (dirty){dirty=false;updateMotionRects();render();}
      raf=requestAnimationFrame(loop);
    }

    // ---- resize ----
    function resize() {
      dpr=window.devicePixelRatio||1;
      canvas.width=Math.floor(container.clientWidth*dpr);
      canvas.height=Math.floor(container.clientHeight*dpr);
      dirty=true;
    }
    const ro=new ResizeObserver(()=>{ resize(); });
    ro.observe(container);
    resize();

    // ---- interaction ----
    function toArt(e) {
      const r=canvas.getBoundingClientRect();
      return {x:(e.clientX-r.left-view.ox)/view.s, y:(e.clientY-r.top-view.oy)/view.s};
    }
    const inBox=(p,b)=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;
    function hitFaderHandle(p) {
      if (!showControls) return null;
      for (const f of faders) {
        const G=faderGeom(f),tol=Math.max(16,f.halo*CFG.haloMult+2)*G.S;
        const along=G.vertical?(p.y>=G.y0-tol&&p.y<=G.y1+tol):(p.x>=G.x0-tol&&p.x<=G.x1+tol);
        const perp=G.vertical?Math.abs(p.x-G.x0):Math.abs(p.y-G.y0);
        if (along&&perp<=tol) {
          if (f.h2){const v=clamp(G.val(p.x,p.y),0,1);if(Math.abs(h2Pos(f.h2,CFG[f.h2.key])-v)<Math.abs(f.v-v))return{f,second:true};}
          return {f,second:false};
        }
      }
      return null;
    }
    function hitMotionKnob(p) {
      if (!showControls) return null;
      const G=motionGeom(),tol=24*G.S;
      const along=G.vertical?(p.y>=G.y0-tol&&p.y<=G.y1+tol):(p.x>=G.x0-tol&&p.x<=G.x1+tol);
      const perp=G.vertical?Math.abs(p.x-G.x0):Math.abs(p.y-G.y0);
      if (!along||perp>tol) return null;
      const v=clamp(G.val(p.x,p.y),0,1);
      let best=null,bd=Infinity;
      motion.knobs.forEach((k,i)=>{const d=Math.abs(k.v-v)+(i===lastKnob?1e-4:0);if(d<bd){bd=d;best=i;}});
      return best;
    }
    function hitFaderBox(p) {
      if (!showControls) return null;
      for (const f of faders) if (inBox(p,faderGeom(f).box)) return f;
      if (inBox(p,motionGeom().box)) return motion;
      if (Math.hypot(p.x-seedGeom().mx,p.y-seedGeom().my)<=seedGeom().R) return seedCtl;
      return null;
    }
    function hitArea(p) {
      const b=areaBox();
      return b&&inBox(p,{x:b.x-10,y:b.y-10,w:b.w+20,h:b.h+20});
    }
    function hitFrame(p) {
      if (!CFG.frameShow) return null;
      const fr=frameRect(); if (!fr) return null;
      const tol=9/view.s;
      const nearL=Math.abs(p.x-fr.x)<tol,nearR=Math.abs(p.x-(fr.x+fr.w))<tol;
      const nearT=Math.abs(p.y-fr.y)<tol,nearB=Math.abs(p.y-(fr.y+fr.h))<tol;
      const inX=p.x>fr.x-tol&&p.x<fr.x+fr.w+tol,inY=p.y>fr.y-tol&&p.y<fr.y+fr.h+tol;
      const ct=tol*1.8;
      const cL=Math.abs(p.x-fr.x)<ct,cR=Math.abs(p.x-(fr.x+fr.w))<ct;
      const cT=Math.abs(p.y-fr.y)<ct,cB=Math.abs(p.y-(fr.y+fr.h))<ct;
      if (cT&&cL) return 'nw'; if (cT&&cR) return 'ne';
      if (cB&&cL) return 'sw'; if (cB&&cR) return 'se';
      if (((nearL||nearR)&&inY)||((nearT||nearB)&&inX)) return 'edge';
      return null;
    }
    function setFader(f,p,second) {
      const v=clamp(faderGeom(f).val(p.x,p.y),0,1);
      if (second&&f.h2){CFG[f.h2.key]=Math.round(h2Value(f.h2,v)*100)/100;saveCFG();syncInputs();}
      else f.v=v;
      needsRegen=true;
    }
    function setKnob(i,p){motion.knobs[i].v=clamp(motionGeom().val(p.x,p.y),0,1);dirty=true;}
    function setFormat(fm) {
      if (fm===format) return;
      format=fm; needsRegen=true;
    }
    function hitSeed(p) {
      if (!showControls) return null;
      const G=seedGeom(),d=Math.hypot(p.x-G.mx,p.y-G.my);
      if (d<=G.rc+4*G.S) return 'centre';
      for (let i=0;i<seedCtl.rings.length;i++){const{inner,outer}=G.ring(i);const pad=(outer-inner)*0.2;if(d>=inner-pad&&d<=outer+pad)return i;}
      return null;
    }
    function setRing(i,p){const G=seedGeom(),rg=seedCtl.rings[i];let a=Math.atan2(p.y-G.my,p.x-G.mx)-rg.a0*Math.PI/180;a=((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2);let v=a/(Math.PI*2);if(Math.abs(v-rg.v)>0.5)v=rg.v>0.5?1:0;rg.v=v;dirty=true;}
    function pressSeed(){seedCtl.on=!seedCtl.on;CFG.seed=Math.floor(Math.random()*999);saveCFG();syncInputs();needsRegen=true;}

    const onPD=e=>{
      const p=toArt(e);
      canvas.setPointerCapture(e.pointerId);
      const alt=e.altKey||altHeld;
      if (e.shiftKey&&alt){
        if(hitFaderBox(p))drag={type:'scaleFaders',sx:p.x,sy:p.y,os:faderScale[format]};
        else if(hitArea(p))drag={type:'scaleArea',sx:p.x,sy:p.y,os:group[format].s};
        return;
      }
      if (e.shiftKey) {
        const fh=hitFrame(p);
        if (fh){const fr={...frameRect()};frame[format]=fr;drag=fh==='edge'?{type:'moveFrame',sx:p.x,sy:p.y,o:{...fr}}:{type:'resizeFrame',corner:fh,sx:p.x,sy:p.y,o:{...fr}};return;}
        const f=hitFaderBox(p);
        if (f){const m=f.pos[format];drag={type:'moveFader',f,sx:p.x,sy:p.y,ox:m.x,oy:m.y,S:faderScale[format]};return;}
        if (hitArea(p)){const G=group[format];drag={type:'moveArea',sx:p.x,sy:p.y,ox:G.x,oy:G.y};}
        return;
      }
      const hs=hitSeed(p);
      if (hs==='centre'){pressSeed();return;}
      if (hs!==null){drag={type:'ring',i:hs};setRing(hs,p);return;}
      const ki=hitMotionKnob(p);
      if (ki!==null){lastKnob=ki;drag={type:'knob',i:ki};setKnob(ki,p);return;}
      const hf=hitFaderHandle(p);
      if (hf){drag={type:'fader',f:hf.f,second:hf.second};setFader(hf.f,p,hf.second);}
    };
    const onPM=e=>{
      const p=toArt(e);
      if (!drag){
        let cur='default';
        const fh=e.shiftKey?hitFrame(p):null;
        if (e.shiftKey&&(e.altKey||altHeld)&&(hitFaderBox(p)||hitArea(p)))cur='nwse-resize';
        else if(fh==='nw'||fh==='se')cur='nwse-resize';
        else if(fh==='ne'||fh==='sw')cur='nesw-resize';
        else if(fh==='edge')cur='move';
        else if(e.shiftKey&&(hitFaderBox(p)||hitArea(p)))cur='move';
        else if(hitSeed(p)!==null||hitMotionKnob(p)!==null||hitFaderHandle(p))cur='pointer';
        canvas.style.cursor=cur; return;
      }
      const dx=p.x-drag.sx,dy=p.y-drag.sy;
      if(drag.type==='fader')setFader(drag.f,p,drag.second);
      else if(drag.type==='knob')setKnob(drag.i,p);
      else if(drag.type==='ring')setRing(drag.i,p);
      else if(drag.type==='moveFader'){drag.f.pos[format]={x:drag.ox+dx/drag.S,y:drag.oy+dy/drag.S};}
      else if(drag.type==='moveArea'){const G=group[format];G.x=drag.ox+dx;G.y=drag.oy+dy;}
      else if(drag.type==='scaleArea'){group[format].s=Math.max(0.2,Math.min(5,drag.os*Math.exp((dx-dy)/300)));}
      else if(drag.type==='scaleFaders'){faderScale[format]=Math.max(0.4,Math.min(3,drag.os*Math.exp((dx-dy)/300)));}
      else if(drag.type==='moveFrame'){frame[format]={...drag.o,x:drag.o.x+dx,y:drag.o.y+dy};}
      else if(drag.type==='resizeFrame'){
        const o=drag.o;let{x,y,w,h}=o;
        if(drag.corner.includes('w')){x=o.x+dx;w=o.w-dx;} if(drag.corner.includes('e')){w=o.w+dx;}
        if(drag.corner.includes('n')){y=o.y+dy;h=o.h-dy;} if(drag.corner.includes('s')){h=o.h+dy;}
        if(w<40){if(drag.corner.includes('w'))x-=40-w;w=40;} if(h<40){if(drag.corner.includes('n'))y-=40-h;h=40;}
        frame[format]={x,y,w,h};
      }
      dirty=true;
    };
    const onPU=()=>{drag=null;};
    const onWheel=e=>{
      if(!e.shiftKey)return; e.preventDefault();
      const d=e.deltaY||e.deltaX;
      if(hitFaderBox(toArt(e)))faderScale[format]=Math.max(0.4,Math.min(3,faderScale[format]*Math.exp(-d/600)));
      else{const G=group[format];G.s=Math.max(0.2,Math.min(5,G.s*Math.exp(-d/600)));}
      dirty=true;
    };
    const onKU=e=>{if(e.key==='Alt'||e.code==='AltLeft'||e.code==='AltRight')altHeld=false;};
    const onBlur=()=>{altHeld=false;};
    canvas.addEventListener('pointerdown',onPD);
    canvas.addEventListener('pointermove',onPM);
    canvas.addEventListener('pointerup',onPU);
    canvas.addEventListener('pointercancel',onPU);
    canvas.addEventListener('wheel',onWheel,{passive:false});
    window.addEventListener('keyup',onKU);
    window.addEventListener('blur',onBlur);

    // ---- export ----
    function flash(m){message=m;messageTime=performance.now();dirty=true;setTimeout(()=>dirty=true,3100);}
    function download(text,name,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}
    function exportPNG() {
      const F=FORMATS[format],q=2,c=document.createElement('canvas');
      c.width=F.W*q;c.height=F.H*q;
      const g=c.getContext('2d');
      g.setTransform(q,0,0,q,0,0);g.fillStyle=CFG.bg;g.fillRect(0,0,F.W,F.H);
      pxScale=q; drawArt(g,{controls:showControls}); dirty=true;
      try{c.toBlob(b=>{if(!b){flash('Export failed');return;}const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`assemblage_${format.replace(':','x')}_${Date.now()}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);flash('Exported PNG');},'image/png');}
      catch(err){flash('Export blocked: image server does not allow CORS — drop a local image to export');}
    }
    function exportPositions() {
      const r1=v=>Math.round(v*10)/10;
      const box=b=>b?{x:r1(b.x),y:r1(b.y),w:r1(b.w),h:r1(b.h)}:null;
      const posOf=o=>Object.fromEntries(Object.entries(o.pos).map(([fm,q])=>[fm,{x:r1(q.x),y:r1(q.y)}]));
      const data={program:'Assemblage',format,artboard:{W:FORMATS[format].W,H:FORMATS[format].H},faders:faders.map(f=>({n:ROMAN[f.i],key:f.key,value:Math.round(f.v*1000)/1000,halo:f.halo,position:posOf(f)})),seedControl:{on:seedCtl.on,seed:CFG.seed,rings:seedCtl.rings.map(r=>Math.round(r.v*1000)/1000),position:posOf(seedCtl)},motion:{knobs:motion.knobs.map(k=>({key:k.key,value:Math.round(k.v*1000)/1000})),position:posOf(motion)},faderScale:{...faderScale},imageArea:Object.fromEntries(Object.entries(group).map(([fm,G])=>[fm,{moveX:r1(G.x),moveY:r1(G.y),scale:Math.round(G.s*1000)/1000}])),frame:Object.fromEntries(Object.entries(frame).map(([fm,b])=>[fm,b?box(b):'auto'])),settings:{...CFG}};
      const json=JSON.stringify(data,null,2);
      download(json,`assemblage_positions_${format.replace(':','x')}_${Date.now()}.json`,'application/json');
      if(navigator.clipboard)navigator.clipboard.writeText(json).catch(()=>{});
      flash('Positions exported');
    }

    // ---- RAL picker ----
    const RAL={
      'Yellow':[['1000','#BEBD7F','Green beige'],['1001','#C2B078','Beige'],['1002','#C6A664','Sand yellow'],['1003','#E5BE01','Signal yellow'],['1004','#CDA434','Golden yellow'],['1005','#A98307','Honey yellow'],['1006','#E4A010','Maize yellow'],['1007','#DC9D00','Daffodil yellow'],['1011','#8A6642','Brown beige'],['1012','#C7B446','Lemon yellow'],['1013','#EAE6CA','Oyster white'],['1014','#E1CC4F','Ivory'],['1015','#E6D690','Light ivory'],['1016','#EDFF21','Sulfur yellow'],['1017','#F5D033','Saffron yellow'],['1018','#F8F32B','Zinc yellow'],['1019','#9E9764','Grey beige'],['1020','#999950','Olive yellow'],['1021','#F3DA0B','Rape yellow'],['1023','#FAD201','Traffic yellow'],['1024','#AEA04B','Ochre yellow'],['1026','#FFFF00','Luminous yellow'],['1027','#9D9101','Curry'],['1028','#F4A900','Melon yellow'],['1032','#D6AE01','Broom yellow'],['1033','#F3A505','Dahlia yellow'],['1034','#EFA94A','Pastel yellow'],['1035','#6A5D4D','Pearl beige'],['1036','#705335','Pearl gold'],['1037','#F39F18','Sun yellow']],
      'Orange':[['2000','#ED760E','Yellow orange'],['2001','#C93C20','Red orange'],['2002','#CB2821','Vermilion'],['2003','#FF7514','Pastel orange'],['2004','#F44611','Pure orange'],['2005','#FF2301','Luminous orange'],['2007','#FFA420','Luminous bright orange'],['2008','#F75E25','Bright red orange'],['2009','#F54021','Traffic orange'],['2010','#D84B20','Signal orange'],['2011','#EC7C26','Deep orange'],['2012','#E55137','Salmon orange'],['2013','#C35831','Pearl orange']],
      'Red':[['3000','#AF2B1E','Flame red'],['3001','#A52019','Signal red'],['3002','#A2231D','Carmine red'],['3003','#9B111E','Ruby red'],['3004','#75151E','Purple red'],['3005','#5E2129','Wine red'],['3007','#412227','Black red'],['3009','#642424','Oxide red'],['3011','#781F19','Brown red'],['3012','#C1876B','Beige red'],['3013','#A12312','Tomato red'],['3014','#D36E70','Antique pink'],['3015','#EA899A','Light pink'],['3016','#B32821','Coral red'],['3017','#E63244','Rose'],['3018','#D53032','Strawberry red'],['3020','#CC0605','Traffic red'],['3022','#D95030','Salmon pink'],['3024','#F80000','Luminous red'],['3026','#FE0000','Luminous bright red'],['3027','#C51D34','Raspberry red'],['3028','#CB3234','Pure red'],['3031','#B32428','Orient red'],['3032','#721422','Pearl ruby red'],['3033','#B44C43','Pearl pink']],
      'Violet':[['4001','#6D3F5B','Red lilac'],['4002','#922B3E','Red violet'],['4003','#DE4C8A','Heather violet'],['4004','#641C34','Claret violet'],['4005','#6C4675','Blue lilac'],['4006','#A03472','Traffic purple'],['4007','#4A192C','Purple violet'],['4008','#924E7D','Signal violet'],['4009','#A18594','Pastel violet'],['4010','#CF3476','Telemagenta'],['4011','#8673A1','Pearl violet'],['4012','#6C6874','Pearl blackberry']],
      'Blue':[['5000','#354D73','Violet blue'],['5001','#1F3438','Green blue'],['5002','#20214F','Ultramarine blue'],['5003','#1D1E33','Sapphire blue'],['5004','#18171C','Black blue'],['5005','#1E2460','Signal blue'],['5007','#3E5F8A','Brillant blue'],['5008','#26252D','Grey blue'],['5009','#025669','Azure blue'],['5010','#0E294B','Gentian blue'],['5011','#231A24','Steel blue'],['5012','#3B83BD','Light blue'],['5013','#1E213D','Cobalt blue'],['5014','#606E8C','Pigeon blue'],['5015','#2271B3','Sky blue'],['5017','#063971','Traffic blue'],['5018','#3F888F','Turquoise blue'],['5019','#1B5583','Capri blue'],['5020','#1D334A','Ocean blue'],['5021','#256D7B','Water blue'],['5022','#252850','Night blue'],['5023','#49678D','Distant blue'],['5024','#5D9B9B','Pastel blue'],['5025','#2A6478','Pearl gentian blue'],['5026','#102C54','Pearl night blue']],
      'Green':[['6000','#316650','Patina green'],['6001','#287233','Emerald green'],['6002','#2D572C','Leaf green'],['6003','#424632','Olive green'],['6004','#1F3A3D','Blue green'],['6005','#2F4538','Moss green'],['6006','#3E3B32','Grey olive'],['6007','#343B29','Bottle green'],['6008','#39352A','Brown green'],['6009','#31372B','Fir green'],['6010','#35682D','Grass green'],['6011','#587246','Reseda green'],['6012','#343E40','Black green'],['6013','#6C7156','Reed green'],['6014','#47402E','Yellow olive'],['6015','#3B3C36','Black olive'],['6016','#1E5945','Turquoise green'],['6017','#4C9141','May green'],['6018','#57A639','Yellow green'],['6019','#BDECB6','Pastel green'],['6020','#2E3A23','Chrome green'],['6021','#89AC76','Pale green'],['6022','#25221B','Olive drab'],['6024','#308446','Traffic green'],['6025','#3D642D','Fern green'],['6026','#015D52','Opal green'],['6027','#84C3BE','Light green'],['6028','#2C5545','Pine green'],['6029','#20603D','Mint green'],['6032','#317F43','Signal green'],['6033','#497E76','Mint turquoise'],['6034','#7FB5B5','Pastel turquoise'],['6035','#1C542D','Pearl green'],['6036','#193737','Pearl opal green'],['6037','#008F39','Pure green'],['6038','#00BB2D','Luminous green']],
      'Grey':[['7000','#78858B','Squirrel grey'],['7001','#8A9597','Silver grey'],['7002','#817F68','Olive grey'],['7003','#7D7F7D','Moss grey'],['7004','#9EA0A1','Signal grey'],['7005','#6C7059','Mouse grey'],['7006','#756F61','Beige grey'],['7008','#745F3D','Khaki grey'],['7009','#5B6259','Green grey'],['7010','#575D57','Tarpaulin grey'],['7011','#555D61','Iron grey'],['7012','#596163','Basalt grey'],['7013','#555F54','Brown grey'],['7015','#51565C','Slate grey'],['7016','#373F43','Anthracite grey'],['7021','#2E3234','Black grey'],['7022','#4C4F4E','Umbra grey'],['7023','#818479','Concrete grey'],['7024','#474A51','Graphite grey'],['7026','#374447','Granite grey'],['7030','#8B8C7A','Stone grey'],['7031','#474B4E','Blue grey'],['7032','#B8B799','Pebble grey'],['7033','#7D8471','Cement grey'],['7034','#8F8B66','Yellow grey'],['7035','#D7D7D7','Light grey'],['7036','#7F7679','Platinum grey'],['7037','#7D7F7D','Dusty grey'],['7038','#B5B8B1','Agate grey'],['7039','#6C6960','Quartz grey'],['7040','#9DA3A6','Window grey'],['7042','#8D948D','Traffic grey A'],['7043','#4E5452','Traffic grey B'],['7044','#CAC4B0','Silk grey'],['7045','#909090','Telegrey 1'],['7046','#82898F','Telegrey 2'],['7047','#D0D0D0','Telegrey 4'],['7048','#898176','Pearl mouse grey']],
      'Brown':[['8000','#826C34','Green brown'],['8001','#955F20','Ochre brown'],['8002','#6C3B2A','Signal brown'],['8003','#734222','Clay brown'],['8004','#8E402A','Copper brown'],['8007','#59351F','Fawn brown'],['8008','#6F4F28','Olive brown'],['8011','#5B3A29','Nut brown'],['8012','#592321','Red brown'],['8014','#382C1E','Sepia brown'],['8015','#633A34','Chestnut brown'],['8016','#4C2F27','Mahogany brown'],['8017','#45322E','Chocolate brown'],['8019','#403A3A','Grey brown'],['8022','#212121','Black brown'],['8023','#A65E2E','Orange brown'],['8024','#79553D','Beige brown'],['8025','#755C48','Pale brown'],['8028','#4E3B31','Terra brown'],['8029','#763C28','Pearl copper']],
      'White & Black':[['9001','#FDF4E3','Cream'],['9002','#E7EBDA','Grey white'],['9003','#F4F4F4','Signal white'],['9004','#282828','Signal black'],['9005','#0A0A0A','Jet black'],['9006','#A5A5A5','White aluminium'],['9007','#8F8F8F','Grey aluminium'],['9010','#FFFFFF','Pure white'],['9011','#1C1C1C','Graphite black'],['9012','#F6F6F6','Cleanroom white'],['9016','#F6F6F6','Traffic white'],['9017','#1E1E1E','Traffic black'],['9018','#D7D7D7','Papyrus white'],['9022','#9E9E9E','Pearl light grey'],['9023','#828282','Pearl dark grey']],
    };
    const RAL_BY_HEX={};
    Object.values(RAL).forEach(list=>list.forEach(([code,hex,name])=>{if(!RAL_BY_HEX[hex.toUpperCase()])RAL_BY_HEX[hex.toUpperCase()]={code,name};}));
    const ralLabel=hex=>{const r=RAL_BY_HEX[(hex||'').toUpperCase()];return r?r.code:(hex||'').toUpperCase();};

    const ralPopup=document.createElement('div');
    ralPopup.style.cssText='position:fixed;background:#D0D0D0;border:1px solid #BBBBBB;padding:10px;z-index:10001;display:none;max-width:320px;max-height:420px;overflow-y:auto;box-shadow:2px 2px 8px rgba(0,0,0,.15);';
    const ralTooltip=document.createElement('div');
    ralTooltip.style.cssText='position:fixed;background:#333;color:#DDD;font:9px "Courier New",monospace;padding:3px 6px;pointer-events:none;z-index:10002;white-space:nowrap;display:none;';
    document.body.appendChild(ralPopup);
    document.body.appendChild(ralTooltip);
    // ral swatch styles
    const ralSt=document.createElement('style');
    ralSt.textContent='.tg-ral-sw{width:16px;height:16px;cursor:pointer;border:1px solid transparent;flex-shrink:0;display:inline-block}.tg-ral-sw:hover{border-color:#333}.tg-ral-sw.selected{border-color:#fff;box-shadow:0 0 0 1px #333}.tg-ral-cat{font:8px "Helvetica Neue",Helvetica,Arial,sans-serif;color:#999;text-transform:uppercase;letter-spacing:.08em;margin:6px 0 3px;display:block}.tg-ral-row{display:flex;flex-wrap:wrap;gap:2px;margin-bottom:2px}';
    document.head.appendChild(ralSt);
    {
      let html='';
      for (const [cat,colors] of Object.entries(RAL)){
        html+=`<span class="tg-ral-cat">${cat}</span><div class="tg-ral-row">`;
        colors.forEach(([code,hex,name])=>{html+=`<div class="tg-ral-sw" style="background:${hex}" data-code="${code}" data-hex="${hex}" data-name="${name}"></div>`;});
        html+='</div>';
      }
      ralPopup.innerHTML=html;
    }
    let ralTarget=null;
    function openRal(target) {
      ralTarget=target;
      const cur=(CFG[target.key]||'').toUpperCase();
      ralPopup.querySelectorAll('.tg-ral-sw').forEach(s=>s.classList.toggle('selected',s.dataset.hex.toUpperCase()===cur));
      const rect=target.btn.getBoundingClientRect();
      ralPopup.style.left=Math.max(8,Math.min(rect.left-340,window.innerWidth-340))+'px';
      ralPopup.style.top=Math.max(8,Math.min(rect.top-40,window.innerHeight-440))+'px';
      ralPopup.style.display='block';
    }
    ralPopup.addEventListener('click',e=>{
      const sw=e.target.closest('.tg-ral-sw');
      if (!sw||!ralTarget) return;
      CFG[ralTarget.key]=sw.dataset.hex;
      ralTarget.btn.style.background=sw.dataset.hex;
      ralTarget.val.textContent=sw.dataset.code;
      ralPopup.querySelectorAll('.tg-ral-sw').forEach(s=>s.classList.remove('selected'));
      sw.classList.add('selected');
      ralPopup.style.display='none';
      ralTooltip.style.display='none';
      changed(ralTarget.key);
    });
    ralPopup.addEventListener('mousemove',e=>{
      const sw=e.target.closest('.tg-ral-sw');
      if (sw){ralTooltip.textContent=`RAL ${sw.dataset.code} — ${sw.dataset.name}`;ralTooltip.style.display='block';ralTooltip.style.left=(e.clientX+12)+'px';ralTooltip.style.top=(e.clientY-8)+'px';}
      else ralTooltip.style.display='none';
    });
    ralPopup.addEventListener('mouseleave',()=>{ralTooltip.style.display='none';});
    const onRalClose=e=>{if(!ralPopup.contains(e.target)&&!(e.target.classList&&e.target.classList.contains('tg-asm-sw'))){ralPopup.style.display='none';ralTooltip.style.display='none';}};
    document.addEventListener('pointerdown',onRalClose);

    // ---- dev console ----
    const consoleEl=document.createElement('div');
    consoleEl.style.cssText='position:fixed;top:16px;right:16px;width:290px;max-height:calc(100vh - 80px);display:flex;flex-direction:column;background:rgba(20,20,20,0.92);color:#ddd;border:1px solid #444;border-radius:6px;font:11px/1.3 "Helvetica Neue",Helvetica,Arial,sans-serif;z-index:10000;box-shadow:0 8px 30px rgba(0,0,0,.35);user-select:none;';
    consoleEl.innerHTML='<div class="tg-asm-head" style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;cursor:move;border-bottom:1px solid #333;font-weight:bold;letter-spacing:.08em"><span>CONSOLE</span><button style="background:none;border:0;color:#aaa;cursor:pointer;font-size:14px" id="tg-asm-close">×</button></div><div style="overflow-y:auto;padding:4px 10px 10px" id="tg-asm-body"></div>';
    consoleEl.classList.add('hidden');
    consoleEl.style.display='none';
    document.body.appendChild(consoleEl);
    // console styles
    const conSt=document.createElement('style');
    conSt.textContent='#tg-asm-body details{border-bottom:1px solid #2c2c2c;padding:4px 0}#tg-asm-body summary{cursor:pointer;padding:4px 0;font-weight:bold;color:#fff;letter-spacing:.05em}#tg-asm-body .tg-row{display:grid;grid-template-columns:92px 1fr 52px;align-items:center;gap:6px;padding:3px 0}#tg-asm-body .tg-row label{color:#aaa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#tg-asm-body .tg-val{font-size:10px;text-align:right;color:#888;font-variant-numeric:tabular-nums}#tg-asm-body input[type=range]{width:100%;accent-color:#a0d2ec}#tg-asm-body input[type=checkbox]{justify-self:start;accent-color:#a0d2ec}#tg-asm-body .tg-btns{display:flex;flex-wrap:wrap;gap:6px;padding:8px 0 2px}#tg-asm-body .tg-btns button{flex:1 1 auto;background:#2b2b2b;color:#ddd;border:1px solid #444;border-radius:4px;padding:5px 6px;font:inherit;cursor:pointer}#tg-asm-body .tg-btns button:hover{background:#383838}#tg-asm-body .tg-asm-sw{width:100%;height:16px;border:1px solid #555;cursor:pointer;padding:0}#tg-asm-body .tg-asm-sw:hover{border-color:#ddd}#tg-asm-body textarea{width:100%;height:90px;box-sizing:border-box;background:#111;color:#ccc;border:1px solid #444;font:10px monospace}';
    document.head.appendChild(conSt);

    const consoleBody=consoleEl.querySelector('#tg-asm-body');
    const SCHEMA=[
      ['Colours',[['bg','Background','color'],['textColor','Fader text','color'],['textAlpha','Fader text α','range',0,1,0.01],['notesColor','Notes text','color'],['notesAlpha','Notes text α','range',0,1,0.01],['uiTextColor','Bottom bar text','color'],['lineColor','Fader lines','color'],['lineAlpha','Fader lines α','range',0,1,0.01],['dotColor','Dots','color'],['haloColor','Halos','color'],['haloAlpha','Halos α','range',0,1,0.01],['inkColor','Rays + curves','color']]],
      ['Borders',[['border','Border','select',['off','black','white','orange']],['borderWidth','Width (px)','range',0.25,4,0.05]]],
      ['Frame',[['frameShow','Show frame','check'],['frameColor','Colour','color'],['frameAlpha','Opacity','range',0,1,0.01],['frameWidth','Line width','range',0.1,4,0.05],['framePad','Auto padding','range',0,200,1],['__fitFrame','Fit frame to content','button']]],
      ['Faders (look)',[['trackLenV','Track length 16:9','range',80,500,1],['trackLenH','Track length 9:16','range',80,500,1],['trackWidth','Line width','range',0.25,3,0.05],['markerR','Marker radius','range',6,30,0.5],['numeralSize','Numeral size','range',5,20,0.5],['labelSize','Label size','range',6,24,0.5],['handleDot','Handle dot','range',1,12,0.1],['haloMult','Handle halo ×','range',0.3,3,0.01],['minHalo','Min halo','range',2,20,0.1],['minDot','Min dot','range',0.5,8,0.1],['showLeaders','Leader lines','check'],['leaderDash','Leader dash','range',1,20,0.5]]],
      ['Lines & details',[['rayWidth','Ray width','range',0.1,3,0.05],['rayAlpha','Ray opacity','range',0,1,0.01],['rayDot','Ray end dot ×','range',0,3,0.05],['rayDensity','Ray density ×','range',0,3,0.05],['rayLength','Ray length ×','range',0.2,3,0.05],['curveCount','Curves/guides ×','range',0,3,0.05],['curveWidth','Curve width','range',0.1,3,0.05],['curveAlpha','Curve opacity','range',0,1,0.01],['guideAlpha','Guide opacity','range',0,1,0.01],['showNotes','Notes','check'],['notesSize','Notes size','range',6,30,0.5],['notesCount','Notes count ×','range',0,4,0.05]]],
      ['Blue areas',[['washShow','Show','check'],['washColor','Base colour','color'],['washAlpha','Opacity','range',0,1,0.01],['washVar','Shade variation','range',0,2,0.01],['washAmount','Amount','range',0,1,0.01],['washSpread','Size','range',0.2,3,0.01],['washBands','Slivers ×','range',0,4,0.05],['washSkew','Shards ×','range',0,2,0.01]]],
      ['Motion',[['followMotion','Lines follow pieces','check'],['motionLen','Motion track ×','range',0.6,2,0.01]]],
      ['Pieces (shape)',[['seed','Seed','range',0,998,1],['seedSize','Seed control size','range',60,400,1],['pieceW','Width × (fader II)','range',0.3,3,0.01],['pieceH','Height × (fader III)','range',0.3,3,0.01],['stackChance','Stacked blocks','range',0,1,0.01],['multiplyChance','Multiply blend','range',0,1,0.01]]],
    ];
    const inputs={};
    function fmtVal(v,step){return step>=1?String(Math.round(v)):(+v).toFixed(step<0.1?2:1);}
    function buildConsole() {
      consoleBody.innerHTML='';
      SCHEMA.forEach(([title,items],si)=>{
        const det=document.createElement('details');
        if (si<2) det.open=true;
        const sum=document.createElement('summary'); sum.textContent=title.toUpperCase();
        det.appendChild(sum);
        items.forEach(([key,label,type,min,max,step])=>{
          if (type==='button'){
            const wrap=document.createElement('div'); wrap.className='tg-btns';
            const b=document.createElement('button'); b.textContent=label;
            b.onclick=()=>{if(key==='__fitFrame'){frame[format]=null;dirty=true;}};
            wrap.appendChild(b); det.appendChild(wrap); return;
          }
          const row=document.createElement('div'); row.className='tg-row';
          const lab=document.createElement('label'); lab.textContent=label; lab.title=label;
          const inp=document.createElement('input');
          const val=document.createElement('span'); val.className='tg-val';
          if (type==='range'){
            inp.type='range'; inp.min=min; inp.max=max; inp.step=step; inp.value=CFG[key];
            val.textContent=fmtVal(CFG[key],step);
            inp.oninput=()=>{CFG[key]=parseFloat(inp.value);val.textContent=fmtVal(CFG[key],step);changed(key);};
            inp.ondblclick=()=>{CFG[key]=CFG_DEFAULT[key];inp.value=CFG[key];val.textContent=fmtVal(CFG[key],step);changed(key);};
            inp.title='Double-click to reset';
          } else if (type==='color'){
            const btn=document.createElement('button');
            btn.className='tg-asm-sw'; btn.style.background=CFG[key];
            val.textContent=ralLabel(CFG[key]);
            btn.onclick=e=>{e.stopPropagation();openRal({key,btn,val});};
            inputs[key]={inp:btn,val,step,type};
            row.append(lab,btn,val); det.appendChild(row); return;
          } else if (type==='check'){
            inp.type='checkbox'; inp.checked=!!CFG[key];
            inp.onchange=()=>{CFG[key]=inp.checked;changed(key);};
          } else if (type==='select'){
            const sel=document.createElement('select');
            sel.style.cssText='width:100%;background:#2b2b2b;color:#ddd;border:1px solid #444;font:inherit;';
            min.forEach(o=>{const op=document.createElement('option');op.value=o;op.textContent=o.toUpperCase();sel.appendChild(op);});
            sel.value=CFG[key];
            sel.onchange=()=>{CFG[key]=sel.value;changed(key);};
            inputs[key]={inp:sel,val,step,type};
            row.append(lab,sel,val); det.appendChild(row); return;
          }
          inputs[key]={inp,val,step,type};
          row.append(lab,inp,val); det.appendChild(row);
        });
        consoleBody.appendChild(det);
      });
      const det=document.createElement('details');
      const sum=document.createElement('summary'); sum.textContent='SETTINGS'; det.appendChild(sum);
      const ta=document.createElement('textarea'); ta.placeholder='Paste settings JSON here, then Load';
      const btns=document.createElement('div'); btns.className='tg-btns';
      const mk=(t,fn)=>{const b=document.createElement('button');b.textContent=t;b.onclick=fn;btns.appendChild(b);};
      mk('Copy settings',()=>{const json=JSON.stringify(CFG,null,2);ta.value=json;if(navigator.clipboard)navigator.clipboard.writeText(json).catch(()=>{});download(json,`assemblage_settings_${Date.now()}.json`,'application/json');flash('Settings copied + downloaded');});
      mk('Load',()=>{try{CFG={...CFG_DEFAULT,...JSON.parse(ta.value)};syncInputs();saveCFG();needsRegen=true;flash('Settings loaded');}catch(e){flash('Could not read settings JSON');}});
      mk('Reset all',()=>{CFG={...CFG_DEFAULT};syncInputs();saveCFG();needsRegen=true;flash('Settings reset');});
      det.append(btns,ta); consoleBody.appendChild(det);
    }
    function syncInputs() {
      Object.entries(inputs).forEach(([key,o])=>{
        if(o.type==='check')o.inp.checked=!!CFG[key];
        else if(o.type==='color'){o.inp.style.background=CFG[key];o.val.textContent=ralLabel(CFG[key]);}
        else o.inp.value=CFG[key];
        if(o.type==='range')o.val.textContent=fmtVal(CFG[key],o.step);
      });
    }
    function changed(key){saveCFG();if(REGEN_KEYS.has(key))needsRegen=true;dirty=true;}
    function toggleConsole(){
      const hidden=consoleEl.style.display==='none';
      consoleEl.style.display=hidden?'flex':'none';
      dirty=true;
    }
    consoleEl.querySelector('#tg-asm-close').onclick=toggleConsole;
    // drag console by header
    {
      const head=consoleEl.querySelector('.tg-asm-head');
      let d=null;
      head.addEventListener('pointerdown',e=>{if(e.target.tagName==='BUTTON')return;const r=consoleEl.getBoundingClientRect();d={sx:e.clientX,sy:e.clientY,ox:r.left,oy:r.top};head.setPointerCapture(e.pointerId);});
      head.addEventListener('pointermove',e=>{if(!d)return;consoleEl.style.left=(d.ox+e.clientX-d.sx)+'px';consoleEl.style.top=(d.oy+e.clientY-d.sy)+'px';consoleEl.style.right='auto';});
      head.addEventListener('pointerup',()=>{d=null;});
    }
    buildConsole();

    // start loop
    raf=requestAnimationFrame(loop);

    // ---- public interface ----
    function getParams() {
      return {
        cfg: {...CFG},
        faders: faders.map(f=>({key:f.key, v:f.v, pos: Object.fromEntries(FMT_KEYS.map(fm=>[fm,{...f.pos[fm]}]))})),
        motion: {knobs: motion.knobs.map(k=>({key:k.key, v:k.v})), pos: Object.fromEntries(FMT_KEYS.map(fm=>[fm,{...motion.pos[fm]}]))},
        seed: {rings: seedCtl.rings.map(r=>({v:r.v, a0:r.a0})), on: seedCtl.on, pos: Object.fromEntries(FMT_KEYS.map(fm=>[fm,{...seedCtl.pos[fm]}]))},
        format, showControls,
        group: Object.fromEntries(FMT_KEYS.map(fm=>[fm,{...group[fm]}])),
        faderScale: {...faderScale},
        frame: Object.fromEntries(FMT_KEYS.map(fm=>[fm, frame[fm]?{...frame[fm]}:null])),
      };
    }
    function setParams(obj) {
      if (obj.cfg){CFG={...CFG_DEFAULT,...CFG,...obj.cfg};saveCFG();}   // merge: a bg-only update must not reset the rest
      if (obj.faders) obj.faders.forEach(fd=>{const f=faders.find(x=>x.key===fd.key);if(f){f.v=fd.v;if(fd.pos)FMT_KEYS.forEach(fm=>{if(fd.pos[fm])f.pos[fm]={...fd.pos[fm]};});}});
      if (obj.motion){obj.motion.knobs.forEach(mk=>{const k=motion.knobs.find(x=>x.key===mk.key);if(k)k.v=mk.v;});if(obj.motion.pos)FMT_KEYS.forEach(fm=>{if(obj.motion.pos[fm])motion.pos[fm]={...obj.motion.pos[fm]};});}
      if (obj.seed){obj.seed.rings.forEach((r,i)=>{if(seedCtl.rings[i])Object.assign(seedCtl.rings[i],r);});if(obj.seed.on!==undefined)seedCtl.on=obj.seed.on;if(obj.seed.pos)FMT_KEYS.forEach(fm=>{if(obj.seed.pos[fm])seedCtl.pos[fm]={...obj.seed.pos[fm]};});}
      if (obj.format) format=obj.format;
      if (obj.showControls!==undefined) showControls=obj.showControls;
      if (obj.group) FMT_KEYS.forEach(fm=>{if(obj.group[fm])Object.assign(group[fm],obj.group[fm]);});
      if (obj.faderScale) Object.assign(faderScale,obj.faderScale);
      if (obj.frame) FMT_KEYS.forEach(fm=>{frame[fm]=obj.frame[fm]||null;});
      syncInputs(); needsRegen=true; dirty=true;
    }
    function onKey(e) {
      if (e.key==='Alt'||e.code==='AltLeft'||e.code==='AltRight'){altHeld=true;e.preventDefault();return;}
      if (e.metaKey||e.ctrlKey||e.altKey) return;
      const k=(e.code&&e.code.startsWith('Key'))?e.code.slice(3).toLowerCase():e.key.toLowerCase();
      if (k==='r'){CFG.seed=Math.floor(Math.random()*999);saveCFG();syncInputs();needsRegen=true;}
      else if (k==='f'){setFormat(FMT_KEYS[(FMT_KEYS.indexOf(format)+1)%FMT_KEYS.length]);}
      else if (k==='h'){showControls=!showControls;dirty=true;}
      else if (k==='c'){toggleConsole();}
      else if (k==='l'){
        group[format]={x:0,y:0,s:1};faderScale[format]=DEFAULT_FADER_SCALE[format];frame[format]=null;
        const keep=faders.map(f=>({...f.pos})),keepM={...motion.pos},keepS={...seedCtl.pos};
        defaultFaderLayout();
        faders.forEach((f,i)=>{const d=f.pos[format];f.pos=keep[i];f.pos[format]=d;});
        const dm=motion.pos[format];motion.pos=keepM;motion.pos[format]=dm;
        const ds=seedCtl.pos[format];seedCtl.pos=keepS;seedCtl.pos[format]=ds;
        needsRegen=true;
      }
      else if (k==='e'){exportPNG();}
      else if (k==='p'){exportPositions();}
    }
    function destroy() {
      if (raf) cancelAnimationFrame(raf);
      offDeck();
      ro.disconnect();
      canvas.removeEventListener('pointerdown',onPD);
      canvas.removeEventListener('pointermove',onPM);
      canvas.removeEventListener('pointerup',onPU);
      canvas.removeEventListener('pointercancel',onPU);
      canvas.removeEventListener('wheel',onWheel);
      window.removeEventListener('keyup',onKU);
      window.removeEventListener('blur',onBlur);
      document.removeEventListener('pointerdown',onRalClose);
      canvas.remove();
      consoleEl.remove();
      ralPopup.remove();
      ralTooltip.remove();
      ralSt.remove();
      conSt.remove();
      raf=null;
    }

    return { destroy, getParams, setParams, onKey, resize };
    // TODO: shared video element — create(container, sharedVideo)
  }
};
