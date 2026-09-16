/* portale — il cerchio si apre dal punto d'origine e resta aperto.
   Sotto movimento ridotto il contenuto compare e basta, senza il cerchio. */
(function () {
if (!window.FM) return;
FM.scenica('portale', function (el, o) {
  var n = FM.num, durata = n(o.durata, 900);
  var ospite = o.dentro ? document.querySelector(o.dentro) : el.parentNode;
  el.classList.add('fmx-portale');
  if (el === document.body || o.schermo != null) el.classList.add('fmx-schermo');
  else if (ospite && getComputedStyle(ospite).position === 'static') ospite.classList.add('fm-palco');

  var aperto = false;
  function apri(x, y) {
    aperto = true;
    clearTimeout(scorta);
    var b = el.getBoundingClientRect();
    var cx = x != null ? x : b.width / 2, cy = y != null ? y : b.height / 2;
    var r = Math.sqrt(Math.max(cx, b.width - cx) * Math.max(cx, b.width - cx) +
                      Math.max(cy, b.height - cy) * Math.max(cy, b.height - cy));
    el.style.setProperty('--fmx-x', cx.toFixed(0) + 'px');
    el.style.setProperty('--fmx-y', cy.toFixed(0) + 'px');
    if (FM.ridotto()) { el.style.clipPath = 'none'; return; }
    /* Niente requestAnimationFrame qui: in una scheda nascosta il frame non
       arriva e il contenuto resterebbe coperto a tempo indeterminato. Si fissa
       lo stato di partenza leggendo il layout, poi si scrive quello finale. */
    el.style.transition = 'clip-path ' + durata + 'ms cubic-bezier(.22,1,.36,1)';
    void el.offsetWidth;
    el.style.clipPath = 'circle(' + r.toFixed(0) + 'px at ' +
      cx.toFixed(0) + 'px ' + cy.toFixed(0) + 'px)';
    /* rete di sicurezza: comunque vada, il ritaglio sparisce e non resta niente coperto */
    clearTimeout(rete);
    rete = setTimeout(function () { el.style.clipPath = 'none'; }, durata + 600);
  }
  var rete = 0;
  var innesco = o.da ? document.querySelector(o.da) : null;
  function suClic(e) {
    var b = el.getBoundingClientRect();
    apri(e.clientX - b.left, e.clientY - b.top);
  }
  if (innesco) innesco.addEventListener('click', suClic);
  else {
    var io = new IntersectionObserver(function (v) { if (v[0].isIntersecting) { io.disconnect(); apri(); } });
    io.observe(el);
  }
  /* Regola 3 del kit applicata anche qui: questo effetto RITAGLIA il contenuto,
     quindi se l'apertura non parte (osservatore che non arriva mai, scheda
     rimasta nascosta) deve comunque scoprirsi da solo. */
  var scorta = setTimeout(function () { if (!aperto) el.style.clipPath = 'none'; }, 4000);
  return { ferma: function () {
    if (innesco) innesco.removeEventListener('click', suClic);
    if (io) io.disconnect();
    clearTimeout(rete); clearTimeout(scorta);
    el.classList.remove('fmx-portale', 'fmx-schermo'); el.style.clipPath = '';
  }, apri: apri };
});
})();
