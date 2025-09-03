// Controle de Estoque da Frota - Lógica Principal com Login
// Este arquivo contém toda a lógica para gerenciar login, estoques, pedidos e notificações

// Credenciais iniciais para login
const USERNAME = 'admin';
const PASSWORD = 'admin';

// Elementos do DOM para a tela de login
const loginScreen = document.getElementById('login-screen');
const appContent = document.getElementById('app-content');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

// Inicializar login se estiver na página de login
if (loginForm) {
    // Função para mostrar erro de login
    function showLoginError(message) {
        loginError.textContent = message;
    }

    // Evento de submissão do formulário de login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = loginForm.username.value.trim();
        const password = loginForm.password.value.trim();

        if (username === USERNAME && password === PASSWORD) {
            showAppContent();
        } else {
            showLoginError('Usuário ou senha incorretos.');
        }
    });
}

// Estruturas de dados globais
let vehicles = []; // Array de veículos
let requests = []; // Array de pedidos pendentes
let notifications = []; // Array de notificações

// Função para redirecionar para o dashboard após login
function showAppContent() {
    window.location.href = 'dashboard.html';
}

// Carregar dados do localStorage ao iniciar
function loadData() {
    const storedVehicles = localStorage.getItem('vehicles');
    const storedRequests = localStorage.getItem('requests');
    const storedNotifications = localStorage.getItem('notifications');

    if (storedVehicles) vehicles = JSON.parse(storedVehicles);
    if (storedRequests) requests = JSON.parse(storedRequests);
    if (storedNotifications) notifications = JSON.parse(storedNotifications);
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    localStorage.setItem('requests', JSON.stringify(requests));
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Renderizar lista de veículos na página
function renderVehicles() {
    const listaVeiculos = document.getElementById('lista-veiculos');
    listaVeiculos.innerHTML = '';

    if (vehicles.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" style="text-align: center; padding: 2rem;">Nenhum veículo cadastrado</td>';
        listaVeiculos.appendChild(tr);
        return;
    }

    vehicles.forEach((vehicle, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${vehicle.placa || ''}</td>
            <td>${vehicle.modelo || ''}</td>
            <td>${vehicle.marca || ''}</td>
            <td>${vehicle.renavan || ''}</td>
            <td>${vehicle.ano || ''}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editVehicle(${index})">Editar</button>
                <button class="action-btn delete-btn" onclick="deleteVehicle(${index})">Excluir</button>
            </td>
        `;
        listaVeiculos.appendChild(tr);
    });
}

// Renderizar pedidos pendentes
function renderRequests() {
    const listaPedidos = document.getElementById('lista-pedidos');
    listaPedidos.innerHTML = '';

    requests.forEach(request => {
        const div = document.createElement('div');
        div.className = 'request-item';
        div.innerHTML = `
            <p>Placa: ${request.placa}</p>
            <p>Técnico: ${request.tecnico}</p>
            <p>Peça: ${request.peca}</p>
            <p>Quantidade: ${request.quantidade}</p>
            <button onclick="approveRequest(${request.id}, true)">Aprovar</button>
            <button onclick="approveRequest(${request.id}, false)">Rejeitar</button>
        `;
        listaPedidos.appendChild(div);
    });
}

// Renderizar notificações
function renderNotifications() {
    const listaNotificacoes = document.getElementById('lista-notificacoes');
    listaNotificacoes.innerHTML = '';

    notifications.forEach(notif => {
        const div = document.createElement('div');
        div.className = 'notification-item';
        div.innerHTML = `<p>${notif.mensagem} - ${new Date(notif.data).toLocaleString()}</p>`;
        listaNotificacoes.appendChild(div);
    });
}

// Renderizar resumo de estoque
function renderStockSummary() {
    const resumoEstoque = document.getElementById('resumo-estoque');
    resumoEstoque.innerHTML = '';

    const totalItems = {};
    vehicles.forEach(vehicle => {
        Object.entries(vehicle.estoque).forEach(([peca, qtd]) => {
            totalItems[peca] = (totalItems[peca] || 0) + qtd;
        });
    });

    if (Object.keys(totalItems).length === 0) {
        resumoEstoque.innerHTML = '<p>Nenhum item em estoque.</p>';
    } else {
        const ul = document.createElement('ul');
        Object.entries(totalItems).forEach(([peca, qtd]) => {
            const li = document.createElement('li');
            li.textContent = `${peca}: ${qtd}`;
            ul.appendChild(li);
        });
        resumoEstoque.appendChild(ul);
    }
}

// Adicionar novo veículo
function addVehicle(placa, modelo, marca, renavan, ano) {
    const vehicle = {
        placa: placa.toUpperCase(),
        modelo,
        marca,
        renavan,
        ano,
        supervisor: '',
        tecnicos: [],
        estoque: {}
    };
    vehicles.push(vehicle);
    saveData();
    renderVehicles();
    renderStockSummary();
}

// Editar veículo
function editVehicle(index) {
    const vehicle = vehicles[index];
    const placa = prompt('Placa:', vehicle.placa);
    const modelo = prompt('Modelo:', vehicle.modelo);
    const marca = prompt('Marca:', vehicle.marca);
    const renavan = prompt('Renavan:', vehicle.renavan);
    const ano = prompt('Ano:', vehicle.ano);

    if (placa && modelo && marca && renavan && ano) {
        vehicles[index] = {
            ...vehicle,
            placa: placa.toUpperCase(),
            modelo,
            marca,
            renavan,
            ano
        };
        saveData();
        renderVehicles();
        renderStockSummary();
    }
}

// Excluir veículo
function deleteVehicle(index) {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
        vehicles.splice(index, 1);
        saveData();
        renderVehicles();
        renderStockSummary();
    }
}

// Criar pedido de peça
function createRequest(placa) {
    const peca = prompt('Digite a peça solicitada:');
    const quantidade = parseInt(prompt('Digite a quantidade:'));
    const tecnico = prompt('Digite o nome do técnico:');

    if (peca && quantidade && tecnico) {
        const request = {
            id: Date.now(),
            placa,
            tecnico,
            peca,
            quantidade,
            status: 'pendente'
        };
        requests.push(request);
        saveData();
        renderRequests();
    }
}

// Aprovar ou rejeitar pedido
function approveRequest(id, aprovado) {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    if (aprovado) {
        const vehicle = vehicles.find(v => v.placa === request.placa);
        if (vehicle.estoque[request.peca] >= request.quantidade) {
            vehicle.estoque[request.peca] -= request.quantidade;
            notifications.push({
                mensagem: `Peça ${request.peca} retirada do estoque de ${request.placa}`,
                data: new Date()
            });
        } else {
            // Notificar supervisor e encaminhar para matriz
            notifications.push({
                mensagem: `Estoque insuficiente para ${request.peca} em ${request.placa}. Pedido encaminhado para matriz.`,
                data: new Date()
            });
            // Simular envio para matriz
        }
    } else {
        notifications.push({
            mensagem: `Pedido de ${request.peca} rejeitado para ${request.placa}`,
            data: new Date()
        });
    }

    // Remover pedido da lista
    requests = requests.filter(r => r.id !== id);
    saveData();
    renderRequests();
    renderNotifications();
    renderVehicles(); // Atualizar estoques
    renderStockSummary();
}

// Event listeners
const addVehicleBtn = document.getElementById('adicionar-veiculo');
if (addVehicleBtn) {
    addVehicleBtn.addEventListener('click', () => {
        const placa = prompt('Digite a placa do veículo:');
        const supervisor = prompt('Digite o nome do supervisor:');
        const tecnicos = prompt('Digite os nomes dos técnicos (separados por vírgula):');
        const estoque = {}; // Para simplificar, estoque inicial vazio

        if (placa && supervisor && tecnicos) {
            addVehicle(placa, supervisor, tecnicos, estoque);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar aplicação
    // Verificar se estamos na página do dashboard e inicializar
    if (document.getElementById('app-content')) {
        loadData();
        renderVehicles();
        renderRequests();
        renderNotifications();
        renderStockSummary();
        renderDashboardSummary();

        // Menu navigation
        const menuButtons = document.querySelectorAll('.menu-btn');
        menuButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active from all
                menuButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Hide all sections
                const sections = document.querySelectorAll('.content-section');
                sections.forEach(s => s.classList.add('hidden'));

                // Show target section
                const target = btn.getAttribute('data-target');
                document.getElementById(target).classList.remove('hidden');
            });
        });
    }
});

// Função para renderizar os resumos no dashboard
function renderDashboardSummary() {
    // Veículos cadastrados
    const countVeiculos = vehicles.length;

    // Itens em estoque positivos e negativos
    let estoquePositivo = 0;
    let estoqueNegativo = 0;
    vehicles.forEach(vehicle => {
        Object.values(vehicle.estoque).forEach(qtd => {
            if (qtd > 0) estoquePositivo += qtd;
            else if (qtd < 0) estoqueNegativo += qtd;
        });
    });

    // Pedidos aprovados e pendentes
    let pedidosAprovados = 0;
    let pedidosPendentes = 0;
    requests.forEach(req => {
        if (req.status && req.status.toLowerCase() === 'aprovado') pedidosAprovados++;
        else if (req.status && req.status.toLowerCase() === 'pendente') pedidosPendentes++;
    });

    // Total de baixas realizadas (notificações)
    const totalBaixas = notifications.length;

    // Atualizar o DOM
    document.getElementById('count-veiculos').textContent = countVeiculos;
    document.getElementById('count-estoque-positivo').textContent = estoquePositivo;
    document.getElementById('count-estoque-negativo').textContent = estoqueNegativo;
    document.getElementById('count-pedidos-aprovados').textContent = pedidosAprovados;
    document.getElementById('count-pedidos-pendentes').textContent = pedidosPendentes;
    document.getElementById('count-baixas').textContent = totalBaixas;
}
