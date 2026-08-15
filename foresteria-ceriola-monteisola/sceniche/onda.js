/* onda — un velo copre la sezione e si ritira con un bordo ondulato.
   Il bordo e' un path costruito qui: cambiando altezza resta corretto. */
(function () {
if (!window.FM) return;
FM.scenica('onda', function (el, o) {
  var n = FM.num, ampiezza = n(o.ampiezza, 28), gobbe = n(o.gobbe, 3), durata = n(o.durata, 1100);
  if (FM.ridotto()) return { ferma: function () {} };
  el.classList.add('fmx-onda-sez');
  var velo = document.createElement('div');
  velo.className = 'fmx-onda-vela'; velo.setAttribute('aria-hidden', 'true');
  if (o.fondo) velo.style.setProperty('--fmx-fondo', o.fondo);
  el.appendChild(velo);

  function taglia(k) {
    var passi = 24, punti = [], i;
    for (i = 0; i <= passi; i++) {
      var x = i / passi;
      var y = k * 100 + Math.sin((x * gobbe + k * 2) * 6.283) * ampiezza * (1 - k) / el.offsetHeight * 100;
      punti.push((x * 100).toFixed(2) + '% ' + y.toFixed(2) + '%');
    }
    punti.push('100% 100%', '0% 100%');
    velo.style.clipPath = 'polygon(' + punti.join(',') + ')';
  }
  taglia(0);
  var t0 = 0, giro = 0, morto = false;
  function frame(t) {
    if (morto) return;
    if (!t0) t0 = t;
    var k = Math.min(1, (t - t0) / durata);
    taglia(1 - Math.pow(1 - k, 3));
    if (k < 1) giro = requestAnimationFrame(frame); else chiudi();
  }
  var io = new IntersectionObserver(function (v) {
    if (v[0].isIntersecting) { io.disconnect(); giro = requestAnimationFrame(frame); }
  }, { rootMargin: '0px 0px -15% 0px' });
  io.observe(el);
  function chiudi() {
    if (morto) return; morto = true;
    cancelAnimationFrame(giro); io.disconnect();
    if (velo.parentNode) velo.parentNode.removeChild(velo);
    el.classList.remove('fmx-onda-sez');
  }
  return { ferma: chiudi };
});
})();
