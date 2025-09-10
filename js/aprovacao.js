// Sistema de Solicitação de Peças - Página de Aprovação
// Comentários em português

// Configuração inicial dos event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o usuário está logado antes de carregar
    if (!JSON.parse(localStorage.getItem('usuarioLogado'))) {
        window.location.href = '../index.html';
        return;
    }
    carregarSolicitacoes(); // Agora carrega do Supabase

    // Delegação de eventos para os botões de detalhes
    document.getElementById('tabela-solicitacoes').addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('btn-detalhes')) {
            const id = e.target.getAttribute('data-id');
            mostrarDetalhes(id);
        }
    });
});

// Função para carregar solicitações pendentes do Supabase
async function carregarSolicitacoes() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const tbody = document.querySelector('#tabela-solicitacoes tbody');

    if (!tbody || !supabase) {
        tbody.innerHTML = '<tr><td colspan="6">Erro de conexão.</td></tr>';
        return;
    }
    tbody.innerHTML = '<tr><td colspan="6">Carregando...</td></tr>';

    let query = supabase
        .from('solicitacoes')
        .select(`
            id,
            created_at,
            status,
            usuario:usuario_id ( nome ),
            veiculo:veiculo_id ( placa, supervisor_id )
        `)
        .eq('status', 'pendente');

    // Se for supervisor, filtra pelas solicitações dos veículos que ele supervisiona
    if (usuarioLogado && usuarioLogado.nivel === 'supervisor') {
        const { data: veiculosSupervisor, error: veiculosError } = await supabase
            .from('veiculos')
            .select('id')
            .eq('supervisor_id', usuarioLogado.id);

        if (veiculosError) {
            console.error('Erro ao buscar veículos do supervisor:', veiculosError);
            tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar dados da equipe.</td></tr>';
            return;
        }
        const veiculosIds = veiculosSupervisor.map(v => v.id);
        if (veiculosIds.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Nenhuma solicitação pendente para sua equipe.</td></tr>';
            return;
        }
        query = query.in('veiculo_id', veiculosIds);
    }

    const { data: solicitacoes, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar solicitações:', error);
        tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar solicitações.</td></tr>';
        return;
    }

    if (solicitacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Nenhuma solicitação pendente.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    solicitacoes.forEach(solicitacao => {
        const tr = document.createElement('tr');
        const dataFormatada = new Date(solicitacao.created_at).toLocaleString('pt-BR');
        tr.innerHTML = `
            <td>${String(solicitacao.id).padStart(5, '0')}</td>
            <td>${dataFormatada}</td>
            <td>${solicitacao.usuario ? solicitacao.usuario.nome : 'N/A'}</td>
            <td>${solicitacao.veiculo ? solicitacao.veiculo.placa : 'N/A'}</td>
            <td><span class="status ${solicitacao.status.toLowerCase()}">${solicitacao.status}</span></td>
            <td><button class="btn-detalhes" data-id="${solicitacao.id}">Detalhes</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para mostrar detalhes da solicitação
function mostrarDetalhes(id) {
    // Abrir nova aba com detalhes da solicitação, passando o id via query string
    window.open(`detalhes_solicitacao.html?id=${id}`, '_blank');
}
