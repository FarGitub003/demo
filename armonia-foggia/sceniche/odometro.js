/* odometro — ogni cifra e' un rullo di 0..9 che si ferma sulla sua.
   Parte quando entra nello schermo; sotto movimento ridotto scrive il numero e basta. */
(function () {
if (!window.FM) return;
FM.scenica('odometro', function (el, o) {
  var n = FM.num, valore = String(o.valore != null ? o.valore : el.textContent.trim());
  var passo = n(o.passo, 70), durata = n(o.durata, 900);
  el.setAttribute('aria-label', valore);
  if (FM.ridotto()) { el.textContent = valore; return { ferma: function () {} }; }
  el.textContent = '';
  el.classList.add('fmx-odometro');
  var rulli = [];
  valore.split('').forEach(function (ch, i) {
    if (!/[0-9]/.test(ch)) { var s = document.createElement('span'); s.textContent = ch;
      s.setAttribute('aria-hidden', 'true'); el.appendChild(s); return; }
    var r = document.createElement('span'); r.className = 'fmx-rullo';
    r.setAttribute('aria-hidden', 'true');
    r.style.setProperty('--fmx-ritardo', i * passo + 'ms');
    r.style.setProperty('--fmx-durata', durata + 'ms');
    var t = document.createElement('span');
    for (var k = 0; k <= 9; k++) { var d = document.createElement('i'); d.textContent = k; t.appendChild(d); }
    r.appendChild(t); el.appendChild(r);
    rulli.push({ r: r, c: +ch });
  });
  var io = new IntersectionObserver(function (v) {
    if (!v[0].isIntersecting) return;
    io.disconnect();
    rulli.forEach(function (x) { x.r.style.setProperty('--fmx-cifra', x.c); });
  });
  io.observe(el);
  return { ferma: function () { io.disconnect(); el.classList.remove('fmx-odometro'); el.textContent = valore; } };
});
})();
