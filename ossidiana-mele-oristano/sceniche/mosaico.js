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
  var io = new IntersectionObserver(function (v) {
    if (!v[0].isIntersecting) return;
    io.disconnect();
    var max = 0;
    tessere.forEach(function (t) {
      max = Math.max(max, t.__d);
      t.style.transition = 'transform ' + durata + 'ms cubic-bezier(.22,1,.36,1) ' + t.__d +
        'ms, opacity ' + durata + 'ms linear ' + t.__d + 'ms';
      t.style.transform = 'scale(.4)'; t.style.opacity = '0';
    });
    setTimeout(chiudi, max + durata + 100);
  }, { rootMargin: '0px 0px -12% 0px' });
  io.observe(el);
  function chiudi() {
    io.disconnect();
    if (velo.parentNode) velo.parentNode.removeChild(velo);
    el.classList.remove('fmx-mosaico');
  }
  return { ferma: chiudi };
});
})();
