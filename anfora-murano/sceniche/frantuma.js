/* ============================================================================
   frantuma — il capostipite. Un proiettile arriva, colpisce, il vetro si crepa
   e cade a pezzi scoprendo quello che c'è sotto.

   È la pallina di VBora generalizzata, con le tre fragilità dell'originale
   corrette (inventario 09/08/2026):
     1. le coordinate non sono più cablate al lancio: c'è un ascoltatore di
        resize che rimisura e ridisegna finché il vetro non è ancora caduto;
     2. i tempi non sono più quattro numeri magici tenuti in sync a mano: ogni
        soglia è CALCOLATA dalle durate, quindi cambiando la durata del volo
        resta tutto in sincrono;
     3. niente getTotalLength(): le crepe le disegniamo noi, quindi la loro
        lunghezza la sappiamo già sommando i segmenti. Zero reflow.

   L'orologio è a requestAnimationFrame, non a setTimeout: in scheda nascosta i
   timer slittano e il botto arriva fuori tempo, il rAF invece si mette in pausa.

   Uso:  <div class="fm-palco" data-fms="frantuma" data-fms-proiettile="⚽"></div>
   oppure  FM.scena('frantuma', document.body, { schermo: 1, poi: funzione })
   ============================================================================ */
(function () {
if (!window.FM) return;
var NS = 'http://www.w3.org/2000/svg';

FM.scenica('frantuma', function (ospite, o) {
  var n = FM.num, D = document;
  var chiave = o.unavolta;
  if (chiave && sessionStorage.getItem(chiave)) {
    /* Gia' vista in questa sessione: si salta lo spettacolo, ma `poi` DEVE
       partire lo stesso, se no il contenuto che aspettava la fine dell'intro
       resta nascosto per sempre. */
    if (typeof o.poi === 'function') o.poi();
    return { ferma: function () {} };
  }

  var schermo = ospite === D.body || o.schermo != null;
  var Dvolo    = n(o.volo, 720);
  var Dcrepe   = n(o.crepe, 620);
  var Dschegge = n(o.schegge, 820);
  var attesa   = n(o.attesa, 220);
  /* le soglie NON sono numeri a mano: derivano dalle durate qui sopra */
  var Timpatto = attesa + Dvolo;
  var Tcrepe   = Timpatto + 60;
  var Trottura = Tcrepe + Dcrepe * 0.72;
  var Tfine    = Trottura + Dschegge + 240;

  var nRaggi  = Math.max(6, n(o.raggi, 14));
  var nAnelli = Math.max(0, n(o.anelli, 3));
  var nPezzi  = Math.max(8, n(o.pezzi, 26));
  var bx = n((o.bersaglio || '50 44').split(' ')[0], 50) / 100;
  var by = n((o.bersaglio || '50 44').split(' ')[1], 44) / 100;

  /* ---- impalcatura ------------------------------------------------------ */
  if (!schermo && getComputedStyle(ospite).position === 'static') ospite.classList.add('fm-palco');
  var strato = D.createElement('div');
  strato.className = 'fmx-frantuma' + (schermo ? ' fmx-schermo' : '');
  strato.setAttribute('aria-hidden', 'true');
  if (o.fondo)  strato.style.setProperty('--fmx-fondo', o.fondo);
  if (o.colore) strato.style.setProperty('--fmx-palla', o.colore);
  if (o.crepa)  strato.style.setProperty('--fmx-crepa', o.crepa);

  var vetro = D.createElement('div');
  vetro.className = 'fmx-vetro';
  if (o.titolo) {                       // testo, non HTML: niente da ripulire
    var tit = D.createElement('div'); tit.textContent = o.titolo; vetro.appendChild(tit);
  }

  var flash = D.createElement('div'); flash.className = 'fmx-flash';
  var onda  = D.createElement('div'); onda.className  = 'fmx-onda';
  var crepe = D.createElementNS(NS, 'svg'); crepe.setAttribute('class', 'fmx-crepe');
  var pezzi = D.createElement('div'); pezzi.className = 'fmx-schegge';
  var palla = D.createElement('div'); palla.className = 'fmx-palla';
  if (o.proiettile) { palla.className += ' fmx-scritta'; palla.textContent = o.proiettile; }
  if (o.misura) strato.style.setProperty('--fmx-misura', n(o.misura, 78) + 'px');

  var salta = D.createElement('button');
  salta.type = 'button'; salta.className = 'fmx-salta'; salta.textContent = o.salta || 'Salta →';

  strato.appendChild(vetro); strato.appendChild(crepe); strato.appendChild(pezzi);
  strato.appendChild(flash); strato.appendChild(onda); strato.appendChild(palla);
  strato.appendChild(salta);
  strato.removeAttribute('aria-hidden');     // il bottone deve restare raggiungibile
  (schermo ? D.body : ospite).appendChild(strato);

  /* movimento ridotto: nessuno spettacolo, si sparisce subito e con dignità.
     🪤 15/08/2026 — qui NON si chiama `chiudi()`. Questo ramo sta prima che
     `staccaMisura` e `fratelli` siano inizializzate: `chiudi()` le usava e
     lanciava un TypeError, che il try/catch di `FM.scena` ingoiava. Risultato,
     provato: console pulita e lo strato — schermo intero, opacità 1 — MAI
     rimosso. Chi ha «riduci movimento» attivo vedeva un pannello nero al posto
     del sito, per sempre. Qui si fa a mano il minimo che serve. */
  if (FM.ridotto()) {
    if (strato.parentNode) strato.parentNode.removeChild(strato);
    if (chiave) try { sessionStorage.setItem(chiave, '1'); } catch (x) {}
    if (typeof o.poi === 'function') o.poi();   // il contenuto che aspetta la fine deve partire lo stesso
    return { ferma: function () {} };
  }

  /* ---- misure (rifatte a ogni resize finché il vetro è intero) ---------- */
  var L = 0, A = 0, cx = 0, cy = 0, rotto = false, morto = false;
  var lati = [];
  function misura() {
    L = strato.clientWidth || 1; A = strato.clientHeight || 1;
    cx = L * bx; cy = A * by;
    strato.style.setProperty('--fmx-x', cx.toFixed(1) + 'px');
    strato.style.setProperty('--fmx-y', cy.toFixed(1) + 'px');
    crepe.setAttribute('viewBox', '0 0 ' + L + ' ' + A);
    lati = [L, A, L, A];
  }
  function suResize() { if (rotto || morto) return; misura(); disegnaCrepe(); costruisciSchegge(); }
  misura();

  /* ---- le crepe: le disegniamo noi, quindi la lunghezza la sappiamo ----- */
  var vieCrepa = [];
  function disegnaCrepe() {
    while (crepe.firstChild) crepe.removeChild(crepe.firstChild);
    vieCrepa = [];
    var lungo = Math.max(L, A), i, s;
    for (i = 0; i < nRaggi; i++) {
      var ang = (i / nRaggi) * Math.PI * 2 + (Math.random() - .5) * .3;
      var x = cx, y = cy, d = 'M' + cx.toFixed(1) + ' ' + cy.toFixed(1), tot = 0;
      var segmenti = 4 + (Math.random() * 3 | 0);
      var base = lungo * (.24 + Math.random() * .22) / segmenti;
      for (s = 0; s < segmenti; s++) {
        ang += (Math.random() - .5) * .55;                    // lo zig-zag: è questo che la rende credibile
        var p = base * (1 + Math.random() * .7);
        var nx = x + Math.cos(ang) * p, ny = y + Math.sin(ang) * p;
        tot += Math.sqrt((nx - x) * (nx - x) + (ny - y) * (ny - y));
        d += 'L' + nx.toFixed(1) + ' ' + ny.toFixed(1);
        x = nx; y = ny;
      }
      via(d, tot, i * 8);
    }
    for (i = 0; i < nAnelli; i++) {
      var r0 = lungo * (.07 + i * .075), punti = 13, d2 = '', tot2 = 0, px = 0, py = 0;
      for (s = 0; s <= punti; s++) {
        var a2 = (s / punti) * Math.PI * 2;
        var rr = r0 * (.82 + Math.random() * .36);
        var qx = cx + Math.cos(a2) * rr, qy = cy + Math.sin(a2) * rr;
        if (!s) { d2 = 'M' + qx.toFixed(1) + ' ' + qy.toFixed(1); }
        else if (s % 4 === 0) { d2 += 'M' + qx.toFixed(1) + ' ' + qy.toFixed(1); }   // spezzato, non un cerchio
        else { d2 += 'L' + qx.toFixed(1) + ' ' + qy.toFixed(1);
               tot2 += Math.sqrt((qx - px) * (qx - px) + (qy - py) * (qy - py)); }
        px = qx; py = qy;
      }
      via(d2, tot2, 60 + i * 55);
    }
  }
  function via(d, lung, ritardo) {
    var p = D.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    lung = Math.max(1, lung);
    p.style.strokeDasharray = lung;
    p.style.strokeDashoffset = lung;
    p.style.transition = 'stroke-dashoffset ' + Dcrepe + 'ms cubic-bezier(.4,0,.2,1) ' + ritardo + 'ms';
    crepe.appendChild(p); vieCrepa.push(p);
  }

  /* ---- le schegge: triangoli col vertice nel punto d'impatto ------------ */
  var listaPezzi = [];
  function bordo(t) {
    var per = 2 * (L + A); t = ((t % per) + per) % per;
    if (t < L) return [t, 0];
    if (t < L + A) return [L, t - L];
    if (t < 2 * L + A) return [L - (t - L - A), A];
    return [0, A - (t - 2 * L - A)];
  }
  function costruisciSchegge() {
    while (pezzi.firstChild) pezzi.removeChild(pezzi.firstChild);
    listaPezzi = [];
    var per = 2 * (L + A), punti = [], i;
    for (i = 0; i < nPezzi; i++) punti.push(bordo((i + Math.random() * .55) / nPezzi * per));
    for (i = 0; i < nPezzi; i++) {
      var a = punti[i], b = punti[(i + 1) % nPezzi];
      var el = D.createElement('div');
      el.className = 'fmx-scheggia';
      el.style.clipPath = el.style.webkitClipPath =
        'polygon(' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px,' +
        a[0].toFixed(1) + 'px ' + a[1].toFixed(1) + 'px,' +
        b[0].toFixed(1) + 'px ' + b[1].toFixed(1) + 'px)';
      var gx = (cx + a[0] + b[0]) / 3, gy = (cy + a[1] + b[1]) / 3;
      var dx = gx - cx, dy = gy - cy, m = Math.sqrt(dx * dx + dy * dy) || 1;
      el.__v = [dx / m * (140 + Math.random() * 220), dy / m * (110 + Math.random() * 180)];
      el.style.transformOrigin = gx.toFixed(1) + 'px ' + gy.toFixed(1) + 'px';
      pezzi.appendChild(el); listaPezzi.push(el);
    }
  }
  disegnaCrepe(); costruisciSchegge();

  /* ---- orologio a frame: in scheda nascosta si mette in pausa da solo --- */
  var passi = [], t0 = 0, giro = 0;
  function tappa(ms, f) { passi.push({ t: ms, f: f, fatto: false }); }
  function orologio(t) {
    if (morto) return;
    if (!t0) t0 = t;
    var e = t - t0, resta = false, i;
    for (i = 0; i < passi.length; i++) {
      if (passi[i].fatto) continue;
      if (e >= passi[i].t) { passi[i].fatto = true; try { passi[i].f(); } catch (x) {} }
      else resta = true;
    }
    if (resta) giro = requestAnimationFrame(orologio);
  }

  /* 1 · il volo — una sola transizione, nessun calcolo per frame */
  /* la partenza è in px sulle misure VERE del palco, non in vw/vh: dentro un
     riquadro piccolo il vw manderebbe la palla a chilometri di distanza e la
     si vedrebbe solo nell'ultimo decimo del volo. */
  var da = o.da || 'alto-destra';
  var qx = da.indexOf('sinistra') > -1 ? -.28 : da.indexOf('destra') > -1 ? 1.28 : .5;
  var qy = da.indexOf('basso') > -1 ? 1.28 : -.28;
  palla.style.transform = 'translate3d(' + (qx * L).toFixed(0) + 'px,' + (qy * A).toFixed(0) + 'px,0) scale(.05)';
  tappa(1, function () {
    palla.style.transition = 'transform ' + Dvolo + 'ms cubic-bezier(.42,0,.9,.62)';
    palla.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0) scale(1.15)';
  });

  /* 2 · l'impatto — flash, scossa, schiacciamento, onda d'urto insieme */
  tappa(Timpatto, function () {
    strato.classList.add('fmx-scossa');
    flash.style.transition = 'opacity 300ms cubic-bezier(.4,0,.2,1)';
    flash.style.opacity = '.9';
    requestAnimationFrame(function () { flash.style.opacity = '0'; });
    palla.style.transition = 'transform 120ms cubic-bezier(.4,0,.2,1)';
    palla.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0) scale(1.3,.9)';
    onda.style.transition = 'transform 560ms cubic-bezier(.22,1,.36,1), opacity 560ms linear';
    onda.style.opacity = '.9';
    onda.style.transform = 'scale(' + (Math.max(L, A) / 8).toFixed(1) + ')';
    requestAnimationFrame(function () { onda.style.opacity = '0'; });
  });

  /* 3 · le crepe si propagano dal punto d'impatto */
  tappa(Tcrepe, function () {
    vieCrepa.forEach(function (p) { p.style.strokeDashoffset = 0; });
    palla.style.transition = 'transform 420ms cubic-bezier(.4,0,.2,1), opacity 420ms linear';
    palla.style.opacity = '0';
  });

  /* 4 · il vetro cade: le schegge partono lungo il loro raggio, con la gravità */
  tappa(Trottura, function () {
    rotto = true;
    vetro.style.transition = 'opacity 120ms linear';
    vetro.style.opacity = '0';
    listaPezzi.forEach(function (el, i) {
      var ritardo = (i / 5 | 0) * 45;
      /* ease-IN: il vetro cade, quindi accelera. Niente rimbalzi elastici. */
      el.style.transition = 'transform ' + Dschegge + 'ms cubic-bezier(.5,0,.9,.35) ' + ritardo +
                            'ms, opacity ' + Dschegge + 'ms linear ' + (ritardo + Dschegge * .35) + 'ms';
      el.style.transform = 'translate3d(' + el.__v[0].toFixed(0) + 'px,' +
        (el.__v[1] + 220 + Math.random() * 240).toFixed(0) + 'px,0) rotate(' +
        ((Math.random() - .5) * 70).toFixed(0) + 'deg) scale(.86)';
      el.style.opacity = '0';
    });
    crepe.style.transition = 'opacity ' + (Dschegge * .5) + 'ms linear';
    crepe.style.opacity = '0';
  });

  tappa(Tfine, chiudi);

  /* ---- salto, smontaggio ------------------------------------------------ */
  function salto(e) { if (!e || e.type !== 'keydown' || e.key === 'Escape') chiudi(); }
  salta.addEventListener('click', chiudi);
  strato.addEventListener('click', salto);
  D.addEventListener('keydown', salto);
  var staccaMisura = FM.aRidimensionare(suResize);

  var fratelli = [];
  if (schermo) {
    [].forEach.call(D.body.children, function (c) {
      if (c !== strato && !c.hasAttribute('inert')) { c.setAttribute('inert', ''); fratelli.push(c); }
    });
  }

  function chiudi() {
    if (morto) return; morto = true;
    cancelAnimationFrame(giro);
    staccaMisura();
    D.removeEventListener('keydown', salto);
    fratelli.forEach(function (c) { c.removeAttribute('inert'); });
    strato.style.transition = 'opacity 260ms linear';
    strato.style.opacity = '0';
    setTimeout(function () { if (strato.parentNode) strato.parentNode.removeChild(strato); }, 300);
    if (chiave) try { sessionStorage.setItem(chiave, '1'); } catch (x) {}
    if (typeof o.poi === 'function') o.poi();
  }

  giro = requestAnimationFrame(orologio);
  return { ferma: chiudi };
});
})();
