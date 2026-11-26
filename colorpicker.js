// build: tommygee-v08-colour-picker
// Extended colour chooser (RAL / Neon / Mixer) — copied from daysof93 music5.html, plus copy/paste.
(function(){
  var st=document.createElement('style'); st.textContent="#d93cc{display:none;position:fixed;z-index:10000;background:#1a1a1a;border:1px solid #444;\n  box-shadow:3px 5px 18px rgba(0,0,0,.6);width:292px;font-family:'Jost',sans-serif;font-weight:300;color:#bbb}\n#d93cc.open{display:block}\n#d93cc-hdr{padding:6px 10px;border-bottom:1px solid #333;display:flex;align-items:center;\n  justify-content:space-between;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#666;cursor:move}\n#d93cc-close{cursor:pointer;color:#555;font-size:16px;line-height:1;padding:0 2px}\n#d93cc-close:hover{color:#bbb}\n#d93cc-tabs{display:flex;border-bottom:1px solid #333}\n.d93cct{flex:1;padding:5px;font-size:9px;letter-spacing:.15em;text-transform:uppercase;text-align:center;\n  cursor:pointer;color:#555;border-right:1px solid #333}\n.d93cct:last-child{border-right:none}.d93cct.on{color:#6698bb;background:#222}\n.d93ccp{display:none}.d93ccp.on{display:block}\n#d93ral-s{width:100%;padding:5px 10px;font-size:10px;font-family:'Jost',sans-serif;font-weight:300;\n  border:none;border-bottom:1px solid #333;background:#222;outline:none;color:#aaa}\n#d93ral-g{display:flex;flex-wrap:wrap;gap:2px;padding:6px;max-height:180px;overflow-y:auto}\n.d93rs{width:20px;height:20px;cursor:pointer;flex-shrink:0;border:1px solid transparent}\n.d93rs:hover{outline:2px solid #6698bb;outline-offset:1px}\n#d93neon-g{display:flex;flex-wrap:wrap;gap:3px;padding:8px;max-height:260px;overflow-y:auto}\n.d93ns{width:40px;height:28px;cursor:pointer;display:flex;align-items:flex-end;justify-content:center;\n  padding-bottom:2px;font-size:7px;letter-spacing:.08em;text-transform:uppercase;\n  color:rgba(0,0,0,.65);border:1px solid transparent}\n.d93ns:hover{outline:2px solid #eee}\n#d93mix{padding:8px}\n#d93sv{width:100%;height:148px;cursor:crosshair;display:block;border:1px solid #333}\n.d93sr{margin-top:4px;position:relative;height:12px}\n.d93sr canvas{width:100%;height:12px;display:block;cursor:pointer;border:1px solid #333}\n.d93sth{position:absolute;top:-1px;width:5px;height:14px;background:#ccc;border:1px solid #666;\n  transform:translateX(-50%);pointer-events:none}\n.d93fmts{display:flex;gap:2px;margin-top:5px}\n.d93fg{flex:1;display:flex;flex-direction:column;align-items:center}\n.d93fg label{font-size:7px;letter-spacing:.12em;text-transform:uppercase;color:#555;margin-bottom:1px}\n.d93fg input{width:100%;font-size:9px;font-family:monospace;border:1px solid #333;background:#222;\n  padding:2px;text-align:center;outline:none;color:#aaa}\n.d93fg input:focus{border-color:#6698bb}\n#d93prev{height:20px;margin-top:4px;border:1px solid #333;display:flex;align-items:center;\n  padding:0 6px;gap:6px;font-size:9px;color:#666}\n#d93prev-sw{width:28px;height:12px;border:1px solid #555;flex-shrink:0}\n.d93gr,.d93ts{display:flex;gap:2px;margin-top:3px}\n.d93gr div,.d93ts div{flex:1;height:14px;cursor:pointer}\n#d93cust{display:flex;flex-wrap:wrap;gap:2px;padding:4px 8px;min-height:22px;border-top:1px solid #333}\n.d93cs{width:16px;height:16px;cursor:pointer;border:1px solid #444}\n.d93cs:hover{outline:2px solid #6698bb}\n#d93savecs{font-size:8px;font-family:'Jost',sans-serif;border:1px dashed #444;background:transparent;\n  padding:1px 5px;cursor:pointer;margin:2px 0 0 2px;color:#666}\n#d93savecs:hover{color:#aaa}\n\n/* copy / paste (tommygee addition) */\n.d93cp-b{font:8px 'Jost',sans-serif;letter-spacing:.14em;text-transform:uppercase;border:1px solid #444;background:#222;color:#888;padding:2px 6px;cursor:pointer}\n.d93cp-b:hover{color:#ddd;border-color:#6698bb}\n#d93clip{width:16px;height:12px;border:1px dashed #555}\n";
  document.head.appendChild(st);
  var wrap=document.createElement('div'); wrap.innerHTML="<div id=\"d93cc\">\n  <div id=\"d93cc-hdr\">Colour <span style=\"display:flex;align-items:center;gap:6px\"><button class=\"d93cp-b\" id=\"d93copy\" title=\"Copy colour (Cmd+C)\">Copy</button><div id=\"d93clip\" title=\"Clipboard colour\"></div><button class=\"d93cp-b\" id=\"d93paste\" title=\"Paste colour (Cmd+V)\">Paste</button><span id=\"d93cc-close\">\u2715</span></span></div>\n  <div id=\"d93cc-tabs\">\n    <div class=\"d93cct on\" data-t=\"ral\">RAL</div>\n    <div class=\"d93cct\" data-t=\"neon\">Neon</div>\n    <div class=\"d93cct\" data-t=\"mix\">Mixer</div>\n  </div>\n  <div id=\"d93-ral\" class=\"d93ccp on\">\n    <input type=\"text\" id=\"d93ral-s\" placeholder=\"Search RAL\u2026\">\n    <div id=\"d93ral-g\"></div>\n  </div>\n  <div id=\"d93-neon\" class=\"d93ccp\">\n    <div id=\"d93neon-g\"></div>\n  </div>\n  <div id=\"d93-mix\" class=\"d93ccp\">\n    <div id=\"d93mix\">\n      <canvas id=\"d93sv\" width=\"276\" height=\"148\"></canvas>\n      <div class=\"d93sr\"><canvas id=\"d93hue\" width=\"276\" height=\"12\"></canvas><div class=\"d93sth\" id=\"d93hth\"></div></div>\n      <div class=\"d93sr\"><canvas id=\"d93alp\" width=\"276\" height=\"12\"></canvas><div class=\"d93sth\" id=\"d93ath\"></div></div>\n      <div class=\"d93fmts\">\n        <div class=\"d93fg\"><label>HEX</label><input id=\"d93fhex\" maxlength=\"9\"></div>\n        <div class=\"d93fg\"><label>R</label><input id=\"d93fr\" maxlength=\"3\"></div>\n        <div class=\"d93fg\"><label>G</label><input id=\"d93fg2\" maxlength=\"3\"></div>\n        <div class=\"d93fg\"><label>B</label><input id=\"d93fb\" maxlength=\"3\"></div>\n        <div class=\"d93fg\"><label>A</label><input id=\"d93fa\" maxlength=\"5\"></div>\n      </div>\n      <div id=\"d93prev\"><div id=\"d93prev-sw\"></div><span id=\"d93raltxt\"></span></div>\n      <div class=\"d93gr\" id=\"d93gr\"></div>\n      <div class=\"d93ts\" id=\"d93ts\"></div>\n      <div style=\"font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#555;padding:4px 0 2px\">Custom Swatches</div>\n      <div id=\"d93cust\"></div>\n      <button id=\"d93savecs\">+ Save</button>\n    </div>\n  </div>\n</div>\n";
  document.body.appendChild(wrap.firstElementChild || wrap);
})();
(function(){
  // ── Palette data ──
  var RAL = [
    {c:'1000',n:'Green Beige',h:'#BEBD7F'},{c:'1001',n:'Beige',h:'#C2B078'},{c:'1002',n:'Sand Yellow',h:'#C6A664'},
    {c:'1003',n:'Signal Yellow',h:'#E5BE01'},{c:'1004',n:'Golden Yellow',h:'#CDA434'},{c:'1005',n:'Honey Yellow',h:'#A98307'},
    {c:'1006',n:'Maize Yellow',h:'#E4A010'},{c:'1007',n:'Daffodil Yellow',h:'#DC9D00'},{c:'1011',n:'Brown Beige',h:'#8A6642'},
    {c:'1012',n:'Lemon Yellow',h:'#C7B446'},{c:'1013',n:'Oyster White',h:'#EAE6CA'},{c:'1014',n:'Ivory',h:'#E1CC4F'},
    {c:'1015',n:'Light Ivory',h:'#E6D690'},{c:'1016',n:'Sulfur Yellow',h:'#EDFF21'},{c:'1017',n:'Saffron Yellow',h:'#F5D033'},
    {c:'1018',n:'Zinc Yellow',h:'#F8F32B'},{c:'1019',n:'Grey Beige',h:'#9E9764'},{c:'1020',n:'Olive Yellow',h:'#999950'},
    {c:'1021',n:'Rape Yellow',h:'#F3DA0B'},{c:'1023',n:'Traffic Yellow',h:'#FAD201'},{c:'1024',n:'Ochre Yellow',h:'#AEA04B'},
    {c:'1026',n:'Luminous Yellow',h:'#FFFF00'},{c:'1027',n:'Curry',h:'#9D9101'},{c:'1028',n:'Melon Yellow',h:'#F4A900'},
    {c:'1032',n:'Broom Yellow',h:'#D6AE01'},{c:'1033',n:'Dahlia Yellow',h:'#F3A505'},{c:'1034',n:'Pastel Yellow',h:'#EFA63D'},
    {c:'1037',n:'Sun Yellow',h:'#F39F18'},
    {c:'2000',n:'Yellow Orange',h:'#ED760E'},{c:'2001',n:'Red Orange',h:'#C93C20'},{c:'2002',n:'Vermilion',h:'#CB2821'},
    {c:'2003',n:'Pastel Orange',h:'#FF7514'},{c:'2004',n:'Pure Orange',h:'#F44611'},{c:'2007',n:'Bright Orange',h:'#FFA420'},
    {c:'2008',n:'Bright Red Orange',h:'#F75E25'},{c:'2009',n:'Traffic Orange',h:'#F54021'},{c:'2010',n:'Signal Orange',h:'#D84B20'},
    {c:'2011',n:'Deep Orange',h:'#EC7C26'},{c:'2012',n:'Salmon Orange',h:'#E55137'},{c:'2013',n:'Pearl Orange',h:'#C35831'},
    {c:'3000',n:'Flame Red',h:'#AF2B1E'},{c:'3001',n:'Signal Red',h:'#A52019'},{c:'3002',n:'Carmine Red',h:'#A2231D'},
    {c:'3003',n:'Ruby Red',h:'#9B111E'},{c:'3004',n:'Purple Red',h:'#75151E'},{c:'3005',n:'Wine Red',h:'#5E2129'},
    {c:'3007',n:'Black Red',h:'#412227'},{c:'3009',n:'Oxide Red',h:'#642424'},{c:'3011',n:'Brown Red',h:'#781F19'},
    {c:'3012',n:'Beige Red',h:'#C1876B'},{c:'3013',n:'Tomato Red',h:'#A12312'},{c:'3014',n:'Antique Pink',h:'#D36E70'},
    {c:'3015',n:'Light Pink',h:'#EA899A'},{c:'3016',n:'Coral Red',h:'#B32821'},{c:'3017',n:'Rose',h:'#E63244'},
    {c:'3018',n:'Strawberry Red',h:'#D53032'},{c:'3020',n:'Traffic Red',h:'#CC0605'},{c:'3022',n:'Salmon Pink',h:'#D95030'},
    {c:'3027',n:'Raspberry Red',h:'#C51D34'},{c:'3028',n:'Pure Red',h:'#CB3234'},{c:'3031',n:'Orient Red',h:'#B32428'},
    {c:'4001',n:'Red Lilac',h:'#6D3F5B'},{c:'4002',n:'Red Violet',h:'#922B3E'},{c:'4003',n:'Heather Violet',h:'#DE4C8A'},
    {c:'4004',n:'Claret Violet',h:'#641C34'},{c:'4005',n:'Blue Lilac',h:'#6C4675'},{c:'4006',n:'Traffic Purple',h:'#A03472'},
    {c:'4007',n:'Purple Violet',h:'#4A192C'},{c:'4008',n:'Signal Violet',h:'#924E7D'},{c:'4009',n:'Pastel Violet',h:'#A18594'},
    {c:'4010',n:'Telemagenta',h:'#CF3476'},{c:'4011',n:'Pearl Violet',h:'#8673A1'},
    {c:'5000',n:'Violet Blue',h:'#354D73'},{c:'5001',n:'Green Blue',h:'#1F3438'},{c:'5002',n:'Ultramarine Blue',h:'#20214F'},
    {c:'5003',n:'Sapphire Blue',h:'#1D1E33'},{c:'5005',n:'Signal Blue',h:'#1E2460'},{c:'5007',n:'Brilliant Blue',h:'#3E5F8A'},
    {c:'5008',n:'Grey Blue',h:'#26252D'},{c:'5009',n:'Azure Blue',h:'#025669'},{c:'5010',n:'Gentian Blue',h:'#0E294B'},
    {c:'5012',n:'Light Blue',h:'#3B83BD'},{c:'5013',n:'Cobalt Blue',h:'#1E213D'},{c:'5014',n:'Pigeon Blue',h:'#606E8C'},
    {c:'5015',n:'Sky Blue',h:'#2271B3'},{c:'5017',n:'Traffic Blue',h:'#063971'},{c:'5018',n:'Turquoise Blue',h:'#3F888F'},
    {c:'5019',n:'Capri Blue',h:'#1B5583'},{c:'5021',n:'Water Blue',h:'#256D7B'},{c:'5022',n:'Night Blue',h:'#252850'},
    {c:'5023',n:'Distant Blue',h:'#49678D'},{c:'5024',n:'Pastel Blue',h:'#5D9B9B'},
    {c:'6000',n:'Patina Green',h:'#316650'},{c:'6001',n:'Emerald Green',h:'#287233'},{c:'6002',n:'Leaf Green',h:'#2D572C'},
    {c:'6003',n:'Olive Green',h:'#424632'},{c:'6005',n:'Moss Green',h:'#2F4538'},{c:'6006',n:'Grey Olive',h:'#3E3B32'},
    {c:'6007',n:'Bottle Green',h:'#343B29'},{c:'6009',n:'Fir Green',h:'#31372B'},{c:'6010',n:'Grass Green',h:'#35682D'},
    {c:'6011',n:'Reseda Green',h:'#587246'},{c:'6013',n:'Reed Green',h:'#6C7156'},{c:'6017',n:'May Green',h:'#4C9141'},
    {c:'6018',n:'Yellow Green',h:'#57A639'},{c:'6019',n:'Pastel Green',h:'#BDECB6'},{c:'6021',n:'Pale Green',h:'#89AC76'},
    {c:'6024',n:'Traffic Green',h:'#308446'},{c:'6025',n:'Fern Green',h:'#3D642D'},{c:'6027',n:'Light Green',h:'#84C3BE'},
    {c:'6032',n:'Signal Green',h:'#317F43'},{c:'6033',n:'Mint Turquoise',h:'#497E76'},{c:'6034',n:'Pastel Turquoise',h:'#7FB5B5'},
    {c:'7000',n:'Squirrel Grey',h:'#78858B'},{c:'7001',n:'Silver Grey',h:'#8A9597'},{c:'7002',n:'Olive Grey',h:'#7E7B52'},
    {c:'7003',n:'Moss Grey',h:'#6C7059'},{c:'7004',n:'Signal Grey',h:'#969992'},{c:'7005',n:'Mouse Grey',h:'#646B63'},
    {c:'7006',n:'Beige Grey',h:'#6D6552'},{c:'7008',n:'Khaki Grey',h:'#6A5F31'},{c:'7010',n:'Tarpaulin Grey',h:'#4C514A'},
    {c:'7011',n:'Iron Grey',h:'#434B4D'},{c:'7012',n:'Basalt Grey',h:'#4E5754'},{c:'7013',n:'Brown Grey',h:'#464531'},
    {c:'7015',n:'Slate Grey',h:'#434750'},{c:'7016',n:'Anthracite Grey',h:'#293133'},{c:'7021',n:'Black Grey',h:'#23282B'},
    {c:'7022',n:'Umbra Grey',h:'#332F2C'},{c:'7023',n:'Concrete Grey',h:'#686C5E'},{c:'7024',n:'Graphite Grey',h:'#474A51'},
    {c:'7026',n:'Granite Grey',h:'#2F353B'},{c:'7030',n:'Stone Grey',h:'#8B8C7A'},{c:'7031',n:'Blue Grey',h:'#474B4E'},
    {c:'7032',n:'Pebble Grey',h:'#B8B799'},{c:'7033',n:'Cement Grey',h:'#7D8471'},{c:'7034',n:'Yellow Grey',h:'#8F8B66'},
    {c:'7035',n:'Light Grey',h:'#D7D7D7'},{c:'7037',n:'Dusty Grey',h:'#7D7F7D'},{c:'7038',n:'Agate Grey',h:'#B5B8B1'},
    {c:'7039',n:'Quartz Grey',h:'#6C6960'},{c:'7040',n:'Window Grey',h:'#9DA1AA'},{c:'7042',n:'Traffic Grey A',h:'#8D948D'},
    {c:'7043',n:'Traffic Grey B',h:'#4E5452'},{c:'7044',n:'Silk Grey',h:'#CAC4B0'},{c:'7045',n:'Telegrey 1',h:'#909090'},
    {c:'7046',n:'Telegrey 2',h:'#82898F'},{c:'7047',n:'Telegrey 4',h:'#D0D0D0'},{c:'7048',n:'Pearl Mouse Grey',h:'#898176'},
    {c:'8000',n:'Green Brown',h:'#826C34'},{c:'8001',n:'Ochre Brown',h:'#955F20'},{c:'8002',n:'Signal Brown',h:'#6C3B2A'},
    {c:'8003',n:'Clay Brown',h:'#734222'},{c:'8004',n:'Copper Brown',h:'#8E402A'},{c:'8007',n:'Fawn Brown',h:'#59351F'},
    {c:'8008',n:'Olive Brown',h:'#6F4F28'},{c:'8009',n:'Hazel Brown',h:'#5B3A29'},{c:'8011',n:'Nut Brown',h:'#53422E'},
    {c:'8012',n:'Red Brown',h:'#6D3545'},{c:'8014',n:'Sepia Brown',h:'#37290E'},{c:'8015',n:'Chestnut Brown',h:'#633A34'},
    {c:'8016',n:'Mahogany Brown',h:'#4C2F27'},{c:'8017',n:'Chocolate Brown',h:'#45322E'},{c:'8019',n:'Grey Brown',h:'#403A3A'},
    {c:'8022',n:'Black Brown',h:'#212121'},{c:'8023',n:'Orange Brown',h:'#A65E2E'},{c:'8024',n:'Beige Brown',h:'#79553D'},
    {c:'8025',n:'Pale Brown',h:'#755C48'},{c:'8028',n:'Terra Brown',h:'#4E3B31'},
    {c:'9001',n:'Cream',h:'#FDF4E3'},{c:'9002',n:'Grey White',h:'#E7EBDA'},{c:'9003',n:'Signal White',h:'#F4F4F4'},
    {c:'9004',n:'Signal Black',h:'#282828'},{c:'9005',n:'Jet Black',h:'#0A0A0A'},{c:'9006',n:'White Aluminium',h:'#A5A5A5'},
    {c:'9007',n:'Grey Aluminium',h:'#8F8F8F'},{c:'9010',n:'Pure White',h:'#FFFFFF'},{c:'9011',n:'Graphite Black',h:'#1C1C1C'},
    {c:'9016',n:'Traffic White',h:'#F6F6F6'},{c:'9017',n:'Traffic Black',h:'#1E1E1E'},{c:'9018',n:'Papyrus White',h:'#D7D7D0'}
  ];
  var NEON = [
    {n:'Laser Lemon',h:'#FFFF66'},{n:'Neon Yellow',h:'#FFFF00'},{n:'Highlighter',h:'#F3F315'},
    {n:'Hi-Vis Yellow',h:'#E6FF00'},{n:'Electric Lime',h:'#CCFF00'},{n:'Neon Lime',h:'#A6FF00'},
    {n:'Acid Green',h:'#B0FC38'},{n:'Chartreuse',h:'#7FFF00'},{n:'Toxic Green',h:'#4DFF00'},
    {n:'Neon Green',h:'#39FF14'},{n:'Spring Green',h:'#00FF50'},{n:'Neon Mint',h:'#00FF7F'},
    {n:'Gamma Green',h:'#00FFA0'},{n:'Aqua Flash',h:'#00FFCC'},{n:'Neon Turquoise',h:'#00FFE0'},
    {n:'Electric Cyan',h:'#00FFFF'},{n:'Ice Cyan',h:'#7DF9FF'},{n:'Sky Neon',h:'#00E5FF'},
    {n:'Neon Blue',h:'#00BFFF'},{n:'Azure Flash',h:'#0099FF'},{n:'Electric Blue',h:'#0080FF'},
    {n:'Neon Cobalt',h:'#1F51FF'},{n:'Electric Indigo',h:'#6F00FF'},{n:'Ultra Violet',h:'#7B00FF'},
    {n:'Neon Lavender',h:'#B86BFF'},{n:'Neon Purple',h:'#BF00FF'},{n:'Psychedelic',h:'#DF00FF'},
    {n:'Electric Violet',h:'#EE00FF'},{n:'Neon Pink',h:'#FF00FF'},{n:'Shocking Pink',h:'#FC0FC0'},
    {n:'Neon Magenta',h:'#FF1DCE'},{n:'Bubblegum',h:'#FF6EC7'},{n:'Neon Rose',h:'#FF3399'},
    {n:'Ultra Rose',h:'#FF007B'},{n:'Hot Pink',h:'#FF007F'},{n:'Watermelon',h:'#FF2D55'},
    {n:'Radical Red',h:'#FF355E'},{n:'Neon Coral',h:'#FF4466'},{n:'Neon Red',h:'#FF003F'},
    {n:'Neon Scarlet',h:'#FF1A1A'},{n:'Electric Red',h:'#FF2400'},{n:'Neon Orange',h:'#FF4500'},
    {n:'Blaze Orange',h:'#FF6600'},{n:'Safety Orange',h:'#FF6700'},{n:'Atomic Tangerine',h:'#FF9966'},
    {n:'Neon Tangerine',h:'#FF8C00'},{n:'Neon Amber',h:'#FFB000'},{n:'Neon Gold',h:'#FFD300'},
    {n:'Flash White',h:'#F5F5FF'}
  ];

  // ── Colour utils ──
  function h2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(function(x){return x+x;}).join('');return{r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};}
  function rgb2h(r,g,b){return'#'+[r,g,b].map(function(x){return Math.round(Math.max(0,Math.min(255,x))).toString(16).padStart(2,'0');}).join('');}
  function hsv2rgb(h,s,v){var r,g,b,i=Math.floor(h/60),f=h/60-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);switch(i%6){case 0:r=v;g=t;b=p;break;case 1:r=q;g=v;b=p;break;case 2:r=p;g=v;b=t;break;case 3:r=p;g=q;b=v;break;case 4:r=t;g=p;b=v;break;case 5:r=v;g=p;b=q;break;}return{r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)};}
  function rgb2hsv(r,g,b){r/=255;g/=255;b/=255;var max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,h,s=max===0?0:d/max,v=max;if(max===min){h=0;}else{switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h*=60;}return{h:h,s:s,v:v};}
  function hsv2hex(h,s,v){var c=hsv2rgb(h,s,v);return rgb2h(c.r,c.g,c.b);}
  function h2hsva(hex){try{if(!hex||!hex.startsWith('#'))hex='#808080';var c=h2rgb(hex),hsv=rgb2hsv(c.r,c.g,c.b);return{h:hsv.h,s:hsv.s,v:hsv.v,a:1};}catch(e){return{h:0,s:0,v:0.5,a:1};}}
  function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;var max=Math.max(r,g,b),min=Math.min(r,g,b),h,s,l=(max+min)/2;if(max===min){h=s=0;}else{var d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h*=60;}return{h:Math.round(h),s:Math.round(s*100),l:Math.round(l*100)};}
  function nearestRAL(hex){var c=h2rgb(hex),best=null,bd=Infinity;RAL.forEach(function(r2){var c2=h2rgb(r2.h),d=(c.r-c2.r)*(c.r-c2.r)+(c.g-c2.g)*(c.g-c2.g)+(c.b-c2.b)*(c.b-c2.b);if(d<bd){bd=d;best=r2;}});return best;}
  function hslHex(h,s,l){s/=100;l/=100;var a=s*Math.min(l,1-l),f=function(n){var k=(n+h/30)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1));};return rgb2h(Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255));}

  // ── Picker state ──
  var hsva = {h:0,s:0,v:0.5,a:1};
  var ccTarget = null;  // {swatch, onChange}
  var customSwatches = [];
  try{customSwatches=JSON.parse(localStorage.getItem('d93-cs')||'[]');}catch(e){}
  var svDrag=false, hueDrag=false, alpDrag=false;
  var ccDrag=false, ccDX=0, ccDY=0;
  var curTab = 'ral';

  function d93OpenCC(swatchEl, currentHex, onChange){
    ccTarget = {swatch:swatchEl, onChange:onChange};
    hsva = h2hsva(currentHex);
    var cc = document.getElementById('d93cc');
    var rect = swatchEl.getBoundingClientRect();
    var top = rect.bottom + 4;
    var left = rect.left;
    if(left + 292 > window.innerWidth) left = window.innerWidth - 296;
    if(top + 420 > window.innerHeight) top = Math.max(4, rect.top - 424);
    cc.style.top = top + 'px'; cc.style.left = left + 'px';
    cc.classList.add('open');
    if(curTab === 'mix') d93Redraw();
    d93UpdatePreview();
    d93UpdateNearestRAL();
  }
  window.d93OpenCC = d93OpenCC;

  function d93Apply(hex){
    if(!ccTarget) return;
    ccTarget.swatch.style.background = hex;
    ccTarget.onChange(hex);
    document.getElementById('d93prev-sw').style.background = hex;
  }

  function d93CloseCC(){document.getElementById('d93cc').classList.remove('open');}

  // ── Tab switching ──
  function d93ShowTab(t){
    curTab = t;
    document.querySelectorAll('.d93cct').forEach(function(el){ el.classList.toggle('on', el.dataset.t===t); });
    document.querySelectorAll('.d93ccp').forEach(function(el){ el.classList.remove('on'); });
    document.getElementById('d93-'+t).classList.add('on');
    if(t==='mix') d93Redraw();
  }
  document.querySelectorAll('.d93cct').forEach(function(el){ el.addEventListener('click', function(){ d93ShowTab(el.dataset.t); }); });
  document.getElementById('d93cc-close').addEventListener('click', d93CloseCC);

  // ── Mixer draw ──
  function d93Redraw(){d93DrawSV();d93DrawHue();d93DrawAlpha();d93UpdateFmts();d93UpdateGrey();d93UpdateTS();d93UpdateNearestRAL();d93UpdateCustom();}

  function d93DrawSV(){
    var cv=document.getElementById('d93sv'),c=cv.getContext('2d'),w=cv.width,hh=cv.height;
    var hc='hsl('+hsva.h+',100%,50%)';
    var gH=c.createLinearGradient(0,0,w,0);gH.addColorStop(0,'white');gH.addColorStop(1,hc);
    c.fillStyle=gH;c.fillRect(0,0,w,hh);
    var gV=c.createLinearGradient(0,0,0,hh);gV.addColorStop(0,'rgba(0,0,0,0)');gV.addColorStop(1,'rgba(0,0,0,1)');
    c.fillStyle=gV;c.fillRect(0,0,w,hh);
    var cx2=hsva.s*w,cy2=(1-hsva.v)*hh;
    c.beginPath();c.arc(cx2,cy2,5,0,Math.PI*2);c.strokeStyle='white';c.lineWidth=2;c.stroke();
    c.beginPath();c.arc(cx2,cy2,5,0,Math.PI*2);c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1;c.stroke();
  }
  function d93DrawHue(){
    var cv=document.getElementById('d93hue'),c=cv.getContext('2d'),w=cv.width,hh=cv.height;
    var g=c.createLinearGradient(0,0,w,0);
    for(var i=0;i<=360;i+=60)g.addColorStop(i/360,'hsl('+i+',100%,50%)');
    c.fillStyle=g;c.fillRect(0,0,w,hh);
    var th=document.getElementById('d93hth');th.style.left=(hsva.h/360*w)+'px';
  }
  function d93DrawAlpha(){
    var cv=document.getElementById('d93alp'),c=cv.getContext('2d'),w=cv.width,hh=cv.height;
    for(var x=0;x<w;x+=8)for(var y=0;y<hh;y+=8){c.fillStyle=((Math.floor(x/8)+Math.floor(y/8))%2)?'#555':'#333';c.fillRect(x,y,8,8);}
    var rgb=hsv2rgb(hsva.h,hsva.s,hsva.v);
    var g2=c.createLinearGradient(0,0,w,0);
    g2.addColorStop(0,'rgba('+rgb.r+','+rgb.g+','+rgb.b+',0)');g2.addColorStop(1,'rgba('+rgb.r+','+rgb.g+','+rgb.b+',1)');
    c.fillStyle=g2;c.fillRect(0,0,w,hh);
    document.getElementById('d93ath').style.left=(hsva.a*w)+'px';
  }
  function sf(id,v){var el=document.getElementById(id);if(el&&document.activeElement!==el)el.value=v;}
  function d93UpdateFmts(){
    var hex=hsv2hex(hsva.h,hsva.s,hsva.v),c=h2rgb(hex),hsl=rgb2hsl(c.r,c.g,c.b);
    sf('d93fhex',hex);sf('d93fr',c.r);sf('d93fg2',c.g);sf('d93fb',c.b);sf('d93fa',hsva.a.toFixed(2));
  }
  function d93UpdatePreview(){
    var hex=hsv2hex(hsva.h,hsva.s,hsva.v);
    document.getElementById('d93prev-sw').style.background=hex;
  }
  function d93UpdateNearestRAL(){
    var hex=hsv2hex(hsva.h,hsva.s,hsva.v),r2=nearestRAL(hex);
    if(r2) document.getElementById('d93raltxt').textContent='≈ RAL '+r2.c+' '+r2.n;
  }
  function d93UpdateGrey(){
    var row=document.getElementById('d93gr');row.innerHTML='';
    for(var i=0;i<=10;i++){
      var v=Math.round(i/10*255),hex=rgb2h(v,v,v);
      var d=document.createElement('div');d.style.background=hex;d.title='Grey '+i*10+'%';
      (function(h){d.addEventListener('click',function(){d93Apply(h);hsva=h2hsva(h);d93Redraw();});})(hex);
      row.appendChild(d);
    }
  }
  function d93UpdateTS(){
    var hex=hsv2hex(hsva.h,hsva.s,hsva.v),c=h2rgb(hex);
    var row=document.getElementById('d93ts');row.innerHTML='';
    for(var i=4;i>=0;i--){var t=i/5,tHex=rgb2h(Math.round(c.r+(255-c.r)*(1-t)),Math.round(c.g+(255-c.g)*(1-t)),Math.round(c.b+(255-c.b)*(1-t)));var d=document.createElement('div');d.style.background=tHex;(function(h){d.addEventListener('click',function(){d93Apply(h);hsva=h2hsva(h);d93Redraw();});})(tHex);row.appendChild(d);}
    for(var i=0;i<=4;i++){var t=i/5,shHex=rgb2h(Math.round(c.r*(1-t)),Math.round(c.g*(1-t)),Math.round(c.b*(1-t)));var d=document.createElement('div');d.style.background=shHex;(function(h){d.addEventListener('click',function(){d93Apply(h);hsva=h2hsva(h);d93Redraw();});})(shHex);row.appendChild(d);}
  }
  function d93UpdateCustom(){
    var cont=document.getElementById('d93cust');cont.innerHTML='';
    customSwatches.forEach(function(h){
      var d=document.createElement('div');d.className='d93cs';d.style.background=h;d.title=h;
      d.addEventListener('click',function(){d93Apply(h);hsva=h2hsva(h);d93Redraw();d93CloseCC();});
      cont.appendChild(d);
    });
  }

  // Format inputs
  function d93FmtInput(type,val){
    try{
      var hex=hsv2hex(hsva.h,hsva.s,hsva.v),c=h2rgb(hex),hh;
      if(type==='hex'){hh=val.startsWith('#')?val:'#'+val;if(hh.length<7)return;hsva=h2hsva(hh);}
      else if(type==='r'){hh=rgb2h(+val,c.g,c.b);hsva=h2hsva(hh);}
      else if(type==='g'){hh=rgb2h(c.r,+val,c.b);hsva=h2hsva(hh);}
      else if(type==='b'){hh=rgb2h(c.r,c.g,+val);hsva=h2hsva(hh);}
      else if(type==='a'){hsva.a=Math.max(0,Math.min(1,+val));}
      d93Apply(hsv2hex(hsva.h,hsva.s,hsva.v));d93Redraw();
    }catch(e){}
  }
  document.getElementById('d93fhex').addEventListener('input',function(){d93FmtInput('hex',this.value);});
  document.getElementById('d93fr').addEventListener('input',function(){d93FmtInput('r',this.value);});
  document.getElementById('d93fg2').addEventListener('input',function(){d93FmtInput('g',this.value);});
  document.getElementById('d93fb').addEventListener('input',function(){d93FmtInput('b',this.value);});
  document.getElementById('d93fa').addEventListener('input',function(){d93FmtInput('a',this.value);});

  // SV canvas
  document.getElementById('d93sv').addEventListener('mousedown',function(e){svDrag=true;svMove(e);});
  document.getElementById('d93sv').addEventListener('mousemove',function(e){if(svDrag)svMove(e);});
  function svMove(e){var r=document.getElementById('d93sv').getBoundingClientRect();hsva.s=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));hsva.v=Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height));d93Apply(hsv2hex(hsva.h,hsva.s,hsva.v));d93Redraw();}
  // Hue canvas
  document.getElementById('d93hue').addEventListener('mousedown',function(e){hueDrag=true;hueMove(e);});
  document.getElementById('d93hue').addEventListener('mousemove',function(e){if(hueDrag)hueMove(e);});
  function hueMove(e){var r=document.getElementById('d93hue').getBoundingClientRect();hsva.h=Math.max(0,Math.min(360,(e.clientX-r.left)/r.width*360));d93Apply(hsv2hex(hsva.h,hsva.s,hsva.v));d93Redraw();}
  // Alpha canvas
  document.getElementById('d93alp').addEventListener('mousedown',function(e){alpDrag=true;alpMove(e);});
  document.getElementById('d93alp').addEventListener('mousemove',function(e){if(alpDrag)alpMove(e);});
  function alpMove(e){var r=document.getElementById('d93alp').getBoundingClientRect();hsva.a=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));d93Redraw();}
  document.addEventListener('mouseup',function(){svDrag=false;hueDrag=false;alpDrag=false;});

  // Custom swatches save
  document.getElementById('d93savecs').addEventListener('click',function(){
    var hex=hsv2hex(hsva.h,hsva.s,hsva.v);
    if(!customSwatches.includes(hex)){customSwatches.push(hex);try{localStorage.setItem('d93-cs',JSON.stringify(customSwatches));}catch(e){}}
    d93UpdateCustom();
  });

  // Drag the picker
  document.getElementById('d93cc-hdr').addEventListener('mousedown',function(e){
    var cc=document.getElementById('d93cc');
    ccDrag=true;ccDX=e.clientX-cc.offsetLeft;ccDY=e.clientY-cc.offsetTop;
  });
  document.addEventListener('mousemove',function(e){if(ccDrag){var cc=document.getElementById('d93cc');cc.style.left=(e.clientX-ccDX)+'px';cc.style.top=(e.clientY-ccDY)+'px';}});
  document.addEventListener('mouseup',function(){ccDrag=false;});

  // Close on outside click
  document.addEventListener('mousedown',function(e){
    var cc=document.getElementById('d93cc');
    if(cc.classList.contains('open')&&!cc.contains(e.target)&&(!ccTarget||!ccTarget.swatch.contains(e.target))){d93CloseCC();}
  });

  // ── Build RAL + Neon swatches ──
  function buildRAL(){
    var cont=document.getElementById('d93ral-g');cont.innerHTML='';
    RAL.forEach(function(r2){
      var d=document.createElement('div');d.className='d93rs';d.style.background=r2.h;d.title='RAL '+r2.c+' – '+r2.n+'\n'+r2.h;
      d.addEventListener('click',function(){d93Apply(r2.h);hsva=h2hsva(r2.h);if(curTab==='mix')d93Redraw();d93CloseCC();});
      cont.appendChild(d);
    });
  }
  document.getElementById('d93ral-s').addEventListener('input',function(){
    var q=this.value.toLowerCase();
    document.querySelectorAll('#d93ral-g .d93rs').forEach(function(el){el.style.display=(!q||el.title.toLowerCase().includes(q))?'':'none';});
  });
  function buildNeon(){
    var cont=document.getElementById('d93neon-g');cont.innerHTML='';
    NEON.forEach(function(n){
      var d=document.createElement('div');d.className='d93ns';d.style.background=n.h;d.title=n.n;d.textContent=n.n;
      d.addEventListener('click',function(){d93Apply(n.h);hsva=h2hsva(n.h);if(curTab==='mix')d93Redraw();d93CloseCC();});
      cont.appendChild(d);
    });
  }

  buildRAL(); buildNeon();

  // ── Copy / paste (tommygee addition) ──
  var CLIP_KEY='tommygee.colourclip';
  var clipHex=null; try{clipHex=localStorage.getItem(CLIP_KEY);}catch(e){}
  function showClip(){var el=document.getElementById('d93clip');el.style.background=clipHex||'transparent';el.style.borderStyle=clipHex?'solid':'dashed';el.title=clipHex?('Clipboard: '+clipHex.toUpperCase()):'Clipboard empty';}
  function curHex(){return hsv2hex(hsva.h,hsva.s,hsva.v);}
  function copyColour(hex){clipHex=hex||curHex();try{localStorage.setItem(CLIP_KEY,clipHex);}catch(e){} if(navigator.clipboard)navigator.clipboard.writeText(clipHex.toUpperCase()).catch(function(){}); showClip();}
  function pasteColour(){if(!clipHex||!ccTarget)return; d93Apply(clipHex); hsva=h2hsva(clipHex); d93Redraw(); d93UpdatePreview();}
  document.getElementById('d93copy').addEventListener('click',function(e){e.stopPropagation();copyColour();});
  document.getElementById('d93paste').addEventListener('click',function(e){e.stopPropagation();pasteColour();});
  document.addEventListener('keydown',function(e){
    var cc=document.getElementById('d93cc'); if(!cc.classList.contains('open'))return;
    var a=document.activeElement; if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'))return;
    if((e.metaKey||e.ctrlKey)&&(e.key==='c'||e.key==='C')){copyColour();e.preventDefault();}
    if((e.metaKey||e.ctrlKey)&&(e.key==='v'||e.key==='V')){pasteColour();e.preventDefault();}
  });
  window.d93CopyColour=copyColour;
  window.d93PasteTo=function(hex){ return clipHex; };
  window.d93GetClip=function(){ return clipHex; };
  showClip();


})();
