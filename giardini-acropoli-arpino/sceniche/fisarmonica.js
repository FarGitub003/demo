/* fisarmonica — l'apertura e' tutta in CSS (flex-grow): lo script serve solo
   a rendere i pannelli raggiungibili da tastiera e a dichiararne lo stato. */
(function () {
if (!window.FM) return;
FM.scenica('fisarmonica', function (el, o) {
  var n = FM.num;
  el.classList.add('fmx-fisarmonica');
  el.style.setProperty('--fmx-apri', n(o.apri, 3.2));
  var pan = FM.lista(':scope > *', el);
  pan.forEach(function (p) {
    if (!p.querySelector('a,button,input,select,textarea') && p.tabIndex < 0) p.tabIndex = 0;
  });
  return { ferma: function () {
    el.classList.remove('fmx-fisarmonica');
    el.style.removeProperty('--fmx-apri');
  } };
});
})();
