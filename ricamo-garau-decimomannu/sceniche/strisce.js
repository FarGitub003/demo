/* strisce — la copertina si sfila a lamelle. Ogni lamella e' un pezzo della
   stessa immagine, ritagliato con background-position: nessuna immagine in piu'. */
(function () {
if (!window.FM) return;
FM.scenica('strisce', function (el, o) {
  var n = FM.num, quante = Math.max(3, n(o.quante, 12)), durata = n(o.durata, 900);
  var fonte = o.immagine || (el.querySelector('img') && el.querySelector('img').currentSrc);
  if (!fonte || FM.ridotto()) return { ferma: function () {} };
  el.classList.add('fmx-strisce');
  var velo = document.createElement('div');
  velo.className = 'fmx-strisce-velo'; velo.setAttribute('aria-hidden', 'true');
  var i, lamelle = [];
  for (i = 0; i < quante; i++) {
    var s = document.createElement('div');
    s.className = 'fmx-striscia';
    s.style.cssText = 'left:' + (i / quante * 100) + '%;width:' + (100 / quante + .2) + '%;' +
      'background-image:url(' + JSON.stringify(fonte) + ');' +
      'background-size:' + (quante * 100) + '% 100%;' +
      'background-position:' + (quante > 1 ? (i / (quante - 1) * 100) : 0) + '% center';
    velo.appendChild(s); lamelle.push(s);
  }
  el.appendChild(velo);
  var partito = false, rete = 0, staccaScorr = null;
  function parte() {
    if (partito) return; partito = true;
    io.disconnect(); clearTimeout(rete);
    if (staccaScorr) { staccaScorr(); staccaScorr = null; }
    lamelle.forEach(function (s, k) {
      var giu = k % 2 === 0;
      s.style.transition = 'transform ' + durata + 'ms cubic-bezier(.5,0,.9,.35) ' +
        (k * 45) + 'ms, opacity ' + durata + 'ms linear ' + (k * 45 + durata * .4) + 'ms';
      s.style.transform = 'translate3d(0,' + (giu ? 110 : -110) + '%,0)';
      s.style.opacity = '0';
    });
    setTimeout(chiudi, durata + quante * 45 + 120);
  }
  var io = new IntersectionObserver(function (v) {
    if (v[0].isIntersecting) parte();
  }, { rootMargin: '0px 0px -12% 0px' });
  io.observe(el);
  /* REGOLA 3 — queste lamelle COPRONO la fotografia. Se l'osservatore c'e' ma
     non parla mai (capita coi browser che alzano le protezioni privacy) la
     copertina resta chiusa per sempre, e senza un errore in console. Allora a
     RETE ms ci si guarda da soli: se l'elemento e' in vista si parte comunque;
     se non lo e', ci si aggancia all'UNICO ascoltatore di scorrimento del
     motore (regola 6), che dell'osservatore non ha bisogno. Cosi' il velo si
     toglie sempre, e l'effetto non si brucia per chi ci arriva piu' tardi. */
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
    el.classList.remove('fmx-strisce');
  }
  return { ferma: chiudi };
});
})();
