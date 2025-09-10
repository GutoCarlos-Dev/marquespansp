// js/cadastro_pecas.js
// Lógica do cadastro de peças, agora com SupaBase

let pecas = []; // Cache local das peças para edição
let editandoId = null;

// Função para salvar peça (adicionar ou editar)
document.getElementById('form-peca').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!supabase) {
        alert('Erro: A conexão com o Supabase não foi inicializada.');
        return;
    }

    const codigo = document.getElementById('codigo').value;
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;

    const pecaData = {
        codigo,
        nome,
        descricao,
    };

    let error;

    if (editandoId) {
        // Editando
        const { error: updateError } = await supabase
            .from('pecas')
            .update(pecaData)
            .eq('id', editandoId);
        error = updateError;
    } else {
        // Adicionando
        const { error: insertError } = await supabase
            .from('pecas')
            .insert([pecaData])
            .select();
        error = insertError;
    }

    if (error) {
        console.error('Erro ao salvar peça:', error);
        alert('Erro ao salvar peça. Verifique se o código já existe.');
    } else {
        alert('Peça salva com sucesso!');
        this.reset();
        editandoId = null;
        document.querySelector('form button[type="submit"]').textContent = 'Salvar Peça';
        await atualizarTabela();
    }
});

// Função para atualizar tabela de peças
async function atualizarTabela() {
    const tbody = document.querySelector('#tabela-pecas tbody');
    if (!tbody || !supabase) {
        tbody.innerHTML = '<tr><td colspan="4">Erro: Conexão com o Supabase não inicializada.</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';

    const { data, error } = await supabase
        .from('pecas')
        .select('*')
        .order('nome');

    if (error) {
        console.error('Erro ao buscar peças:', error);
        tbody.innerHTML = '<tr><td colspan="4">Erro ao carregar peças.</td></tr>';
        return;
    }

    pecas = data; // Atualiza o cache local
    tbody.innerHTML = '';

    if (pecas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Nenhuma peça cadastrada.</td></tr>';
        return;
    }

    pecas.forEach(peca => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${peca.codigo}</td>
            <td>${peca.nome}</td>
            <td>${peca.descricao || '-'}</td>
            <td>
                <button onclick="editarPeca(${peca.id})" class="btn-editar">Editar</button>
                <button onclick="excluirPeca(${peca.id})" class="btn-excluir">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para preencher formulário para edição
function editarPeca(id) {
    const peca = pecas.find(p => p.id === id);
    if (peca) {
        document.getElementById('codigo').value = peca.codigo;
        document.getElementById('nome').value = peca.nome;
        document.getElementById('descricao').value = peca.descricao;

        editandoId = id;
        document.querySelector('form button[type="submit"]').textContent = 'Atualizar Peça';
        window.scrollTo(0, 0);
    }
}

// Função para excluir peça
async function excluirPeca(id) {
    if (confirm('Tem certeza que deseja excluir esta peça?')) {
        if (!supabase) {
            alert('Erro: A conexão com o Supabase não foi inicializada.');
            return;
        }

        const { error } = await supabase
            .from('pecas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir peça:', error);
            alert('Erro ao excluir peça.');
        } else {
            alert('Peça excluída com sucesso!');
            await atualizarTabela();
        }
    }
}

// Inicializar ao carregar página
document.addEventListener('DOMContentLoaded', function() {
    if (!JSON.parse(localStorage.getItem('usuarioLogado'))) {
        window.location.href = '../index.html';
        return;
    }
    atualizarTabela();
});