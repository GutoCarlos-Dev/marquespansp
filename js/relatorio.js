// Lógica para a Página de Relatórios Gerais
// Comentários em português

let dadosAtuaisRelatorio = []; // Cache dos dados filtrados para exportação

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

    if (usuarioLogado.nivel !== 'administrador' && usuarioLogado.nivel !== 'matriz') {
        alert('Acesso negado. Esta página é restrita a Administradores e Matriz.');
        window.location.href = 'dashboard.html';
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
        <div class="filtro-grupo" id="grupo-filtro-supervisor" style="display: none;">
            <span class="filtro-titulo">Por Supervisor:</span>
            <div class="filtro-item">
                <select id="filtro-supervisor">
                    <option value="">Todos os Supervisores</option>
                </select>
            </div>
        </div>
        <div class="filtro-grupo-botoes">
            <button id="btn-filtrar-data">Filtrar e Mostrar Gráficos</button>
            <button id="btn-exportar-excel" class="btn-sucesso">Exportar Excel</button>
            <button id="btn-limpar-filtro" class="btn-secundario">Limpar</button>
        </div>
    `;
    
    const dashboardContainer = document.getElementById('dashboard-container');
    if (dashboardContainer) {
        dashboardContainer.insertBefore(filtroContainer, dashboardContainer.firstChild);
    }

    // Função para carregar supervisores no filtro (apenas para Admin/Matriz)
    async function carregarSupervisoresFiltro() {
        if (usuarioLogado.nivel === 'administrador' || usuarioLogado.nivel === 'matriz') {
            const { data: supervisores, error } = await supabase
                .from('usuarios')
                .select('id, nome')
                .eq('nivel', 'supervisor')
                .order('nome');

            if (error) {
                console.error('Erro ao carregar supervisores para filtro:', error);
                return;
            }

            const selectSupervisor = document.getElementById('filtro-supervisor');
            supervisores.forEach(sup => {
                const option = document.createElement('option');
                option.value = sup.id;
                option.textContent = sup.nome;
                selectSupervisor.appendChild(option);
            });
            document.getElementById('grupo-filtro-supervisor').style.display = 'flex';
        }
    }

    await carregarSupervisoresFiltro();

    // Função para atualizar a visão geral com base em todos os filtros
    async function atualizarVisaoGeralComFiltro() {
        const dataInicio = document.getElementById('data-inicio').value;
        const dataFim = document.getElementById('data-fim').value;
        const supervisorId = document.getElementById('filtro-supervisor')?.value || '';
        const mostrarSolicitacoes = document.getElementById('check-solicitacoes').checked;
        const mostrarPecas = document.getElementById('check-pecas').checked;

        // Limpa os containers antes de renderizar
        const summaryCards = document.getElementById('summary-cards');
        if (summaryCards) summaryCards.innerHTML = '';

        const chartsContainer = document.getElementById('charts-container');
        if (chartsContainer) chartsContainer.style.display = 'none'; // Esconde para evitar layout quebrado

        const recentActivityContainer = document.getElementById('recent-activity-container');
        if (recentActivityContainer) recentActivityContainer.style.display = 'none';

        if (statusChartInstance) statusChartInstance.destroy();
        if (barChartInstance) barChartInstance.destroy();
        if (topPecasChartInstance) topPecasChartInstance.destroy();
        if (statusCountChartInstance) statusCountChartInstance.destroy();

        // Busca os dados base uma única vez, aplicando o filtro de data
        switch (usuarioLogado.nivel) {
            case 'administrador':
            case 'matriz':
                dadosAtuaisRelatorio = await buscarSolicitacoesAdmin(dataInicio, dataFim, supervisorId);
                break;
            case 'supervisor':
                dadosAtuaisRelatorio = await buscarSolicitacoesSupervisor(usuarioLogado, dataInicio, dataFim);
                break;
            case 'tecnico':
                dadosAtuaisRelatorio = await buscarSolicitacoesTecnico(usuarioLogado, dataInicio, dataFim);
                break;
            default:
                document.getElementById('dashboard-container').innerHTML = '<p>Nível de usuário não reconhecido.</p>';
                return;
        }

        // Renderiza os componentes com base nos checkboxes
        if (mostrarSolicitacoes) {
            renderizarDadosSolicitacoes(dadosAtuaisRelatorio, usuarioLogado.nivel);
            if (chartsContainer) chartsContainer.style.display = 'block';
            if (recentActivityContainer) recentActivityContainer.style.display = 'block';
        }

        // Lógica para o gráfico de barras
        if (mostrarPecas) {
            renderizarDadosPecas(dadosAtuaisRelatorio, usuarioLogado.nivel);
            if (chartsContainer) chartsContainer.style.display = 'block';
            
            // NOVO: Renderiza o gráfico de Top 10 Peças
            renderizarTopPecas(dadosAtuaisRelatorio);

            // NOVO: Renderiza o relatório detalhado de peças por supervisor
            renderizarRelatorioDetalhadoPecas(dadosAtuaisRelatorio);

        } else if (mostrarSolicitacoes) {
            // Se 'Peças' não está marcado, mas 'Solicitações' está, mostramos solicitações por técnico
            if (usuarioLogado.nivel !== 'tecnico') {
                const barChartTitle = document.getElementById('bar-chart-title');
                if (barChartTitle) barChartTitle.textContent = 'Nº de Solicitações por Técnico';

                const solicitacoesPorTecnico = {};
                dadosAtuaisRelatorio.forEach(s => {
                    if (s.usuario && (s.usuario.nivel === 'tecnico' || usuarioLogado.nivel === 'supervisor')) {
                        const nomeTecnico = s.usuario.nome;
                        solicitacoesPorTecnico[nomeTecnico] = (solicitacoesPorTecnico[nomeTecnico] || 0) + 1;
                    }
                });
                renderBarChart('bar-chart', 'Nº de Solicitações', Object.keys(solicitacoesPorTecnico), Object.values(solicitacoesPorTecnico));
            }
        }

        // Se 'Peças' for desmarcado, removemos o container de detalhes para limpar a tela
        if (!mostrarPecas) {
            const detalheContainer = document.getElementById('detalhe-pecas-container');
            if (detalheContainer) detalheContainer.remove();
        }

        // Se ambos estiverem desmarcados, mostra uma mensagem
        if (!mostrarSolicitacoes && !mostrarPecas) {
            if (summaryCards) {
                summaryCards.innerHTML = '<p class="aviso-filtro">Selecione uma opção e clique em "Filtrar e Mostrar Gráficos" para ver os dados.</p>';
            }
        }

        // Se nenhum gráfico for exibido, esconde o container
        if (!mostrarSolicitacoes && !mostrarPecas) {
            if (chartsContainer) chartsContainer.style.display = 'none';
        }

        // NOVO: Configura o carrossel após renderizar os gráficos
        setupCarousel();
    }

    // Adicionar listeners para os botões de filtro
    document.getElementById('btn-filtrar-data').addEventListener('click', atualizarVisaoGeralComFiltro);
    
    document.getElementById('btn-exportar-excel').addEventListener('click', () => {
        exportarRelatorioExcel(dadosAtuaisRelatorio);
    });

    document.getElementById('btn-limpar-filtro').addEventListener('click', () => {
        document.getElementById('data-inicio').value = '';
        document.getElementById('data-fim').value = '';
        if (document.getElementById('filtro-supervisor')) {
            document.getElementById('filtro-supervisor').value = '';
        }
        document.getElementById('check-solicitacoes').checked = true;
        document.getElementById('check-pecas').checked = true;
        atualizarVisaoGeralComFiltro(); // Recarrega com os filtros limpos
    });

    // Carregamento inicial do dashboard (sem filtro de data)
    atualizarVisaoGeralComFiltro();
});

// Função para exportar os dados do relatório para Excel
function exportarRelatorioExcel(solicitacoes) {
    if (!solicitacoes || solicitacoes.length === 0) {
        alert('Não há dados filtrados para exportar no momento.');
        return;
    }

    if (typeof XLSX === 'undefined') {
        alert('Erro: Biblioteca XLSX não encontrada. Certifique-se de incluí-la no HTML.');
        return;
    }

    const dataParaExportar = solicitacoes.map(s => ({
        'Código': String(s.id).padStart(5, '0'),
        'Data/Hora': new Date(s.created_at).toLocaleString('pt-BR'),
        'Técnico': s.usuario?.nome || 'N/A',
        'Supervisor': s.veiculo?.supervisor?.nome || 'N/A',
        'Status': s.status.toUpperCase(),
        'Itens Solicitados': (s.itens || []).length,
        'Total Peças': (s.itens || []).reduce((sum, item) => sum + item.quantidade, 0)
    }));

    // Gerar dados para a segunda aba (Relatório Detalhado por Peça e Supervisor)
    const resumoPecas = {};
    solicitacoes.forEach(s => {
        const supervisor = s.veiculo?.supervisor?.nome || 'N/A';
        if (!resumoPecas[supervisor]) resumoPecas[supervisor] = {};

        (s.itens || []).forEach(item => {
            const cod = item.codigo;
            if (!resumoPecas[supervisor][cod]) {
                resumoPecas[supervisor][cod] = { nome: item.nome, solicitada: 0, enviada: 0 };
            }
            resumoPecas[supervisor][cod].solicitada += item.quantidade;
            if (s.status === 'enviado') {
                resumoPecas[supervisor][cod].enviada += item.quantidade;
            }
        });
    });

    const dataDetalhadaParaExportar = [];
    for (const sup in resumoPecas) {
        for (const cod in resumoPecas[sup]) {
            dataDetalhadaParaExportar.push({
                'Supervisor': sup,
                'Código Peça': cod,
                'Descrição': resumoPecas[sup][cod].nome,
                'Quantidade Solicitada': resumoPecas[sup][cod].solicitada,
                'Quantidade Enviada': resumoPecas[sup][cod].enviada
            });
        }
    }

    const ws = XLSX.utils.json_to_sheet(dataParaExportar);
    const ws2 = XLSX.utils.json_to_sheet(dataDetalhadaParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório Geral");
    XLSX.utils.book_append_sheet(wb, ws2, "Detalhado por Peças");
    XLSX.writeFile(wb, `relatorio_pecas_marquespan_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// --- Funções de Renderização de Dashboards ---

// Variáveis para armazenar as instâncias dos gráficos e destruí-las antes de recriar
let statusChartInstance = null;
let barChartInstance = null;
let topPecasChartInstance = null;
let statusCountChartInstance = null;

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

async function buscarSolicitacoesAdmin(dataInicio, dataFim, supervisorId = '') {
    let query = supabase
        .from('solicitacoes')
        .select('id, created_at, status, itens, usuario:usuario_id(nome, nivel), veiculo:veiculo_id(supervisor:supervisor_id(nome))');
    
    if (supervisorId) {
        // Busca os IDs dos veículos vinculados a este supervisor para filtrar a query principal
        const { data: veiculos, error: vError } = await supabase
            .from('veiculos')
            .select('id')
            .eq('supervisor_id', supervisorId);
        
        if (!vError && veiculos.length > 0) {
            query = query.in('veiculo_id', veiculos.map(v => v.id));
        } else {
            return []; // Retorna vazio se o supervisor selecionado não tiver veículos
        }
    }
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
        .select('id, created_at, status, itens, usuario:usuario_id(nome, nivel), veiculo:veiculo_id(supervisor:supervisor_id(nome))')
        .in('veiculo_id', veiculosIds);
    return await buscarSolicitacoesComFiltro(query, dataInicio, dataFim);
}

async function buscarSolicitacoesTecnico(usuarioTecnico, dataInicio, dataFim) {
    let query = supabase
        .from('solicitacoes')
        .select('id, created_at, status, itens, usuario:usuario_id(nome), veiculo:veiculo_id(supervisor:supervisor_id(nome))')
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
    const statusData = {
        'Pendente': solicitacoes.filter(s => s.status === 'pendente').length,
        'Aprovado': solicitacoes.filter(s => s.status === 'aprovado').length,
        'Enviado': solicitacoes.filter(s => s.status === 'enviado').length,
        'Rejeitado': solicitacoes.filter(s => s.status === 'rejeitado').length
    };
    renderPieChart('status-chart', 'Status das Solicitações', Object.keys(statusData), Object.values(statusData));

    // 4. Gráfico de Barras: Quantidade por Status (Novo)
    renderStatusCountChart('status-count-chart', 'Quantidade por Status', Object.keys(statusData), Object.values(statusData));

    // 3. Grid de Atividade Recente
    const solicitacoesRecentes = [...solicitacoes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
    renderRecentActivityGrid(solicitacoesRecentes);
}

function renderizarDadosPecas(solicitacoes, nivelUsuario) {
    // 1. Card de Total de Peças
    const totalPecas = solicitacoes
        .filter(s => s.status !== 'rejeitado') // Filtra para não somar peças de solicitações rejeitadas
        .reduce((total, s) => {
            return total + (s.itens || []).reduce((subtotal, item) => subtotal + item.quantidade, 0);
        }, 0);
    renderSummaryCards([{ title: 'Total de Peças Solicitadas', value: totalPecas, className: 'pecas-total' }]);

    // 2. Gráfico de Barras: Peças por Técnico
    // Não mostrar para técnico, pois só teria uma barra
    if (nivelUsuario === 'tecnico') return;

    const barChartTitle = document.getElementById('bar-chart-title');
    if (barChartTitle) barChartTitle.textContent = 'Peças por Supervisor';

    const solicitacoesPorSupervisor = {};
    solicitacoes
        .filter(s => s.status !== 'rejeitado') // Filtra também para o gráfico de barras
        .forEach(s => {
            const nomeSupervisor = s.veiculo?.supervisor?.nome || 'N/A';
            const totalItens = (s.itens || []).reduce((acc, item) => acc + (item.quantidade || 0), 0);
            solicitacoesPorSupervisor[nomeSupervisor] = (solicitacoesPorSupervisor[nomeSupervisor] || 0) + totalItens;
        });
    renderBarChart('bar-chart', 'Total de Peças por Supervisor', Object.keys(solicitacoesPorSupervisor), Object.values(solicitacoesPorSupervisor));
}

// NOVO: Função para renderizar o gráfico de Top 10 Peças
function renderizarTopPecas(solicitacoes) {
    const pecasCount = {};
    solicitacoes
        .filter(s => s.status !== 'rejeitado') // Não conta peças de solicitações rejeitadas
        .forEach(s => {
            (s.itens || []).forEach(item => {
                const nomePeca = item.nome || 'Peça sem nome';
                pecasCount[nomePeca] = (pecasCount[nomePeca] || 0) + item.quantidade;
            });
        });

    const sortedPecas = Object.entries(pecasCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    const labels = sortedPecas.map(([nome]) => nome);
    const data = sortedPecas.map(([, quantidade]) => quantidade);

    renderTopPecasChart('top-pecas-chart', 'Quantidade', labels, data);
}

// NOVO: Função para renderizar a tabela detalhada de peças por supervisor
function renderizarRelatorioDetalhadoPecas(solicitacoes) {
    let container = document.getElementById('detalhe-pecas-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'detalhe-pecas-container';
        container.className = 'recent-activity-grid';
        container.style.marginTop = '2rem';
        
        const dashboardContainer = document.getElementById('dashboard-container');
        dashboardContainer.appendChild(container);
    }

    container.innerHTML = `
        <h3>Relatório Detalhado de Peças por Supervisor</h3>
        <table>
            <thead>
                <tr>
                    <th>Supervisor</th>
                    <th>Cód. Peça</th>
                    <th>Descrição</th>
                    <th>Solicitada</th>
                    <th>Enviada</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    const tbody = container.querySelector('tbody');
    const resumo = {};

    solicitacoes.forEach(s => {
        const supervisor = s.veiculo?.supervisor?.nome || 'N/A';
        if (!resumo[supervisor]) resumo[supervisor] = {};

        (s.itens || []).forEach(item => {
            const cod = item.codigo;
            if (!resumo[supervisor][cod]) {
                resumo[supervisor][cod] = { nome: item.nome, solicitada: 0, enviada: 0 };
            }
            resumo[supervisor][cod].solicitada += item.quantidade;
            if (s.status === 'enviado') resumo[supervisor][cod].enviada += item.quantidade;
        });
    });

    const rows = [];
    for (const sup in resumo) {
        for (const cod in resumo[sup]) {
            rows.push({ supervisor: sup, codigo: cod, ...resumo[sup][cod] });
        }
    }

    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum item encontrado no período.</td></tr>';
        return;
    }

    // Ordenar por Supervisor e depois por Nome da Peça
    rows.sort((a, b) => a.supervisor.localeCompare(b.supervisor) || a.nome.localeCompare(b.nome));

    rows.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.supervisor}</td>
            <td>${r.codigo}</td>
            <td>${r.nome}</td>
            <td>${r.solicitada}</td>
            <td><strong style="color: #2196F3;">${r.enviada}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Funções Auxiliares de Renderização ---

function renderSummaryCards(cardsData) {
    const container = document.getElementById('summary-cards');
    if (!container) return;
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
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: [
                    '#ff0019', // Pendente (Vermelho)
                    '#249c40', // Aprovado (Verde)
                    '#0cabf5', // Enviado (Azul)
                    '#6c757d'  // Rejeitado (Cinza)
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'right',
                    labels: { font: { size: 12 } }
                },
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold' },
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => { sum += data; });
                        let percentage = (value*100 / sum).toFixed(1)+"%";
                        return value > 0 ? percentage : '';
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function renderBarChart(canvasId, label, labels, data) {
    // Destrói o gráfico anterior se ele existir
    if (barChartInstance) {
        barChartInstance.destroy();
    }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: '#17a2b8', // Azul Ciano
                borderRadius: 4,
                borderWidth: 0
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
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderTopPecasChart(canvasId, label, labels, data) {
    if (topPecasChartInstance) {
        topPecasChartInstance.destroy();
    }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    topPecasChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: '#007bff', // Azul
                borderRadius: 4,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y', // Gráfico de barras horizontal para melhor leitura
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // O título do card já é suficiente
                }
            }
        }
    });
}

function renderStatusCountChart(canvasId, label, labels, data) {
    if (statusCountChartInstance) {
        statusCountChartInstance.destroy();
    }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Cores correspondentes aos status (mesmas do gráfico de rosca)
    const bgColors = labels.map(l => {
        if (l === 'Pendente') return '#ff0019';
        if (l === 'Aprovado') return '#249c40';
        if (l === 'Enviado') return '#0cabf5';
        if (l === 'Rejeitado') return '#6c757d';
        return '#333';
    });

    statusCountChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: bgColors,
                borderRadius: 4,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    color: '#333',
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value > 0 ? value : '',
                    font: { weight: 'bold' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function renderRecentActivityGrid(solicitacoes) {
    const table = document.getElementById('tabela-recente');
    if (!table) return;
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = `
        <tr>
            <th>Código</th>
            <th>Data</th>
            <th>Técnico</th>
            <th>Supervisor</th>
            <th>Status</th>
            <th>Itens</th>
        </tr>
    `;
    tbody.innerHTML = '';

    if (solicitacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhuma atividade recente.</td></tr>';
        return;
    }

    solicitacoes.forEach(s => {
        const tr = document.createElement('tr');
        
        // Configura a linha para ser clicável e abrir o resumo do pedido
        tr.style.cursor = 'pointer';
        tr.title = 'Clique para ver o Resumo do Pedido';
        tr.onclick = () => window.open(`detalhes_solicitacao.html?id=${s.id}`, '_blank');

        tr.innerHTML = `
            <td>${String(s.id).padStart(5, '0')}</td>
            <td>${new Date(s.created_at).toLocaleString('pt-BR')}</td>
            <td>${s.usuario?.nome || 'N/A'}</td> 
                <td>${s.veiculo?.supervisor?.nome || 'N/A'}</td>
            <td><span class="status ${s.status.toLowerCase()}">${s.status}</span></td>
            <td>${(s.itens || []).reduce((total, item) => total + item.quantidade, 0)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// NOVO: Função para controlar a rolagem automática (Marquee)
function setupCarousel() {
    const wrapper = document.querySelector('.marquee-wrapper');
    if (!wrapper) return;

    // Cancela animação anterior se houver (para evitar aceleração ao recarregar filtros)
    if (wrapper.animationId) cancelAnimationFrame(wrapper.animationId);

    let direction = 1; // 1 = direita, -1 = esquerda
    const speed = 1;   // Velocidade da rolagem

    function step() {
        // Se o conteúdo couber na tela, não rola
        if (wrapper.scrollWidth <= wrapper.clientWidth) {
             wrapper.animationId = requestAnimationFrame(step);
             return;
        }

        // Verifica se chegou ao fim ou ao início para inverter a direção
        if (wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 1) {
            direction = -1;
        } else if (wrapper.scrollLeft <= 0) {
            direction = 1;
        }
        wrapper.scrollLeft += speed * direction;
        wrapper.animationId = requestAnimationFrame(step);
    }
    
    // Inicia o loop de animação
    wrapper.animationId = requestAnimationFrame(step);
    
    // Pausar ao passar o mouse para facilitar a leitura
    wrapper.addEventListener('mouseenter', () => {
        if (wrapper.animationId) cancelAnimationFrame(wrapper.animationId);
    });
    wrapper.addEventListener('mouseleave', () => {
        wrapper.animationId = requestAnimationFrame(step);
    });
}
