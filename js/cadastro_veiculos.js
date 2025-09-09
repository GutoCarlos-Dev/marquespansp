// Cadastro de Veículos - Lógica
// Cada veículo (placa) tem um supervisor associado

let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];

// Função para carregar supervisores no select
function carregarSupervisores() {
    const supervisores = JSON.parse(localStorage.getItem('usuarios')) || [];
    const select = document.getElementById('supervisor');
    select.innerHTML = '<option value="">Selecione</option>';

    supervisores.filter(u => u.nivel === 'supervisor').forEach(sup => {
        const option = document.createElement('option');
        option.value = sup.id;
        option.textContent = sup.nome;
        select.appendChild(option);
    });
}

// Função para carregar técnicos no select
function carregarTecnicos() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const select = document.getElementById('tecnico');
    select.innerHTML = '<option value="">Selecione</option>';

    usuarios.filter(u => u.nivel === 'tecnico').forEach(tec => {
        const option = document.createElement('option');
        option.value = tec.id;
        option.textContent = tec.nome;
        select.appendChild(option);
    });
}

// Função para salvar veículo
document.getElementById('form-veiculo').addEventListener('submit', function(e) {
    e.preventDefault();

    const placa = document.getElementById('placa').value;
    const qtdEquipe = document.getElementById('qtd_equipe').value;
    const supervisorId = document.getElementById('supervisor').value;
    const tecnicoId = document.getElementById('tecnico').value;

    const novoVeiculo = {
        id: Date.now(),
        placa,
        qtdEquipe: parseInt(qtdEquipe),
        supervisorId: parseInt(supervisorId),
        tecnicoId: parseInt(tecnicoId)
    };

    veiculos.push(novoVeiculo);
    localStorage.setItem('veiculos', JSON.stringify(veiculos));

    // Limpar formulário
    this.reset();

    // Atualizar tabela
    atualizarTabela();
});

// Função para atualizar tabela
function atualizarTabela() {
    const tbody = document.querySelector('#tabela-veiculos tbody');
    tbody.innerHTML = '';

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    veiculos.forEach(veiculo => {
        const supervisor = usuarios.find(s => s.id === veiculo.supervisorId);
        const tecnico = usuarios.find(t => t.id === veiculo.tecnicoId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${veiculo.placa}</td>
            <td>${veiculo.qtdEquipe || 0}</td>
            <td>${supervisor ? supervisor.nome : '-'}</td>
            <td>${tecnico ? tecnico.nome : '-'}</td>
            <td>
                <button onclick="editarVeiculo(${veiculo.id})" class="btn-editar">Editar</button>
                <button onclick="excluirVeiculo(${veiculo.id})" class="btn-excluir">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para editar veículo
function editarVeiculo(id) {
    const veiculo = veiculos.find(v => v.id === id);
    if (veiculo) {
        document.getElementById('placa').value = veiculo.placa;
        document.getElementById('qtd_equipe').value = veiculo.qtdEquipe;
        document.getElementById('supervisor').value = veiculo.supervisorId;
        document.getElementById('tecnico').value = veiculo.tecnicoId;

        // Remover da lista para edição
        veiculos = veiculos.filter(v => v.id !== id);
        localStorage.setItem('veiculos', JSON.stringify(veiculos));
        atualizarTabela();
    }
}

// Função para excluir veículo
function excluirVeiculo(id) {
    veiculos = veiculos.filter(v => v.id !== id);
    localStorage.setItem('veiculos', JSON.stringify(veiculos));
    atualizarTabela();
}

// Inicializar ao carregar página
document.addEventListener('DOMContentLoaded', function() {
    carregarSupervisores();
    carregarTecnicos();
    atualizarTabela();
});
