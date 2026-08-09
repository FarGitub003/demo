/* Studio Lombardo — comportamenti di pagina.
   Nessuna dipendenza esterna. Tutto degrada senza JS: la pagina resta leggibile. */
(function () {
  'use strict';

  var motoRidotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- testata che si stacca ---------- */
  var topbar = document.getElementById('topbar');
  function aggiornaTopbar() {
    topbar.classList.toggle('attaccata', window.scrollY > 8);
  }
  aggiornaTopbar();

  /* ---------- menu mobile ---------- */
  var burger = document.getElementById('hamburger');
  var menu = document.getElementById('menu');
  burger.addEventListener('click', function () {
    var aperto = menu.classList.toggle('aperto');
    burger.setAttribute('aria-expanded', String(aperto));
    burger.setAttribute('aria-label', aperto ? 'Chiudi il menu' : 'Apri il menu');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      menu.classList.remove('aperto');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Apri il menu');
    }
  });

  /* ---------- il marchio si disegna al caricamento ---------- */
  var marchio = document.getElementById('marchioGrande');
  if (marchio && !motoRidotto) {
    requestAnimationFrame(function () {
      /* se c'è il sipario, il marchio si disegna quando la pagina viene scoperta */
      if (!document.documentElement.classList.contains('intro-viva')) marchio.classList.add('parti');
    });
  }

  /* ---------- rivelazione al primo passaggio ---------- */
  var daRivelare = document.querySelectorAll('.rivela');
  if ('IntersectionObserver' in window && !motoRidotto) {
    var oss = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { v.target.classList.add('visibile'); oss.unobserve(v.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    daRivelare.forEach(function (el) { oss.observe(el); });
    /* rete di sicurezza: se per qualsiasi motivo l'osservatore non scatta
       (scheda mai disegnata, motore che lo salta), dopo 3s si mostra tutto. */
    setTimeout(function () {
      daRivelare.forEach(function (el) { el.classList.add('visibile'); });
    }, 3000);
  } else {
    daRivelare.forEach(function (el) { el.classList.add('visibile'); });
  }

  /* ---------- IL FILO ----------
     Il monogramma è un tratto unico piegato. Il filo lo continua giù per la
     pagina: a ogni sezione fa una piega e si avvicina di un passo al testo,
     fino a chiudersi con un punto sui contatti. */
  var filo = document.getElementById('filo');
  var filoPath = document.getElementById('filoPath');
  var filoPunto = document.getElementById('filoPunto');
  var main = document.getElementById('contenuto');
  var lunghezza = 0;
  var cima = 0;
  var altezza = 0;

  var PASSO = 16;   // di quanto si sposta a destra a ogni piega
  var RAGGIO = 12;  // raggio della piega
  var X0 = 8;       // partenza, allineata allo stelo del monogramma

  function costruisciFilo() {
    if (!filo || getComputedStyle(filo).display === 'none') return;

    var rettoMain = main.getBoundingClientRect();
    var scorrimento = window.scrollY || document.documentElement.scrollTop;
    cima = rettoMain.top + scorrimento;

    var hero = document.getElementById('hero');
    var partenza = hero.offsetHeight * 0.72;               // parte da dentro l'hero
    var contatti = document.getElementById('contatti');
    var fine = contatti.offsetTop + Math.min(260, contatti.offsetHeight * 0.42);

    altezza = fine;
    var x = X0;
    var d = 'M' + x + ',' + partenza;

    var ancore = Array.prototype.slice.call(main.querySelectorAll('[data-filo]'));
    ancore.forEach(function (sez) {
      var y = sez.offsetTop;
      if (y <= partenza + RAGGIO * 2 || y >= fine - RAGGIO * 2) return;
      d += ' L' + x + ',' + (y - RAGGIO);
      d += ' Q' + x + ',' + y + ' ' + (x + RAGGIO) + ',' + y;
      d += ' L' + (x + PASSO - RAGGIO) + ',' + y;
      d += ' Q' + (x + PASSO) + ',' + y + ' ' + (x + PASSO) + ',' + (y + RAGGIO);
      x += PASSO;
    });
    d += ' L' + x + ',' + fine;

    filo.setAttribute('viewBox', '0 0 120 ' + fine);
    filo.setAttribute('height', fine);
    filo.style.height = fine + 'px';
    filoPath.setAttribute('d', d);
    filoPunto.setAttribute('cx', x);
    filoPunto.setAttribute('cy', fine);

    lunghezza = filoPath.getTotalLength();
    filoPath.style.strokeDasharray = lunghezza;
    if (motoRidotto) {
      filoPath.style.strokeDashoffset = 0;
      filo.classList.add('completo');
    } else {
      disegnaFilo();
    }
  }

  function disegnaFilo() {
    if (!lunghezza || motoRidotto) return;
    var y = window.scrollY + window.innerHeight * 0.86 - cima;
    var q = Math.max(0, Math.min(1, y / altezza));
    filoPath.style.strokeDashoffset = lunghezza * (1 - q);
    filo.classList.toggle('completo', q > 0.985);
  }

  /* ---------- voce di menu attiva ---------- */
  var voci = Array.prototype.slice.call(document.querySelectorAll('.menu a'));
  var bersagli = voci
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function aggiornaMenu() {
    var y = window.scrollY + 140;
    var attivo = -1;
    bersagli.forEach(function (sez, i) { if (sez.offsetTop <= y) attivo = i; });
    voci.forEach(function (a, i) {
      if (i === attivo) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  /* ---------- un solo ascoltatore, allineato ai frame ---------- */
  var inCoda = false;
  function alloScorrimento() {
    if (inCoda) return;
    inCoda = true;
    requestAnimationFrame(function () {
      aggiornaTopbar();
      disegnaFilo();
      aggiornaMenu();
      inCoda = false;
    });
  }
  window.addEventListener('scroll', alloScorrimento, { passive: true });

  var attesa;
  window.addEventListener('resize', function () {
    clearTimeout(attesa);
    attesa = setTimeout(function () { costruisciFilo(); aggiornaMenu(); }, 160);
  });

  /* i <details> cambiano l'altezza della pagina: il filo si ricalcola */
  document.querySelectorAll('.domanda').forEach(function (d) {
    d.addEventListener('toggle', function () { costruisciFilo(); });
  });

  window.addEventListener('load', function () { costruisciFilo(); aggiornaMenu(); });
  costruisciFilo();
  aggiornaMenu();
})();

/* ============================================================
   Numeri che salgono e bilancio che va a pareggio.
   Aggiunto dopo il modulo principale: non tocca il resto.
   ============================================================ */
(function () {
  'use strict';

  var motoRidotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmtInt = new Intl.NumberFormat('it-IT');
  var fmtDec = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  function scrivi(el, v, dec) {
    el.textContent = dec ? fmtDec.format(v) : fmtInt.format(Math.round(v));
  }

  /* partenza morbida, arrivo lento: i numeri "atterrano" invece di fermarsi di colpo */
  function frena(t) { return 1 - Math.pow(1 - t, 3); }

  function sali(el, durata, ritardo) {
    var meta = parseFloat(el.dataset.a);
    var dec = el.dataset.dec === '1';
    if (motoRidotto) { scrivi(el, meta, dec); return Promise.resolve(); }

    return new Promise(function (fatto) {
      setTimeout(function () {
        var t0 = null;
        function passo(ora) {
          if (t0 === null) t0 = ora;
          var q = Math.min(1, (ora - t0) / durata);
          scrivi(el, meta * frena(q), dec);
          if (q < 1) requestAnimationFrame(passo);
          else { scrivi(el, meta, dec); fatto(); }
        }
        requestAnimationFrame(passo);
      }, ritardo);
    });
  }

  function avviaPareggio(sezione) {
    var libro = sezione.querySelector('#libro');

    /* i contatori del blocco di sinistra */
    var contatori = sezione.querySelectorAll('.contatore .cifra');
    contatori.forEach(function (el, i) { sali(el, 1400, 120 + i * 130); });

    if (!libro) return;

    /* le voci del libro compaiono una alla volta, come si scrive una riga per volta */
    var voci = libro.querySelectorAll('.voce');
    var attese = [];
    voci.forEach(function (voce, i) {
      var cifra = voce.querySelector('.cifra');
      var tot = voce.classList.contains('voce--tot');
      if (!motoRidotto) {
        voce.style.opacity = '0';
        voce.style.transform = 'translateY(8px)';
        voce.style.transition = 'opacity .45s var(--ease), transform .45s var(--ease)';
        setTimeout(function () { voce.style.opacity = ''; voce.style.transform = ''; }, 180 + i * 110);
      }
      if (cifra) attese.push(sali(cifra, tot ? 1100 : 850, (tot ? 420 : 230) + i * 110));
    });

    /* quando l'ultimo numero è atterrato, i conti tornano */
    Promise.all(attese).then(function () { libro.classList.add('pari'); });
  }

  var sezione = document.getElementById('pareggio');
  if (!sezione) return;

  if ('IntersectionObserver' in window) {
    var oss = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { oss.disconnect(); avviaPareggio(sezione); }
      });
    }, { threshold: 0.25 });
    oss.observe(sezione);
  } else {
    avviaPareggio(sezione);
  }
})();

/* ============================================================
   SIPARIO D'INGRESSO
   Le lettere di "STUDIO LOMBARDO" arrivano da fuori schermo e si
   compongono; poi il sipario si alza e scopre la pagina.
   Regola non negoziabile: se qualcosa va storto, il sipario sparisce.
   ============================================================ */
(function () {
  'use strict';

  var doc = document.documentElement;
  var sipario = document.getElementById('sipario');
  if (!sipario) return;

  var motoRidotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motoRidotto) { doc.classList.add('intro-finita'); return; }

  doc.classList.add('intro-viva');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* --- costruisce le lettere, ognuna con la sua traiettoria --- */
  var lettere = [];
  var indice = 0;
  Array.prototype.forEach.call(sipario.querySelectorAll('.sipario-parola'), function (parola) {
    var testo = parola.dataset.testo || '';
    for (var i = 0; i < testo.length; i++) {
      var s = document.createElement('span');
      s.className = 'lett';
      s.textContent = testo[i];
      /* traiettoria decisa dalla posizione, non a caso: le lettere di sinistra
         entrano da sinistra, quelle di destra da destra. Il ritorno è ordinato. */
      var lato = (indice % 2 === 0) ? -1 : 1;
      var lontananza = 40 + (indice % 5) * 26;
      s.style.setProperty('--dx', (lato * lontananza) + 'px');
      s.style.setProperty('--dy', (((indice % 3) - 1) * 46) + 'px');
      s.style.setProperty('--rot', (lato * (5 + (indice % 4) * 3)) + 'deg');
      s.style.setProperty('--rit', (indice * 42) + 'ms');
      parola.appendChild(s);
      lettere.push(s);
      indice++;
    }
  });

  var payoff = sipario.querySelector('.sipario-payoff');
  var fl = document.getElementById('siparioFl');
  var chiuso = false;
  var orologi = [];

  function fra(ms, fn) { orologi.push(setTimeout(fn, ms)); }

  function scopri() {
    if (chiuso) return;
    chiuso = true;
    orologi.forEach(clearTimeout);
    doc.classList.remove('intro-viva');
    doc.classList.add('intro-finita');
    var mg = document.getElementById('marchioGrande');
    if (mg) mg.classList.add('parti');
    /* tolto dal flusso a sipario alzato: non deve intercettare più niente */
    fra(1100, function () { sipario.style.display = 'none'; });
    window.removeEventListener('keydown', scopri);
    window.removeEventListener('wheel', scopri);
    sipario.removeEventListener('click', scopri);
  }

  /* si può sempre saltare */
  window.addEventListener('keydown', scopri);
  window.addEventListener('wheel', scopri, { passive: true });
  sipario.addEventListener('click', scopri);

  requestAnimationFrame(function () {
    if (fl) fl.classList.add('parti');
    lettere.forEach(function (l) { l.classList.add('posata'); });
    fra(indice * 42 + 620, function () { if (payoff) payoff.classList.add('posata'); });
    fra(indice * 42 + 1250, scopri);
  });

  /* rete di sicurezza: comunque vada, dopo 5s la pagina è scoperta */
  setTimeout(scopri, 5000);
})();

/* l'anno del copyright si aggiorna da solo */
(function () {
  var a = document.getElementById('anno');
  if (a) a.textContent = new Date().getFullYear();
})();
