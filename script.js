
document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     KI-HINWEISE
     ========================================= */

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

    aiButtons.forEach((button) => {
      button.addEventListener("click", openAiModal);
    });

    aiModalClose.addEventListener("click", closeAiModal);
    aiModalBackdrop.addEventListener("click", closeAiModal);

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        aiModal.classList.contains("is-open")
      ) {
        closeAiModal();
      }
    });
  }


  /* =========================================
     FOTOGRAFIE – BILDVERGLEICH 1
     ========================================= */

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


  /* =========================================
     ZENTRALE NAVIGATION – DATEIPFADE
     ========================================= */

  const scriptElement = [
    ...document.querySelectorAll("script[src]")
  ].find((element) =>
    /(?:^|\/)script\.js(?:[?#].*)?$/.test(
      element.getAttribute("src") || ""
    )
  );

  const scriptURL = scriptElement
    ? new URL(scriptElement.getAttribute("src"), document.baseURI)
    : new URL("script.js", document.baseURI);

  const url = (path) => new URL(path, scriptURL).href;
  const rootPath = new URL("./", scriptURL).pathname;

  const currentPath = window.location.pathname;
  const relativePath = currentPath.startsWith(rootPath)
    ? currentPath.slice(rootPath.length)
    : currentPath;


  /* =========================================
     WEBSITE-BEREICH ERKENNEN
     ========================================= */

  function getPageArea(path) {

    if (
      path === "portale.html" ||
      path.startsWith("portale/")
    ) {
      return "portale";
    }

    if (
      path === "genealogie.html" ||
      path.startsWith("genealogie/")
    ) {
      return "genealogie";
    }

    if (
      path === "ueber-mich.html" ||
      path.startsWith("ueber-mich/")
    ) {
      return "ueber-mich";
    }

    if (
      path === "kontakt.html" ||
      path.startsWith("kontakt/")
    ) {
      return "kontakt";
    }

    return "portfolio";
  }

  const activePage = getPageArea(relativePath);
  document.body.dataset.page = activePage;

  const homeURL = url("index.html");
  const aboutURL = url("ueber-mich/ueber-mich.html");
  const contactURL = url("kontakt/kontakt.html");


  /* =========================================
     INTERNE RÜCKSPRUNGZIELE
     ========================================= */

  function getInternalDestination(address) {

    if (!address) return null;

    try {
      const destination = new URL(address, window.location.href);

      if (destination.origin !== window.location.origin) {
        return null;
      }

      if (!destination.pathname.startsWith(rootPath)) {
        return null;
      }

      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return null;
      }

      const path = destination.pathname.slice(rootPath.length);

      if (!path) return null;

      if (
        activePage === "ueber-mich" &&
        (
          path === "ueber-mich.html" ||
          path.startsWith("ueber-mich/")
        )
      ) {
        return null;
      }

      if (
        activePage === "kontakt" &&
        (
          path === "kontakt.html" ||
          path.startsWith("kontakt/")
        )
      ) {
        return null;
      }

      return destination.href;

    } catch (error) {
      return null;
    }
  }


  /* =========================================
     HERKUNFT FÜR ÜBER MICH & KONTAKT MERKEN
     ========================================= */

  const aboutOriginKey = "richwindesign-about-origin";
  const contactOriginKey = "richwindesign-contact-origin";

  document.addEventListener("click", (event) => {

    const link = event.target.closest("a[href]");

    if (!link) return;

    let destination;

    try {
      destination = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }

    if (destination.origin !== window.location.origin) {
      return;
    }

    try {

      if (
        destination.pathname === new URL(aboutURL).pathname &&
        activePage !== "ueber-mich"
      ) {
        sessionStorage.setItem(
          aboutOriginKey,
          window.location.href
        );
      }

      if (
        destination.pathname === new URL(contactURL).pathname &&
        activePage !== "kontakt"
      ) {
        sessionStorage.setItem(
          contactOriginKey,
          window.location.href
        );
      }

    } catch (error) {
      // Die Navigation funktioniert auch ohne Session-Speicher.
    }
  });


  /* =========================================
     ZURÜCKZIEL BESTIMMEN
     ========================================= */

  function getBackDestination() {

    const referrer = getInternalDestination(document.referrer);

    if (referrer) {
      return referrer;
    }

    if (
      activePage === "ueber-mich" ||
      activePage === "kontakt"
    ) {

      const storageKey = activePage === "ueber-mich"
        ? aboutOriginKey
        : contactOriginKey;

      try {
        const remembered = getInternalDestination(
          sessionStorage.getItem(storageKey)
        );

        if (remembered) {
          return remembered;
        }
      } catch (error) {
        // Kein gespeicherter Rücksprung vorhanden.
      }
    }

    if (
      activePage === "portale" &&
      relativePath.startsWith("portale/")
    ) {
      return url("portale.html");
    }

    return null;
  }

  const backDestination = getBackDestination();


  /* =========================================
     HAUPTNAVIGATION – LINKS
     ========================================= */

  function navLink(label, target, key) {

    const active = activePage === key;

    return `
      <a
        href="${url(target)}"
        data-nav="${key}"
        ${active ? 'class="active" aria-current="page"' : ""}
      >
        ${label}
      </a>
    `;
  }


  /* =========================================
     MENÜ NACH WEBSITE-BEREICH
     ========================================= */

  let navigationHTML = "";

  if (activePage === "portfolio") {

    // STARTSEITE:
    // NUR PORTFOLIO, ÜBER MICH UND KONTAKT

    navigationHTML = `
      ${navLink("Portfolio", "index.html#portfolio", "portfolio")}
      ${navLink("Über mich", "ueber-mich/ueber-mich.html", "ueber-mich")}
      ${navLink("Kontakt", "kontakt/kontakt.html", "kontakt")}
    `;

  } else if (activePage === "portale") {

    // PORTALE: UNVERÄNDERT

    navigationHTML = `
      ${navLink("Portale", "portale.html", "portale")}
      ${navLink("Kontakt", "kontakt/kontakt.html", "kontakt")}
    `;

  } else if (activePage === "genealogie") {

    // GENEALOGIE: UNVERÄNDERT

    navigationHTML = `
      ${navLink("Genealogie", "genealogie.html", "genealogie")}
      ${navLink("Kontakt", "kontakt/kontakt.html", "kontakt")}
    `;

  } else if (activePage === "ueber-mich") {

    // ÜBER MICH: UNVERÄNDERT

    navigationHTML = `
      ${navLink("Über mich", "ueber-mich/ueber-mich.html", "ueber-mich")}
      ${navLink("Kontakt", "kontakt/kontakt.html", "kontakt")}
    `;

  } else if (activePage === "kontakt") {

    // KONTAKT: UNVERÄNDERT

    navigationHTML = `
      ${navLink("Kontakt", "kontakt/kontakt.html", "kontakt")}
    `;
  }


  /* =========================================
     ZENTRALEN HEADER ERZEUGEN
     ========================================= */

  const header = document.createElement("header");
  header.className = "site-header";

  let logoDestination = homeURL;

  if (activePage === "portale") {
    logoDestination = url("portale.html");
  }

  if (activePage === "genealogie") {
    logoDestination = url("genealogie.html");
  }

  if (activePage === "ueber-mich") {
    logoDestination = backDestination || aboutURL;
  }

  if (activePage === "kontakt") {
    logoDestination = backDestination || contactURL;
  }

  header.innerHTML = `
    <div class="header-inner">

      <a
        class="header-logo"
        href="${logoDestination}"
        aria-label="Zur Bereichsübersicht"
      >
        BR
      </a>

      <nav class="main-nav" aria-label="Hauptnavigation">
        ${navigationHTML}
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


  /* =========================================
     HEADER EINSETZEN
     ========================================= */

  const existingHeader = document.querySelector("header.site-header");
  const placeholder = document.getElementById("site-header");

  if (placeholder) {

    placeholder.replaceWith(header);

    if (existingHeader) {
      existingHeader.remove();
    }

  } else if (existingHeader) {

    existingHeader.replaceWith(header);

  } else {

    document.body.insertBefore(
      header,
      document.querySelector("main") || document.body.firstChild
    );
  }


  /* =========================================
     MEGA-MENÜ – EINTRÄGE
     ========================================= */

  const mainNav = header.querySelector(".main-nav");

  const item = (label, path, icon = "◇") =>
    path
      ? `
        <a class="mega-link" href="${url(path)}">
          <span class="mega-link-icon" aria-hidden="true">${icon}</span>
          <span>${label}</span>
        </a>
      `
      : `
        <span
          class="mega-link mega-link-pending"
          aria-disabled="true"
          title="Seite noch in Arbeit"
        >
          <span class="mega-link-icon" aria-hidden="true">${icon}</span>
          <span>${label}</span>
          <small>geplant</small>
        </span>
      `;


  /* =========================================
     PORTAL-EINTRÄGE
     FÜR DIE BESTEHENDE PORTALE-SEITE
     ========================================= */

  const portalItems = [
    item("Portal-Merch", "portale/portal-merch.html", "✧"),
    item("Portal 01", "portale/portal-01.html"),
    item("Portal 02", "portale/portal-02.html"),
    item("Portal 03", "portale/portal-03.html"),
    item("Portal 04", "portale/portal-04.html"),
    item("Portal 05", "portale/portal-05.html")
  ].join("");


  /* =========================================
     PORTFOLIO-EINTRÄGE
     ========================================= */

  const portfolioItems = [
    item("Motion & Visuals", "portfolio/motion-visuals.html", "▣"),
    item("Print Medien", "portfolio/print-medien.html", "▤"),
    item("Landing Pages", "portfolio/landing-pages.html", "▱"),
    item("Fotografie", "portfolio/fotografie.html", "◎")
  ].join("");


  /* =========================================
     GENEALOGIE-EINTRÄGE
     FÜR DIE BESTEHENDE GENEALOGIE-SEITE
     ========================================= */

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
      <div class="mega-group-title">
        <a
          href="${url("genealogie/bildarchiv/bildarchiv.html")}"
          style="color: inherit; text-decoration: none;"
        >Bildarchiv</a>
      </div>
    </div>
  `;


  /* =========================================
     NEUES PORTFOLIO-DROPDOWN
     NUR FÜR DIE STARTSEITE
     ========================================= */

  const portfolioDropdown = `
    <div class="mega-column mega-portfolio-column">

      <div class="mega-heading">Portfolio</div>

      ${portfolioItems}

      <!-- PORTALE -->

      <details class="mega-portfolio-group">

        <summary>Portale</summary>

        <div class="mega-portfolio-children">

          ${item("Alle Portale", "portale.html", "◈")}

          <details class="mega-portfolio-group mega-portfolio-subgroup">

            <summary>Portal-Merch</summary>

            <div class="mega-portfolio-children">

              ${item("Alle Produkte", "portale/portal-merch.html", "✧")}
              ${item("Sticker", "portale/merch/sticker.html")}
              ${item("Anhänger", "portale/merch/anhaenger.html")}
              ${item("Acrylaufsteller", "portale/merch/aufsteller.html")}
              ${item("Pins", "portale/merch/pins.html")}
              ${item("Magnete", "portale/merch/magnete.html")}
              ${item("Prints", "portale/merch/prints.html")}

            </div>

          </details>

          ${item("Portal 01", "portale/portal-01.html")}
          ${item("Portal 02", "portale/portal-02.html")}
          ${item("Portal 03", "portale/portal-03.html")}
          ${item("Portal 04", "portale/portal-04.html")}
          ${item("Portal 05", "portale/portal-05.html")}

        </div>

      </details>


      <!-- GENEALOGIE -->

      <details class="mega-portfolio-group">

        <summary>Genealogie</summary>

        <div class="mega-portfolio-children">

          ${item("Genealogie – Übersicht", "genealogie.html", "❖")}

          <div class="mega-portfolio-section-title">
            Familienlinie
          </div>

          <div class="mega-portfolio-children">
            ${item("Linie Richwin", null)}
            ${item("Linie Schmidt", null)}
            ${item("Linie Klotz", null)}
            ${item("Linie Nielebock", null)}
          </div>

          <div class="mega-portfolio-section-title">
            Personenverzeichnis
          </div>

          <div class="mega-portfolio-children">
            ${item("Namensverzeichnis", null)}
          </div>

          <div class="mega-portfolio-section-title">
            Familienregister
          </div>

          <div class="mega-portfolio-children">
            ${item("Familiennummern 1 bis 200", null)}
            ${item("Familiennummern 201 bis 400", null)}
          </div>

          ${item(
            "Bildarchiv",
            "genealogie/bildarchiv/bildarchiv.html",
            "▣"
          )}

        </div>

      </details>

    </div>
  `;


  /* =========================================
     MEGA-MENÜ – VORSCHAU
     ========================================= */

  const preview = (image, title, description, target) => `
    <a class="mega-preview" href="${url(target)}">
      <img
        src="${url(image)}"
        alt="${title} – Vorschau"
        loading="lazy"
      >
      <strong>${title}</strong>
      <span>${description}</span>
      <b aria-hidden="true">→</b>
    </a>
  `;


  /* =========================================
     MEGA-MENÜ – INHALTE
     ========================================= */

  const panels = {

    /* NUR DIE STARTSEITE HAT DAS NEUE MENÜ */

    portfolio: portfolioDropdown,


    /* PORTALE-SEITE: BISHERIGES MENÜ */

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
        ${preview(
          "images/portale/portal_merch.png",
          "Portal-Merch",
          "Kleine Welten zum Mitnehmen.",
          "portale/portal-merch.html"
        )}
      </div>
    `,


    /* GENEALOGIE-SEITE: BISHERIGES MENÜ */

    genealogie: `
      <div class="mega-column">
        <div class="mega-heading">Familienforschung</div>
        ${item("Genealogie – Übersicht", "genealogie.html", "❖")}
        ${genealogyItems}
      </div>

      <div class="mega-column mega-column-preview">
        ${preview(
          "images/general/Hero_Genealogie.webp",
          "Genealogie",
          "Familienlinien, Archive und historische Spuren.",
          "genealogie.html"
        )}
      </div>
    `,


    /* KONTAKT-SEITE: BISHERIGES MENÜ */

    kontakt: `
      <div class="mega-column">
        <div class="mega-heading">Kontakt &amp; Rechtliches</div>
        ${item("Kontakt", "kontakt/kontakt.html", "✉")}
        ${item("Impressum", "kontakt/impressum.html", "§")}
        ${item("Datenschutzerklärung", "kontakt/datenschutz.html", "§")}
      </div>
    `
  };


  /* =========================================
     MEGA-MENÜ – GRUNDFUNKTION
     ========================================= */

  const triggers = [
    ...mainNav.querySelectorAll("a[data-nav]")
  ];

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

    if (currentMenu !== name) {
      panel.innerHTML = panels[name];
    }

    currentMenu = name;
    panel.dataset.menu = name;
    panel.hidden = false;

    header.classList.add("mega-open");

    triggers.forEach((link) => {
      const active = link.dataset.nav === name;

      link.classList.toggle("mega-hovered", active);
      link.setAttribute("aria-expanded", String(active));
    });
  }


  /* =========================================
     MEGA-MENÜ – HOVER UND TOUCH
     ========================================= */

  triggers.forEach((link) => {

    const name = link.dataset.nav;

    if (!name || !panels[name]) {
      link.addEventListener("mouseenter", closeMenu);
      link.addEventListener("focus", closeMenu);
      return;
    }

    link.classList.add("mega-trigger");
    link.setAttribute("aria-controls", panel.id);
    link.setAttribute("aria-expanded", "false");

    link.addEventListener("mouseenter", () => openMenu(name));
    link.addEventListener("focus", () => openMenu(name));

    link.addEventListener("touchstart", (event) => {
      if (currentMenu !== name) {
        event.preventDefault();
        openMenu(name);
      }
    }, { passive: false });
  });

  header.addEventListener("mouseleave", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!header.contains(event.target)) {
      closeMenu();
    }
  });


  /* =========================================
     PORTFOLIO-MENÜ – EIGENES DESIGN
     GILT NUR FÜR DAS PORTFOLIO-DROPDOWN
     ========================================= */

  const portfolioMenuStyle = document.createElement("style");

  portfolioMenuStyle.textContent = `

    #richwin-mega-menu[data-menu="portfolio"] {
      box-sizing: border-box;
      width: min(420px, calc(100vw - 32px));
      max-width: calc(100vw - 32px);
      max-height: min(75vh, 680px);
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: #476a7d #0a141d;
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-column {
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      max-width: 100%;
      flex: 1 1 100%;
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-group {
      display: block;
      margin-top: 8px;
      border-top: 1px solid rgba(111, 182, 217, .18);
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-group > summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 12px 4px;
      color: #eaf5fa;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.4;
      list-style: none;
      cursor: pointer;
      user-select: none;
    }

    #richwin-mega-menu[data-menu="portfolio"] summary::-webkit-details-marker {
      display: none;
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-group > summary::after {
      content: "⌄";
      color: #8bc9e7;
      font-size: 18px;
      font-weight: 400;
      line-height: 1;
      transition: transform .2s ease;
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-group[open] > summary::after {
      transform: rotate(180deg);
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-group > summary:hover {
      color: #8bc9e7;
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-group > summary:focus-visible {
      outline: 2px solid #8bc9e7;
      outline-offset: 2px;
      border-radius: 4px;
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-children {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 2px;
      min-width: 0;
      margin: 0 0 10px 12px;
      padding-left: 12px;
      border-left: 1px solid rgba(111, 182, 217, .22);
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-children .mega-link {
      width: 100%;
      box-sizing: border-box;
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-subgroup {
      margin: 4px 0;
      border-top: none;
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-subgroup > summary {
      padding: 8px 4px;
      font-size: 12px;
      font-weight: 600;
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-section-title {
      margin: 10px 0 3px;
      padding: 2px 4px;
      color: #d8e8f0;
      font-size: 12px;
      font-weight: 700;
    }

    #richwin-mega-menu[data-menu="portfolio"] .mega-portfolio-section-title
    + .mega-portfolio-children {
      margin-bottom: 5px;
    }

    @media (prefers-reduced-motion: reduce) {
      #richwin-mega-menu[data-menu="portfolio"] summary::after {
        transition: none;
      }
    }

  `;

  document.head.appendChild(portfolioMenuStyle);


  /* =========================================
     ZURÜCK-BUTTON IM SEITENINHALT
     ========================================= */

  if (
    activePage !== "portfolio" &&
    (backDestination || activePage === "kontakt")
  ) {

    let targetContainer = null;

    if (activePage === "ueber-mich") {
      targetContainer = document.querySelector(".about-hero-copy");
    }

    if (activePage === "genealogie") {
      targetContainer = document.querySelector(".genealogy-intro");
    }

    if (activePage === "portale") {
      targetContainer =
        document.querySelector(".portal-intro-inner") ||
        document.querySelector(".portal-detail-hero-text") ||
        document.querySelector(".portal-page main") ||
        document.querySelector("main");
    }

    if (activePage === "kontakt") {
      targetContainer =
        document.querySelector(".contact-heading") ||
        document.querySelector(".legal-heading");
    }

    if (targetContainer) {

      const backLink = document.createElement("a");

      backLink.className = "about-back-link";

      backLink.href = backDestination ||
        (relativePath === "kontakt/kontakt.html" ? homeURL : contactURL);

      backLink.textContent = "← Zurück";

      backLink.setAttribute(
        "aria-label",
        "Zurück zur vorherigen internen Seite"
      );

      targetContainer.insertBefore(
        backLink,
        targetContainer.firstChild
      );
    }
  }


  /* =========================================
     ZURÜCK-BUTTON – GESTALTUNG
     ========================================= */

  const backStyle = document.createElement("style");

  backStyle.textContent = `
    .about-back-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: fit-content;
      min-height: 36px;
      margin: 0 0 24px;
      padding: 9px 16px;
      border: 1px solid rgba(111, 182, 217, 0.5);
      border-radius: 8px;
      background: transparent;
      color: #ffffff;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.3;
      text-decoration: none;
      transition:
        background .25s ease,
        border-color .25s ease,
        box-shadow .25s ease,
        transform .25s ease;
    }

    .about-back-link:hover {
      background: rgba(111, 182, 217, .13);
      border-color: #85c9e5;
      box-shadow: 0 0 16px rgba(111, 182, 217, .15);
      transform: translateX(-2px);
    }

    .main-nav .nav-back-link {
      display: none;
    }
  `;

  document.head.appendChild(backStyle);

});


/* =========================================
   FOTOGRAFIE – BILDVERGLEICH 2
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
