// js/cadastro_usuarios.js

// Variável para controlar o ID do usuário em edição
let editandoId = null;

// Helper para pegar o cliente Supabase que já foi inicializado em app.js
const supabase = window.supabase;

// Função para salvar usuário (adicionar ou editar)
document.getElementById('form-usuario').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const senha = document.getElementById('senha').value;
    const nivel = document.getElementById('nivel').value;

    const btnSubmit = document.querySelector('form button[type="submit"]');
    btnSubmit.disabled = true;
    const originalButtonText = btnSubmit.textContent;
    btnSubmit.textContent = 'Salvando...';

    if (editandoId) {
        // --- Editando usuário existente ---
        const updates = {
            nome: nome,
            nivel: nivel,
        };

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', editandoId);

        if (error) {
            alert('Erro ao atualizar usuário: ' + error.message);
        } else {
            // NOTA: A alteração de senha de outros usuários não é segura de se fazer
            // diretamente do cliente. Esta funcionalidade pode ser adicionada no futuro
            // com uma abordagem mais segura (ex: usando Funções de Borda do Supabase).
            if (senha) {
                alert('Perfil atualizado. A alteração de senha para outros usuários não é permitida nesta tela por segurança.');
            }
            alert('Usuário atualizado com sucesso!');
        }

        editandoId = null;
    } else {
        // --- Adicionando novo usuário ---
        if (!senha || senha.length < 6) {
            alert("A senha é obrigatória e deve ter no mínimo 6 caracteres.");
            btnSubmit.disabled = false;
            btnSubmit.textContent = originalButtonText;
            return;
        }

        // Gera um e-mail interno para o sistema de autenticação
        // Usamos .app que é um TLD válido para passar na validação do Supabase.
        // Usamos @example.com que é um domínio padrão para testes e garantido para passar na validação.
        const email = `${nome.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')}@example.com`;

        // 1. Cria o usuário no sistema de autenticação do Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: senha,
            options: { email_confirm: true }
        });

        if (authError) {
            alert("Erro ao criar usuário na autenticação: " + authError.message);
        } else if (authData.user) {
            // 2. Insere o perfil na tabela 'profiles'
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    nome: nome,
                    nivel: nivel,
                    email: email
                });

            if (profileError) {
                alert("Usuário criado, mas falha ao salvar o perfil: " + profileError.message);
            } else {
                alert("Usuário cadastrado com sucesso!");
            }
        }
    }

    this.reset();
    document.getElementById('senha').placeholder = 'Mínimo 6 caracteres';
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Salvar Usuário';
    editandoId = null;

    await atualizarTabela();
});

// Função para atualizar tabela
async function atualizarTabela() {
    const { data: profiles, error } = await supabase.from('profiles').select('*').order('nome', { ascending: true });

    if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
    }

    const tbody = document.querySelector('#tabela-usuarios tbody');
    tbody.innerHTML = '';

    profiles.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${usuario.nivel}</td>
            <td>
                <button onclick="editarUsuario('${usuario.id}', '${usuario.nome}', '${usuario.nivel}')" class="btn-editar">Editar</button>
                <button onclick="excluirUsuario('${usuario.id}')" class="btn-excluir">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para preencher o formulário para edição
function editarUsuario(id, nome, nivel) {
    document.getElementById('nome').value = nome;
    document.getElementById('nivel').value = nivel;
    document.getElementById('senha').placeholder = 'Deixe em branco para não alterar';
    document.getElementById('senha').value = '';
    document.getElementById('senha').required = false; // Senha não é obrigatória na edição

    editandoId = id;
    document.querySelector('form button[type="submit"]').textContent = 'Atualizar Usuário';
    window.scrollTo(0, 0); // Rola a página para o topo para ver o formulário
}

// Função para excluir usuário
async function excluirUsuario(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
        return;
    }

    // ATENÇÃO: A exclusão segura de um usuário no Supabase envolve duas etapas:
    // 1. Excluir o perfil (na tabela 'profiles').
    // 2. Excluir o usuário da autenticação (em 'auth.users').
    // A etapa 2 requer privilégios de administrador (service_role) e não deve ser
    // feita diretamente do cliente por segurança.
    // Por enquanto, vamos apenas excluir o perfil. O usuário não conseguirá mais
    // logar, pois a lógica de login depende do perfil.

    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Erro ao excluir usuário: ' + error.message);
    } else {
        alert('Usuário excluído com sucesso.');
        await atualizarTabela();
    }
}

// Inicializar página
document.addEventListener('DOMContentLoaded', async () => {
    // Garante que o app.js (com a inicialização do Supabase) já carregou
    if (typeof supabase === 'undefined') {
        alert('Erro: Cliente Supabase não encontrado. Verifique a ordem dos scripts.');
        return;
    }
    await atualizarTabela();
});