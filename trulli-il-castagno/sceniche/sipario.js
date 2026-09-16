/* sipario — due ante e un marchio in mezzo. Si smonta da solo a fine corsa,
   e chi ha chiesto meno movimento non lo vede proprio. */
(function () {
if (!window.FM) return;
FM.scenica('sipario', function (el, o) {
  var n = FM.num, durata = n(o.durata, 900), sosta = n(o.sosta, 420);
  var schermo = el === document.body || o.schermo != null;
  var ospite = schermo ? document.body : el;
  if (!schermo && getComputedStyle(el).position === 'static') el.classList.add('fm-palco');
  var s = document.createElement('div');
  s.className = 'fmx-sipario' + (schermo ? ' fmx-schermo' : '');
  s.setAttribute('aria-hidden', 'true');
  if (o.fondo) s.style.setProperty('--fmx-fondo', o.fondo);
  var sx = document.createElement('div'); sx.className = 'fmx-anta fmx-anta-sx';
  var dx = document.createElement('div'); dx.className = 'fmx-anta fmx-anta-dx';
  s.appendChild(sx); s.appendChild(dx);
  if (o.marchio) {
    var m = document.createElement('div');
    m.className = 'fmx-sipario-marchio'; m.textContent = o.marchio;
    s.appendChild(m);
  }
  ospite.appendChild(s);
  var morto = false;
  if (FM.ridotto()) { chiudi(); return { ferma: chiudi }; }
  var t = setTimeout(function () {
    if (m) { m.style.transition = 'opacity .3s linear'; m.style.opacity = '0'; }
    sx.style.transition = dx.style.transition = 'transform ' + durata + 'ms cubic-bezier(.7,0,.2,1)';
    sx.style.transform = 'translate3d(-100%,0,0)';
    dx.style.transform = 'translate3d(100%,0,0)';
    t = setTimeout(chiudi, durata + 60);
  }, sosta);
  function chiudi() {
    if (morto) return; morto = true;
    clearTimeout(t);
    if (s.parentNode) s.parentNode.removeChild(s);
  }
  return { ferma: chiudi };
});
})();
