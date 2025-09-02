// Controle de Estoque da Frota - Lógica Principal
// Este arquivo contém toda a lógica para gerenciar estoques, pedidos e notificações

// Estruturas de dados globais
let vehicles = []; // Array de veículos (estoques por placa)
let requests = []; // Array de pedidos pendentes
let notifications = []; // Array de notificações

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

    vehicles.forEach(vehicle => {
        const div = document.createElement('div');
        div.className = 'vehicle-item';
        div.innerHTML = `
            <h3>Placa: ${vehicle.placa}</h3>
            <p>Supervisor: ${vehicle.supervisor}</p>
            <p>Técnicos: ${vehicle.tecnicos.join(', ')}</p>
            <h4>Estoque:</h4>
            <ul>
                ${Object.entries(vehicle.estoque).map(([peca, qtd]) => `<li>${peca}: ${qtd}</li>`).join('')}
            </ul>
            <button onclick="createRequest('${vehicle.placa}')">Criar Pedido</button>
        `;
        listaVeiculos.appendChild(div);
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

// Adicionar novo veículo
function addVehicle(placa, supervisor, tecnicos, estoqueInicial) {
    const vehicle = {
        placa,
        supervisor,
        tecnicos: tecnicos.split(',').map(t => t.trim()),
        estoque: estoqueInicial || {}
    };
    vehicles.push(vehicle);
    saveData();
    renderVehicles();
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
}

// Event listeners
document.getElementById('adicionar-veiculo').addEventListener('click', () => {
    const placa = prompt('Digite a placa do veículo:');
    const supervisor = prompt('Digite o nome do supervisor:');
    const tecnicos = prompt('Digite os nomes dos técnicos (separados por vírgula):');
    const estoque = {}; // Para simplificar, estoque inicial vazio

    if (placa && supervisor && tecnicos) {
        addVehicle(placa, supervisor, tecnicos, estoque);
    }
});

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderVehicles();
    renderRequests();
    renderNotifications();
});
