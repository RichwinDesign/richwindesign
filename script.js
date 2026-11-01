```javascript
document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------------------------------- */
  /* WEBSITE INTRO */
  /* -------------------------------------------------- */

  const siteIntro = document.getElementById("siteIntro");

  if (siteIntro) {
    const introAlreadyShown =
      sessionStorage.getItem("richwinIntroShown");

    if (introAlreadyShown) {
      siteIntro.classList.add("is-hidden");
    } else {
      sessionStorage.setItem("richwinIntroShown", "true");

      window.setTimeout(() => {
        siteIntro.classList.add("is-opening");
      }, 1100);

      window.setTimeout(() => {
        siteIntro.classList.add("is-hidden");
      }, 2100);
    }
  }


  /* -------------------------------------------------- */
  /* KI-POPUP */
  /* -------------------------------------------------- */

  const aiButtons = document.querySelectorAll(".ai-label");
  const aiModal = document.getElementById("aiModal");
  const aiModalClose = document.getElementById("aiModalClose");
  const aiModalBackdrop = document.querySelector(".ai-modal-backdrop");

  // Wenn auf der Seite kein KI-Popup vorhanden ist,
  // muss nichts weiter ausgeführt werden.
  if (!aiModal || !aiModalClose || !aiModalBackdrop) {
    return;
  }

  function openAiModal(event) {
    event.preventDefault();
    event.stopPropagation();

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

});
```
