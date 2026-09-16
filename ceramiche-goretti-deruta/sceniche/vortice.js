/* vortice — a ogni figlio la sua posizione sulla spirale, calcolata una volta
   sola all'avvio: nessun conto per frame. */
(function () {
if (!window.FM) return;
FM.scenica('vortice', function (el, o) {
  var n = FM.num, raggio = n(o.raggio, 220), giri = n(o.giri, 1.1), passo = n(o.passo, 70);
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
  var io = new IntersectionObserver(function (v) {
    if (v[0].isIntersecting) { io.disconnect(); el.classList.add('fmx-fermo'); }
  }, { rootMargin: '0px 0px -12% 0px' });
  io.observe(el);
  var rete = setTimeout(function () { el.classList.add('fmx-fermo'); }, 3000);
  function pulisci() {
    if (io) io.disconnect(); clearTimeout(rete);
    el.classList.remove('fmx-vortice', 'fmx-fermo');
    figli.forEach(function (f) { f.style.cssText = ''; });
  }
  return { ferma: pulisci };
});
})();
