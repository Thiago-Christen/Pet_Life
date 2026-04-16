document.querySelectorAll(".js-edit-toggle").forEach((button) => {
    button.addEventListener("click", () => {
        const form = document.getElementById(button.dataset.target);
        if (!form) return;

        const fields = form.querySelectorAll("input:not([type='hidden'])");
        const saveBtn = form.querySelector(".js-save-btn");

        const isDisabled = [...fields].every(field => field.disabled);

        fields.forEach(field => field.disabled = !isDisabled);

        if (saveBtn) saveBtn.disabled = !isDisabled;

        button.innerHTML = isDisabled
            ? '<i class="fa-solid fa-ban"></i> Bloquear edição'
            : '<i class="fa-solid fa-pen"></i> ' + (form.id === "account-form" ? "Editar dados" : "Editar config.");
    });
});


const errorModal = document.getElementById("error-modal");
const errorText = document.getElementById("error-text");
const errorOk = document.getElementById("error-ok");

function showError(message) {
  errorText.textContent = message;
  errorModal.classList.remove("hidden");

  errorOk.onclick = () => {
    errorModal.classList.add("hidden");
  };
}

document.getElementById("delete-account-btn")?.addEventListener("click", () => {
  const modal = document.getElementById("confirm-modal");

  modal.classList.remove("hidden");

  return new Promise((resolve) => {
    document.getElementById("confirm-close").onclick = () => {
        document.getElementById("confirm-modal").classList.add("hidden");
    };
    document.getElementById("confirm-yes").onclick = async () => {
      modal.classList.add("hidden");

      const response = await fetch("/profile_delete", { method: "DELETE" });
      const data = await response.json();

      if (data.success) {
        window.location.href = "/login";
      } else {
        showError(data.error || "Não foi possível excluir a conta.");
      }

      resolve(true);
    };

    document.getElementById("confirm-no").onclick = () => {
      modal.classList.add("hidden");
      resolve(false);
    };
  });
});