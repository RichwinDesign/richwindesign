/* ===========================================================
   RICHWINDESIGN – EFEU-PORTAL ANIMATION / TESTVERSION 01
   Betrifft ausschließlich links/links.html.
   =========================================================== */

(() => {
  'use strict';

  // 01 – Einstellungen (hier kannst du später die Wirkung anpassen)
  const SETTINGS = {
    desktopLeaves: 260,       // viele kleine statt weniger riesiger Blätter
    mobileLeaves: 140,
    desktopSize: [45, 76],    // Blattgröße in Pixeln (klein bis groß)
    mobileSize: [32, 53],
    openDuration: 3300,      // Dauer der Öffnung in Millisekunden
    closeDuration: 1650,     // Dauer der Schließung
    survivingLeaves: 0.46,  // Anteil sichtbarer Blätter in den Ecken
    assetFolder: '../images/links/efeublaetter/'
  };

  // Portalwelten: erster Klick öffnet die Vorschau; der zweite betritt die Welt.
  // Capture-Handler läuft vor dem bestehenden Efeu-Navigationshandler.
  const portalStone = document.querySelector('.stone--portal');
  const portalHint = document.getElementById('portal-hint');
  if (portalStone) {
    portalStone.addEventListener('click', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (portalStone.classList.contains('is-portal-open')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      portalStone.classList.add('is-portal-open');
      portalStone.setAttribute('aria-expanded', 'true');
      portalStone.setAttribute('aria-label', 'Portalwelten betreten');
      if (portalHint) portalHint.textContent = 'Portal geöffnet – erneut auf Portalwelten klicken, um einzutreten.';
    }, true);
  }

  const overlay = document.getElementById('ivy-overlay');
  const leafContainer = document.getElementById('ivy-leaves');
  const skipButton = document.getElementById('skip-intro');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!overlay || !leafContainer || reduceMotion) return;

  let isClosing = false;
  let openTimer = null;

  // 02 – Reproduzierbare Zufallszahlen für ruhigen, gleichmäßigen Efeu
  function randomGenerator(seed) {
    return () => {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  const rnd = randomGenerator(20261114);
  const range = (min, max) => min + rnd() * (max - min);
  const clamp = (num, min, max) => Math.max(min, Math.min(max, num));

  // 03 – Blätter erzeugen und ihre Start-/Endpositionen festlegen
  function buildIvy() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const smallScreen = vw < 700;
    const total = smallScreen ? SETTINGS.mobileLeaves : SETTINGS.desktopLeaves;
    const sizes = smallScreen ? SETTINGS.mobileSize : SETTINGS.desktopSize;
    const cols = Math.ceil(Math.sqrt(total * vw / vh));
    const rows = Math.ceil(total / cols);
    const cellW = vw / cols;
    const cellH = vh / rows;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < total; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const size = range(...sizes);
      const leaf = document.createElement('img');
      const variant = String((i * 7 + 3) % 20 + 1).padStart(2, '0');
      leaf.src = `${SETTINGS.assetFolder}efeu_blatt_${variant}.webp`;
      leaf.alt = '';
      leaf.decoding = 'async';
      leaf.draggable = false;
      leaf.className = 'ivy-leaf';

      // Geschlossen: dichtes, leicht versetztes Blätterfeld.
      const closedX = (col + .5) * cellW - size / 2 + range(-cellW * .5, cellW * .5);
      const closedY = (row + .5) * cellH - size / 2 + range(-cellH * .5, cellH * .5);

      // Offen: dichte, kleinere Efeu-Gruppen NUR in den vier Ecken.
      // Keine frei schwebenden Blätter auf Logo oder Steinblöcken.
      const corner = i % 4;
      const isLeft = corner === 0 || corner === 2;
      const isTop = corner < 2;
      const maxReachX = Math.min(vw * .22, 225);
      const maxReachY = Math.min(vh * .19, 175);
      const spread = Math.pow(rnd(), 1.8);
      const horizontal = range(-size * .38, maxReachX * spread);
      const vertical = range(-size * .38, maxReachY * spread);
      const openX = isLeft ? horizontal : vw - size - horizontal;
      const openY = isTop ? vertical : vh - size - vertical;
      const keep = rnd() < SETTINGS.survivingLeaves;

      leaf.style.setProperty('--size', `${size.toFixed(1)}px`);
      leaf.style.setProperty('--closed-x', `${closedX.toFixed(1)}px`);
      leaf.style.setProperty('--closed-y', `${closedY.toFixed(1)}px`);
      leaf.style.setProperty('--closed-rot', `${range(-180, 180).toFixed(0)}deg`);
      leaf.style.setProperty('--closed-scale', range(.9, 1.2).toFixed(2));
      leaf.style.setProperty('--open-x', `${openX.toFixed(1)}px`);
      leaf.style.setProperty('--open-y', `${openY.toFixed(1)}px`);
      leaf.style.setProperty('--open-rot', `${range(-120, 120).toFixed(0)}deg`);
      leaf.style.setProperty('--open-scale', range(.58, .94).toFixed(2));
      leaf.style.setProperty('--open-opacity', keep ? range(.65, 1).toFixed(2) : '0');
      // Mitte öffnet zuerst; Blattbewegungen sind zeitlich leicht gestaffelt.
      const nx = (closedX + size / 2) / vw - .5;
      const ny = (closedY + size / 2) / vh - .5;
      const distance = Math.sqrt(nx * nx + ny * ny);
      leaf.style.setProperty('--delay', `${Math.round(distance * 260 + rnd() * 150)}ms`);
      leaf.style.setProperty('--close-delay', `${Math.round((.7 - clamp(distance, 0, .7)) * 170)}ms`);
      fragment.appendChild(leaf);
    }

    leafContainer.replaceChildren(fragment);
  }

  // 04 – Beim Laden: kurz vollständig geschlossen, dann spiralförmig öffnen
  function startOpening() {
    buildIvy();
    document.body.classList.add('ivy-ready');
    document.body.classList.remove('ivy-closing', 'ivy-open');
    skipButton.hidden = false;

    // Doppelte Frames stellen sicher, dass Chrome den geschlossenen Zustand zeichnet.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!isClosing) document.body.classList.add('ivy-open');
    }));

    openTimer = window.setTimeout(() => { skipButton.hidden = true; }, SETTINGS.openDuration + 350);
  }

  skipButton.addEventListener('click', () => {
    document.body.classList.add('ivy-open');
    // Animation sofort beenden, weiterhin Efeu in den Ecken sichtbar.
    leafContainer.style.transition = 'none';
    leafContainer.querySelectorAll('.ivy-leaf').forEach((leaf) => {
      leaf.style.transition = 'none';
    });
    document.querySelector('.ivy-darkness').style.transition = 'none';
    skipButton.hidden = true;
  });

  // 05 – Link anklicken: Efeu schließt, erst danach erfolgt der Seitenwechsel
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-portal-transition]');
    if (!link || event.defaultPrevented) return;
    if (isClosing) { event.preventDefault(); return; }
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    const destination = new URL(link.href, window.location.href);
    // Externe Links wie Ko-fi dürfen ebenfalls durch den Portalvorhang wechseln.
    event.preventDefault();
    isClosing = true;
    window.clearTimeout(openTimer);
    skipButton.hidden = true;
    document.body.classList.add('is-travelling');
    document.body.classList.remove('ivy-open');
    document.body.classList.add('ivy-closing');

    // Falls vorher „Überspringen“ genutzt wurde: Übergänge reaktivieren.
    leafContainer.querySelectorAll('.ivy-leaf').forEach((leaf) => { leaf.style.transition = ''; });
    document.querySelector('.ivy-darkness').style.transition = '';
    window.setTimeout(() => { window.location.assign(destination.href); }, SETTINGS.closeDuration + 230);
  });

  // 06 – Browser-Zurück: keinen festhängenden geschlossenen Vorhang anzeigen
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      isClosing = false;
      document.body.classList.remove('is-travelling', 'ivy-closing');
      startOpening();
    }
  });

  startOpening();
})();
