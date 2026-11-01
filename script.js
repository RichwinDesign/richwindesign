document.addEventListener("DOMContentLoaded", () => {
  const aiButtons = document.querySelectorAll(".ai-label");
  const aiModal = document.getElementById("aiModal");
  const aiModalClose = document.getElementById("aiModalClose");
  const aiModalBackdrop = document.querySelector(".ai-modal-backdrop");

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
