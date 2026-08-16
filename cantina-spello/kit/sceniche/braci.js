/* braci — particelle su canvas, riciclate (nessuna allocazione per frame).
   Si ferma da sola fuori vista e a scheda nascosta: e' la lezione 5 dello
   spoglio (animazioni infinite mai fermate). */
(function () {
if (!window.FM) return;
FM.scenica('braci', function (el, o) {
  if (FM.ridotto()) return { ferma: function () {} };
  var n = FM.num, quante = n(o.quante, 70), colore = o.colore || '255,170,80';
  var salita = n(o.salita, 26), raggio = n(o.raggio, 2.6);
  if (getComputedStyle(el).position === 'static') el.classList.add('fm-palco');

  var tela = document.createElement('canvas');
  tela.className = 'fmx-braci-tela'; tela.setAttribute('aria-hidden', 'true');
  el.insertBefore(tela, el.firstChild);
  var c = tela.getContext('2d'), L = 0, A = 0, dpr = Math.min(2, devicePixelRatio || 1);
  var p = [], i, giro = 0, vivo = true, inVista = true;

  function misura() {
    L = el.clientWidth || tela.clientWidth; A = el.clientHeight || tela.clientHeight;
    tela.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    tela.width = L * dpr; tela.height = A * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function nasci(q, primo) {
    q.x = Math.random() * L;
    q.y = primo ? Math.random() * A : A + Math.random() * 40;
    q.r = raggio * (.4 + Math.random());
    q.v = salita * (.4 + Math.random()) / 60;
    q.o = .25 + Math.random() * .55;
    q.d = (Math.random() - .5) * .35;
  }
  misura();
  for (i = 0; i < quante; i++) { p.push({}); nasci(p[i], true); }

  function frame() {
    if (!vivo) return;
    c.clearRect(0, 0, L, A);
    for (i = 0; i < quante; i++) {
      var q = p[i];
      q.y -= q.v; q.x += q.d;
      if (q.y < -10) nasci(q, false);
      var g = c.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r * 4);
      g.addColorStop(0, 'rgba(' + colore + ',' + q.o + ')');
      g.addColorStop(1, 'rgba(' + colore + ',0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(q.x, q.y, q.r * 4, 0, 6.284); c.fill();
    }
    giro = requestAnimationFrame(frame);
  }
  function accendi() { if (vivo && inVista && !document.hidden && !giro) giro = requestAnimationFrame(frame); }
  function spegni() { cancelAnimationFrame(giro); giro = 0; }

  var io = new IntersectionObserver(function (v) {
    inVista = v[0].isIntersecting; inVista ? accendi() : spegni();
  });
  io.observe(el);
  function visibilita() { document.hidden ? spegni() : accendi(); }
  document.addEventListener('visibilitychange', visibilita);
  var staccaMisura = FM.aRidimensionare(misura);
  accendi();

  return { ferma: function () {
    vivo = false; spegni(); io.disconnect();
    document.removeEventListener('visibilitychange', visibilita);
    staccaMisura();
    if (tela.parentNode) tela.parentNode.removeChild(tela);
  } };
});
})();
