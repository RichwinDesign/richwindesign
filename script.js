
document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------------- */
  /* KI POPUP – BESTEHENDE FUNKTION */
  /* -------------------------------- */
  const aiButtons = document.querySelectorAll(".ai-label");
  const aiModal = document.getElementById("aiModal");
  const aiModalClose = document.getElementById("aiModalClose");
  const aiModalBackdrop = document.querySelector(".ai-modal-backdrop");

  if (aiModal && aiModalClose && aiModalBackdrop) {
    function openAiModal(event) {
      event.preventDefault();
      event.stopPropagation();

      const message = aiModal.querySelector(".ai-modal-window p");

      if (message) {
        message.textContent =
          event.currentTarget.dataset.aiMessage ||
          "Dieses Bild wurde mithilfe generativer KI erstellt.";
      }

      aiModal.classList.add("is-open");
      aiModal.setAttribute("aria-hidden", "false");
    }

    function closeAiModal() {
      aiModal.classList.remove("is-open");
      aiModal.setAttribute("aria-hidden", "true");
    }

    aiButtons.forEach((button) => button.addEventListener("click", openAiModal));
    aiModalClose.addEventListener("click", closeAiModal);
    aiModalBackdrop.addEventListener("click", closeAiModal);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && aiModal.classList.contains("is-open")) {
        closeAiModal();
      }
    });
  }

  /* -------------------------------- */
  /* VORHER / NACHHER – BESTEHEND */
  /* -------------------------------- */
  document.querySelectorAll("[data-compare]").forEach((compare) => {
    const slider = compare.querySelector(".image-compare-slider");
    const overlay = compare.querySelector(".image-compare-overlay");
    const line = compare.querySelector(".image-compare-line");
    const handle = compare.querySelector(".image-compare-handle");

    if (!slider || !overlay || !line || !handle) return;

    function updateCompare(value) {
      overlay.style.width = value + "%";
      line.style.left = value + "%";
      handle.style.left = value + "%";
    }

    updateCompare(slider.value);
    slider.addEventListener("input", () => updateCompare(slider.value));
  });

  /* -------------------------------- */
  /* RICHWIN DESIGN – MEGA-MENÜ */
  /* -------------------------------- */

  // ZENTRALER HEADER:
  // Ersetzt vorhandene Header automatisch.
  // Unterstützt auch <div id="site-header"></div>.
  // Alle Pfade werden von der gemeinsamen script.js aus berechnet.

  const scriptElement = [...document.querySelectorAll("script[src]")].find((el) =>
    /(?:^|\/)script\.js(?:[?#].*)?$/.test(el.getAttribute("src") || "")
  );

  const scriptURL = scriptElement
    ? new URL(scriptElement.getAttribute("src"), document.baseURI)
    : new URL("script.js", document.baseURI);

  const url = (path) => new URL(path, scriptURL).href;

  const currentPath = window.location.pathname;
  const rootPath = new URL("index.html", scriptURL).pathname.replace(/index\.html$/, "");

  const relativePath = currentPath.startsWith(rootPath)
    ? currentPath.slice(rootPath.length)
    : currentPath;

  const activePage = relativePath.startsWith("portale/") || relativePath === "portale.html"
    ? "portale"
    : relativePath === "genealogie.html" || relativePath.startsWith("genealogie/")
      ? "genealogie"
      : relativePath.startsWith("ueber-mich/") || relativePath === "ueber-mich.html"
        ? "ueber-mich"
        : window.location.hash === "#kontakt"
          ? "kontakt"
          : "portfolio";

  const navLink = (label, target, key) => {
    const active = activePage === key;
    return `<a href="${url(target)}"${active ? ' class="active" aria-current="page"' : ""}>${label}</a>`;
  };

  const header = document.createElement("header");
  header.className = "site-header";

  header.innerHTML = `
    <div class="header-inner">
      <a class="header-logo" href="${url("index.html")}" aria-label="Startseite">BR</a>

      <nav class="main-nav" aria-label="Hauptnavigation">
        ${navLink("Portfolio", "index.html#portfolio", "portfolio")}
        ${navLink("Portale", "portale.html", "portale")}
        ${navLink("Genealogie", "genealogie.html", "genealogie")}
        ${navLink("Über mich", "ueber-mich/ueber-mich.html", "ueber-mich")}
        ${navLink("Kontakt", "index.html#kontakt", "kontakt")}
      </nav>

      <div class="social-links">
        <a href="#" aria-label="Weitere Links">+</a>
        <a href="#" aria-label="YouTube">▶</a>
        <a href="#" aria-label="LinkedIn">in</a>
        <a href="#" aria-label="Pinterest">p</a>
        <a href="#" aria-label="Social Media">◉</a>
      </div>
    </div>
  `;

  const existingHeader = document.querySelector("header.site-header");
  const placeholder = document.getElementById("site-header");

  if (placeholder) {
    placeholder.replaceWith(header);
    if (existingHeader) existingHeader.remove();
  } else if (existingHeader) {
    existingHeader.replaceWith(header);
  } else {
    document.body.insertBefore(
      header,
      document.querySelector("main") || document.body.firstChild
    );
  }

  const mainNav = header.querySelector(".main-nav");

  /* -------------------------------- */
  /* DROPDOWN-EINTRÄGE */
  /* -------------------------------- */

  const item = (label, path, icon = "◇") =>
    path
      ? `<a class="mega-link" href="${url(path)}"><span class="mega-link-icon" aria-hidden="true">${icon}</span><span>${label}</span></a>`
      : `<span class="mega-link mega-link-pending" aria-disabled="true" title="Seite noch in Arbeit"><span class="mega-link-icon" aria-hidden="true">${icon}</span><span>${label}</span><small>geplant</small></span>`;

  const portalItems = [
    item("Portal-Merch", "portale/portal-merch.html", "✧"),
    item("Portal 01", "portale/portal-01.html"),
    item("Portal 02", "portale/portal-02.html"),
    item("Portal 03", "portale/portal-03.html"),
    item("Portal 04", "portale/portal-04.html"),
    item("Portal 05", "portale/portal-05.html")
  ].join("");

  const portfolioItems = [
    item("Motion & Visuals", "portfolio/motion-visuals.html", "▣"),
    item("Print Medien", "portfolio/print-medien.html", "▤"),
    item("Landing Pages", "portfolio/landing-pages.html", "▱"),
    item("Fotografie", "portfolio/fotografie.html", "◎"),
    item("Portale", "portale.html", "◈"),
    item("Genealogie", "genealogie.html", "❖")
  ].join("");

  const genealogyItems = `
    <div class="mega-genealogy-group">
      <div class="mega-group-title">Familienlinie</div>
      ${item("Linie Richwin", null)}
      ${item("Linie Schmidt", null)}
      ${item("Linie Klotz", null)}
      ${item("Linie Nielebock", null)}
    </div>

    <div class="mega-genealogy-group">
      <div class="mega-group-title">Personenverzeichnis</div>
      ${item("Namensverzeichnis", null)}
    </div>

    <div class="mega-genealogy-group">
      <div class="mega-group-title">Familienregister</div>
      ${item("Familiennummern 1 bis 200", null)}
      ${item("Familiennummern 201 bis 400", null)}
    </div>

    <div class="mega-genealogy-group">
      <div class="mega-group-title">Bildarchiv</div>
      ${item("Zeichnungen &amp; Gemälde", null)}
    </div>
  `;

  const preview = (image, title, description, target) => `
    <a class="mega-preview" href="${url(target)}">
      <img src="${url(image)}" alt="${title} – Vorschau" loading="lazy">
      <strong>${title}</strong>
      <span>${description}</span>
      <b aria-hidden="true">→</b>
    </a>
  `;

  /* -------------------------------- */
  /* MEGA-MENÜ-INHALTE */
  /* -------------------------------- */

  const panels = {
    portfolio: `
      <div class="mega-column">
        <div class="mega-heading">Portfolio</div>
        ${portfolioItems}
      </div>
      <div class="mega-column">
        <div class="mega-heading">Portale</div>
        ${portalItems}
      </div>
      <div class="mega-column mega-column-preview">
        ${preview("images/portale/portal_03.png", "Portale", "Handbemalte Boxen und eigene Welten.", "portale.html")}
      </div>
    `,

    portale: `
      <div class="mega-column">
        <div class="mega-heading">Portalwelten</div>
        ${portalItems}
      </div>
      <div class="mega-column">
        <div class="mega-heading">Entdecken</div>
        ${item("Alle Portale", "portale.html", "◈")}
        ${item("Sticker", "portale/merch/sticker.html", "✧")}
        ${item("Anhänger", "portale/merch/anhaenger.html", "✧")}
        ${item("Acrylaufsteller", "portale/merch/aufsteller.html", "✧")}
        ${item("Pins", "portale/merch/pins.html", "✧")}
        ${item("Magnete", "portale/merch/magnete.html", "✧")}
        ${item("Prints", "portale/merch/prints.html", "✧")}
      </div>
      <div class="mega-column mega-column-preview">
        ${preview("images/portale/portal_merch.png", "Portal-Merch", "Kleine Welten zum Mitnehmen.", "portale/portal-merch.html")}
      </div>
    `,

    genealogie: `
      <div class="mega-column">
        <div class="mega-heading">Familienforschung</div>
        ${item("Genealogie – Übersicht", "genealogie.html", "❖")}
        ${genealogyItems}
      </div>
      <div class="mega-column mega-column-preview">
        ${preview("images/general/Hero_Genealogie.webp", "Genealogie", "Familienlinien, Archive und historische Spuren.", "genealogie.html")}
      </div>
    `,

    kontakt: `
      <div class="mega-column">
        <div class="mega-heading">Kontakt &amp; Rechtliches</div>
        ${item("Kontakt", "index.html#kontakt", "✉")}
        ${item("Impressum", null, "§")}
        ${item("Datenschutzerklärung", null, "§")}
      </div>
    `
  };

  /* -------------------------------- */
  /* MEGA-MENÜ-STEUERUNG */
  /* -------------------------------- */

  const triggers = [...mainNav.querySelectorAll("a")];
  const menuNames = ["portfolio", "portale", "genealogie", null, "kontakt"];

  const panel = document.createElement("div");
  panel.className = "mega-menu-panel";
  panel.id = "richwin-mega-menu";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Unterseiten");
  header.appendChild(panel);

  let currentMenu = null;

  function closeMenu() {
    currentMenu = null;
    panel.hidden = true;
    panel.innerHTML = "";
    header.classList.remove("mega-open");

    triggers.forEach((link) => {
      link.classList.remove("mega-hovered");
      link.setAttribute("aria-expanded", "false");
    });
  }

  function openMenu(name) {
    if (!name || !panels[name]) {
      closeMenu();
      return;
    }

    if (currentMenu !== name) panel.innerHTML = panels[name];

    currentMenu = name;
    panel.dataset.menu = name;
    panel.hidden = false;
    header.classList.add("mega-open");

    triggers.forEach((link, index) => {
      const active = menuNames[index] === name;
      link.classList.toggle("mega-hovered", active);
      link.setAttribute("aria-expanded", String(active));
    });
  }

  triggers.forEach((link, index) => {
    const name = menuNames[index];
    if (!name) return;

    link.classList.add("mega-trigger");
    link.setAttribute("aria-controls", panel.id);
    link.setAttribute("aria-expanded", "false");

    link.addEventListener("mouseenter", () => openMenu(name));
    link.addEventListener("focus", () => openMenu(name));

    // Auf Touchgeräten öffnet der erste Tap das Menü.
    // Der zweite Tap führt zur jeweiligen Hauptseite.
    link.addEventListener("touchstart", (event) => {
      if (currentMenu !== name) {
        event.preventDefault();
        openMenu(name);
      }
    }, { passive: false });
  });

  const aboutLink = triggers[3];

  if (aboutLink) {
    aboutLink.addEventListener("mouseenter", closeMenu);
    aboutLink.addEventListener("focus", closeMenu);
  }

  header.addEventListener("mouseleave", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("pointerdown", (event) => {
    if (!header.contains(event.target)) closeMenu();
  });
});

/* =========================================
   FOTOGRAFIE – BILDVERGLEICH
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const photoComparisons = document.querySelectorAll(".photo-compare");

  photoComparisons.forEach((compare) => {
    const slider = compare.querySelector(".photo-compare-range");

    if (!slider) return;

    function updatePhotoCompare() {
      compare.style.setProperty("--split", slider.value + "%");
    }

    updatePhotoCompare();
    slider.addEventListener("input", updatePhotoCompare);
  });
});
