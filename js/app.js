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

    // Corrigir foco para evitar digitação duplicada
    loginForm.username.addEventListener('focus', () => {
        loginForm.username.value = '';
    });
    loginForm.password.addEventListener('focus', () => {
        loginForm.password.value = '';
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

// Variável para controlar o índice do veículo sendo editado
let editingVehicleIndex = null;

// Editar veículo usando modal
function editVehicle(index) {
    editingVehicleIndex = index;
    const vehicle = vehicles[index];

    // Preencher o formulário do modal com os dados do veículo
    document.getElementById('placa').value = vehicle.placa || '';
    document.getElementById('modelo').value = vehicle.modelo || '';
    document.getElementById('marca').value = vehicle.marca || '';
    document.getElementById('renavan').value = vehicle.renavan || '';
    document.getElementById('ano').value = vehicle.ano || '';

    // Atualizar título do modal
    document.getElementById('modal-title').textContent = 'Editar Veículo';

    // Mostrar modal
    document.getElementById('vehicle-modal').classList.remove('hidden');
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

const addVehicleBtn = document.getElementById('adicionar-veiculo');
if (addVehicleBtn) {
    addVehicleBtn.addEventListener('click', () => {
        // Limpar formulário
        document.getElementById('vehicle-form').reset();
        editingVehicleIndex = null;
        document.getElementById('modal-title').textContent = 'Adicionar Veículo';
        document.getElementById('vehicle-modal').classList.remove('hidden');
    });
}

// Fechar modal
const closeModalBtn = document.getElementById('close-modal');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        document.getElementById('vehicle-modal').classList.add('hidden');
    });
}

// Salvar veículo via formulário modal
const vehicleForm = document.getElementById('vehicle-form');
if (vehicleForm) {
    vehicleForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const placa = document.getElementById('placa').value.trim();
        const modelo = document.getElementById('modelo').value.trim();
        const marca = document.getElementById('marca').value.trim();
        const renavan = document.getElementById('renavan').value.trim();
        const ano = document.getElementById('ano').value.trim();

        if (!placa || !modelo || !marca || !renavan || !ano) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (editingVehicleIndex !== null) {
            // Editar veículo existente
            vehicles[editingVehicleIndex] = {
                ...vehicles[editingVehicleIndex],
                placa: placa.toUpperCase(),
                modelo,
                marca,
                renavan,
                ano
            };
        } else {
            // Adicionar novo veículo
            addVehicle(placa, modelo, marca, renavan, ano);
        }

        saveData();
        renderVehicles();
        renderStockSummary();
        document.getElementById('vehicle-modal').classList.add('hidden');
    });
}

// Variáveis para controle do modal de itens
let editingItemIndex = null;

// Renderizar lista de itens no estoque
function renderItems() {
    const listaItens = document.getElementById('lista-itens');
    listaItens.innerHTML = '';

    let allItems = [];
    vehicles.forEach(vehicle => {
        Object.entries(vehicle.estoque).forEach(([item, quantidade]) => {
            allItems.push({
                placa: vehicle.placa,
                item,
                quantidade
            });
        });
    });

    if (allItems.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="4" style="text-align: center; padding: 2rem;">Nenhum item cadastrado</td>';
        listaItens.appendChild(tr);
        return;
    }

    allItems.forEach((entry, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${entry.placa}</td>
            <td>${entry.item}</td>
            <td>${entry.quantidade}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editItem(${index})">Editar</button>
                <button class="action-btn delete-btn" onclick="deleteItem(${index})">Excluir</button>
            </td>
        `;
        listaItens.appendChild(tr);
    });
}

// Abrir modal para adicionar novo item
const btnCadastrarItem = document.getElementById('btn-cadastrar-item');
if (btnCadastrarItem) {
    btnCadastrarItem.addEventListener('click', () => {
        editingItemIndex = null;
        document.getElementById('item-form').reset();
        document.getElementById('item-modal-title').textContent = 'Cadastrar Item';
        document.getElementById('item-modal').classList.remove('hidden');
    });
}

// Fechar modal de item
const closeItemModalBtn = document.getElementById('close-item-modal');
if (closeItemModalBtn) {
    closeItemModalBtn.addEventListener('click', () => {
        document.getElementById('item-modal').classList.add('hidden');
    });
}

// Editar item
function editItem(index) {
    editingItemIndex = index;
    const listaItens = document.getElementById('lista-itens');
    const tr = listaItens.children[index];
    if (!tr) return;

    const placa = tr.children[0].textContent;
    const item = tr.children[1].textContent;
    const quantidade = tr.children[2].textContent;

    document.getElementById('item-placa').value = placa;
    document.getElementById('item-nome').value = item;
    document.getElementById('item-quantidade').value = quantidade;

    document.getElementById('item-modal-title').textContent = 'Editar Item';
    document.getElementById('item-modal').classList.remove('hidden');
}

// Excluir item
function deleteItem(index) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    // Encontrar o item na estrutura vehicles e remover
    let count = 0;
    for (let v = 0; v < vehicles.length; v++) {
        const vehicle = vehicles[v];
        for (const [item, quantidade] of Object.entries(vehicle.estoque)) {
            if (count === index) {
                delete vehicle.estoque[item];
                saveData();
                renderItems();
                renderStockSummary();
                return;
            }
            count++;
        }
    }
}

// Salvar item via formulário modal
const itemForm = document.getElementById('item-form');
if (itemForm) {
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const placa = document.getElementById('item-placa').value.trim();
        const nome = document.getElementById('item-nome').value.trim();
        const quantidade = parseInt(document.getElementById('item-quantidade').value.trim());

        if (!placa || !nome || isNaN(quantidade)) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        // Encontrar veículo para atualizar ou adicionar item
        let vehicle = vehicles.find(v => v.placa === placa);
        if (!vehicle) {
            alert('Veículo não encontrado para a placa informada.');
            return;
        }

        if (editingItemIndex !== null) {
            // Editar item existente
            let count = 0;
            for (const [item, qtd] of Object.entries(vehicle.estoque)) {
                if (count === editingItemIndex) {
                    vehicle.estoque[item] = quantidade;
                    break;
                }
                count++;
            }
        } else {
            // Adicionar novo item
            vehicle.estoque[nome] = (vehicle.estoque[nome] || 0) + quantidade;
        }

        saveData();
        renderItems();
        renderStockSummary();
        document.getElementById('item-modal').classList.add('hidden');
    });
}

// Buscar item por placa
const btnBuscarItem = document.getElementById('btn-buscar-item');
if (btnBuscarItem) {
    btnBuscarItem.addEventListener('click', () => {
        const placaBusca = document.getElementById('buscar-placa').value.trim().toUpperCase();
        if (!placaBusca) {
            alert('Por favor, informe a placa para busca.');
            return;
        }

        const listaItens = document.getElementById('lista-itens');
        listaItens.innerHTML = '';

        let foundItems = [];
        vehicles.forEach(vehicle => {
            if (vehicle.placa.toUpperCase() === placaBusca) {
                Object.entries(vehicle.estoque).forEach(([item, quantidade]) => {
                    foundItems.push({
                        placa: vehicle.placa,
                        item,
                        quantidade
                    });
                });
            }
        });

        if (foundItems.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="4" style="text-align: center; padding: 2rem;">Nenhum item encontrado para a placa informada.</td>';
            listaItens.appendChild(tr);
            return;
        }

        foundItems.forEach((entry, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${entry.placa}</td>
                <td>${entry.item}</td>
                <td>${entry.quantidade}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editItem(${index})">Editar</button>
                    <button class="action-btn delete-btn" onclick="deleteItem(${index})">Excluir</button>
                </td>
            `;
            listaItens.appendChild(tr);
        });
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
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                const target = btn.getAttribute('data-target');

                if (target.endsWith('.html')) {
                    // Navigate to the page
                    window.location.href = target;
                } else {
                    // Remove active from all
                    menuButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Hide all sections
                    const sections = document.querySelectorAll('.content-section');
                    sections.forEach(s => s.classList.add('hidden'));

                    // Show target section
                    const targetSection = document.getElementById(target);
                    if (targetSection) {
                        targetSection.classList.remove('hidden');
                    } else {
                        console.error(`Seção alvo não encontrada: ${target}`);
                    }
                }
            });
        });

        // Trigger click on the active menu button to show the initial section
        const activeBtn = document.querySelector('.menu-btn.active');
        if (activeBtn) {
            activeBtn.click();
        }
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
