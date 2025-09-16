// js/cadastro_pecas.js
// Lógica do cadastro de peças, agora com SupaBase

let pecas = []; // Cache local das peças para edição
let editandoId = null;
// Variáveis para controlar a ordenação da tabela
let sortColumn = 'codigo'; // Coluna inicial de ordenação
let sortAscending = true; // Direção inicial

// Função para sugerir o próximo código disponível
function sugerirProximoCodigo() {
    const codigoInput = document.getElementById('codigo');
    if (!codigoInput) return;

    // Se não estiver editando, sugere um novo código
    if (!editandoId) {
        if (pecas && pecas.length > 0) {
            // Pega todos os códigos, converte para número e filtra os que não são numéricos
            const codigosNumericos = pecas
                .map(p => parseInt(p.codigo, 10))
                .filter(n => !isNaN(n));
            
            if (codigosNumericos.length > 0) {
                const maxCodigo = Math.max(...codigosNumericos);
                codigoInput.value = maxCodigo + 1;
            } else {
                codigoInput.value = 1; // Caso não haja códigos numéricos na base
            }
        } else {
            codigoInput.value = 1; // Caso a tabela esteja completamente vazia
        }
    }
}

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
        // MODO EDIÇÃO: Lógica robusta para evitar erro de chave única.
        // 1. Encontra a peça original no cache para comparar as mudanças.
        const pecaOriginal = pecas.find(p => p.id === editandoId);
        const dadosParaAtualizar = {};

        // 2. Compara cada campo e adiciona ao objeto de atualização apenas o que mudou.
        if (pecaOriginal && pecaOriginal.codigo !== pecaData.codigo) {
            dadosParaAtualizar.codigo = pecaData.codigo;
        }
        if (pecaOriginal && pecaOriginal.nome !== pecaData.nome) {
            dadosParaAtualizar.nome = pecaData.nome;
        }
        if (pecaOriginal && (pecaOriginal.descricao || '') !== (pecaData.descricao || '')) {
            dadosParaAtualizar.descricao = pecaData.descricao;
        }

        // 3. Só executa a atualização se algum campo realmente foi alterado.
        if (Object.keys(dadosParaAtualizar).length > 0) {
            const { error: updateError } = await supabase
                .from('pecas')
                .update(dadosParaAtualizar)
                .eq('id', editandoId);
            error = updateError;
        }
        // Se nada mudou, 'error' continua undefined (considerado sucesso).
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
        // Limpa o formulário e reseta o modo de edição
        editandoId = null;
        document.getElementById('form-peca').reset();
        document.querySelector('form button[type="submit"]').textContent = 'Salvar Peça';
        await atualizarTabela();
        sugerirProximoCodigo(); // Sugere o próximo código após salvar
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

    // Pega o termo de busca do novo input
    const termoBusca = document.getElementById('busca-peca')?.value.trim();

    let query = supabase
        .from('pecas')
        .select('*')
        .order(sortColumn, { ascending: sortAscending });

    // Se houver um termo de busca, adiciona o filtro na consulta
    if (termoBusca) {
        // .or() busca em múltiplas colunas. ilike é case-insensitive.
        query = query.or(`nome.ilike.%${termoBusca}%,codigo.ilike.%${termoBusca}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Erro ao buscar peças:', error);
        tbody.innerHTML = '<tr><td colspan="4">Erro ao carregar peças.</td></tr>';
        return;
    }

    pecas = data || []; // Atualiza o cache local, garantindo que seja um array
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
                <button onclick="editarPeca('${peca.id}')" class="btn-editar">Editar</button>
                <button onclick="excluirPeca('${peca.id}')" class="btn-excluir">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Atualizar indicadores visuais nos cabeçalhos
    document.querySelectorAll('#tabela-pecas th.sortable').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (th.dataset.column === sortColumn) {
            th.classList.add(sortAscending ? 'sorted-asc' : 'sorted-desc');
        }
    });
}

// Função para preencher formulário para edição
function editarPeca(id) {
    const peca = pecas.find(p => p.id === id);
    if (peca) {
        document.getElementById('codigo').value = peca.codigo;
        document.getElementById('nome').value = peca.nome;
        document.getElementById('descricao').value = peca.descricao || ''; // Garante que o campo não fique com 'null' ou 'undefined'

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
document.addEventListener('DOMContentLoaded', async function() {
    if (!JSON.parse(localStorage.getItem('usuarioLogado'))) {
        window.location.href = '../index.html';
        return;
    }

    // Adicionar listeners para os novos controles de busca e atualização
    const buscaInput = document.getElementById('busca-peca');
    const btnAtualizar = document.getElementById('btn-atualizar-tabela');

    if (buscaInput) {
        buscaInput.addEventListener('input', () => atualizarTabela());
    }
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', () => atualizarTabela());
    }

    // Adicionar listeners de clique aos cabeçalhos da tabela para ordenação
    document.querySelectorAll('#tabela-pecas th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.column;
            if (sortColumn === column) {
                // Inverte a direção se a mesma coluna for clicada
                sortAscending = !sortAscending;
            } else {
                // Define a nova coluna e reseta a direção para ascendente
                sortColumn = column;
                sortAscending = true;
            }
            atualizarTabela(); // Recarrega a tabela com a nova ordenação
        });
    });

    await atualizarTabela(); // Aguarda a tabela (e o cache 'pecas') ser carregada
    sugerirProximoCodigo(); // Sugere o código com base nos dados carregados
});