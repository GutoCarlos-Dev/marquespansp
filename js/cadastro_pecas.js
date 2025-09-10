// Cadastro de Peças - Lógica
// Simulação de armazenamento local

let pecas = JSON.parse(localStorage.getItem('pecas')) || [];

let editandoId = null; // Controla o modo de edição

// Função para gerar o próximo código de peça
function gerarProximoCodigo() {
    if (pecas.length === 0) {
        return 1;
    }
    // Garante que os códigos sejam tratados como números para encontrar o máximo
    const maxCodigo = Math.max(...pecas.map(p => parseInt(p.codigo, 10)));
    return maxCodigo + 1;
}

// Função para definir o próximo código no formulário
function definirProximoCodigo() {
    document.getElementById('codigo').value = gerarProximoCodigo();
}

// Função para salvar ou atualizar peça
document.getElementById('form-peca').addEventListener('submit', function(e) {
    e.preventDefault();

    const codigo = document.getElementById('codigo').value;
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;

    if (editandoId) {
        // Atualizando peça existente
        const index = pecas.findIndex(p => p.id === editandoId);
        if (index !== -1) {
            // Não permite alterar o código na edição para manter a integridade
            pecas[index].nome = nome;
            pecas[index].descricao = descricao;
        }
        editandoId = null;
        document.querySelector('form button[type="submit"]').textContent = 'Salvar Peça';
    } else {
        // Adicionando nova peça
        // Verifica se o código já existe
        if (pecas.some(p => p.codigo === codigo)) {
            alert('Erro: O código da peça já existe. Por favor, insira um código único.');
            return;
        }

        const novaPeca = {
            id: Date.now(),
            codigo: codigo,
            nome,
            descricao
        };
        pecas.push(novaPeca);
    }

    localStorage.setItem('pecas', JSON.stringify(pecas));

    // Limpar formulário
    this.reset();

    atualizarTabela();
    definirProximoCodigo(); // Define o código para a próxima peça
});

// Função para atualizar tabela
function atualizarTabela() {
    const tbody = document.querySelector('#tabela-pecas tbody');
    tbody.innerHTML = '';

    pecas.forEach(peca => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${peca.codigo}</td>
            <td>${peca.nome}</td>
            <td>${peca.descricao}</td>
            <td>
                <button onclick="editarPeca(${peca.id})" class="btn-editar">Editar</button>
                <button onclick="excluirPeca(${peca.id})" class="btn-excluir">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para editar peça
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
function excluirPeca(id) {
    pecas = pecas.filter(p => p.id !== id);
    localStorage.setItem('pecas', JSON.stringify(pecas));
    atualizarTabela();
}

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    atualizarTabela();
    definirProximoCodigo();
});
