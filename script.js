
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

    slider.addEventListener("input", () => {
      updateCompare(slider.value);
    });
  });


  /* =========================================
     ZENTRALE DATEIPFADE
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
      path === "genealogie/genealogie.html" ||
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
     HERKUNFT FÜR ÜBER MICH & KONTAKT
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
      // Navigation funktioniert auch ohne Session-Speicher.
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
     HAUPTNAVIGATION
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

  let navigationHTML = "";

  if (activePage === "portfolio") {

    navigationHTML = `
      ${navLink("Portfolio", "index.html#portfolio", "portfolio")}
      ${navLink("Über mich", "ueber-mich/ueber-mich.html", "ueber-mich")}
      ${navLink("Kontakt", "kontakt/kontakt.html", "kontakt")}
    `;

  } else if (activePage === "portale") {

    navigationHTML = `
      ${navLink("Portale", "portale.html", "portale")}
      ${navLink("Kontakt", "kontakt/kontakt.html", "kontakt")}
    `;

  } else if (activePage === "genealogie") {

    navigationHTML = `
      ${navLink("Genealogie", "genealogie/genealogie.html", "genealogie")}
      ${navLink("Kontakt", "kontakt/kontakt.html", "kontakt")}
    `;

  } else if (activePage === "ueber-mich") {

    navigationHTML = `
      ${navLink("Über mich", "ueber-mich/ueber-mich.html", "ueber-mich")}
      ${navLink("Kontakt", "kontakt/kontakt.html", "kontakt")}
    `;

  } else if (activePage === "kontakt") {

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
    logoDestination = url("genealogie/genealogie.html");
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

      <div class="social-links" aria-label="Social Media">
        <a href="https://www.deviantart.com/richwindesign" target="_blank" rel="noopener noreferrer" aria-label="RichwinDesign auf DeviantArt (öffnet in neuem Tab)">
          <img src="${url("images/general/icons/icon_social_deviantart.webp")}" alt="" width="20" height="20">
        </a>
        <a href="https://www.instagram.com/richwindesign/" target="_blank" rel="noopener noreferrer" aria-label="RichwinDesign auf Instagram (öffnet in neuem Tab)">
          <img src="${url("images/general/icons/icon_social_instagram.webp")}" alt="" width="20" height="20">
        </a>
        <a href="https://www.linkedin.com/in/bianca-christine-richwin/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn-Profil von Bianca Christine Richwin (öffnet in neuem Tab)">
          <img src="${url("images/general/icons/icon_social_linkedin.webp")}" alt="" width="20" height="20">
        </a>
        <a href="https://de.pinterest.com/RichwinDesign/" target="_blank" rel="noopener noreferrer" aria-label="RichwinDesign auf Pinterest (öffnet in neuem Tab)">
          <img src="${url("images/general/icons/icon_social_pinterest.webp")}" alt="" width="20" height="20">
        </a>
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
     MEGA-MENÜ – LINKS
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
     ========================================= */

  const genealogyItems = `
    <div class="mega-genealogy-group">
      <div class="mega-group-title">Familienlinie</div>
      ${item("Linie Richwin", "genealogie/familienlinien/richwin.html")}
      ${item("Linie Schmidt", "genealogie/familienlinien/schmidt.html")}
      ${item("Linie Klotz", "genealogie/familienlinien/klotz.html")}
      ${item("Linie Nielebock", "genealogie/familienlinien/nielebock.html")}
    </div>

    <div class="mega-genealogy-group">
      <div class="mega-group-title">Personenverzeichnis</div>
      ${item("Namensverzeichnis", "genealogie/personenverzeichnis/namensverzeichnis.html")}
    </div>

    <div class="mega-genealogy-group">
      <div class="mega-group-title">Familienregister</div>
      ${item("Familiennummern 1 bis 200", "genealogie/familienregister/familiennummern-001-200.html")}
      ${item("Familiennummern 201 bis 400", "genealogie/familienregister/familiennummern-201-400.html")}
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
     PORTFOLIO-DROPDOWN
     NUR AUF DER STARTSEITE
     ========================================= */

  const portfolioDropdown = `
    <div class="mega-column mega-portfolio-column">

      <div class="mega-heading">Portfolio</div>

      ${portfolioItems}

      <!-- PORTALE -->

      <details class="mega-portfolio-group">

        <summary>
          <a
            class="mega-portfolio-title"
            href="${url("portale.html")}"
            onclick="event.stopPropagation()"
          >Portale</a>

          <span
            class="mega-portfolio-hint"
            aria-label="Unterseiten aufklappen"
          >
            <span>Portal-Merch</span>
            <span>Portal 01</span>
          </span>
        </summary>

        <div class="mega-portfolio-children">

          <details class="mega-portfolio-group mega-portfolio-subgroup">

            <summary>
              <a
                class="mega-portfolio-title"
                href="${url("portale/portal-merch.html")}"
                onclick="event.stopPropagation()"
              >Portal-Merch</a>

              <span
                class="mega-portfolio-hint"
                aria-label="Produkte aufklappen"
              >
                <span>Sticker</span>
                <span>Anhänger</span>
              </span>
            </summary>

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

        <summary>
          <a
            class="mega-portfolio-title"
            href="${url("genealogie/genealogie.html")}"
            onclick="event.stopPropagation()"
          >Genealogie</a>

          <span
            class="mega-portfolio-hint"
            aria-label="Unterseiten aufklappen"
          >
            <span>Familienlinie</span>
            <span>Personenverzeichnis</span>
          </span>
        </summary>

        <div class="mega-portfolio-children">

          <div class="mega-portfolio-section-title">
            Familienlinie
          </div>

          <div class="mega-portfolio-children">
            ${item("Linie Richwin", "genealogie/familienlinien/richwin.html")}
            ${item("Linie Schmidt", "genealogie/familienlinien/schmidt.html")}
            ${item("Linie Klotz", "genealogie/familienlinien/klotz.html")}
            ${item("Linie Nielebock", "genealogie/familienlinien/nielebock.html")}
          </div>

          <div class="mega-portfolio-section-title">
            Personenverzeichnis
          </div>

          <div class="mega-portfolio-children">
            ${item("Namensverzeichnis", "genealogie/personenverzeichnis/namensverzeichnis.html")}
          </div>

          <div class="mega-portfolio-section-title">
            Familienregister
          </div>

          <div class="mega-portfolio-children">
            ${item("Familiennummern 1 bis 200", "genealogie/familienregister/familiennummern-001-200.html")}
            ${item("Familiennummern 201 bis 400", "genealogie/familienregister/familiennummern-201-400.html")}
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

    portfolio: portfolioDropdown,

    portale: `
      <div class="mega-column mega-portfolio-column">
        <div class="mega-heading">Portale</div>
        <div class="mega-portfolio-section-title">
          <a class="mega-portfolio-title" href="${url("portale.html")}">Alle Portale</a>
        </div>

        <details class="mega-portfolio-group">
          <summary>
            <a class="mega-portfolio-title" href="${url("portale/portal-merch.html")}" onclick="event.stopPropagation()">Portal-Merch</a>
            <span class="mega-portfolio-hint" aria-label="Produkte aufklappen">
              <span>Sticker</span><span>Anhänger</span>
            </span>
          </summary>
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
    `,

    genealogie: `
      <div class="mega-column mega-portfolio-column">
        <div class="mega-heading">Genealogie</div>

        <details class="mega-portfolio-group">
          <summary>
            <a class="mega-portfolio-title" href="${url("genealogie/familienlinien/familienlinien.html")}" onclick="event.stopPropagation()">Familienlinien</a>
            <span class="mega-portfolio-hint" aria-label="Familienlinien aufklappen">
              <span>Richwin · Schmidt</span><span>Klotz · Nielebock</span>
            </span>
          </summary>
          <div class="mega-portfolio-children">
            ${item("Linie Richwin", "genealogie/familienlinien/richwin.html")}
            ${item("Linie Schmidt", "genealogie/familienlinien/schmidt.html")}
            ${item("Linie Klotz", "genealogie/familienlinien/klotz.html")}
            ${item("Linie Nielebock", "genealogie/familienlinien/nielebock.html")}
          </div>
        </details>

        <details class="mega-portfolio-group">
          <summary>
            <a class="mega-portfolio-title" href="${url("genealogie/personenverzeichnis/personenverzeichnis.html")}" onclick="event.stopPropagation()">Personenverzeichnis</a>
            <span class="mega-portfolio-hint" aria-label="Personenverzeichnis aufklappen">
              <span>Namensverzeichnis</span><span>Personenlisten A–Z</span>
            </span>
          </summary>
          <div class="mega-portfolio-children">
            ${item("Namensverzeichnis", "genealogie/personenverzeichnis/namensverzeichnis.html")}
            ${item("Personenlisten A–Z", "genealogie/personenverzeichnis/personenverzeichnis.html")}
          </div>
        </details>

        <details class="mega-portfolio-group">
          <summary>
            <a class="mega-portfolio-title" href="${url("genealogie/familienregister/familienregister.html")}" onclick="event.stopPropagation()">Familienregister</a>
            <span class="mega-portfolio-hint" aria-label="Familienregister aufklappen">
              <span>Familiennummern 1 bis 200</span><span>201 bis 400</span>
            </span>
          </summary>
          <div class="mega-portfolio-children">
            ${item("Familiennummern 1 bis 200", "genealogie/familienregister/familiennummern-001-200.html")}
            ${item("Familiennummern 201 bis 400", "genealogie/familienregister/familiennummern-201-400.html")}
          </div>
        </details>

        <div class="mega-portfolio-group mega-simple-link">
          <a class="mega-portfolio-title" href="${url("genealogie/bildarchiv/bildarchiv.html")}">Bildarchiv</a>
        </div>
      </div>
    `,

    kontakt: `
      <div class="mega-column mega-portfolio-column">
        <div class="mega-heading">Kontakt &amp; Rechtliches</div>
        ${item("Kontakt", "kontakt/kontakt.html", "✉")}
        ${item("Impressum", "kontakt/impressum.html", "§")}
        ${item("Datenschutzerklärung", "kontakt/datenschutz.html", "§")}
      </div>
    `
  };


  /* =========================================
     MEGA-MENÜ – FUNKTIONEN
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


  /* =========================================
     NEU: DROPDOWN MITTIG UNTER MENÜPUNKT
     ========================================= */

  function positionMenu() {

    if (!currentMenu || panel.hidden) return;

    const trigger = triggers.find(
      (link) => link.dataset.nav === currentMenu
    );

    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();

    const viewportWidth = document.documentElement.clientWidth;

    const panelRect = panel.getBoundingClientRect();
    const panelWidth = panelRect.width;

    const margin = 12;

    // Alle Dropdowns am jeweiligen Menüpunkt ausrichten

// Innenabstand des Dropdowns aus dem CSS auslesen
const panelPaddingLeft =
  parseFloat(window.getComputedStyle(panel).paddingLeft) || 0;

// Desktop: Text im Dropdown bündig mit Menüpunkt
// Mobil: bisherige zentrierte Position beibehalten

let panelLeft;

if (window.innerWidth > 950) {

  panelLeft = triggerRect.left - panelPaddingLeft;

} else {

  const triggerCenter =
    triggerRect.left + triggerRect.width / 2;

  panelLeft = triggerCenter - panelWidth / 2;

}

    // Verhindert, dass das Dropdown aus dem Bildschirm ragt
    const maxLeft = Math.max(
      margin,
      viewportWidth - panelWidth - margin
    );

    panelLeft = Math.max(
      margin,
      Math.min(panelLeft, maxLeft)
    );

    // Direkt an der Unterkante des Headers
    const panelTop = headerRect.bottom - 1;

    panel.style.setProperty(
      "position",
      "fixed",
      "important"
    );

    panel.style.setProperty(
      "left",
      `${panelLeft}px`,
      "important"
    );

    panel.style.setProperty(
      "top",
      `${panelTop}px`,
      "important"
    );

    panel.style.setProperty(
      "right",
      "auto",
      "important"
    );

    panel.style.setProperty(
      "bottom",
      "auto",
      "important"
    );

    panel.style.setProperty(
      "transform",
      "none",
      "important"
    );

    panel.style.setProperty(
      "z-index",
      "9999",
      "important"
    );
  }


  /* =========================================
     MENÜ SCHLIESSEN
     ========================================= */

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


  /* =========================================
     MENÜ ÖFFNEN
     ========================================= */

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

    // Neue Position unmittelbar berechnen
    positionMenu();
  }


  /* =========================================
     MENÜ BEI GRÖSSENÄNDERUNG NACHFÜHREN
     ========================================= */

  window.addEventListener("resize", positionMenu);

  window.addEventListener(
    "scroll",
    positionMenu,
    { passive: true }
  );

  // Wichtig für Portfolio:
  // Wenn Portale oder Genealogie aufgeklappt werden,
  // verändert sich die Breite des Dropdowns.
  // Es bleibt trotzdem mittig unter Portfolio.

  if ("ResizeObserver" in window) {

    const menuResizeObserver = new ResizeObserver(() => {
      positionMenu();
    });

    menuResizeObserver.observe(panel);
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

    link.addEventListener("mouseenter", () => {
      openMenu(name);
    });

    link.addEventListener("focus", () => {
      openMenu(name);
    });

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
     PORTFOLIO-MENÜ – DESIGN
     ========================================= */

  const portfolioMenuStyle = document.createElement("style");

  portfolioMenuStyle.textContent = `

    /* =========================================
       DYNAMISCHE MENÜBREITE
       ========================================= */

    #richwin-mega-menu {
      box-sizing: border-box;

      width: min(230px, calc(100vw - 24px));
      min-width: min(230px, calc(100vw - 24px));
      max-width: calc(100vw - 24px);

      max-height: min(76vh, 720px);

      overflow-x: hidden;
      overflow-y: auto;

      overscroll-behavior: contain;

      scrollbar-width: thin;
      scrollbar-color: #476a7d #0a141d;

      transition:
        width .25s ease,
        min-width .25s ease;
    }


    /* PORTALE GEÖFFNET */

    #richwin-mega-menu[data-menu="portfolio"]:has(
      .mega-portfolio-group:not(.mega-portfolio-subgroup)[open]
    ) {
      width: min(260px, calc(100vw - 24px));
      min-width: min(260px, calc(100vw - 24px));
    }


    /* GENEALOGIE GEÖFFNET */

    #richwin-mega-menu[data-menu="portfolio"]:has(
      .mega-portfolio-group:not(.mega-portfolio-subgroup):last-child[open]
    ) {
      width: min(310px, calc(100vw - 24px));
      min-width: min(310px, calc(100vw - 24px));
    }


    /* =========================================
       MENÜSPALTE
       ========================================= */

    #richwin-mega-menu
    .mega-portfolio-column {
      box-sizing: border-box;

      display: flex;
      flex-direction: column;
      align-items: stretch;

      width: 100%;
      min-width: 0;
      max-width: 100%;

      flex: 1 1 100%;
    }


    /* =========================================
       PORTFOLIO-LINKS – GRUNDGESTALTUNG
       ========================================= */

    #richwin-mega-menu
    .mega-link {
      box-sizing: border-box;

      display: flex;
      flex-wrap: nowrap;
      align-items: center;

      width: 100%;
      min-width: 0;

      white-space: nowrap;
      line-height: 1.5;

      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;

      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;

      text-decoration: none !important;
      transform: none !important;

      transition:
        color .2s ease,
        text-shadow .2s ease;
    }

    #richwin-mega-menu
    .mega-link > span {
      flex-shrink: 0;
      white-space: nowrap;
    }

    #richwin-mega-menu
    .mega-link > small {
      flex-shrink: 0;
    }


    /* =========================================
       HOVER-KÄSTEN VOLLSTÄNDIG ENTFERNEN
       ========================================= */

    #richwin-mega-menu
    .mega-link:hover,

    #richwin-mega-menu
    .mega-link:focus,

    #richwin-mega-menu
    .mega-link:focus-visible,

    #richwin-mega-menu
    .mega-link:active {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;

      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;

      text-decoration: none !important;
      transform: none !important;
    }


    /* DEKORATIVE RAHMEN ENTFERNEN */

    #richwin-mega-menu
    .mega-link::before,

    #richwin-mega-menu
    .mega-link::after,

    #richwin-mega-menu
    .mega-link:hover::before,

    #richwin-mega-menu
    .mega-link:hover::after {
      content: none !important;
      display: none !important;
      border: none !important;
      box-shadow: none !important;
    }


    /* AUCH INNERE SPANS OHNE HOVER-HINTERGRUND */

    #richwin-mega-menu
    .mega-link span,

    #richwin-mega-menu
    .mega-link:hover span {
      background: transparent !important;
      background-color: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }


    /* =========================================
       HELLBLAUER HOVER-EFFEKT
       ========================================= */

    #richwin-mega-menu
    .mega-link:hover,

    #richwin-mega-menu
    .mega-link:focus-visible {
      color: var(--header-accent, #8bc9e7) !important;

      text-shadow:
        0 0 9px rgba(139, 201, 231, .3);
    }

    #richwin-mega-menu
    .mega-link:hover span,

    #richwin-mega-menu
    .mega-link:focus-visible span {
      color: var(--header-accent, #8bc9e7) !important;
    }


    /* TASTATURFOKUS OHNE KASTEN */

    #richwin-mega-menu
    .mega-link:focus-visible {
      text-decoration: underline !important;
      text-decoration-color: var(--header-accent, #8bc9e7) !important;
      text-underline-offset: 4px;
    }


    /* =========================================
       HAUPTÜBERSCHRIFT
       ========================================= */

    #richwin-mega-menu
    .mega-heading {
      margin-bottom: 13px;
      white-space: nowrap;
    }


    /* =========================================
       TRENNLINIEN ZWISCHEN DEN BEREICHEN
       ========================================= */

    #richwin-mega-menu
    .mega-portfolio-group {
      display: block;

      margin-top: 15px;
      padding-top: 10px;

      border-top:
        1px solid rgba(111, 182, 217, .17);
    }


    /* =========================================
       PORTALE UND GENEALOGIE
       ========================================= */

    #richwin-mega-menu
    .mega-portfolio-group > summary {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      position: relative;
      gap: 7px;

      padding: 6px 6px 12px;

      color: #f1f7fa;
      list-style: none;

      cursor: pointer;
      user-select: none;
    }


    /* =========================================
       STANDARDPFEILE ENTFERNEN
       ========================================= */

    #richwin-mega-menu
    summary::-webkit-details-marker {
      display: none;
    }

    #richwin-mega-menu
    summary::marker {
      content: "";
    }


    /* =========================================
       KLICKBARER TITEL MIT BLAUER LINIE
       ========================================= */

    #richwin-mega-menu
    .mega-portfolio-title {
      display: inline-block;

      padding-bottom: 7px;

      border-bottom:
        2px solid rgba(130, 194, 225, .8);

      color: #f1f7fa;

      font-size: 13px;
      font-weight: 700;
      line-height: 1.4;

      white-space: nowrap;
      text-decoration: none;

      transition:
        color .2s ease,
        border-color .2s ease;
    }


    /* =========================================
       VORSCHAU UNTEREINANDER
       ========================================= */

    #richwin-mega-menu
    .mega-portfolio-hint {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      gap: 3px;
      max-width: 100%;

      color: var(--menu-hint, #7996a7);

      font-size: 10px;
      font-weight: 400;
      line-height: 1.6;

      white-space: nowrap;
      letter-spacing: .015em;
    }


    /* =========================================
       ERSTE VORSCHAU – 80 %
       ========================================= */

    #richwin-mega-menu
    .mega-portfolio-hint > span:first-child {
      opacity: .8;
    }


    /* =========================================
       ZWEITE VORSCHAU – 30 %
       ========================================= */

    #richwin-mega-menu
    .mega-portfolio-hint > span:nth-child(2) {
      opacity: .3;
    }


    /* =========================================
       BEIM AUFKLAPPEN VORSCHAU AUSBLENDEN
       ========================================= */

    #richwin-mega-menu
    .mega-portfolio-group[open] > summary
    .mega-portfolio-hint {
      display: none;
    }


    /* =========================================
       HOVER AUF PORTALE UND GENEALOGIE
       ========================================= */

    #richwin-mega-menu
    .mega-portfolio-group > summary:hover
    .mega-portfolio-title {
      color: var(--header-accent, #8bc9e7);
      border-color: var(--header-accent, #8bc9e7);
    }

    #richwin-mega-menu
    .mega-portfolio-group[open] > summary
    .mega-portfolio-title {
      color: var(--header-accent, #8bc9e7);
      border-color: var(--header-accent, #8bc9e7);
    }

    #richwin-mega-menu
    .mega-portfolio-group > summary:focus-visible {
      outline: 2px solid var(--header-accent, #8bc9e7);
      outline-offset: 3px;
      border-radius: 4px;
    }


    /* =========================================
       AUSGEKLAPPTE UNTERSEITEN
       ========================================= */

    #richwin-mega-menu
    .mega-portfolio-children {
      box-sizing: border-box;

      display: flex;
      flex-direction: column;
      align-items: stretch;

      gap: 3px;
      min-width: 0;

      margin: 0 0 13px 9px;
      padding-left: 15px;

      border-left:
        1px solid rgba(111, 182, 217, .23);
    }

    #richwin-mega-menu
    .mega-portfolio-children .mega-link {
      width: 100%;
      white-space: nowrap;
    }


    /* =========================================
       PORTAL-MERCH
       ========================================= */

    #richwin-mega-menu
    .mega-portfolio-subgroup {
      margin: 6px 0;
      padding-top: 0;
      border-top: none;
    }

    #richwin-mega-menu
    .mega-portfolio-subgroup > summary {
      padding: 6px 4px 10px;
    }

    #richwin-mega-menu
    .mega-portfolio-subgroup
    .mega-portfolio-title {
      font-size: 12px;
      font-weight: 600;

      border-bottom-width: 1px;
    }

    #richwin-mega-menu
    .mega-portfolio-subgroup
    .mega-portfolio-hint {
      font-size: 10px;
    }


    /* =========================================
       GENEALOGIE-UNTERÜBERSCHRIFTEN
       ========================================= */

    #richwin-mega-menu
    .mega-portfolio-section-title {
      margin: 10px 0 3px;
      padding: 2px 4px;

      color: var(--header-accent, #d8e8f0);

      font-size: 12px;
      font-weight: 700;

      white-space: nowrap;
    }

    #richwin-mega-menu
    .mega-portfolio-section-title
    + .mega-portfolio-children {
      margin-bottom: 6px;
    }


    /* =========================================
       SMARTPHONES
       ========================================= */

    @media (max-width: 480px) {

      #richwin-mega-menu {
        width: min(310px, calc(100vw - 20px));
        min-width: 0;
        max-width: calc(100vw - 20px);
      }

      #richwin-mega-menu
      .mega-portfolio-hint {
        font-size: 9px;
      }

      #richwin-mega-menu
      .mega-portfolio-children {
        margin-left: 5px;
        padding-left: 10px;
      }

    }


    /* =========================================
       REDUZIERTE BEWEGUNG
       ========================================= */

    @media (prefers-reduced-motion: reduce) {

      #richwin-mega-menu {
        transition: none;
      }

      #richwin-mega-menu
      .mega-portfolio-title {
        transition: none;
      }

      #richwin-mega-menu
      .mega-link {
        transition: none;
      }

    }

  `;

  document.head.appendChild(portfolioMenuStyle);


  /* =========================================
     ZURÜCK-BUTTON
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
