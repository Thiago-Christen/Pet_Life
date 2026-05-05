document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("petForm");
    
    // Elementos
    const photoInput = document.getElementById("foto");
    const photoPreview = document.getElementById("photoPreview");
    const photoUploadArea = document.getElementById("photoUploadArea");
    
    const nomeInput = document.getElementById("nome");
    const especieInput = document.getElementById("especie");
    const generoInput = document.getElementById("genero");
    const racaInput = document.getElementById("raca");
    const dataNascimentoInput = document.getElementById("data_nascimento");
    const pesoInput = document.getElementById("peso");
    const porteInput = document.getElementById("porte");
    
    // Popup
    const popup = document.getElementById("petPopup");
    const popupCard = document.getElementById("petPopupCard");
    const popupClose = document.getElementById("closePetPopup");
    const popupIcon = document.getElementById("petPopupIcon");
    const popupTitle = document.getElementById("petPopupTitle");
    const popupMessage = document.getElementById("petPopupMessage");
    
    // Data máxima (não pode ser futura)
    const today = new Date();
    const maxDate = today.toISOString().split('T')[0];
    if (dataNascimentoInput) {
        dataNascimentoInput.max = maxDate;
    }
    
    // Funções de validação
    function showError(id, message) {
        const el = document.getElementById(id);
        if (el) el.textContent = message;
    }
    
    function clearError(id) {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    }
    
    function clearAllErrors() {
        const errorIds = ["nomeError", "especieError", "generoError", "racaError", 
                         "data_nascimentoError", "pesoError", "porteError", "fotoError"];
        errorIds.forEach(clearError);
    }
    
    // Valida CPF indireto para dono (idade do pet)
    function validatePetAge(birthdate) {
        if (!birthdate) return { valid: false, message: "Data de nascimento obrigatória" };
        
        const birth = new Date(birthdate);
        const today = new Date();
        
        if (birth > today) {
            return { valid: false, message: "Data não pode ser futura" };
        }
        
        return { valid: true, message: "" };
    }
    
    // Upload de foto
    function openPopup(type, title, message) {
        if (!popup) return;
        
        popupCard.classList.remove("success", "error");
        popupCard.classList.add(type);
        
        if (type === "success") {
            popupIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        } else {
            popupIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        }
        
        popupTitle.textContent = title;
        popupMessage.textContent = message;
        
        popup.classList.add("show");
        popup.setAttribute("aria-hidden", "false");
    }
    
    function closePopup() {
        if (!popup) return;
        popup.classList.remove("show");
        popup.setAttribute("aria-hidden", "true");
    }
    
    popupClose?.addEventListener("click", closePopup);
    popup?.addEventListener("click", (event) => {
        if (event.target === popup) closePopup();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closePopup();
    });
    
    // Preview da foto
    photoUploadArea?.addEventListener("click", () => {
        photoInput?.click();
    });
    
    photoInput?.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                showError("fotoError", "Por favor, selecione uma imagem válida");
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                showError("fotoError", "Imagem deve ter no máximo 5MB");
                return;
            }
            
            clearError("fotoError");
            
            const reader = new FileReader();
            reader.onload = function(ev) {
                photoPreview.style.backgroundImage = `url(${ev.target.result})`;
                photoPreview.classList.add("has-image");
                photoPreview.innerHTML = '';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Botões de espécie
    document.querySelectorAll(".species-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".species-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            especieInput.value = btn.dataset.especie;
            clearError("especieError");
        });
    });
    
    // Botões de gênero
    document.querySelectorAll(".gender-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".gender-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            generoInput.value = btn.dataset.genero;
            clearError("generoError");
        });
    });
    
    // Botões de porte
    document.querySelectorAll(".porte-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".porte-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            porteInput.value = btn.dataset.porte;
            clearError("porteError");
        });
    });
    
    // Validação do formulário
    form?.addEventListener("submit", async function(event) {
        event.preventDefault();
        clearAllErrors();
        
        let valid = true;
        
        // Nome
        const nome = nomeInput?.value.trim() || "";
        if (nome.length < 2) {
            showError("nomeError", "Nome deve ter pelo menos 2 caracteres");
            valid = false;
        }
        if (nome.length > 100) {
            showError("nomeError", "Nome muito longo (máx 100 caracteres)");
            valid = false;
        }
        
        // Espécie
        const especie = especieInput?.value || "";
        if (!especie) {
            showError("especieError", "Selecione a espécie do pet");
            valid = false;
        }
        
        // Gênero
        const genero = generoInput?.value || "";
        if (!genero) {
            showError("generoError", "Selecione o gênero do pet");
            valid = false;
        }
        
        // Raça - opcional, mas validar tamanho
        const raca = racaInput?.value.trim() || "";
        if (raca.length > 50) {
            showError("racaError", "Raça muito longa (máx 50 caracteres)");
            valid = false;
        }
        
        // Data de nascimento
        const dataNascimento = dataNascimentoInput?.value || "";
        const ageCheck = validatePetAge(dataNascimento);
        if (!ageCheck.valid) {
            showError("data_nascimentoError", ageCheck.message);
            valid = false;
        }
        
        // Peso
        const peso = pesoInput?.value || "";
        if (peso) {
            const pesoNum = parseFloat(peso);
            if (isNaN(pesoNum) || pesoNum < 0) {
                showError("pesoError", "Peso inválido");
                valid = false;
            }
            if (pesoNum > 200) {
                showError("pesoError", "Peso muito alto (máx 200kg)");
                valid = false;
            }
        }
        
        // Porte
        const porte = porteInput?.value || "";
        if (!porte) {
            showError("porteError", "Selecione o porte do pet");
            valid = false;
        }
        
        if (!valid) return;
        
        // Enviar formulário via fetch
        const formData = new FormData(form);
        
        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                openPopup("success", "Pet cadastrado!", data.message || `${nome} foi adicionado com sucesso!`);
                setTimeout(() => {
                    window.location.href = "/index";
                }, 2000);
            } else {
                if (data.errors) {
                    if (data.errors.nome) showError("nomeError", data.errors.nome);
                    if (data.errors.especie) showError("especieError", data.errors.especie);
                    if (data.errors.genero) showError("generoError", data.errors.genero);
                    if (data.errors.data_nascimento) showError("data_nascimentoError", data.errors.data_nascimento);
                    if (data.errors.porte) showError("porteError", data.errors.porte);
                    if (data.errors.peso) showError("pesoError", data.errors.peso);
                    if (data.errors.raca) showError("racaError", data.errors.raca);
                }
                openPopup("error", "Erro no cadastro", data.error || "Verifique os dados informados");
            }
        } catch (error) {
            openPopup("error", "Erro", "Não foi possível cadastrar o pet");
        }
    });
});
