document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("account-form");

    const nameInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("num_telefone");
    const birthdateInput = document.getElementById("data_nascimento");
    const cpfCnpjInput = document.getElementById("cpf");
    const passwordInput = document.getElementById("senha_account");
    
    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const phoneError = document.getElementById("phoneError");
    const birthdateError = document.getElementById("birthdateError");
    const cpfCnpjError = document.getElementById("cpfCnpjError");
    const passwordError = document.getElementById("passwordError");
  
    const nameRegex = /^.{5,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    function onlyNumbers(value) {
        return value.replace(/\D/g, "");
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

    function validateCNPJ(cnpj) {
        cnpj = onlyNumbers(cnpj);
        if (cnpj.length !== 14) return false;
        if (/^(\d)\1+$/.test(cnpj)) return false;

        let length = 12;
        let numbers = cnpj.substring(0, length);
        let digits = cnpj.substring(length);
        let sum = 0;
        let pos = length - 7;

        for (let i = length; i >= 1; i--) {
            sum += numbers.charAt(length - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (result !== parseInt(digits.charAt(0))) return false;

        length = 13;
        numbers = cnpj.substring(0, length);
        sum = 0;
        pos = length - 7;

        for (let i = length; i >= 1; i--) {
            sum += numbers.charAt(length - i) * pos--;
            if (pos < 2) pos = 9;
        }

        result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (result !== parseInt(digits.charAt(1))) return false;

        return true;
    }

    function showError(element, message) {
        element.textContent = message;
    }

    function clearError(element) {
        element.textContent = "";
    }

    togglePasswordBtn.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePasswordBtn.textContent = "Ocultar";
        } else {
            passwordInput.type = "password";
            togglePasswordBtn.textContent = "Mostrar";
        }
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        let valid = true;

        clearError(nameError);
        clearError(emailError);
        clearError(phoneError);
        clearError(birthdateError);
        clearError(cpfCnpjError);
        clearError(passwordError);
        clearError(confirmPasswordError);

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const birthdate = birthdateInput.value;
        const cpfCnpj = cpfCnpjInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!nameRegex.test(name)) {
            showError(nameError, "Nome deve ter pelo menos 5 caracteres.");
            valid = false;
        }

        if (!emailRegex.test(email)) {
            showError(emailError, "E-mail inválido.");
            valid = false;
        }

        if (!phoneRegex.test(phone)) {
            showError(phoneError, "Celular inválido.");
            valid = false;
        }

        if (!birthdate) {
            showError(birthdateError, "Data de nascimento obrigatória.");
            valid = false;
        } else {
            const today = new Date();
            const birth = new Date(birthdate);
            today.setHours(0, 0, 0, 0);
            birth.setHours(0, 0, 0, 0);

            if (birth > today) {
                showError(birthdateError, "A data não pode ser no futuro.");
                valid = false;
            } else {
                let age = today.getFullYear() - birth.getFullYear();
                const monthDiff = today.getMonth() - birth.getMonth();
                const dayDiff = today.getDate() - birth.getDate();

                if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                    age--;
                }

                if (age < 18) {
                    showError(birthdateError, "Você precisa ter 18 anos ou mais.");
                    valid = false;
                }
            }
            
        }

        const numbersOnly = onlyNumbers(cpfCnpj);
        if (numbersOnly.length === 11) {
            if (!validateCPF(numbersOnly)) {
                showError(cpfCnpjError, "CPF inválido.");
                valid = false;
            }
        } else if (numbersOnly.length === 14) {
            if (!validateCNPJ(numbersOnly)) {
                showError(cpfCnpjError, "CNPJ inválido.");
                valid = false;
            }
        } else {
            showError(cpfCnpjError, "Digite CPF com 11 dígitos ou CNPJ com 14 dígitos.");
            valid = false;
        }

        if (!passwordRegex.test(password)) {
            showError(passwordError, "Senha forte: 8 caracteres, maiúscula, minúscula e número.");
            valid = false;
        }

        if (password !== confirmPassword) {
            showError(confirmPasswordError, "As senhas não coincidem.");
            valid = false;
        }
        if (valid === true){
            form.submit();
        }
    });
});