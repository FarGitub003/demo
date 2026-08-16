/* piega — i figli si aprono come pagine incernierate in alto, uno dopo l'altro. */
(function () {
if (!window.FM) return;
FM.scenica('piega', function (el, o) {
  var n = FM.num, passo = n(o.passo, 130);
  el.classList.add('fmx-piega');
  [].forEach.call(el.children, function (c, i) { c.style.setProperty('--fmx-ritardo', i * passo + 'ms'); });
  if (FM.ridotto()) { el.classList.add('fmx-aperta'); return { ferma: pulisci }; }
  var io = new IntersectionObserver(function (v) {
    if (v[0].isIntersecting) { io.disconnect(); el.classList.add('fmx-aperta'); }
  }, { rootMargin: '0px 0px -14% 0px' });
  io.observe(el);
  var rete = setTimeout(function () { el.classList.add('fmx-aperta'); }, 3000);
  function pulisci() { if (io) io.disconnect(); clearTimeout(rete); el.classList.remove('fmx-piega', 'fmx-aperta'); }
  return { ferma: pulisci };
});
})();
