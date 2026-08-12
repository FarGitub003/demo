/* Galleria-cinema delle opere Pyramis + micro-interazioni "wow".
   Si adatta alla versione tramite CSS custom properties:
   --lb-bg, --lb-accent, --lb-testo, --lb-font (facoltative). */
(function(){
'use strict';
var BASE='../img/opere/';
var dati=null, ordine=[], corrente=null, indice=0, riduci=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- stili iniettati ---------- */
var css=[
'.lb{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;background:var(--lb-bg,rgba(7,10,16,.94));backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);opacity:0;transition:opacity .35s ease}',
'.lb.on{opacity:1}',
'.lb *{box-sizing:border-box}',
'.lb-testa{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px 22px 8px;color:var(--lb-testo,#F0EAD9)}',
'.lb-titolo{font-family:var(--lb-font,inherit);font-size:clamp(1.1rem,2.6vw,1.7rem);line-height:1.15;margin:0}',
'.lb-sotto{font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:var(--lb-accent,#C9A050);margin:6px 0 0}',
'.lb-chiudi{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid var(--lb-accent,#C9A050);background:transparent;color:var(--lb-testo,#F0EAD9);font-size:1.15rem;cursor:pointer;transition:transform .2s,background .2s}',
'.lb-chiudi:hover{background:var(--lb-accent,#C9A050);color:#10131a;transform:rotate(90deg)}',
'.lb-palco{position:relative;flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden}',
'.lb-img{max-width:min(94vw,1500px);max-height:100%;object-fit:contain;border-radius:4px;box-shadow:0 24px 80px rgba(0,0,0,.55);opacity:0;transform:scale(.965);transition:opacity .45s ease,transform .45s ease}',
'.lb-img.on{opacity:1;transform:scale(1)}',
'@media(prefers-reduced-motion:no-preference){.lb-img.on{animation:lbkb 14s ease-in-out infinite alternate}}',
'@keyframes lbkb{from{transform:scale(1)}to{transform:scale(1.035)}}',
'.lb-freccia{position:absolute;top:50%;transform:translateY(-50%);width:54px;height:54px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(10,12,18,.45);backdrop-filter:blur(8px);color:var(--lb-testo,#F0EAD9);font-size:1.3rem;cursor:pointer;transition:border-color .2s,color .2s,transform .2s;z-index:5}',
'.lb-freccia:hover{border-color:var(--lb-accent,#C9A050);color:var(--lb-accent,#C9A050);transform:translateY(-50%) scale(1.08)}',
'.lb-prev{left:16px}.lb-next{right:16px}',
'.lb-conta{position:absolute;bottom:12px;right:18px;font-size:.75rem;letter-spacing:.18em;color:var(--lb-testo,#F0EAD9);opacity:.75;z-index:5}',
'.lb-testo-op{padding:4px 22px 0;color:var(--lb-testo,#F0EAD9);opacity:.78;font-size:.86rem;max-width:900px}',
'.lb-nastro{display:flex;gap:8px;padding:12px 22px 18px;overflow-x:auto;scrollbar-width:thin}',
'.lb-mini{flex:none;width:74px;height:52px;border-radius:3px;overflow:hidden;border:2px solid transparent;padding:0;background:none;cursor:pointer;opacity:.55;transition:opacity .2s,border-color .2s,transform .2s}',
'.lb-mini img{width:100%;height:100%;object-fit:cover;display:block}',
'.lb-mini.on{opacity:1;border-color:var(--lb-accent,#C9A050);transform:translateY(-3px)}',
'.lb-mini:hover{opacity:1}',
'@media(max-width:640px){.lb-freccia{width:44px;height:44px}.lb-testo-op{font-size:.78rem;padding:2px 16px 0}.lb-testa{padding:14px 16px 6px}.lb-nastro{padding:10px 16px 14px}}',
'[data-opera]{cursor:pointer}',
/* tilt 3D + lampo d’oro sulle card */
'.tilt{transform-style:preserve-3d;transition:transform .18s ease;will-change:transform;position:relative;overflow:hidden}',
'.tilt::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(420px circle at var(--mx,50%) var(--my,50%),rgba(233,196,117,.16),transparent 55%);opacity:0;transition:opacity .25s}',
'.tilt:hover::after{opacity:1}'
].join('\n');
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---------- dati ---------- */
fetch(BASE+'opere.json').then(function(r){return r.json()}).then(function(j){
  dati=j; ordine=Object.keys(j);
  document.querySelectorAll('[data-opera]').forEach(function(el){
    el.addEventListener('click',function(e){
      var s=el.getAttribute('data-opera');
      if(dati[s]){e.preventDefault();apri(s)}
    });
    el.setAttribute('role','button');
    if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','0');
    el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}});
  });
}).catch(function(e){console.warn('galleria: dati non caricati',e)});

/* ---------- lightbox ---------- */
/* "N foto" deve contare SOLO fotografie. Render, certificati e planimetrie
   stanno in o.tecniche e si contano a parte come "tavole". */
function conteggio(o){
  var t=(o.tecniche||[]).length, f=o.foto.length-t;
  return f+(f===1?' foto':' foto')+(t?' · '+t+(t===1?' tavola':' tavole'):'');
}
var lb=null;
function apri(slug){
  corrente=slug;indice=0;
  var o=dati[slug];
  lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label',o.titolo);
  lb.innerHTML=
    '<div class="lb-testa"><div><h2 class="lb-titolo">'+o.titolo+'</h2><p class="lb-sotto">'+o.sotto+' · '+conteggio(o)+'</p></div>'+
    '<button class="lb-chiudi" aria-label="Chiudi">✕</button></div>'+
    '<div class="lb-palco">'+
      '<button class="lb-freccia lb-prev" aria-label="Foto precedente">‹</button>'+
      '<img class="lb-img" alt="">'+
      '<button class="lb-freccia lb-next" aria-label="Foto successiva">›</button>'+
      '<span class="lb-conta"></span>'+
    '</div>'+
    '<p class="lb-testo-op">'+o.testo+'</p>'+
    '<div class="lb-nastro" role="tablist"></div>';
  document.body.appendChild(lb);
  document.body.style.overflow='hidden';
  var nastro=lb.querySelector('.lb-nastro');
  o.foto.forEach(function(f,i){
    var b=document.createElement('button');b.className='lb-mini';b.setAttribute('aria-label','Foto '+(i+1));
    b.innerHTML='<img loading="lazy" src="'+BASE+slug+'/'+encodeURIComponent(f)+'" alt="">';
    b.addEventListener('click',function(){vai(i)});
    nastro.appendChild(b);
  });
  lb.querySelector('.lb-chiudi').addEventListener('click',chiudi);
  lb.querySelector('.lb-prev').addEventListener('click',function(){vai(indice-1)});
  lb.querySelector('.lb-next').addEventListener('click',function(){vai(indice+1)});
  lb.addEventListener('click',function(e){if(e.target===lb)chiudi()});
  document.addEventListener('keydown',tasti);
  /* swipe */
  var x0=null;
  lb.querySelector('.lb-palco').addEventListener('pointerdown',function(e){x0=e.clientX});
  lb.querySelector('.lb-palco').addEventListener('pointerup',function(e){
    if(x0===null)return;
    var dx=e.clientX-x0;x0=null;
    if(Math.abs(dx)>48)vai(indice+(dx<0?1:-1));
  });
  requestAnimationFrame(function(){lb.classList.add('on')});
  vai(0,true);
}
function vai(i,subito){
  var o=dati[corrente];
  indice=(i+o.foto.length)%o.foto.length;
  var img=lb.querySelector('.lb-img');
  var url=BASE+corrente+'/'+encodeURIComponent(o.foto[indice]);
  img.classList.remove('on');
  var carica=function(){
    img.src=url;img.alt=o.titolo+' · foto '+(indice+1)+' di '+o.foto.length;
    requestAnimationFrame(function(){requestAnimationFrame(function(){img.classList.add('on')})});
  };
  if(subito){carica()}else{setTimeout(carica,riduci?0:160)}
  lb.querySelector('.lb-conta').textContent=(indice+1)+' / '+o.foto.length;
  lb.querySelectorAll('.lb-mini').forEach(function(m,k){m.classList.toggle('on',k===indice)});
  var att=lb.querySelectorAll('.lb-mini')[indice];
  if(att)att.scrollIntoView({block:'nearest',inline:'center',behavior:riduci?'auto':'smooth'});
  /* precarica vicini */
  [indice+1,indice-1].forEach(function(k){
    var f=o.foto[(k+o.foto.length)%o.foto.length];
    var p=new Image();p.src=BASE+corrente+'/'+encodeURIComponent(f);
  });
}
function tasti(e){
  if(!lb)return;
  if(e.key==='Escape')chiudi();
  if(e.key==='ArrowRight')vai(indice+1);
  if(e.key==='ArrowLeft')vai(indice-1);
}
function chiudi(){
  document.removeEventListener('keydown',tasti);
  var el=lb;lb=null;
  el.classList.remove('on');
  document.body.style.overflow='';
  setTimeout(function(){el.remove()},360);
}

/* ---------- tilt 3D sulle card opera ---------- */
if(!riduci&&matchMedia('(hover:hover)').matches){
  document.addEventListener('pointermove',function(e){
    var c=e.target.closest('.tilt');
    if(!c)return;
    var r=c.getBoundingClientRect();
    var px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
    c.style.setProperty('--mx',(px*100)+'%');
    c.style.setProperty('--my',(py*100)+'%');
    c.style.transform='perspective(900px) rotateY('+((px-.5)*7)+'deg) rotateX('+((.5-py)*6)+'deg) translateY(-2px)';
  });
  document.addEventListener('pointerout',function(e){
    var c=e.target.closest('.tilt');
    if(c&&!c.contains(e.relatedTarget))c.style.transform='';
  });
}
window.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('[data-opera]').forEach(function(el){el.classList.add('tilt')});
});
})();
