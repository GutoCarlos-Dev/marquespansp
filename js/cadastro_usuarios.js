// js/cadastro_usuarios.js

// Simulação de armazenamento local, em produção conectar com SupaBase
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let editandoId = null; // Variável para controlar o ID do usuário em edição

// Função para salvar usuário (adicionar ou editar)
document.getElementById('form-usuario').addEventListener('submit', function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const nivel = document.getElementById('nivel').value;

    if (editandoId) {
        // Editando usuário existente
        const index = usuarios.findIndex(u => u.id === editandoId);
        if (index !== -1) {
            usuarios[index].nome = nome;
            usuarios[index].email = email;
            if (senha) { // Só atualiza a senha se uma nova for digitada
                usuarios[index].senha = senha;
            }
            usuarios[index].nivel = nivel;
        }
        editandoId = null; // Reseta o modo de edição
        document.querySelector('form button[type="submit"]').textContent = 'Salvar Usuário';
    } else {
        // Adicionando novo usuário
        const novoUsuario = {
            id: Date.now(),
            nome,
            email,
            senha,
            nivel
        };
        usuarios.push(novoUsuario);
    }

    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Limpar formulário
    this.reset();
    document.getElementById('senha').placeholder = 'Deixe em branco para não alterar';

    // Atualizar tabela
    atualizarTabela();
});

// Função para atualizar tabela
function atualizarTabela() {
    const tbody = document.querySelector('#tabela-usuarios tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    usuarios.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>${usuario.nivel}</td>
            <td>
                <button onclick="editarUsuario(${usuario.id})" class="btn-editar">Editar</button>
                <button onclick="excluirUsuario(${usuario.id})" class="btn-excluir">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para preencher formulário para edição
function editarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
        document.getElementById('nome').value = usuario.nome;
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
function excluirUsuario(id) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        usuarios = usuarios.filter(u => u.id !== id);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        atualizarTabela();
    }
}

// Função para exportar usuários para SQL do SupaBase
function exportarUsuariosSQL() {
    if (usuarios.length === 0) {
        alert('❌ Nenhum usuário cadastrado para exportar.');
        return;
    }

    let sql = '-- Script SQL para importar usuários no SupaBase\n';
    sql += '-- Gerado em: ' + new Date().toLocaleString('pt-BR') + '\n\n';

    // Criar tabela
    sql += '-- Criar tabela usuarios\n';
    sql += 'CREATE TABLE IF NOT EXISTS usuarios (\n';
    sql += '    id BIGINT PRIMARY KEY,\n';
    sql += '    nome TEXT NOT NULL,\n';
    sql += '    email TEXT UNIQUE NOT NULL,\n';
    sql += '    senha TEXT NOT NULL,\n';
    sql += '    nivel TEXT NOT NULL\n';
    sql += ');\n\n';

    // Inserir usuários
    sql += '-- Inserir usuários\n';
    usuarios.forEach((usuario, index) => {
        try {
            const nome = usuario.nome ? usuario.nome.replace(/'/g, "''") : '';
            const email = usuario.email ? usuario.email.replace(/'/g, "''") : '';
            const senha = usuario.senha ? usuario.senha.replace(/'/g, "''") : '';
            const nivel = usuario.nivel || 'tecnico';

            sql += `INSERT INTO usuarios (id, nome, email, senha, nivel) VALUES (${usuario.id}, '${nome}', '${email}', '${senha}', '${nivel}');\n`;
        } catch (error) {
            console.error(`Erro ao processar usuário ${index + 1}:`, error);
        }
    });

    // Verificar inserção
    sql += '\n-- Verificar inserção\n';
    sql += 'SELECT * FROM usuarios ORDER BY id;\n';

    // Criar um blob com o SQL e fazer download
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_supabase_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`✅ SQL exportado com sucesso!\n\n📁 Arquivo: usuarios_supabase_${new Date().toISOString().split('T')[0]}.sql\n\n📋 Copie o conteúdo do arquivo e cole no SQL Editor do SupaBase.`);
}

// Event listener para o botão de exportar
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-usuario');
    if (form) {
        atualizarTabela();
    }

    // Adicionar event listener para o botão de exportar
    const btnExportar = document.getElementById('btn-exportar-sql');
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarUsuariosSQL);
    }
});
