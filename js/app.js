// Sistema de Solicitação de Peças - Lógica Principal
// Comentários em português

// Login simples local sem banco de dados

// Lista fixa de usuários para login local
const usuariosValidos = [
    { nome: 'admin', senha: 'admin123', nivel: 'administrador' },
    { nome: 'tecnico', senha: 'tec123', nivel: 'tecnico' },
    { nome: 'supervisor', senha: 'sup123', nivel: 'supervisor' },
    { nome: 'matriz', senha: 'matriz123', nivel: 'matriz' }
];

// Variáveis globais
let usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));

// Lógica de Login - Executa apenas se o formulário de login existir na página
const handleLogin = (event) => {
    event.preventDefault();
    const nomeUsuario = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = loginButton.textContent;

    loginButton.disabled = true;
    loginButton.textContent = 'Entrando...';

    // Verifica se o usuário e senha estão na lista fixa
    const usuario = usuariosValidos.find(u => u.nome === nomeUsuario && u.senha === password);

    if (usuario) {
        // Salva o usuário no sessionStorage para manter o login até fechar a aba
        sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        usuarioLogado = usuario;

        // Redireciona para o dashboard
        window.location.href = 'pages/dashboard.html';
    } else {
        alert('Nome de usuário ou senha inválidos.');
        loginButton.disabled = false;
        loginButton.textContent = originalButtonText;
    }
};

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

function atualizarMenu() {
    const menuContainer = document.getElementById('menu');
    if (!menuContainer) return;
    menuContainer.innerHTML = ''; // Limpa o menu

    const criarBotao = (texto, onClick) => {
        const button = document.createElement('button');
        button.textContent = texto;
        button.addEventListener('click', onClick);
        return button;
    };

    // Adiciona o botão Dashboard para todos os perfis logados, exceto na própria dashboard
    if (!window.location.pathname.includes('dashboard.html')) {
        menuContainer.appendChild(criarBotao('Dashboard', carregarDashboard));
    }

    if (usuarioLogado.nivel === 'tecnico') {
        menuContainer.appendChild(criarBotao('Nova Solicitação', carregarSolicitacao));
    } else if (usuarioLogado.nivel === 'supervisor') {
        menuContainer.appendChild(criarBotao('Nova Solicitação', carregarSolicitacao));
        menuContainer.appendChild(criarBotao('Aprovar Solicitações', carregarAprovacao));
    } else if (usuarioLogado.nivel === 'matriz') {
        menuContainer.appendChild(criarBotao('Nova Solicitação', carregarSolicitacao));
        menuContainer.appendChild(criarBotao('Aprovar Solicitações', carregarAprovacao));
        menuContainer.appendChild(criarBotao('Solicitações Aprovadas', carregarAprovados));
    } else if (usuarioLogado.nivel === 'administrador') {
        // Dropdown de Cadastro
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        const dropBtn = criarBotao('Cadastro', toggleDropdown);
        dropBtn.className = 'dropbtn';
        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'dropdown-content';
        dropdownContent.id = 'dropdown-content';
        dropdownContent.style.display = 'none';

        dropdownContent.appendChild(criarBotao('Cadastrar Usuários', () => carregarCadastro('usuarios')));
        dropdownContent.appendChild(criarBotao('Cadastrar Placas', () => carregarCadastro('veiculos')));
        dropdownContent.appendChild(criarBotao('Cadastro Peças', () => carregarCadastro('pecas')));

        dropdown.appendChild(dropBtn);
        dropdown.appendChild(dropdownContent);
        menuContainer.appendChild(dropdown);

        // Outros botões
        menuContainer.appendChild(criarBotao('Nova Solicitação', carregarSolicitacao));
        menuContainer.appendChild(criarBotao('Aprovar Solicitações', carregarAprovacao));
        menuContainer.appendChild(criarBotao('Solicitações Aprovadas', carregarAprovados));
    }

    // Botão de Sair para todos
    const btnSair = criarBotao('Sair', logout);
    btnSair.classList.add('btn-sair'); // Adiciona uma classe para estilização
    menuContainer.appendChild(btnSair);
}

// Carregar página inicial
function carregarPaginaInicial() {
    // Como a dashboard.html não tem div com id 'content', removemos essa linha para evitar erro
    // Se desejar conteúdo dinâmico, pode criar div#content no HTML e descomentar abaixo
    // const content = document.getElementById('content');
    // content.innerHTML = `<h2>Bem-vindo, ${usuarioLogado.nome}!</h2><p>Selecione uma opção no menu acima.</p>`;

    // Corrigir mensagem de boas-vindas para refletir o nome real do usuário
    // Esta lógica foi movida para dashboard.js, que é o local correto para manipular o conteúdo do dashboard.
    // const main = document.querySelector('main');
    // if (main && usuarioLogado && usuarioLogado.nome) {
    //     // A manipulação do conteúdo da dashboard deve ficar em dashboard.js
    //     // main.innerHTML = `<h2>Bem-vindo, ${usuarioLogado.nome}!</h2><p>Selecione uma opção no menu acima.</p>`;
    // }
}

// Função para carregar dashboard
function carregarDashboard() {
    window.location.href = 'pages/dashboard.html';
}

// Função para carregar solicitação
function carregarSolicitacao() {
    window.location.href = 'pages/solicitacao.html';
}

// Função para carregar aprovação
function carregarAprovacao() {
    window.location.href = 'pages/aprovacao.html';
}

// Função para carregar cadastros
function carregarCadastro(tipo) {
    window.location.href = `pages/cadastro_${tipo}.html`;
}

// Função para carregar aprovados
function carregarAprovados() {
    window.location.href = 'pages/aprovados.html';
}

// Função para alternar dropdown no menu cadastro
function toggleDropdown() {
    const dropdownContent = document.getElementById('dropdown-content');
    if (dropdownContent.style.display === 'none' || dropdownContent.style.display === '') {
        dropdownContent.style.display = 'block';
    } else {
        dropdownContent.style.display = 'none';
    }
}

console.log('Script app.js carregado');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded disparado');
    if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('cadastro_') || window.location.pathname.includes('solicitacao.html') || window.location.pathname.includes('aprovacao.html') || window.location.pathname.includes('aprovados.html') || window.location.pathname.includes('detalhes_solicitacao.html') || window.location.pathname.includes('envio_solicitacao.html')) {
        console.log('Estamos em uma página do sistema');
        usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
        if (usuarioLogado) {
            console.log('Usuário logado:', usuarioLogado);
            atualizarMenu();
            if (window.location.pathname.includes('dashboard.html')) {
                // A lógica de preenchimento do dashboard já está em dashboard.js,
                // então não precisamos chamar carregarPaginaInicial() aqui.
                // carregarPaginaInicial();
            }
        } else {
            console.log('Usuário não logado, redirecionando para login');
            window.location.href = '../index.html';
        }
    }
});

// Função de logout
function logout() {
    // Limpar dados do usuário logado do sessionStorage
    sessionStorage.removeItem('usuarioLogado');
    
    // Redireciona para a página de login
    window.location.href = '../index.html';
}
