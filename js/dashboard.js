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

    // Mostrar nome do usuário
    const nomeUsuarioSpan = document.getElementById('nome-usuario');
    if (nomeUsuarioSpan) {
        nomeUsuarioSpan.textContent = usuarioLogado.nome;
    }

    // Renderiza o dashboard de acordo com o nível do usuário
    switch (usuarioLogado.nivel) {
        case 'administrador':
        case 'matriz':
            await renderDashboardAdminMatriz();
            break;
        case 'supervisor':
            await renderDashboardSupervisor(usuarioLogado);
            break;
        case 'tecnico':
            await renderDashboardTecnico(usuarioLogado);
            break;
        default:
            document.getElementById('dashboard-container').innerHTML = '<p>Nível de usuário não reconhecido.</p>';
    }
});

// --- Funções de Renderização de Dashboards ---

// Variáveis para armazenar as instâncias dos gráficos e destruí-las antes de recriar
let statusChartInstance = null;
let barChartInstance = null;

async function renderDashboardAdminMatriz() {
    // Busca todas as solicitações com os dados do usuário associado
    const { data: solicitacoes, error: solicitacoesError } = await supabase
        .from('solicitacoes')
        .select('id, created_at, status, itens, usuario:usuario_id(nome, nivel)');

    if (solicitacoesError) {
        console.error('Erro ao buscar solicitações:', solicitacoesError);
        return;
    }

    // 1. Renderizar Cards de Resumo
    const totalSolicitacoes = solicitacoes.length;
    const totalPendente = solicitacoes.filter(s => s.status === 'pendente').length;
    const totalAprovado = solicitacoes.filter(s => s.status === 'aprovado').length;
    const totalEnviado = solicitacoes.filter(s => s.status === 'enviado').length;
    renderSummaryCards([
        { title: 'Total de Solicitações', value: totalSolicitacoes, className: '' },
        { title: 'Pendentes', value: totalPendente, className: 'pendente' },
        { title: 'Aprovadas', value: totalAprovado, className: 'aprovado' },
        { title: 'Enviadas', value: totalEnviado, className: 'enviado' }
    ]);

    // 2. Renderizar Gráficos
    // Gráfico de Pizza: Status das Solicitações
    const statusData = {
        'Pendente': solicitacoes.filter(s => s.status === 'pendente').length,
        'Aprovado': solicitacoes.filter(s => s.status === 'aprovado').length,
        'Enviado': solicitacoes.filter(s => s.status === 'enviado').length,
        'Rejeitado': solicitacoes.filter(s => s.status === 'rejeitado').length
    };
    renderPieChart('status-chart', 'Status das Solicitações', Object.keys(statusData), Object.values(statusData));

    // Gráfico de Barras: Solicitações por Técnico
    const solicitacoesPorTecnico = {};
    solicitacoes.forEach(s => {
        if (s.usuario && s.usuario.nivel === 'tecnico') {
            const nomeTecnico = s.usuario.nome;
            solicitacoesPorTecnico[nomeTecnico] = (solicitacoesPorTecnico[nomeTecnico] || 0) + 1;
        }
    });
    renderBarChart('bar-chart', 'Nº de Solicitações', Object.keys(solicitacoesPorTecnico), Object.values(solicitacoesPorTecnico));

    // 3. Renderizar Grid de Atividade Recente
    const solicitacoesRecentes = [...solicitacoes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
    renderRecentActivityGrid(solicitacoesRecentes);
}

async function renderDashboardSupervisor(usuarioSupervisor) {
    // 1. Encontrar os veículos que este supervisor gerencia
    const { data: veiculosSupervisor, error: veiculosError } = await supabase
        .from('veiculos')
        .select('id')
        .eq('supervisor_id', usuarioSupervisor.id);

    if (veiculosError) {
        console.error('Erro ao buscar veículos do supervisor:', veiculosError);
        return;
    }
    const veiculosIds = veiculosSupervisor.map(v => v.id);

    // 2. Buscar as solicitações apenas desses veículos
    let solicitacoes = [];
    if (veiculosIds.length > 0) {
        const { data, error } = await supabase
            .from('solicitacoes')
            .select('id, created_at, status, itens, usuario:usuario_id(nome, nivel)')
            .in('veiculo_id', veiculosIds);
        if (error) {
            console.error('Erro ao buscar solicitações da equipe:', error);
        } else {
            solicitacoes = data;
        }
    }

    // 1. Renderizar Cards de Resumo
    const totalPendente = solicitacoes.filter(s => s.status === 'pendente').length;
    const totalAprovado = solicitacoes.filter(s => s.status === 'aprovado').length;
    const totalEnviado = solicitacoes.filter(s => s.status === 'enviado').length;
    renderSummaryCards([
        { title: 'Pendentes (Sua Equipe)', value: totalPendente, className: 'pendente' },
        { title: 'Aprovadas (Sua Equipe)', value: totalAprovado, className: 'aprovado' },
        { title: 'Enviadas (Sua Equipe)', value: totalEnviado, className: 'enviado' }
    ]);

    // 2. Renderizar Gráficos
    const statusData = {
        'Pendente': solicitacoes.filter(s => s.status === 'pendente').length,
        'Aprovado': solicitacoes.filter(s => s.status === 'aprovado').length,
        'Enviado': solicitacoes.filter(s => s.status === 'enviado').length,
        'Rejeitado': solicitacoes.filter(s => s.status === 'rejeitado').length
    };
    renderPieChart('status-chart', 'Status das Solicitações (Sua Equipe)', Object.keys(statusData), Object.values(statusData));

    document.getElementById('bar-chart-title').textContent = 'Solicitações por Técnico (Sua Equipe)';
    const solicitacoesPorTecnico = {};
    solicitacoes.forEach(s => {
        if (s.usuario) {
            solicitacoesPorTecnico[s.usuario.nome] = (solicitacoesPorTecnico[s.usuario.nome] || 0) + 1;
        }
    });
    renderBarChart('bar-chart', 'Nº de Solicitações', Object.keys(solicitacoesPorTecnico), Object.values(solicitacoesPorTecnico));

    // 3. Renderizar Grid de Atividade Recente
    const solicitacoesRecentes = [...solicitacoes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
    renderRecentActivityGrid(solicitacoesRecentes);
}

async function renderDashboardTecnico(usuarioTecnico) {
    const { data: solicitacoes, error } = await supabase
        .from('solicitacoes')
        .select('id, created_at, status, itens, usuario:usuario_id(nome)')
        .eq('usuario_id', usuarioTecnico.id);

    if (error) {
        console.error('Erro ao buscar suas solicitações:', error);
        return;
    }

    // 1. Renderizar Cards de Resumo
    const totalPendente = solicitacoes.filter(s => s.status === 'pendente').length;
    const totalAprovado = solicitacoes.filter(s => s.status === 'aprovado').length;
    const totalEnviado = solicitacoes.filter(s => s.status === 'enviado').length;
    renderSummaryCards([
        { title: 'Minhas Pendentes', value: totalPendente, className: 'pendente' },
        { title: 'Minhas Aprovadas', value: totalAprovado, className: 'aprovado' },
        { title: 'Minhas Enviadas', value: totalEnviado, className: 'enviado' }
    ]);

    // 2. Renderizar Gráficos
    // Esconder o gráfico de barras que não faz sentido para o técnico
    const barChartContainer = document.getElementById('bar-chart-container');
    if (barChartContainer) barChartContainer.style.display = 'none';
    // Ajustar o layout para o gráfico de pizza ocupar mais espaço
    document.getElementById('charts-container').style.gridTemplateColumns = '1fr';

    const statusData = {
        'Pendente': solicitacoes.filter(s => s.status === 'pendente').length,
        'Aprovado': solicitacoes.filter(s => s.status === 'aprovado').length,
        'Enviado': solicitacoes.filter(s => s.status === 'enviado').length,
        'Rejeitado': solicitacoes.filter(s => s.status === 'rejeitado').length
    };
    renderPieChart('status-chart', 'Status das Minhas Solicitações', Object.keys(statusData), Object.values(statusData));

    // 3. Renderizar Grid de Atividade Recente
    const solicitacoesRecentes = [...solicitacoes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
    renderRecentActivityGrid(solicitacoesRecentes);
}

// --- Funções Auxiliares de Renderização ---

function renderSummaryCards(cardsData) {
    const container = document.getElementById('summary-cards');
    container.innerHTML = '';
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
                backgroundColor: ['#ff9800', '#4CAF50', '#2196F3', '#f44336'],
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
            <th>Total Itens</th>
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
            <td>${s.status}</td>
            <td>${(s.itens || []).reduce((total, item) => total + item.quantidade, 0)}</td>
        `;
        tbody.appendChild(tr);
    });
}
