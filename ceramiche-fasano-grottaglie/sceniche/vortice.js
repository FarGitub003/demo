/* vortice — a ogni figlio la sua posizione sulla spirale, calcolata una volta
   sola all'avvio: nessun conto per frame. */
(function () {
if (!window.FM) return;
FM.scenica('vortice', function (el, o) {
  var n = FM.num, raggio = n(o.raggio, 220), giri = n(o.giri, 1.1), passo = n(o.passo, 70);
  var io = null, rete = 0, tFine = 0, tagliato = null, fermo = false;
  el.classList.add('fmx-vortice');
  var figli = FM.lista(':scope > *', el);
  figli.forEach(function (f, i) {
    var t = figli.length > 1 ? i / (figli.length - 1) : 0;
    var a = t * giri * 6.283;
    f.style.setProperty('--fmx-dx', (Math.cos(a) * raggio * (1 - t * .3)).toFixed(0) + 'px');
    f.style.setProperty('--fmx-dy', (Math.sin(a) * raggio * (1 - t * .3)).toFixed(0) + 'px');
    f.style.setProperty('--fmx-giro', (-38 + t * 76).toFixed(0) + 'deg');
    f.style.setProperty('--fmx-ritardo', (i * passo) + 'ms');
  });
  if (FM.ridotto()) { el.classList.add('fmx-fermo'); return { ferma: pulisci }; }
  /* Finche' non si assestano, i pezzi aspettano spostati fino a `raggio` px
     lungo la spirale: invisibili (opacita' 0) ma presenti, e su telefono
     ALLARGANO LA PAGINA. Misurato il 16/09/2026 su Fasano: 570px su 390, da
     0,1 a 4,3 s. Si taglia di lato il primo antenato largo quanto lo schermo,
     solo finche' i pezzi non sono arrivati: il volo resta dentro lo schermo
     com'era e al sito non resta addosso niente (stessa cura di `timbro`).
     `clip` e non `hidden`: non crea un contenitore di scorrimento. */
  var vw = document.documentElement.clientWidth || window.innerWidth || 0;
  for (var p = el.parentElement; p; p = p.parentElement) {
    if (p === document.body || p.offsetWidth >= vw - 1) { tagliato = p; break; }
  }
  if (tagliato) tagliato.classList.add('fmx-vortice-taglia');
  function assesta() {
    if (fermo) return;
    fermo = true;
    if (io) io.disconnect(); clearTimeout(rete);
    el.classList.add('fmx-fermo');
    /* l'ultimo pezzo parte dopo (n-1)*passo e viaggia .95 s: poi si scopre */
    tFine = setTimeout(scopri, (figli.length - 1) * passo + 1100);
  }
  function scopri() {
    if (tagliato) { tagliato.classList.remove('fmx-vortice-taglia'); tagliato = null; }
  }
  io = new IntersectionObserver(function (v) {
    if (v[0].isIntersecting) assesta();
  }, { rootMargin: '0px 0px -12% 0px' });
  io.observe(el);
  rete = setTimeout(assesta, 3000);
  function pulisci() {
    if (io) io.disconnect(); clearTimeout(rete); clearTimeout(tFine);
    scopri();
    el.classList.remove('fmx-vortice', 'fmx-fermo');
    figli.forEach(function (f) { f.style.cssText = ''; });
  }
  return { ferma: pulisci };
});
})();
