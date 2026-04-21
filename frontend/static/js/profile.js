document.addEventListener("DOMContentLoaded", function () {
    const accountForm = document.getElementById("account-form");
    const settingsForm = document.getElementById("settings-form");

    const cpfInput = document.getElementById("cpf");
    const phoneInput = document.getElementById("num_telefone");
    const emailInput = document.getElementById("email");
    const nameInput = document.getElementById("nome");
    const birthdateInput = document.getElementById("data_nascimento");
    const settingsPasswordInput = document.getElementById("senha_settings");

    const successPopup = document.getElementById("successPopup");
    const closeSuccessPopup = document.getElementById("closeSuccessPopup");
    const successPopupMessage = document.getElementById("successPopupMessage");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

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

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

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
        if (el) el.textContent = "";
    }

    function clearAllErrors() {
        ["nomeError", "emailError", "num_telefoneError", "data_nascimentoError", "cpfError", "senha_settingsError", "deleteAccountError"]
            .forEach(clearError);
    }

    function showSuccessPopup(message) {
        if (!successPopup || !successPopupMessage) return;
        successPopupMessage.textContent = message;
        successPopup.classList.add("show");
        successPopup.setAttribute("aria-hidden", "false");
    }

    function hideSuccessPopup() {
        if (!successPopup) return;
        successPopup.classList.remove("show");
        successPopup.setAttribute("aria-hidden", "true");
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

                button.innerHTML = isDisabled
                    ? '<i class="fa-solid fa-ban"></i> Bloquear edição'
                    : '<i class="fa-solid fa-pen"></i> ' + (form.id === "account-form" ? "Editar dados" : "Editar config.");
            });
        });
    }

    async function submitForm(form, successMessage, errorMap) {
        const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
        });

        const data = await response.json();

        if (data.success) {
            showSuccessPopup(data.message || successMessage);
            return true;
        }

        if (data.errors) {
            Object.entries(errorMap).forEach(([key, id]) => {
                clearError(id);
                if (data.errors[key]) {
                    showError(id, data.errors[key]);
                }
            });
        } else if (data.error) {
            showError(errorMap.general || "deleteAccountError", data.error);
        }

        return false;
    }

    accountForm?.addEventListener("submit", async (event) => {
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

        if (cpfInput) cpfInput.value = onlyNumbers(cpfInput.value);
        if (phoneInput) phoneInput.value = onlyNumbers(phoneInput.value);

        await submitForm(accountForm, "Dados atualizados com sucesso.", {
            nome: "nomeError",
            email: "emailError",
            num_telefone: "num_telefoneError",
            data_nascimento: "data_nascimentoError",
            cpf: "cpfError",
            general: "deleteAccountError"
        });

        if (cpfInput) cpfInput.value = formatCPF(cpfInput.value);
        if (phoneInput) phoneInput.value = formatPhone(phoneInput.value);
    });

    settingsForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearError("senha_settingsError");

        const password = settingsPasswordInput ? settingsPasswordInput.value.trim() : "";

        if (password && !validatePassword(password)) {
            showError("senha_settingsError", "Senha forte: 8 caracteres, com maiúscula, minúscula e número.");
            return;
        }

        const ok = await submitForm(settingsForm, "Senha alterada com sucesso.", {
            general: "senha_settingsError"
        });

        if (ok && settingsPasswordInput) {
            settingsPasswordInput.value = "";
        }
    });

    document.getElementById("delete-account-btn")?.addEventListener("click", async () => {
        const confirmed = confirm("Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.");
        if (!confirmed) return;

        const errorBox = document.getElementById("deleteAccountError");
        if (errorBox) errorBox.textContent = "";

        try {
            const response = await fetch("/profile_delete", { method: "DELETE" });
            const data = await response.json();

            if (data.success) {
                window.location.href = "/login";
            } else {
                if (errorBox) errorBox.textContent = data.error || "Não foi possível excluir a conta.";
            }
        } catch {
            if (errorBox) errorBox.textContent = "Erro ao excluir a conta.";
        }
    });

    closeSuccessPopup?.addEventListener("click", hideSuccessPopup);

    successPopup?.addEventListener("click", (event) => {
        if (event.target === successPopup) hideSuccessPopup();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") hideSuccessPopup();
    });

    setMaskedValueOnLoad();
    bindMask(cpfInput, formatCPF);
    bindMask(phoneInput, formatPhone);
    enableEditToggle();
});