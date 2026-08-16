/* cascata — ogni colonna ha la sua velocita'. Un solo gancio sull'ascoltatore
   del motore, e si spegne quando la cascata e' fuori vista. */
(function () {
if (!window.FM) return;
FM.scenica('cascata', function (el, o) {
  var n = FM.num, ampiezza = n(o.ampiezza, 90);
  el.classList.add('fmx-cascata');
  var col = FM.lista(':scope > *', el);
  if (FM.ridotto() || !col.length) return { ferma: pulisci };
  var stacca = FM.aScorrimento(function (y, h) {
    var b = el.getBoundingClientRect();
    if (b.bottom < -100 || b.top > h + 100) return;
    var k = (h / 2 - (b.top + b.height / 2)) / h;      // -1..1 circa
    col.forEach(function (c, i) {
      var v = (i % 2 ? 1 : -1) * (.5 + (i % 3) * .35);
      c.style.setProperty('--fmx-py', (k * ampiezza * v).toFixed(1) + 'px');
    });
  });
  function pulisci() {
    if (stacca) stacca();
    el.classList.remove('fmx-cascata');
    col.forEach(function (c) { c.style.removeProperty('--fmx-py'); });
  }
  return { ferma: pulisci };
});
})();
