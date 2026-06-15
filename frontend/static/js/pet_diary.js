document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("recordModal");
    const openModalBtn = document.getElementById("openRecordModal");
    const closeModalBtn = document.getElementById("closeModal");
    const cancelModalBtn = document.getElementById("cancelModal");
    const recordForm = document.getElementById("recordForm");
    const filterType = document.getElementById("filterType");
    const recordsList = document.getElementById("recordsList");
    
    // Popup
    const popup = document.getElementById("diaryPopup");
    const popupCard = document.getElementById("diaryPopupCard");
    const popupClose = document.getElementById("closeDiaryPopup");
    const popupIcon = document.getElementById("diaryPopupIcon");
    const popupTitle = document.getElementById("diaryPopupTitle");
    const popupMessage = document.getElementById("diaryPopupMessage");
    
    // Data máxima (hoje)
    const today = new Date().toISOString().split('T')[0];
    const dataInput = document.getElementById("data");
    if (dataInput) dataInput.max = today;
    
    // Abrir modal
    if (openModalBtn) {
        openModalBtn.addEventListener("click", () => {
            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    }
    
    // Fechar modal
    function closeModal() {
        modal.classList.remove("active");
        document.body.style.overflow = "";
        if (recordForm) recordForm.reset();
        clearAllErrors();
    }
    
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);
    
    // Fechar modal clicando fora
    modal?.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Limpar erros
    function clearError(id) {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    }
    
    function clearAllErrors() {
        clearError("tipoError");
        clearError("dataError");
        clearError("observacoesError");
    }
    
    function showError(id, message) {
        const el = document.getElementById(id);
        if (el) el.textContent = message;
    }
    
    // Popup
    function openPopup(type, title, message) {
        if (!popup) return;
        popupCard.classList.remove("success", "error");
        popupCard.classList.add(type);
        popupIcon.innerHTML = type === "success" 
            ? '<i class="fa-solid fa-circle-check"></i>' 
            : '<i class="fa-solid fa-triangle-exclamation"></i>';
        popupTitle.textContent = title;
        popupMessage.textContent = message;
        popup.classList.add("show");
        setTimeout(() => {
            if (type === "success") popup.classList.remove("show");
        }, 3000);
    }
    
    popupClose?.addEventListener("click", () => popup.classList.remove("show"));

    window.registroIdParaExcluir = null;

const deleteConfirmPopupRegistro =
    document.getElementById("deleteConfirmPopupRegistro");

const deletePopupTextRegistro =
    document.getElementById("deletePopupTextRegistro");

const closeDeleteConfirmPopupRegistro =
    document.getElementById("closeDeleteConfirmPopupRegistro");

const cancelDeleteBtnRegistro =
    document.getElementById("cancelDeleteRegistroBtn");

const confirmDeleteRegistroBtn =
    document.getElementById("confirmDeleteRegistroBtn");

// Deletar registro
window.abrirPopupDeleteRegistro = function(registroId, registroTipo) {

    window.registroIdParaExcluir = parseInt(registroId);

    deletePopupTextRegistro.textContent =
        `Tem certeza que deseja excluir ${registroTipo}?`;

    deleteConfirmPopupRegistro.classList.add("show");

    deleteConfirmPopupRegistro.setAttribute(
        "aria-hidden",
        "false"
    );
}

function fecharPopupDelete() {

    deleteConfirmPopupRegistro.classList.remove("show");

    deleteConfirmPopupRegistro.setAttribute(
        "aria-hidden",
        "true"
    );

    window.registroIdParaExcluir = null;
}

closeDeleteConfirmPopupRegistro?.addEventListener(
    "click",
    fecharPopupDelete
);

cancelDeleteBtnRegistro?.addEventListener(
    "click",
    fecharPopupDelete
);

deleteConfirmPopupRegistro?.addEventListener(
    "click",
    (event) => {

        if(event.target === deleteConfirmPopupRegistro){
            fecharPopupDelete();
        }

    }
);

confirmDeleteRegistroBtn?.addEventListener(
    "click",
    async (e) => {

        e.preventDefault();

        console.log("CLICOU NO BOTÃO DELETE");  

        if(window.registroIdParaExcluir === null) return;

        try {

            const response = await fetch(
                `/diario_delete/${window.registroIdParaExcluir}`,
                {
                    method: "DELETE"
                }
            );

            console.log("Status:", response.status);

            const data = await response.json();

            console.log("Resposta:", data);

            if(data.success){

                fecharPopupDelete();

                openPopup(
                    "success",
                    "Registro deletado",
                    "O registro foi removido com sucesso."
                );

                setTimeout(() => {
                    location.reload();
                }, 1200);

            } else {

                fecharPopupDelete();

                openPopup(
                    "error",
                    "Erro ao deletar",
                    data.error ||
                    "Não foi possível remover o registro."
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

    }
);
    
    
    // Salvar registro
    recordForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        event.stopImmediatePropagation();
        clearAllErrors();
        
        const tipo = document.getElementById("tipo")?.value;
        const data = document.getElementById("data")?.value;
        const observacoes = document.getElementById("observacoes")?.value;
        const petId = document.getElementById("pet_id")?.value;
        
        let valid = true;
        if (!tipo) {
            showError("tipoError", "Selecione o tipo de registro");
            valid = false;
        }
        if (!data) {
            showError("dataError", "Selecione a data");
            valid = false;
        }
        
        if (!valid) return;
        
        try {
            const response = await fetch("/diario_add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pet_id: parseInt(petId), tipo, data, observacoes: observacoes || "" })
            });
            
            const result = await response.json();
            console.log("Resposta do servidor:", result); // Para debug
            
            if (result.success === true) {
                openPopup("success", "Sucesso!", "Registro adicionado!");
                setTimeout(() => location.reload(), 1500);
            } else {
                const erroMsg = result.error || result.detail || "Não foi possível salvar";
                openPopup("error", "Erro", erroMsg);
            }
        } catch (error) {
            console.error("Erro:", error);
            openPopup("error", "Erro", "Erro ao conectar com o servidor");
        }
    });
    
    // Filtro
    filterType?.addEventListener("change", () => {
        const tipo = filterType.value;
        const cards = document.querySelectorAll(".record-card");
        cards.forEach(card => {
            if (tipo === "todos" || card.dataset.tipo === tipo) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    });
});

