// Sistema de Solicitação de Peças - Lógica Principal
// Comentários em português

// --- Configuração do Supabase ---
const SUPABASE_URL = 'https://tetshxfxrdbzovajmfoz.supabase.co'; // Substitua se for diferente
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRldHNoeGZ4cmRiem92YWptZm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDI1NDUsImV4cCI6MjA3MjY3ODU0NX0.dG09yVDrzofmRc7XmVHwgVJKVOG1xjPGkwxJGdYpk4U'; // Substitua se for diferente
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variáveis globais
let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

// Lógica de Login - Executa apenas se o formulário de login existir na página
const handleLogin = async (event) => {
    event.preventDefault();
    const nomeUsuario = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = loginButton.textContent;

    loginButton.disabled = true;
    loginButton.textContent = 'Entrando...';

    try {
        // Passo 1: Buscar o e-mail do usuário a partir do nome.
        // Esta é a maneira mais direta de permitir o login por nome de usuário,
        // pois o Supabase Auth precisa do e-mail para autenticar.
        const { data: profile, error: lookupError } = await supabase
            .from('profiles')
            .select('email')
            .eq('nome', nomeUsuario)
            .single();

        if (lookupError || !profile) {
            throw new Error('Nome de usuário não encontrado.');
        }

        // Passo 2: Autenticar com o e-mail encontrado e a senha.
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: profile.email,
            password: password,
        });

        if (authError) {
            // O erro aqui é geralmente "Invalid login credentials"
            throw new Error('Nome de usuário ou senha inválidos.');
        }

        // Passo 3: Buscar o perfil completo do usuário já autenticado.
        // Isso garante que só buscamos dados completos após o login bem-sucedido.
        const { data: fullProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError || !fullProfile) {
            // Se o login funcionou mas o perfil não foi encontrado, é um estado inconsistente.
            await supabase.auth.signOut();
            throw new Error('Falha no login: Perfil de usuário não encontrado.');
        }

        // Salva o perfil no localStorage para uso nas outras páginas
        localStorage.setItem('usuarioLogado', JSON.stringify(fullProfile));
        
        // Redireciona para o dashboard
        window.location.href = 'pages/dashboard.html';

    } catch (error) {
        alert(error.message);
        console.error('Erro de login:', error.message);
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
    window.location.href = 'dashboard.html';
}

// Função para carregar solicitação
function carregarSolicitacao() {
    window.location.href = 'solicitacao.html';
}

// Função para carregar aprovação
function carregarAprovacao() {
    window.location.href = 'aprovacao.html';
}

// Função para carregar cadastros
function carregarCadastro(tipo) {
    window.location.href = `cadastro_${tipo}.html`;
}

// Função para carregar aprovados
function carregarAprovados() {
    window.location.href = 'aprovados.html';
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
        usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
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
async function logout() {
    // Limpar dados do usuário logado do localStorage
    localStorage.removeItem('usuarioLogado');
    
    // Fazer logout do Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Erro ao fazer logout do Supabase:', error.message);
    }

    // Redireciona para a página de login. O caminho relativo funciona
    // tanto localmente quanto no GitHub Pages, independentemente do nome do repositório.
    window.location.href = '../index.html';
}
