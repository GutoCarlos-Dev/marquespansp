// Lógica para o Dashboard do Técnico
// Comentários em português

document.addEventListener('DOMContentLoaded', async () => {
    // Garante que o Chart.js está carregado antes de executar o resto
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não foi carregado. Verifique a tag script no HTML.');
        return;
    }

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Usuário não logado. Redirecionando para login.');
        window.location.href = '../index.html';
        return;
    }

    // Mostrar nome completo do usuário no dashboard
    const nomeUsuarioSpan = document.getElementById('nome-usuario');
    if (nomeUsuarioSpan) {
        nomeUsuarioSpan.textContent = usuarioLogado.nomecompleto || usuarioLogado.nome;
    }

    // --- Container de Filtros ---    
    const filtroContainer = document.createElement('div');
    filtroContainer.id = 'filtro-visao-geral';
    filtroContainer.innerHTML = `
        <div class="filtro-grupo">
            <span class="filtro-titulo">Mostrar Dados de:</span>
            <div class="filtro-item-check">
                <input type="checkbox" id="check-solicitacoes" checked>
                <label for="check-solicitacoes">Quantidade Solicitações realizadas</label>
            </div>
            <div class="filtro-item-check">
                <input type="checkbox" id="check-pecas" checked>
                <label for="check-pecas">Quantidade Total de Peças</label>
            </div>
        </div>
        <div class="filtro-grupo">
            <span class="filtro-titulo">Por Período:</span>
            <div class="filtro-item">
                <label for="data-inicio">De:</label>
                <input type="date" id="data-inicio">
            </div>
            <div class="filtro-item">
                <label for="data-fim">Até:</label>
                <input type="date" id="data-fim">
            </div>
        </div>
        <div class="filtro-grupo-botoes">
            <button id="btn-filtrar-data">Filtrar e Mostrar Gráficos</button>
            <button id="btn-limpar-filtro" class="btn-secundario">Limpar</button>
        </div>
    `;
    
    const dashboardContainer = document.getElementById('dashboard-container');
    if (dashboardContainer) {
        dashboardContainer.insertBefore(filtroContainer, dashboardContainer.firstChild);
    }

    // Função para atualizar a visão geral com base em todos os filtros
    async function atualizarVisaoGeralComFiltro() {
        const dataInicio = document.getElementById('data-inicio').value;
        const dataFim = document.getElementById('data-fim').value;
        const mostrarSolicitacoes = document.getElementById('check-solicitacoes').checked;
        const mostrarPecas = document.getElementById('check-pecas').checked;

        // Limpa os containers antes de renderizar
        document.getElementById('summary-cards').innerHTML = '';
        document.getElementById('charts-container').style.display = 'none'; // Esconde para evitar layout quebrado
        document.getElementById('recent-activity-container').style.display = 'none';

        if (statusChartInstance) statusChartInstance.destroy();
        if (barChartInstance) barChartInstance.destroy();

        let solicitacoesFiltradas = [];

        // Busca os dados base uma única vez, aplicando o filtro de data
        switch (usuarioLogado.nivel) {
            case 'administrador':
            case 'matriz':
                solicitacoesFiltradas = await buscarSolicitacoesAdmin(dataInicio, dataFim);
                break;
            case 'supervisor':
                solicitacoesFiltradas = await buscarSolicitacoesSupervisor(usuarioLogado, dataInicio, dataFim);
                break;
            case 'tecnico':
                solicitacoesFiltradas = await buscarSolicitacoesTecnico(usuarioLogado, dataInicio, dataFim);
                break;
            default:
                document.getElementById('dashboard-container').innerHTML = '<p>Nível de usuário não reconhecido.</p>';
                return;
        }

        // Renderiza os componentes com base nos checkboxes
        if (mostrarSolicitacoes) {
            renderizarDadosSolicitacoes(solicitacoesFiltradas, usuarioLogado.nivel);
            document.getElementById('charts-container').style.display = 'grid';
            document.getElementById('recent-activity-container').style.display = 'block';
        }

        if (mostrarPecas) {
            renderizarDadosPecas(solicitacoesFiltradas, usuarioLogado.nivel);
            document.getElementById('charts-container').style.display = 'grid';
        }

        // Se ambos estiverem desmarcados, mostra uma mensagem
        if (!mostrarSolicitacoes && !mostrarPecas) {
            document.getElementById('summary-cards').innerHTML = '<p class="aviso-filtro">Selecione uma opção e clique em "Filtrar" para ver os dados.</p>';
        }
    }

    // Adicionar listeners para os botões de filtro
    document.getElementById('btn-filtrar-data').addEventListener('click', atualizarVisaoGeralComFiltro);
    document.getElementById('btn-limpar-filtro').addEventListener('click', () => {
        document.getElementById('data-inicio').value = '';
        document.getElementById('data-fim').value = '';
        document.getElementById('check-solicitacoes').checked = true;
        document.getElementById('check-pecas').checked = true;
        atualizarVisaoGeralComFiltro(); // Recarrega com os filtros limpos
    });

    // Carregamento inicial do dashboard (sem filtro de data)
    atualizarVisaoGeralComFiltro();
});

// --- Funções de Renderização de Dashboards ---

// Variáveis para armazenar as instâncias dos gráficos e destruí-las antes de recriar
let statusChartInstance = null;
let barChartInstance = null;

// --- Funções de Busca de Dados ---

async function buscarSolicitacoesComFiltro(baseQuery, dataInicio, dataFim) {
    if (dataInicio) {
        baseQuery = baseQuery.gte('created_at', `${dataInicio}T00:00:00`);
    }
    if (dataFim) {
        // Adiciona o final do dia para incluir a data final completa
        baseQuery = baseQuery.lte('created_at', `${dataFim}T23:59:59`);
    }
    const { data, error } = await baseQuery;
    if (error) {
        console.error('Erro ao buscar solicitações:', error);
        return [];
    }
    return data;
}

async function buscarSolicitacoesAdmin(dataInicio, dataFim) {
    let query = supabase
        .from('solicitacoes')
        .select('id, created_at, status, itens, usuario:usuario_id(nome, nivel)');
    return await buscarSolicitacoesComFiltro(query, dataInicio, dataFim);
}

async function buscarSolicitacoesSupervisor(usuarioSupervisor, dataInicio, dataFim) {
    const { data: veiculosSupervisor, error: veiculosError } = await supabase
        .from('veiculos')
        .select('id')
        .eq('supervisor_id', usuarioSupervisor.id);

    if (veiculosError || !veiculosSupervisor || veiculosSupervisor.length === 0) {
        console.error('Erro ou nenhum veículo encontrado para o supervisor:', veiculosError);
        return [];
    }
    const veiculosIds = veiculosSupervisor.map(v => v.id);
    let query = supabase
        .from('solicitacoes')
        .select('id, created_at, status, itens, usuario:usuario_id(nome, nivel)')
        .in('veiculo_id', veiculosIds);
    return await buscarSolicitacoesComFiltro(query, dataInicio, dataFim);
}

async function buscarSolicitacoesTecnico(usuarioTecnico, dataInicio, dataFim) {
    let query = supabase
        .from('solicitacoes')
        .select('id, created_at, status, itens, usuario:usuario_id(nome)')
        .eq('usuario_id', usuarioTecnico.id);
    return await buscarSolicitacoesComFiltro(query, dataInicio, dataFim);
}

// --- Funções de Renderização de Componentes ---

function renderizarDadosSolicitacoes(solicitacoes, nivelUsuario) {
    // 1. Cards de Resumo de Solicitações
    const totalSolicitacoes = solicitacoes.length;
    const totalPendente = solicitacoes.filter(s => s.status === 'pendente').length;
    const totalAprovado = solicitacoes.filter(s => s.status === 'aprovado').length;
    const totalRejeitado = solicitacoes.filter(s => s.status === 'rejeitado').length;
    const totalEnviado = solicitacoes.filter(s => s.status === 'enviado').length;
    renderSummaryCards([
        { title: 'Total de Solicitações', value: totalSolicitacoes, className: '' },
        { title: 'Pendentes', value: totalPendente, className: 'pendente' },
        { title: 'Aprovadas', value: totalAprovado, className: 'aprovado' },
        { title: 'Rejeitadas', value: totalRejeitado, className: 'rejeitado' },
        { title: 'Enviadas', value: totalEnviado, className: 'enviado' }
    ]);

    // 2. Gráfico de Pizza: Status
    document.getElementById('status-chart-container').style.display = 'block';
    const statusData = {
        'Pendente': solicitacoes.filter(s => s.status === 'pendente').length,
        'Aprovado': solicitacoes.filter(s => s.status === 'aprovado').length,
        'Enviado': solicitacoes.filter(s => s.status === 'enviado').length,
        'Rejeitado': solicitacoes.filter(s => s.status === 'rejeitado').length
    };
    renderPieChart('status-chart', 'Status das Solicitações', Object.keys(statusData), Object.values(statusData));

    // 3. Grid de Atividade Recente
    const solicitacoesRecentes = [...solicitacoes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
    renderRecentActivityGrid(solicitacoesRecentes);
}

function renderizarDadosPecas(solicitacoes, nivelUsuario) {
    // 1. Card de Total de Peças
    const totalPecas = solicitacoes.reduce((total, s) => {
        return total + (s.itens || []).reduce((subtotal, item) => subtotal + item.quantidade, 0);
    }, 0);
    renderSummaryCards([{ title: 'Total de Peças Solicitadas', value: totalPecas, className: 'pecas-total' }]);

    // 2. Gráfico de Barras: Peças por Técnico
    // Não mostrar para técnico, pois só teria uma barra
    if (nivelUsuario === 'tecnico') {
        document.getElementById('bar-chart-container').style.display = 'none';
        return;
    }
    document.getElementById('bar-chart-container').style.display = 'block';
    document.getElementById('bar-chart-title').textContent = 'Peças por Técnico';

    const solicitacoesPorTecnico = {};
    solicitacoes.forEach(s => {
        if (s.usuario && (s.usuario.nivel === 'tecnico' || nivelUsuario === 'supervisor')) {
            const nomeTecnico = s.usuario.nome;
            const totalItens = (s.itens || []).reduce((acc, item) => acc + (item.quantidade || 0), 0);
            solicitacoesPorTecnico[nomeTecnico] = (solicitacoesPorTecnico[nomeTecnico] || 0) + totalItens;
        }
    });
    renderBarChart('bar-chart', 'Nº de Peças', Object.keys(solicitacoesPorTecnico), Object.values(solicitacoesPorTecnico));
}

// --- Funções Auxiliares de Renderização ---

function renderSummaryCards(cardsData) {
    const container = document.getElementById('summary-cards');
    // Não limpa, para que os cards de peças e solicitações possam ser adicionados juntos
    cardsData.forEach(data => {
        const card = document.createElement('div');
        card.className = `card ${data.className || ''}`;
        card.innerHTML = `
            <h4>${data.title}</h4>
            <p>${data.value}</p>
        `;
        container.appendChild(card);
    });
}

function renderPieChart(canvasId, label, labels, data) {
    // Destrói o gráfico anterior se ele existir, para evitar sobreposição e memory leaks
    if (statusChartInstance) {
        statusChartInstance.destroy();
    }
    const ctx = document.getElementById(canvasId).getContext('2d');
    statusChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: ['#ff9800', '#4CAF50', '#2196F3', '#f44336'], // Pendente, Aprovado, Enviado, Rejeitado
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderBarChart(canvasId, label, labels, data) {
    // Destrói o gráfico anterior se ele existir
    if (barChartInstance) {
        barChartInstance.destroy();
    }
    const ctx = document.getElementById(canvasId).getContext('2d');
    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: 'rgba(76, 175, 80, 0.6)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function renderRecentActivityGrid(solicitacoes) {
    const table = document.getElementById('tabela-recente');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = `
        <tr>
            <th>Código</th>
            <th>Data</th>
            <th>Técnico</th>
            <th>Status</th>
            <th>Itens</th>
        </tr>
    `;
    tbody.innerHTML = '';

    if (solicitacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhuma atividade recente.</td></tr>';
        return;
    }

    solicitacoes.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${String(s.id).padStart(5, '0')}</td>
            <td>${new Date(s.created_at).toLocaleString('pt-BR')}</td>
            <td>${s.usuario?.nome || 'N/A'}</td> 
            <td><span class="status ${s.status.toLowerCase()}">${s.status}</span></td>
            <td>${(s.itens || []).reduce((total, item) => total + item.quantidade, 0)}</td>
        `;
        tbody.appendChild(tr);
    });
}
