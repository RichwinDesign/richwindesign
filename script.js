document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------------- */
  /* KI POPUP */
  /* -------------------------------- */

  const aiButtons = document.querySelectorAll(".ai-label");
  const aiModal = document.getElementById("aiModal");
  const aiModalClose = document.getElementById("aiModalClose");
  const aiModalBackdrop = document.querySelector(".ai-modal-backdrop");

  if (aiModal && aiModalClose && aiModalBackdrop) {

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
  }


  /* -------------------------------- */
  /* VORHER / NACHHER SLIDER */
  /* -------------------------------- */

  const compareElements = document.querySelectorAll("[data-compare]");

  compareElements.forEach((compare) => {
    const slider = compare.querySelector(".image-compare-slider");
    const overlay = compare.querySelector(".image-compare-overlay");
    const line = compare.querySelector(".image-compare-line");
    const handle = compare.querySelector(".image-compare-handle");

    if (!slider || !overlay || !line || !handle) {
      return;
    }

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

});
