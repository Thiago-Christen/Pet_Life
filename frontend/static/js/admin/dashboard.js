document.addEventListener("DOMContentLoaded", function () {
    const popup = document.getElementById("appPopup");
const popupCard = document.getElementById("appPopupCard");
const popupClose = document.getElementById("appPopupClose");
const popupIcon = document.getElementById("appPopupIcon");
const popupTitle = document.getElementById("appPopupTitle");
const popupMessage = document.getElementById("appPopupMessage");

function openPopup(type, title, message) {

    popupCard.classList.remove("success", "error");
    popupCard.classList.add(type);

    popupIcon.innerHTML = type === "success"
        ? '<i class="fa-solid fa-circle-check"></i>'
        : '<i class="fa-solid fa-triangle-exclamation"></i>';

    popupTitle.textContent = title;
    popupMessage.textContent = message;

    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
}

function closePopup() {
    popup.classList.remove("show");
    popup.setAttribute("aria-hidden", "true");
}

popupClose?.addEventListener("click", closePopup);

let petIdParaExcluir = null;
let userIdParaExcluir = null;

const deleteConfirmPopupPet = document.getElementById("deleteConfirmPopupPet");
const deleteConfirmPopupPerfil = document.getElementById("deleteConfirmPopupPerfil");
const closeDeleteConfirmPopupPet = document.getElementById("closeDeleteConfirmPopupPet");
const closeDeleteConfirmPopupPerfil = document.getElementById("closeDeleteConfirmPopupPerfil");
const cancelDeletePerfilBtn = document.getElementById("cancelDeletePerfilBtn");
const cancelDeletePetBtn = document.getElementById("cancelDeletePetBtn");
const confirmDeletePerfilBtn = document.getElementById("confirmDeletePerfilBtn");
const confirmDeletePetBtn = document.getElementById("confirmDeletePetBtn");
const deletePopupTextPet = document.getElementById("deletePopupTextPet");
const deletePopupTextPerfil = document.getElementById("deletePopupTextPerfil");

window.abrirPopupDelete = function(petId, petNome) {

    petIdParaExcluir = petId;

    deletePopupTextPet.textContent =
        `Tem certeza que deseja excluir ${petNome}?`;

    deleteConfirmPopupPet.classList.add("show");
    deleteConfirmPopupPet.setAttribute("aria-hidden", "false");
}

function fecharPopupDelete() {

    deleteConfirmPopupPet.classList.remove("show");
    deleteConfirmPopupPet.setAttribute("aria-hidden", "true");

    petIdParaExcluir = null;
}

closeDeleteConfirmPopupPerfil?.addEventListener("click", fecharPopupDelete);

cancelDeletePetBtn?.addEventListener("click", fecharPopupDelete);

deleteConfirmPopupPet?.addEventListener("click", (event) => {

    if(event.target === deleteConfirmPopupPet){
        fecharPopupDelete();
    }

});

confirmDeletePetBtn?.addEventListener("click", async () => {

    if(petIdParaExcluir === null) return;

    try {

        const response = await fetch(`/pet_delete/${petIdParaExcluir}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if(data.success){

            fecharPopupDelete();

            openPopup(
                "success",
                "Pet deletado",
                "O pet foi removido com sucesso."
            );

            setTimeout(() => {
                location.reload();
            }, 1200);

        } else {

            fecharPopupDelete();

            openPopup(
                "error",
                "Erro ao deletar",
                data.error || "Não foi possível remover o pet."
            );

        }

    } catch(error){

        fecharPopupDelete();

        openPopup(
            "error",
            "Erro",
            "Falha ao conectar com o servidor."
        );

    }

});

window.abrirPopupDeleteAccount = function(userId, userName) {

    userIdParaExcluir = userId;

    deletePopupTextPerfil.textContent =
        `Tem certeza que deseja excluir a conta de ${userName}? Esta ação é irreversível.`;

    deleteConfirmPopupPerfil.classList.add("show");
    deleteConfirmPopupPerfil.setAttribute("aria-hidden", "false");
}

function fecharPopupDeleteAccount() {

    deleteConfirmPopupPerfil.classList.remove("show");
    deleteConfirmPopupPerfil.setAttribute("aria-hidden", "true");
    userIdParaExcluir = null;
}

closeDeleteConfirmPopupPerfil?.addEventListener("click", fecharPopupDeleteAccount);

cancelDeletePerfilBtn?.addEventListener("click", fecharPopupDeleteAccount);

deleteConfirmPopupPerfil?.addEventListener("click", (event) => {

    if(event.target === deleteConfirmPopupPerfil){
        fecharPopupDeleteAccount();
    }

});

confirmDeletePerfilBtn?.addEventListener("click", async () => {
    if(userIdParaExcluir === null) return;

    try {
        const response = await fetch(`/user_delete/${userIdParaExcluir}`, {
            method: "DELETE"
        });

        const data = await response.json();
        if(data.success){
            fecharPopupDeleteAccount();
            openPopup(
                "success",
                "Conta deletada",
                "A conta foi removida com sucesso."
            );

            setTimeout(() => {
                location.reload();
            }, 1200);
        } else {
            fecharPopupDeleteAccount();
            openPopup(
                "error",
                "Erro ao deletar",
                data.error || "Não foi possível remover a conta."
            );
        }
    } catch(error){
        fecharPopupDeleteAccount();
        openPopup(
            "error",
            "Erro",
            "Falha ao conectar com o servidor."
        );
    }
});


const rows = document.querySelectorAll(".user-row");

rows.forEach(function (row) {

    row.addEventListener("click", function (e) {

        if (e.target.closest("button")) return;

        const userId = this.getAttribute("data-user");
        const petsRow = document.getElementById("pets-" + userId);

        if (!petsRow) return;

        // TOGGLE com style
        if (petsRow.style.display === "table-row") {
            petsRow.style.display = "none";
        } else {
            petsRow.style.display = "table-row";
        }

    });

});


window.promoverUsuario = async function(userId, nome) {

    try {

        const response = await fetch(`/user_promote/${userId}`, {
            method: "PUT"
        });

        const result = await response.json();

        if(result.success){

            openPopup(
                "success",
                "Usuário promovido",
                `${nome} agora é administrador`
            );

            setTimeout(() => {
                location.reload();
            }, 1500);

        } else {

            openPopup(
                "error",
                "Erro",
                result.error
            );

        }

    } catch(err){

        openPopup(
            "error",
            "Erro",
            "Falha ao conectar ao servidor"
        );

    }

}

window.alterarAdmin = async function(userId, isAdmin, nome) {

    const url = isAdmin
        ? `/user_demote/${userId}`
        : `/user_promote/${userId}`;

    const action = isAdmin ? "removido do admin" : "promovido a admin";

    try {
        const response = await fetch(url, { method: "PUT" });
        const result = await response.json();

        if (result.success) {
            openPopup("success", "Sucesso", `${nome} foi ${action}`);

            setTimeout(() => location.reload(), 1200);
        } else {
            openPopup("error", "Erro", result.error);
        }

    } catch (err) {
        openPopup("error", "Erro", "Falha no servidor");
    }
}
});