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
    
    // Salvar registro
    recordForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
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
    
    // Deletar registro
    document.querySelectorAll(".btn-delete-record").forEach(btn => {
        btn.addEventListener("click", async () => {
            const registroId = btn.dataset.id;
            if (confirm("Tem certeza que deseja excluir este registro?")) {
                try {
                    const response = await fetch(`/diario_delete/${registroId}`, { method: "DELETE" });
                    const result = await response.json();
                    if (result.success) {
                        openPopup("success", "Excluído!", "Registro removido");
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        openPopup("error", "Erro", result.error);
                    }
                } catch {
                    openPopup("error", "Erro", "Erro ao excluir");
                }
            }
        });
    });
});
