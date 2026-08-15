/* timbro — il marchio si imprime sulla pagina quando entra nello schermo.
   Sotto movimento ridotto resta semplicemente al suo posto, nitido. */
(function () {
if (!window.FM) return;
FM.scenica('timbro', function (el, o) {
  var n = FM.num, durata = n(o.durata, 620);
  el.classList.add('fmx-timbro');
  el.style.setProperty('--fmx-durata', durata + 'ms');
  if (o.giro) el.style.setProperty('--fmx-giro', n(o.giro, -8) + 'deg');
  if (FM.ridotto()) return { ferma: pulisci };

  var alone = null, t1 = 0, t2 = 0, tagliato = null;
  /* Toglie di mezzo quello che il battito precedente ha lasciato: senza questo,
     due battiti ravvicinati lasciano due aloni sovrapposti e due timer vivi. */
  function sparecchia() {
    clearTimeout(t1); clearTimeout(t2);
    if (alone && alone.parentNode) alone.parentNode.removeChild(alone);
    alone = null;
    if (tagliato) { tagliato.classList.remove('fmx-timbro-taglia'); tagliato = null; }
  }
  function batti() {
    var scala = 2.4;
    sparecchia();
    el.classList.remove('fmx-batti'); void el.offsetWidth; el.classList.add('fmx-batti');
    var padre = el.offsetParent || el.parentNode;
    if (padre && padre.appendChild) {
      if (getComputedStyle(padre).position === 'static') padre.classList.add('fm-palco');
      /* Il fotogramma 0% del battito ingrandisce il marchio 3,2 volte: su uno
         schermo stretto questo ALLARGA LA PAGINA (barra orizzontale) pur essendo
         invisibile, perche' li' l'opacita' e' 0. Si taglia di lato — solo su
         questo genitore e solo per la durata del battito — invece di rimpicciolire
         l'ingresso: cosi' l'effetto resta quello di sempre e al sito non resta
         addosso niente. `clip` e non `hidden`: non crea un contenitore di
         scorrimento e non tocca `window.scrollY`. */
      tagliato = padre; padre.classList.add('fmx-timbro-taglia');
      alone = document.createElement('div');
      alone.className = 'fmx-timbro-alone'; alone.setAttribute('aria-hidden', 'true');
      var w = el.offsetWidth, h = el.offsetHeight, d = Math.max(w, h);
      /* Quanto si allarga l'alone. Su uno schermo stretto un marchio largo lo
         farebbe sfondare di lato: misurato su un occhiello di 272px a 390px di
         schermo, alone 653px e pagina larga 516. Non si vedeva solo perche' QUEL
         sito ha un `overflow-x:hidden` suo, che il kit non garantisce. Si limita
         la CRESCITA, non la partenza: l'anello deve nascere addosso al marchio. */
      var vw = window.innerWidth || 0;
      if (vw && d * scala > vw * .9) {
        scala = vw * .9 / d;
        /* Se il marchio e' gia' largo quanto lo schermo non basta stringere la
           crescita (l'anello resterebbe fermo): si stringe anche l'anello, cosi'
           un po' di corsa si vede sempre e la pagina non si allarga mai. */
        if (scala < 1.25) { scala = 1.25; d = vw * .9 / scala; }
      }
      alone.style.cssText = 'left:' + (el.offsetLeft + w / 2 - d / 2) + 'px;top:' +
        (el.offsetTop + h / 2 - d / 2) + 'px;width:' + d + 'px;height:' + d + 'px';
      padre.appendChild(alone);
      t1 = setTimeout(function () {
        /* Lo stato di PARTENZA si fissa prima di accendere la transizione: se si
           scrive .5 e subito dopo 0, il browser vede solo il valore finale e la
           transizione si accorcia a niente — l'alone non si vedeva mai. E niente
           requestAnimationFrame: a scheda nascosta quel frame non arriva. */
        alone.style.opacity = '.5';
        void alone.offsetWidth;
        alone.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1), opacity .7s linear';
        alone.style.transform = 'scale(' + scala.toFixed(2) + ')';
        alone.style.opacity = '0';
        t2 = setTimeout(sparecchia, 800);   /* toglie l'alone e il taglio di lato */
      }, durata * .5);
    }
  }
  var io = new IntersectionObserver(function (v) { if (v[0].isIntersecting) { io.disconnect(); batti(); } });
  io.observe(el);
  function pulisci() {
    if (io) io.disconnect();
    el.classList.remove('fmx-timbro', 'fmx-batti');
    sparecchia();                     /* anche i due timer: se restano vivi, agiscono su roba smontata */
  }
  return { ferma: pulisci, batti: batti };
});
})();
