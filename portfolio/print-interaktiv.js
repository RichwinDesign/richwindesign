/* Printmedien – interaktive Projektmodule (ohne externe Bibliotheken) */
(() => {
  'use strict';
  const root = document.querySelector('.print-interactive-showcase');
  if (!root) return;

  // Vorher/Nachher: 50 % als Ausgangspunkt, per Tastatur und Maus verschiebbar.
  root.querySelectorAll('.print-compare').forEach(box => {
    const slider = box.querySelector('input[type="range"]');
    const update = () => box.style.setProperty('--compare-position', `${slider.value}%`);
    slider.addEventListener('input', update);
    update();
  });

  // Bildergalerien: Pfeile, Punkte, Tastaturfokus und optionaler automatischer Wechsel.
  root.querySelectorAll('.print-yellow-carousel, .print-carservice-carousel').forEach(box => {
    const slides = [...box.querySelectorAll('.print-carousel-slide')];
    const dots = box.querySelector('.print-carousel-dots');
    const counter = box.querySelector('.print-carousel-counter');
    let index = 0;
    let timer = null;
    const buttons = slides.map((_, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'print-carousel-dot';
      btn.setAttribute('aria-label', `Ansicht ${idx + 1} zeigen`);
      btn.addEventListener('click', () => { show(idx); restart(); });
      if (dots) dots.append(btn);
      return btn;
    });
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-current', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      buttons.forEach((btn, i) => {
        const active = i === index;
        btn.classList.toggle('is-current', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      if (counter) counter.textContent = `${index + 1} / ${slides.length}`;
    }
    function stop() { if (timer !== null) { clearInterval(timer); timer = null; } }
    function start() {
      if (box.dataset.auto !== 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      stop();
      timer = setInterval(() => { if (!document.hidden) show(index + 1); }, Number(box.dataset.interval || 4400));
    }
    function restart() { stop(); start(); }
    const previous = box.querySelector('.print-carousel-prev');
    const next = box.querySelector('.print-carousel-next');
    if (previous) previous.addEventListener('click', () => { show(index - 1); restart(); });
    if (next) next.addEventListener('click', () => { show(index + 1); restart(); });
    if (!box.classList.contains('print-carservice-carousel')) {
      box.addEventListener('mouseenter', stop);
      box.addEventListener('mouseleave', start);
      box.addEventListener('focusin', stop);
      box.addEventListener('focusout', event => { if (!box.contains(event.relatedTarget)) start(); });
    }
    show(0); start();
  });

  // Farbvarianten: das jeweils gewählte Fahrzeugbild austauschen.
  const picker = root.querySelector('.print-color-picker');
  if (picker) {
    const image = picker.querySelector('.print-color-stage img');
    const choices = [...picker.querySelectorAll('.print-color-option')];
    choices.forEach(button => button.addEventListener('click', () => {
      if (button.classList.contains('is-active')) return;
      choices.forEach(choice => {
        const active = choice === button;
        choice.classList.toggle('is-active', active);
        choice.setAttribute('aria-pressed', String(active));
      });
      image.classList.add('is-changing');
      image.src = '../images/portfolio/print/' + button.dataset.image;
      image.alt = button.dataset.alt;
      const reset = () => image.classList.remove('is-changing');
      if (image.complete) reset();
      else { image.addEventListener('load', reset, { once:true }); image.addEventListener('error', reset, { once:true }); }
    }));
  }
})();
