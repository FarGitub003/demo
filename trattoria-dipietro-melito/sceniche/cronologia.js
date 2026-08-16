/* cronologia — un solo path, lunghezza sommata dai segmenti (niente
   getTotalLength a ogni frame), un solo gancio sull'ascoltatore del motore. */
(function () {
if (!window.FM) return;
var NS = 'http://www.w3.org/2000/svg';
FM.scenica('cronologia', function (el, o) {
  var tappe = FM.lista(o.tappe || ':scope > *', el);
  if (!tappe.length) return { ferma: function () {} };
  el.classList.add('fmx-cronologia');
  tappe.forEach(function (t) { t.classList.add('fmx-tappa'); });
  var svg = document.createElementNS(NS, 'svg'), via = document.createElementNS(NS, 'path');
  svg.setAttribute('class', 'fmx-cronologia-linea'); svg.setAttribute('aria-hidden', 'true');
  svg.appendChild(via); el.appendChild(svg);
  var L = 0, A = 0, lung = 1, quote = [];

  function misura() {
    L = el.offsetWidth; A = Math.max(1, el.offsetHeight);
    var base = el.getBoundingClientRect().top + pageYOffset, d = '', prec = null, ys = [];
    tappe.forEach(function (t, i) {
      var b = t.getBoundingClientRect();
      var x = i % 2 ? L * .82 : L * .18, y = b.top + pageYOffset - base + b.height / 2;
      if (!prec) d = 'M' + x.toFixed(1) + ' 0L' + x.toFixed(1) + ' ' + y.toFixed(1);
      else {
        var m = ((prec[1] + y) / 2).toFixed(1);
        d += 'C' + prec[0].toFixed(1) + ' ' + m + ',' + x.toFixed(1) + ' ' + m + ',' +
             x.toFixed(1) + ' ' + y.toFixed(1);
      }
      ys.push(y); prec = [x, y];
    });
    if (prec) d += 'L' + prec[0].toFixed(1) + ' ' + A;
    svg.setAttribute('viewBox', '0 0 ' + L + ' ' + A);
    svg.setAttribute('width', L); svg.setAttribute('height', A);
    via.setAttribute('d', d);
    /* Un solo path, misurato una volta per ridimensionamento (mai per frame):
       stimarne la lunghezza sommando i segmenti sarebbe sbagliato, il percorso
       e' a curve. Se la dasharray non e' quella vera il tratto si ripete e la
       linea appare a pezzi (difetto trovato in QA il 09/08/2026). */
    lung = Math.max(1, via.getTotalLength());
    quote = ys.map(function (y) { return y / A * lung; });
    via.style.strokeDasharray = lung;
    via.style.strokeDashoffset = FM.ridotto() ? 0 : lung;
  }
  misura();
  if (FM.ridotto()) { tappe.forEach(function (t) { t.classList.add('fmx-accesa'); }); return { ferma: pulisci }; }

  var stacca = FM.aScorrimento(function (y, h) {
    var b = el.getBoundingClientRect();
    if (b.bottom < 0 || b.top > h) return;
    var k = Math.max(0, Math.min(1, (h * .72 - b.top) / Math.max(1, b.height * .78)));
    via.style.strokeDashoffset = (lung * (1 - k)).toFixed(1);
    tappe.forEach(function (t, i) { t.classList.toggle('fmx-accesa', k * lung >= quote[i]); });
  });
  var staccaMisura = FM.aRidimensionare(misura);
  function pulisci() {
    if (stacca) stacca();
    staccaMisura();
    if (svg.parentNode) svg.parentNode.removeChild(svg);
    el.classList.remove('fmx-cronologia');
    tappe.forEach(function (t) { t.classList.remove('fmx-tappa', 'fmx-accesa'); });
  }
  return { ferma: pulisci };
});
})();
