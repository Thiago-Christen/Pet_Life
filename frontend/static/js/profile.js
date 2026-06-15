document.addEventListener("DOMContentLoaded", function () {
        const accountForm = document.getElementById("account-form");
        const settingsForm = document.getElementById("settings-form");

        const cpfInput = document.getElementById("cpf");
        const phoneInput = document.getElementById("num_telefone");
        const emailInput = document.getElementById("email");
        const nameInput = document.getElementById("nome");
        const birthdateInput = document.getElementById("data_nascimento");
        const settingsPasswordInput = document.getElementById("senha_settings");

        const photoInput = document.getElementById("foto_perfil");
        const photoPreview = document.getElementById("photoPreview");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        const popup = document.getElementById("appPopup");
        const popupCard = document.getElementById("appPopupCard");
        const popupClose = document.getElementById("appPopupClose");
        const popupIcon = document.getElementById("appPopupIcon");
        const popupTitle = document.getElementById("appPopupTitle");
        const popupMessage = document.getElementById("appPopupMessage");

        function onlyNumbers(value) {
            return String(value || "").replace(/\D/g, "");
        }

        function formatCPF(value) {
            const digits = onlyNumbers(value).slice(0, 11);
            if (digits.length <= 3) return digits;
            if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
            if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
            return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
        }

        function formatPhone(value) {
            const digits = onlyNumbers(value).slice(0, 11);
            if (digits.length <= 2) return `(${digits}`;
            if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
            if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
        }

        function validateCPF(cpf) {
            cpf = onlyNumbers(cpf);

            if (cpf.length !== 11) return false;
            if (/^(\d)\1+$/.test(cpf)) return false;

            let sum = 0;
            let remainder;

            for (let i = 1; i <= 9; i++) {
                sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
            }

            remainder = (sum * 10) % 11;
            if (remainder === 10) remainder = 0;
            if (remainder !== parseInt(cpf.substring(9, 10))) return false;

            sum = 0;
            for (let i = 1; i <= 10; i++) {
                sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
            }

            remainder = (sum * 10) % 11;
            if (remainder === 10) remainder = 0;
            if (remainder !== parseInt(cpf.substring(10, 11))) return false;

            return true;
        }

        function validatePhone(phone) {
            const digits = onlyNumbers(phone);
            return digits.length === 10 || digits.length === 11;
        }

        function validateBirthdate(birthdate) {
            if (!birthdate) return { valid: false, message: "Informe a data de nascimento." };

            const today = new Date();
            const birth = new Date(birthdate);

            today.setHours(0, 0, 0, 0);
            birth.setHours(0, 0, 0, 0);

            if (birth > today) {
                return { valid: false, message: "A data de nascimento não pode ser no futuro." };
            }

            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            const dayDiff = today.getDate() - birth.getDate();

            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;

            if (age < 18) {
                return { valid: false, message: "Você precisa ter 18 anos ou mais." };
            }

            return { valid: true, message: "" };
        }

        function validatePassword(password) {
            return passwordRegex.test(password);
        }

        function showError(id, message) {
            const el = document.getElementById(id);
            if (el) el.textContent = message;
        }

        function clearError(id) {
            const el = document.getElementById(id);
            if (el) {el.textContent = "";}
        }

        function clearAllErrors() {
            ["nomeError", "emailError", "num_telefoneError", "data_nascimentoError", "cpfError", "senha_settingsError"]
                .forEach(clearError);
        }

        function openPopup(type, title, message) {
            if (!popup || !popupCard || !popupIcon || !popupTitle || !popupMessage) return;

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
            if (!popup) return;
            popup.classList.remove("show");
            popup.setAttribute("aria-hidden", "true");
        }

        function setMaskedValueOnLoad() {
            if (cpfInput) cpfInput.value = formatCPF(cpfInput.value);
            if (phoneInput) phoneInput.value = formatPhone(phoneInput.value);
        }

        function bindMask(input, formatter) {
            if (!input) return;
            input.addEventListener("input", function () {
                input.value = formatter(input.value);
            });
        }

        function setPhotoPreview(file) {
            if (!photoPreview || !file) return;

            const imageUrl = URL.createObjectURL(file);
            photoPreview.style.backgroundImage = `url('${imageUrl}')`;
            photoPreview.classList.add("has-image");
        }

        function enablePhotoUpload(isEnabled) {
            if (!photoInput || !photoPreview) return;

            photoInput.disabled = !isEnabled;
            photoPreview.classList.toggle("editable", isEnabled);
            photoPreview.style.cursor = isEnabled ? "pointer" : "default";
        }

        function enableEditToggle() {
            document.querySelectorAll(".js-edit-toggle").forEach((button) => {
                button.addEventListener("click", () => {
                    const form = document.getElementById(button.dataset.target);
                    if (!form) return;

                    const fields = form.querySelectorAll("input:not([type='hidden'])");
                    const saveBtn = form.querySelector(".js-save-btn");

                    const isDisabled = [...fields].every(field => field.disabled);

                    fields.forEach(field => field.disabled = !isDisabled);
                    if (saveBtn) saveBtn.disabled = !isDisabled;

                    if (photoInput && photoPreview) {
                        enablePhotoUpload(isDisabled);
                    }

                    button.innerHTML = isDisabled
                        ? '<i class="fa-solid fa-ban"></i> Bloquear edição'
                        : '<i class="fa-solid fa-pen"></i> ' + (form.id === "account-form" ? "Editar dados" : "Editar config.");
                });
            });
        }

        photoPreview?.addEventListener("click", () => {
            if (photoInput && !photoInput.disabled) {
                photoInput.click();
            }
        });

        photoInput?.addEventListener("change", () => {
            const file = photoInput.files?.[0];
            if (!file) return;
            setPhotoPreview(file);
        });

        async function submitJsonForm(form) {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form)
            });

            return await response.json();
        }

        accountForm?.addEventListener("submit", async function (event) {
            event.preventDefault();
            clearAllErrors();

            const name = nameInput ? nameInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const phone = phoneInput ? phoneInput.value.trim() : "";
            const birthdate = birthdateInput ? birthdateInput.value : "";
            const cpf = cpfInput ? cpfInput.value.trim() : "";

            let valid = true;

            if (!name || name.length < 3) {
                showError("nomeError", "Nome deve ter pelo menos 3 letras.");
                valid = false;
            }

            if (!emailRegex.test(email)) {
                showError("emailError", "E-mail inválido.");
                valid = false;
            }

            if (!validatePhone(phone)) {
                showError("num_telefoneError", "Telefone inválido.");
                valid = false;
            }

            const birthCheck = validateBirthdate(birthdate);
            if (!birthCheck.valid) {
                showError("data_nascimentoError", birthCheck.message);
                valid = false;
            }

            if (!cpfRegex.test(cpf) || !validateCPF(cpf)) {
                showError("cpfError", "CPF inválido.");
                valid = false;
            }

            if (!valid) return;

            const rawCpf = cpfInput.value;
            const rawPhone = phoneInput.value;
            cpfInput.value = onlyNumbers(rawCpf);
            phoneInput.value = onlyNumbers(rawPhone);

            try {
                const data = await submitJsonForm(accountForm);

                if (data.success) {
                    openPopup("success", "Atualização realizada com sucesso", data.message || "Seus dados foram atualizados com sucesso.");
                    setTimeout(() => window.location.reload(), 800);
                } else {
                    openPopup("error", "Não foi possível atualizar", data.error || "Verifique os dados informados.");
                }
            } catch {
                openPopup("error", "Erro", "Não foi possível atualizar os dados.");
            } finally {
                cpfInput.value = formatCPF(cpfInput.value);
                phoneInput.value = formatPhone(phoneInput.value);
            }
        });

        settingsForm?.addEventListener("submit", async function (event) {
            event.preventDefault();
            clearError("senha_settingsError");

            const password = settingsPasswordInput ? settingsPasswordInput.value.trim() : "";
            if (password && !validatePassword(password)) {
                showError("senha_settingsError", "Senha forte: 8 caracteres, com maiúscula, minúscula e número.");
                return;
            }

            try {
                const data = await submitJsonForm(settingsForm);

                if (data.success) {
                    openPopup("success", "Senha alterada com sucesso", data.message || "Sua senha foi atualizada com sucesso.");
                    settingsPasswordInput.value = "";
                    setTimeout(() => window.location.reload(), 800);
                } else {
                    openPopup("error", "Não foi possível alterar", data.error || "Verifique a senha informada.");
                }
            } catch {
                openPopup("error", "Erro", "Não foi possível alterar a senha.");
            }
        });

        popupClose?.addEventListener("click", closePopup);

        popup?.addEventListener("click", (event) => {
            if (event.target === popup) closePopup();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closePopup();
        });

        setMaskedValueOnLoad();
        bindMask(cpfInput, formatCPF);
        bindMask(phoneInput, formatPhone);
        enableEditToggle();
        enablePhotoUpload(false);

    
    const deleteBtn = document.getElementById("delete-account-btn");
    const deleteConfirmPopup = document.getElementById("deleteConfirmPopup");
    const closeDeleteConfirmPopup = document.getElementById("closeDeleteConfirmPopup");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    function openDeleteConfirmPopup() {
        deleteConfirmPopup?.classList.add("show");
        deleteConfirmPopup?.setAttribute("aria-hidden", "false");
    }

    function closeDeleteConfirmPopupFn() {
        deleteConfirmPopup?.classList.remove("show");
        deleteConfirmPopup?.setAttribute("aria-hidden", "true");
    }

    deleteBtn?.addEventListener("click", () => {
        openDeleteConfirmPopup();
    });

    closeDeleteConfirmPopup?.addEventListener("click", closeDeleteConfirmPopupFn);
    cancelDeleteBtn?.addEventListener("click", closeDeleteConfirmPopupFn);

    deleteConfirmPopup?.addEventListener("click", (event) => {
        if (event.target === deleteConfirmPopup) closeDeleteConfirmPopupFn();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeDeleteConfirmPopupFn();
    });

    confirmDeleteBtn?.addEventListener("click", async () => {
        const errorBox = document.getElementById("deleteAccountError");
        if (errorBox) errorBox.textContent = "";

        try {
            const response = await fetch("/profile_delete", { method: "DELETE" });
            const data = await response.json();

            if (data.success) {
                closeDeleteConfirmPopupFn();
                openPopup("success", "Conta excluída com sucesso", data.message || "Sua conta foi excluída.");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1800);
            } else {
                closeDeleteConfirmPopupFn();
                if (errorBox) errorBox.textContent = data.error || "Não foi possível excluir a conta.";
                openPopup("error", "Erro ao excluir", data.error || "Não foi possível excluir a conta.");
            }
        } catch {
            closeDeleteConfirmPopupFn();
            openPopup("error", "Erro", "Falha ao excluir a conta.");
        }
    });

});