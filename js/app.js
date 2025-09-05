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

// Array para catálogo global de itens
let catalogItems = [];

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

// Renderizar catálogo global de itens
function renderCatalogItems() {
    const listaCatalogo = document.getElementById('lista-catalogo-itens');
    listaCatalogo.innerHTML = '';

    if (catalogItems.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="3" style="text-align: center; padding: 2rem;">Nenhum item no catálogo</td>';
        listaCatalogo.appendChild(tr);
        return;
    }

    catalogItems.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.codigo}</td>
            <td>${item.nomeSale}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editCatalogItem(${index})">Editar</button>
                <button class="action-btn delete-btn" onclick="deleteCatalogItem(${index})">Excluir</button>
            </td>
        `;
        listaCatalogo.appendChild(tr);
    });
}

// Abrir modal para adicionar novo item ao catálogo
const btnAddCatalogItem = document.getElementById('btn-add-catalog-item');
if (btnAddCatalogItem) {
    btnAddCatalogItem.addEventListener('click', () => {
        editingCatalogItemIndex = null;
        document.getElementById('catalog-item-form').reset();
        document.getElementById('catalog-item-modal-title').textContent = 'Adicionar Item ao Catálogo';
        document.getElementById('catalog-item-modal').classList.remove('hidden');
    });
}

// Variável para controle do modal de catálogo
let editingCatalogItemIndex = null;

// Fechar modal do catálogo
const closeCatalogItemModalBtn = document.getElementById('close-catalog-item-modal');
if (closeCatalogItemModalBtn) {
    closeCatalogItemModalBtn.addEventListener('click', () => {
        document.getElementById('catalog-item-modal').classList.add('hidden');
    });
}

// Salvar item do catálogo via formulário modal
const catalogItemForm = document.getElementById('catalog-item-form');
if (catalogItemForm) {
    catalogItemForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const codigo = document.getElementById('catalog-item-codigo').value.trim();
        const nomeSale = document.getElementById('catalog-item-nome-sale').value.trim();

        if (!codigo || !nomeSale) {
            alert('Por favor, preencha todos os campos do catálogo.');
            return;
        }

        if (editingCatalogItemIndex !== null) {
            // Editar item existente
            catalogItems[editingCatalogItemIndex] = { codigo, nomeSale };
        } else {
            // Adicionar novo item
            catalogItems.push({ codigo, nomeSale });
        }

        saveData();
        renderCatalogItems();
        document.getElementById('catalog-item-modal').classList.add('hidden');
        populateItemSelectionDropdown();
    });
}

// Editar item do catálogo
function editCatalogItem(index) {
    editingCatalogItemIndex = index;
    const item = catalogItems[index];
    if (!item) return;

    document.getElementById('catalog-item-codigo').value = item.codigo;
    document.getElementById('catalog-item-nome-sale').value = item.nomeSale;
    document.getElementById('catalog-item-modal-title').textContent = 'Editar Item do Catálogo';
    document.getElementById('catalog-item-modal').classList.remove('hidden');
}

// Excluir item do catálogo
function deleteCatalogItem(index) {
    if (!confirm('Tem certeza que deseja excluir este item do catálogo?')) return;
    catalogItems.splice(index, 1);
    saveData();
    renderCatalogItems();
    populateItemSelectionDropdown();
}

// Atualizar localStorage para incluir catálogo
function saveData() {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    localStorage.setItem('requests', JSON.stringify(requests));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('catalogItems', JSON.stringify(catalogItems));
}

// Carregar dados do localStorage incluindo catálogo
function loadData() {
    const storedVehicles = localStorage.getItem('vehicles');
    const storedRequests = localStorage.getItem('requests');
    const storedNotifications = localStorage.getItem('notifications');
    const storedCatalogItems = localStorage.getItem('catalogItems');

    if (storedVehicles) vehicles = JSON.parse(storedVehicles);
    if (storedRequests) requests = JSON.parse(storedRequests);
    if (storedNotifications) notifications = JSON.parse(storedNotifications);
    if (storedCatalogItems) catalogItems = JSON.parse(storedCatalogItems);
}

// Popular dropdown do modal de seleção com itens do catálogo
function populateItemSelectionDropdown() {
    const selectItemCatalog = document.getElementById('select-item-catalog');

    if (!selectItemCatalog) return;

    // Limpar campos
    selectItemCatalog.innerHTML = '<option value="" disabled selected>Selecione um item</option>';

    // Criar opções para o select
    catalogItems.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${item.codigo} - ${item.nomeSale}`;
        selectItemCatalog.appendChild(option);
    });
}



// Inicializar catálogo e dropdown ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderCatalogItems();
    populateItemSelectionDropdown();
});

// Event listeners for main Estoque buttons
const btnSelecioneEstoque = document.getElementById('btn-selecione-estoque');
if (btnSelecioneEstoque) {
    btnSelecioneEstoque.addEventListener('click', () => {
        document.getElementById('selecione-estoque-section').classList.remove('hidden');
        document.getElementById('cadastrar-itens-section').classList.add('hidden');
    });
}

const btnCadastrarItens = document.getElementById('btn-cadastrar-itens');
if (btnCadastrarItens) {
    btnCadastrarItens.addEventListener('click', () => {
        document.getElementById('cadastrar-itens-section').classList.remove('hidden');
        document.getElementById('selecione-estoque-section').classList.add('hidden');
    });
}

// Abrir modal para adicionar novo item
const btnAddItem = document.getElementById('btn-add-item');
if (btnAddItem) {
    btnAddItem.addEventListener('click', () => {
        editingItemIndex = null;
        document.getElementById('item-modal-form').reset();
        document.getElementById('item-modal-title').textContent = 'Adicionar Item';
        // Pre-fill placa if selected
        const selectedPlaca = document.getElementById('item-placa').value;
        if (selectedPlaca) {
            document.getElementById('modal-item-placa').value = selectedPlaca;
        }
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

// Abrir modal de seleção de item
const btnOpenItemSelection = document.getElementById('btn-open-item-selection');
if (btnOpenItemSelection) {
    btnOpenItemSelection.addEventListener('click', () => {
        document.getElementById('item-selection-modal').classList.remove('hidden');
    });
}

// Fechar modal de seleção de item
const closeItemSelectionModalBtn = document.getElementById('close-item-selection-modal');
if (closeItemSelectionModalBtn) {
    closeItemSelectionModalBtn.addEventListener('click', () => {
        document.getElementById('item-selection-modal').classList.add('hidden');
    });
}

// Selecionar item no modal de seleção e preencher no modal principal
const itemSelectionForm = document.getElementById('item-selection-form');
if (itemSelectionForm) {
    itemSelectionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const selectedIndex = document.getElementById('select-item-catalog').value;
        if (!selectedIndex) {
            alert('Por favor, selecione um item.');
            return;
        }

        const selectedItem = catalogItems[selectedIndex];
        const modalItemNome = document.getElementById('modal-item-nome');
        if (modalItemNome) {
            modalItemNome.value = `${selectedItem.codigo} - ${selectedItem.nomeSale}`;
        }

        // Fechar modal de seleção
        document.getElementById('item-selection-modal').classList.add('hidden');
    });
}

// Botão para adicionar novo item ao catálogo do modal de seleção
const btnAddNewCatalogItem = document.getElementById('btn-add-new-catalog-item');
if (btnAddNewCatalogItem) {
    btnAddNewCatalogItem.addEventListener('click', () => {
        document.getElementById('item-selection-modal').classList.add('hidden');
        editingCatalogItemIndex = null;
        document.getElementById('catalog-item-form').reset();
        document.getElementById('catalog-item-modal-title').textContent = 'Adicionar Item ao Catálogo';
        document.getElementById('catalog-item-modal').classList.remove('hidden');
    });
}

// Editar item
function editItem(index) {
    const selectedPlaca = document.getElementById('item-placa').value;
    if (!selectedPlaca) {
        alert('Selecione uma placa primeiro.');
        return;
    }

    const vehicle = vehicles.find(v => v.placa === selectedPlaca);
    if (!vehicle) {
        alert('Veículo não encontrado.');
        return;
    }

    // Get the item at the local index
    const items = Object.keys(vehicle.estoque);
    const itemName = items[index];
    if (!itemName) return;

    editingItemIndex = index; // Local index within the vehicle's stock
    document.getElementById('modal-item-placa').value = selectedPlaca;
    document.getElementById('modal-item-nome').value = itemName;
    document.getElementById('modal-item-quantidade').value = vehicle.estoque[itemName];

    document.getElementById('item-modal-title').textContent = 'Editar Item';
    document.getElementById('item-modal').classList.remove('hidden');
}

// Excluir item
function deleteItem(index) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    const selectedPlaca = document.getElementById('item-placa').value;
    if (!selectedPlaca) {
        alert('Selecione uma placa primeiro.');
        return;
    }

    const vehicle = vehicles.find(v => v.placa === selectedPlaca);
    if (!vehicle) {
        alert('Veículo não encontrado.');
        return;
    }

    // Get the item at the local index
    const items = Object.keys(vehicle.estoque);
    const itemToDelete = items[index];
    if (itemToDelete) {
        delete vehicle.estoque[itemToDelete];
        saveData();
        renderItems();
        renderStockSummary();

        // Refresh the filtered list
        renderItemsByPlaca(selectedPlaca);
    }
}

// Salvar item via formulário modal
const itemModalForm = document.getElementById('item-modal-form');
if (itemModalForm) {
    itemModalForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const placa = document.getElementById('modal-item-placa').value.trim();
        const nome = document.getElementById('modal-item-nome').value.trim();
        const quantidade = parseInt(document.getElementById('modal-item-quantidade').value.trim());

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
            const items = Object.keys(vehicle.estoque);
            const itemToEdit = items[editingItemIndex];
            if (itemToEdit) {
                vehicle.estoque[itemToEdit] = quantidade;
            }
        } else {
            // Adicionar novo item
            vehicle.estoque[nome] = (vehicle.estoque[nome] || 0) + quantidade;
        }

        saveData();
        renderItems();
        renderStockSummary();

        // Atualizar a lista de itens para a placa selecionada
        const selectedPlaca = document.getElementById('item-placa').value;
        if (selectedPlaca) {
            renderItemsByPlaca(selectedPlaca);
        }

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

        // Popula o select de placas na seção Estoque
        const placaSelect = document.getElementById('item-placa');
        if (placaSelect) {
            placaSelect.innerHTML = '<option value="" disabled selected>Selecione a placa</option>';
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.placa;
                option.textContent = vehicle.placa;
                placaSelect.appendChild(option);
            });

            // Adicionar listener para atualizar a lista de itens ao mudar a placa selecionada
            placaSelect.addEventListener('change', () => {
                const selectedPlaca = placaSelect.value;
                renderItemsByPlaca(selectedPlaca);
            });
        }

        // Função para renderizar itens filtrados por placa
        function renderItemsByPlaca(placa) {
            const listaItens = document.getElementById('lista-itens');
            listaItens.innerHTML = '';

            if (!placa) {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="4" style="text-align: center; padding: 2rem;">Selecione uma placa para ver os itens.</td>';
                listaItens.appendChild(tr);
                return;
            }

            const vehicle = vehicles.find(v => v.placa === placa);
            if (!vehicle || !vehicle.estoque || Object.keys(vehicle.estoque).length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="4" style="text-align: center; padding: 2rem;">Nenhum item cadastrado para esta placa.</td>';
                listaItens.appendChild(tr);
                return;
            }

            let index = 0;
            for (const [item, quantidade] of Object.entries(vehicle.estoque)) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${placa}</td>
                    <td>${item}</td>
                    <td>${quantidade}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editItem(${index})">Editar</button>
                        <button class="action-btn delete-btn" onclick="deleteItem(${index})">Excluir</button>
                    </td>
                `;
                listaItens.appendChild(tr);
                index++;
            }
        }

        // Adicionar event listeners para os botões de solicitação
        const btnRealizarSolicitacao = document.getElementById('btn-realizar-solicitacao');
        if (btnRealizarSolicitacao) {
            btnRealizarSolicitacao.addEventListener('click', () => {
                showRealizarSolicitacao();
            });
        }

        const btnBuscarSolicitacao = document.getElementById('btn-buscar-solicitacao');
        if (btnBuscarSolicitacao) {
            btnBuscarSolicitacao.addEventListener('click', () => {
                showBuscarSolicitacao();
            });
        }

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
