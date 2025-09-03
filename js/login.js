// login.js - funções e eventos relacionados ao login

const USERNAME = 'admin';
const PASSWORD = 'admin';

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

if (loginForm) {
    // Função para mostrar erro de login
    function showLoginError(message) {
        loginError.textContent = message;
    }

    // Evento de submissão do formulário de login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = loginForm.username.value.trim();
        const password = loginForm.password.value.trim();

        if (username === USERNAME && password === PASSWORD) {
            showAppContent();
        } else {
            showLoginError('Usuário ou senha incorretos.');
        }
    });

    // Corrigir foco para evitar digitação duplicada
    loginForm.username.addEventListener('focus', () => {
        loginForm.username.value = '';
    });
    loginForm.password.addEventListener('focus', () => {
        loginForm.password.value = '';
    });
}

// Função para redirecionar para o dashboard após login
function showAppContent() {
    window.location.href = 'dashboard.html';
}
