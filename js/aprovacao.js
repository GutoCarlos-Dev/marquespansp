// Sistema de Solicitação de Peças - Página de Aprovação
// Comentários em português

// Configuração inicial dos event listeners
document.addEventListener('DOMContentLoaded', function() {
    carregarSolicitacoes();

    // Delegação de eventos para os botões de detalhes
    document.getElementById('tabela-solicitacoes').addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('btn-detalhes')) {
            const id = e.target.getAttribute('data-id');
            mostrarDetalhes(id);
        }
    });
});

// Função para carregar solicitações pendentes
function carregarSolicitacoes() {
    const solicitacoes = JSON.parse(localStorage.getItem('solicitacoes')) || [];
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const tbody = document.querySelector('#tabela-solicitacoes tbody');

    tbody.innerHTML = '';

    solicitacoes.forEach(function(solicitacao) {
        if (solicitacao.status === 'Pendente') {
            // Filtrar solicitações por supervisor se necessário
            if (usuarioLogado && usuarioLogado.nivel === 'supervisor') {
                if (solicitacao.supervisor !== usuarioLogado.nome) {
                    return;
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${solicitacao.codigo}</td>
                <td>${solicitacao.nomeTecnico}</td>
                <td>${solicitacao.placa || '-'}</td>
                <td>${solicitacao.status}</td>
                <td><button class="btn-detalhes" data-id="${solicitacao.id}">Detalhes</button></td>
            `;
            tbody.appendChild(tr);
        }
    });
}

// Função para mostrar detalhes da solicitação
function mostrarDetalhes(id) {
    const solicitacoes = JSON.parse(localStorage.getItem('solicitacoes')) || [];
    // Convertendo id para string para garantir comparação correta
    const solicitacao = solicitacoes.find(function(s) {
        return String(s.id) === String(id);
    });

    if (!solicitacao) {
        alert('Solicitação não encontrada.');
        return;
    }

    // Abrir nova aba com detalhes da solicitação, passando o id via query string
    window.open(`detalhes_solicitacao.html?id=${id}`, '_blank');
}



// Função de logout (placeholder)
function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = '../index.html';
}
