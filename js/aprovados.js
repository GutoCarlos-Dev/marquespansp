// Solicitações Aprovadas - Lógica
// Para Matriz

let solicitacaoAtual = null;

// Carregar opções de filtros
function carregarOpcoesFiltros() {
    // Carregar placas
    const veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
    const selectPlaca = document.getElementById('placa');
    veiculos.forEach(veiculo => {
        const option = document.createElement('option');
        option.value = veiculo.placa;
        option.textContent = veiculo.placa;
        selectPlaca.appendChild(option);
    });

    // Carregar supervisores
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const supervisores = usuarios.filter(u => u.nivel === 'supervisor');
    const selectSupervisor = document.getElementById('supervisor');
    supervisores.forEach(sup => {
        const option = document.createElement('option');
        option.value = sup.nome;
        option.textContent = sup.nome;
        selectSupervisor.appendChild(option);
    });
}

function buscarSolicitacoes() {
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    const status = document.getElementById('status').value;
    const placa = document.getElementById('placa').value;
    const supervisor = document.getElementById('supervisor').value;
    const codigo = document.getElementById('codigo').value;

    const solicitacoes = JSON.parse(localStorage.getItem('solicitacoes')) || [];
    // Mostrar também as solicitações com status 'Enviado' para aparecer no grid
    let filtradas = solicitacoes.filter(s => s.status === 'Aprovado' || s.status === 'Rejeitado' || s.status === 'Enviado');

    // Aplicar filtros
    if (dataInicio) {
        filtradas = filtradas.filter(s => new Date(s.dataAprovacao) >= new Date(dataInicio));
    }
    if (dataFim) {
        filtradas = filtradas.filter(s => new Date(s.dataAprovacao) <= new Date(dataFim));
    }
    if (status) {
        filtradas = filtradas.filter(s => s.status === status);
    }
    if (placa) {
        filtradas = filtradas.filter(s => s.placa === placa);
    }
    if (supervisor) {
        filtradas = filtradas.filter(s => s.supervisor === supervisor);
    }
    if (codigo) {
        filtradas = filtradas.filter(s => s.codigo.includes(codigo));
    }

    exibirSolicitacoes(filtradas);
}

// Exibir solicitações na tabela
function exibirSolicitacoes(solicitacoes) {
    const tbody = document.querySelector('#tabela-aprovados tbody');
    tbody.innerHTML = '';

    // Pega o usuário logado para verificar o nível de acesso
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    solicitacoes.forEach(solicitacao => {
        const tr = document.createElement('tr');
        if (solicitacao.status === 'Rejeitado') {
            tr.classList.add('status-rejeitado');
        }

        const dataFormatada = solicitacao.dataAprovacao ? new Date(solicitacao.dataAprovacao).toLocaleDateString('pt-BR') : '';
        const dataEnvioFormatada = solicitacao.dataEnvio ? new Date(solicitacao.dataEnvio).toLocaleDateString('pt-BR') : '';

        let acaoBotao = '';
        if (solicitacao.status === 'Enviado') {
            acaoBotao = `<button onclick="enviarSolicitacao('${solicitacao.id}')" class="btn-pdf">Baixar PDF</button>`;
        } else if (solicitacao.status === 'Rejeitado') {
            acaoBotao = `<button onclick="verDetalhes('${solicitacao.id}')" class="btn-detalhes-rejeitado">Detalhes</button>`;
        } else { // Aprovado
            acaoBotao = `<button onclick="enviarSolicitacao('${solicitacao.id}')" class="btn-enviar">Enviar Solicitação</button>`;
        }

        // Adiciona o botão de excluir apenas para o administrador
        if (usuarioLogado && usuarioLogado.nivel === 'administrador') {
            acaoBotao += ` <button onclick="excluirSolicitacao('${solicitacao.id}')" class="btn-excluir-grid">Excluir</button>`;
        }

        tr.innerHTML = `
            <td>${solicitacao.codigo}</td>
            <td>${dataFormatada}</td>
            <td>${solicitacao.nomeTecnico}</td>
            <td>${solicitacao.placa}</td>
            <td>${solicitacao.supervisor}</td>
            <td>${solicitacao.status}</td>
            <td>${dataEnvioFormatada}</td>
            <td>${acaoBotao}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Enviar solicitação - abre nova página
function enviarSolicitacao(id) {
    window.open(`envio_solicitacao.html?id=${id}`, '_blank');
}

// Ver detalhes da solicitação - abre nova página
function verDetalhes(id) {
    window.open(`detalhes_solicitacao.html?id=${id}`, '_blank');
}

// Função para excluir uma solicitação (apenas para admin)
function excluirSolicitacao(id) {
    if (confirm('Deseja realmente excluir este lançamento?')) {
        let solicitacoes = JSON.parse(localStorage.getItem('solicitacoes')) || [];
        solicitacoes = solicitacoes.filter(s => String(s.id) !== String(id));
        localStorage.setItem('solicitacoes', JSON.stringify(solicitacoes));
        buscarSolicitacoes(); // Recarrega o grid para refletir a exclusão
    }
}

// Função para exportar os dados da tabela para um arquivo .xlsx
function exportarParaPlanilha() {
    // Pega a tabela visível na página
    const tabela = document.getElementById('tabela-aprovados');
    
    // Clona a tabela para poder remover a coluna de ações sem afetar a exibição
    const tabelaClone = tabela.cloneNode(true);

    // Remove a última coluna (Ações) do cabeçalho e de cada linha do corpo da tabela clonada
    tabelaClone.querySelector('thead tr').deleteCell(-1);
    tabelaClone.querySelectorAll('tbody tr').forEach(row => {
        row.deleteCell(-1);
    });

    // Converte o elemento da tabela clonada em uma planilha do Excel
    const workbook = XLSX.utils.table_to_book(tabelaClone, { sheet: "Solicitações" });

    // Gera o arquivo .xlsx e inicia o download
    XLSX.writeFile(workbook, "Relatorio_Solicitacoes.xlsx");
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    carregarOpcoesFiltros();
    document.getElementById('btn-buscar').addEventListener('click', buscarSolicitacoes);
    document.getElementById('btn-exportar').addEventListener('click', exportarParaPlanilha);
    buscarSolicitacoes(); // Carregar todas inicialmente
});
