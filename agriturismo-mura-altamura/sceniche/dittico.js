/* dittico — confronto trascinabile fra due immagini.
   Tastiera inclusa: e' uno slider vero, non un vezzo per il mouse. */
(function () {
if (!window.FM) return;
FM.scenica('dittico', function (el, o) {
  var n = FM.num, taglio = n(o.taglio, 50);
  el.classList.add('fmx-dittico');
  var m = el.querySelector('.fmx-maniglia');
  if (!m) { m = document.createElement('div'); m.className = 'fmx-maniglia'; el.appendChild(m); }
  m.tabIndex = 0;
  m.setAttribute('role', 'slider');
  m.setAttribute('aria-label', o.etichetta || 'Confronta le due immagini');
  m.setAttribute('aria-valuemin', '0'); m.setAttribute('aria-valuemax', '100');

  function metti(v) {
    taglio = Math.max(0, Math.min(100, v));
    el.style.setProperty('--fmx-taglio', taglio.toFixed(1) + '%');
    m.setAttribute('aria-valuenow', Math.round(taglio));
  }
  function daEvento(e) {
    var b = el.getBoundingClientRect();
    metti((e.clientX - b.left) / Math.max(1, b.width) * 100);
  }
  var giu = false;
  function premi(e) { giu = true; el.setPointerCapture(e.pointerId); daEvento(e); }
  function muovi(e) { if (giu) daEvento(e); }
  function molla() { giu = false; }
  function tasti(e) {
    var p = e.key === 'ArrowLeft' ? -3 : e.key === 'ArrowRight' ? 3
          : e.key === 'Home' ? -100 : e.key === 'End' ? 100 : 0;
    if (!p) return;
    e.preventDefault(); metti(taglio + p);
  }
  el.addEventListener('pointerdown', premi);
  el.addEventListener('pointermove', muovi);
  el.addEventListener('pointerup', molla);
  el.addEventListener('pointercancel', molla);
  m.addEventListener('keydown', tasti);
  metti(taglio);

  return { ferma: function () {
    el.removeEventListener('pointerdown', premi); el.removeEventListener('pointermove', muovi);
    el.removeEventListener('pointerup', molla); el.removeEventListener('pointercancel', molla);
    m.removeEventListener('keydown', tasti);
    el.classList.remove('fmx-dittico'); if (m.parentNode === el) el.removeChild(m);
  } };
});
})();
