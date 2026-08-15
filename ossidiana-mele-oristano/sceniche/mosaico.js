/* mosaico — un velo di tessere si scompone e scopre la fotografia.
   Le tessere sono divs pieni, non pezzi d'immagine: costa una frazione. */
(function () {
if (!window.FM) return;
FM.scenica('mosaico', function (el, o) {
  var n = FM.num, col = Math.max(2, n(o.colonne, 10)), rig = Math.max(2, n(o.righe, 6));
  var durata = n(o.durata, 620);
  if (FM.ridotto()) return { ferma: function () {} };
  el.classList.add('fmx-mosaico');
  var velo = document.createElement('div');
  velo.className = 'fmx-mosaico-velo'; velo.setAttribute('aria-hidden', 'true');
  if (o.fondo) velo.style.setProperty('--fmx-fondo', o.fondo);
  var tessere = [], x, y;
  for (y = 0; y < rig; y++) for (x = 0; x < col; x++) {
    var t = document.createElement('div');
    t.className = 'fmx-tessera';
    t.style.cssText = 'left:' + (x / col * 100) + '%;top:' + (y / rig * 100) + '%;width:' +
      (100 / col + .15) + '%;height:' + (100 / rig + .15) + '%';
    t.__d = (x + y) * 34 + Math.random() * 90;      // diagonale, con un pizzico di caso
    velo.appendChild(t); tessere.push(t);
  }
  el.appendChild(velo);
  var partito = false, rete = 0, staccaScorr = null;
  function parte() {
    if (partito) return; partito = true;
    io.disconnect(); clearTimeout(rete);
    if (staccaScorr) { staccaScorr(); staccaScorr = null; }
    var max = 0;
    tessere.forEach(function (t) {
      max = Math.max(max, t.__d);
      t.style.transition = 'transform ' + durata + 'ms cubic-bezier(.22,1,.36,1) ' + t.__d +
        'ms, opacity ' + durata + 'ms linear ' + t.__d + 'ms';
      t.style.transform = 'scale(.4)'; t.style.opacity = '0';
    });
    setTimeout(chiudi, max + durata + 100);
  }
  var io = new IntersectionObserver(function (v) {
    if (v[0].isIntersecting) parte();
  }, { rootMargin: '0px 0px -12% 0px' });
  io.observe(el);
  /* REGOLA 3 — questo velo COPRE la fotografia. Se l'osservatore c'e' ma non
     parla mai (capita coi browser che alzano le protezioni privacy) l'immagine
     resta nascosta per sempre, e senza un errore in console. Allora a RETE ms
     ci si guarda da soli: se l'elemento e' in vista si parte comunque; se non
     lo e', ci si aggancia all'UNICO ascoltatore di scorrimento del motore
     (regola 6), che dell'osservatore non ha bisogno. Cosi' il velo si toglie
     sempre, e l'effetto non si brucia per chi arriva al blocco piu' tardi. */
  function inVista() {
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) return false;   /* dentro un pannello chiuso: non bruciarlo */
    return r.top < (window.innerHeight || 0) && r.bottom > 0;
  }
  rete = setTimeout(function () {
    if (partito) return;
    if (inVista()) return parte();
    staccaScorr = FM.aScorrimento(function () { if (inVista()) parte(); });
  }, 2600);
  function chiudi() {
    partito = true;
    io.disconnect(); clearTimeout(rete);
    if (staccaScorr) { staccaScorr(); staccaScorr = null; }
    if (velo.parentNode) velo.parentNode.removeChild(velo);
    el.classList.remove('fmx-mosaico');
  }
  return { ferma: chiudi };
});
})();
