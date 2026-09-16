/* zoompan — click per avvicinarsi, poi la foto insegue il cursore.
   Anche da tastiera: Invio avvicina, Escape allontana. */
(function () {
if (!window.FM) return;
FM.scenica('zoompan', function (el, o) {
  var n = FM.num, zoom = n(o.zoom, 2.4);
  var img = el.querySelector('img'); if (!img) return { ferma: function () {} };
  el.classList.add('fmx-zoompan');
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', o.etichetta || 'Ingrandisci la fotografia');
  var vicino = false;

  function posa(e) {
    if (!vicino) return;
    var b = el.getBoundingClientRect();
    var x = Math.max(0, Math.min(1, (e.clientX - b.left) / b.width));
    var y = Math.max(0, Math.min(1, (e.clientY - b.top) / b.height));
    img.style.transform = 'translate(' + (-x * (zoom - 1) * 100) + '%,' +
                          (-y * (zoom - 1) * 100) + '%) scale(' + zoom + ')';
  }
  function scambia(e) {
    vicino = !vicino;
    el.classList.toggle('fmx-vicino', vicino);
    el.setAttribute('aria-pressed', vicino);
    if (!vicino) img.style.transform = '';
    else if (e && e.clientX != null) posa(e);
    else img.style.transform = 'translate(' + (-(zoom - 1) * 50) + '%,' + (-(zoom - 1) * 50) + '%) scale(' + zoom + ')';
  }
  function tasti(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scambia(); }
    if (e.key === 'Escape' && vicino) scambia();
  }
  el.addEventListener('click', scambia);
  el.addEventListener('pointermove', posa, { passive: true });
  el.addEventListener('keydown', tasti);
  return { ferma: function () {
    el.removeEventListener('click', scambia); el.removeEventListener('pointermove', posa);
    el.removeEventListener('keydown', tasti);
    el.classList.remove('fmx-zoompan', 'fmx-vicino'); img.style.transform = '';
  } };
});
})();
