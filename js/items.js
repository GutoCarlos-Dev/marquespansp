// items.js - funções e eventos para gerenciamento de itens

// Variável para controle do modal de itens
let editingItemIndex = null;

// Renderizar lista de itens no estoque
function renderItems() {
    const listaItens = document.getElementById('lista-itens');
    if (!listaItens) return;

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
                <button class="btn-primary" style="background-color:#2980b9; padding: 5px 10px; font-size: 0.85rem;" onclick="editItem(${index})">Editar</button>
                <button class="btn-secondary" style="background-color:#e74c3c; padding: 5px 10px; font-size: 0.85rem;" onclick="deleteItem(${index})">Excluir</button>
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
            let oldItemName = null;
            for (const [item, qtd] of Object.entries(vehicle.estoque)) {
                if (count === editingItemIndex) {
                    oldItemName = item;
                    break;
                }
                count++;
            }
            if (oldItemName !== null) {
                // Se o nome do item foi alterado, remover o antigo e adicionar o novo
                if (oldItemName !== nome) {
                    delete vehicle.estoque[oldItemName];
                }
                vehicle.estoque[nome] = quantidade;
            }
        } else {
            // Adicionar novo item
            vehicle.estoque[nome] = (vehicle.estoque[nome] || 0) + quantidade;
        }

        saveData();
        renderItems();
        renderStockSummary();
        // Hide the item form section instead of modal
        document.getElementById('item-form-section').classList.add('hidden');
        // Close the modal after saving
        document.getElementById('item-modal').classList.add('hidden');
    });
}

// Populate placa select options in item form
function populatePlacaOptions() {
    const placaSelect = document.getElementById('item-placa');
    if (!placaSelect) return;

    // Clear existing options except the placeholder
    placaSelect.innerHTML = '<option value="" disabled selected>Selecione a placa</option>';

    vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.placa;
        option.textContent = vehicle.placa;
        placaSelect.appendChild(option);
    });
}

// Call populatePlacaOptions when Estoque section is shown
function showEstoqueSection() {
    // Show the Estoque section and hide others
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    const estoqueSection = document.getElementById('estoque-section');
    if (estoqueSection) {
        estoqueSection.classList.remove('hidden');
    }

    // Populate placa options
    populatePlacaOptions();
}

// Assuming you have a menu button for Estoque with data-target="estoque-section"
const estoqueMenuBtn = document.querySelector('button[data-target="estoque-section"]');
if (estoqueMenuBtn) {
    estoqueMenuBtn.addEventListener('click', () => {
        showEstoqueSection();
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
                <button class="action-btn edit" onclick="editItem(${index})">Editar</button>
                <button class="action-btn delete" onclick="deleteItem(${index})">Excluir</button>
            </td>
            `;
            listaItens.appendChild(tr);
        });
    });
}
