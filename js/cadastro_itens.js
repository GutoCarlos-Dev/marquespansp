// Cadastro de Itens - Lógica
// Simulação de armazenamento local, em produção conectar com SupaBase

let itens = JSON.parse(localStorage.getItem('itens')) || [];

// Função para carregar placas no select
function carregarPlacas() {
    const placas = JSON.parse(localStorage.getItem('veiculos')) || [];
    const selectPlaca = document.getElementById('placa');
    selectPlaca.innerHTML = '<option value="">Selecione a Placa</option>';
    placas.forEach(placa => {
        const option = document.createElement('option');
        option.value = placa.placa;
        option.textContent = placa.placa;
        selectPlaca.appendChild(option);
    });
}

// Função para salvar item
document.getElementById('form-item').addEventListener('submit', function(e) {
    e.preventDefault();

    const placa = document.getElementById('placa').value;
    const codigoPeca = document.getElementById('codigo-peca').value;
    const nomePeca = document.getElementById('nome-peca').value;
    const quantidade = document.getElementById('quantidade').value;

    const novoItem = {
        id: Date.now(),
        placa,
        codigoPeca,
        nome: nomePeca,
        quantidade: parseInt(quantidade)
    };

    itens.push(novoItem);
    localStorage.setItem('itens', JSON.stringify(itens));

    // Limpar formulário
    this.reset();

    // Atualizar tabela
    atualizarTabela();
});

// Função para atualizar tabela
function atualizarTabela() {
    const tbody = document.querySelector('#tabela-itens tbody');
    tbody.innerHTML = '';

    itens.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.placa}</td>
            <td>${item.codigoPeca}</td>
            <td>${item.nome}</td>
            <td>${item.quantidade}</td>
            <td>
                <button onclick="editarItem(${item.id})">Editar</button>
                <button onclick="excluirItem(${item.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para editar item
function editarItem(id) {
    const item = itens.find(i => i.id === id);
    if (item) {
        document.getElementById('placa').value = item.placa;
        document.getElementById('codigo-peca').value = item.codigoPeca;
        document.getElementById('nome-peca').value = item.nome;
        document.getElementById('quantidade').value = item.quantidade;

        // Remover da lista para edição
        itens = itens.filter(i => i.id !== id);
        localStorage.setItem('itens', JSON.stringify(itens));
        atualizarTabela();
    }
}

// Função para excluir item
function excluirItem(id) {
    itens = itens.filter(i => i.id !== id);
    localStorage.setItem('itens', JSON.stringify(itens));
    atualizarTabela();
}

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    carregarPlacas();
    atualizarTabela();
});
