// js/cadastro_usuarios.js

// Usando SupaBase para armazenamento
let usuarios = [];
let editandoId = null; // Variável para controlar o ID do usuário em edição

// Função para salvar usuário (adicionar ou editar)
document.getElementById('form-usuario').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const nomecompleto = document.getElementById('nomecompleto').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const nivel = document.getElementById('nivel').value;

    try {
        // Importar supabase do config.js
        if (!supabase) {
            alert('Erro: A conexão com o Supabase não foi inicializada. Verifique o config.js e a conexão com a internet.');
            return;
        }

        if (editandoId) {
            // Editando usuário existente
            const updateData = {
                nome,
                nomecompleto,
                email,
                nivel
            };
            if (senha) { // Só atualiza a senha se uma nova for digitada
                updateData.senha = senha;
            }

            const { error } = await supabase
                .from('usuarios')
                .update(updateData)
                .eq('id', editandoId);

            if (error) {
                console.error('Erro ao atualizar usuário:', error);
                alert('Erro ao atualizar usuário. Tente novamente.');
                return;
            }

            editandoId = null; // Reseta o modo de edição
            document.querySelector('form button[type="submit"]').textContent = '💾 Salvar Usuário';
        } else {
            // Adicionando novo usuário
            // Validação: A senha é obrigatória para novos usuários
            if (!senha) {
                alert('O campo Senha é obrigatório para cadastrar um novo usuário.');
                return;
            }

            const novoUsuario = {
                nome,
                nomecompleto,
                email,
                senha,
                nivel
            };

            const { error } = await supabase
                .from('usuarios')
                .insert([novoUsuario]); 
                // .select() foi removido. Isso deve impedir a biblioteca de gerar uma URL malformada
                // com o parâmetro 'columns' em uma requisição de inserção, resolvendo o erro 400.


            if (error) {
                // Exibe o erro real do Supabase para facilitar a depuração
                const mensagemErro = `Erro ao cadastrar usuário: ${error.message || 'Verifique o console para detalhes.'}`;
                console.error('Erro ao inserir usuário:', error);
                alert(mensagemErro);
                return;
            }
        }

        // Limpar formulário
        this.reset();
        document.getElementById('senha').placeholder = 'Deixe em branco para não alterar';

        // Atualizar tabela
        await atualizarTabela();

        alert('Usuário salvo com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        alert('Erro ao salvar usuário. Verifique sua conexão e tente novamente.');
    }
});

// Função para atualizar tabela
async function atualizarTabela() {
    const tbody = document.querySelector('#tabela-usuarios tbody');
    if (!tbody) return;

    try {
        if (!supabase) {
            tbody.innerHTML = '<tr><td colspan="5">Erro: Conexão com o Supabase não inicializada.</td></tr>';
            return;
        }

        const { data: usuariosData, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('nome');

        if (error) {
            console.error('Erro ao buscar usuários:', error);
            tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar usuários</td></tr>';
            return;
        }

        usuarios = usuariosData || [];
        tbody.innerHTML = '';

        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhum usuário cadastrado</td></tr>';
            return;
        }

usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.nome}</td>
                <td>${usuario.nomecompleto}</td>
                <td>${usuario.email}</td>
                <td>${usuario.nivel}</td>
                <td>
                    <button onclick="editarUsuario(${usuario.id})" class="btn-editar">✏️Editar</button>
                    <button onclick="excluirUsuario(${usuario.id})" class="btn-excluir">🗑️Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao atualizar tabela:', error);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar usuários</td></tr>';
    }
}

// Função para preencher formulário para edição
function editarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
        document.getElementById('nome').value = usuario.nome;
        document.getElementById('nomecompleto').value = usuario.nomecompleto;
        document.getElementById('email').value = usuario.email;
        // Não preenchemos a senha por segurança, o usuário digita uma nova se quiser alterar
        document.getElementById('senha').placeholder = 'Digite uma nova senha para alterar';
        document.getElementById('senha').value = ''; // Limpa o campo senha
        document.getElementById('nivel').value = usuario.nivel;
        
        editandoId = id;
        document.querySelector('form button[type="submit"]').textContent = 'Atualizar Usuário';
        window.scrollTo(0, 0); // Rola a página para o topo para ver o formulário
    }
}

// Função para excluir usuário
async function excluirUsuario(id) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        try {
            if (!supabase) {
                alert('Erro: A conexão com o Supabase não foi inicializada.');
                return;
            }

            const { error } = await supabase
                .from('usuarios')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Erro ao excluir usuário:', error);
                alert('Erro ao excluir usuário. Tente novamente.');
                return;
            }

            alert('Usuário excluído com sucesso!');
            await atualizarTabela();
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            alert('Erro ao excluir usuário. Verifique sua conexão e tente novamente.');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-usuario');
    if (form) {
        // Verifica se usuário está logado antes de atualizar tabela
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuarioLogado) {
            window.location.href = '../index.html';
            return;
        }
        atualizarTabela();
    }
});
