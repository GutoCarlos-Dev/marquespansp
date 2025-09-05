// requests.js - funções e eventos para gerenciamento de pedidos

// Variables declared in data.js: equipmentRequests, requests, notifications, vehicles

// Funções para mostrar/ocultar seções na tela de solicitações
function showRealizarSolicitacao() {
    const modal = document.getElementById('modal-solicitacao');
    if (modal) modal.classList.remove('hidden');

    // Esconder filtros e lista de pedidos
    const filtros = document.getElementById('buscar-solicitacao-filtros');
    const listaPedidos = document.getElementById('lista-pedidos');
    if (filtros) filtros.classList.add('hidden');
    if (listaPedidos) listaPedidos.classList.add('hidden');

    // Populate placa dropdown
    populatePlacaDropdown();

    // Generate and set automatic request ID
    generateRequestId();

    // Clear equipment table
    clearEquipmentTable();

    // Clear supervisor and tecnico fields
    document.getElementById('supervisor').value = '';
    document.getElementById('tecnico').value = '';
}

// Populate placa dropdown with vehicle plates
function populatePlacaDropdown() {
    const placaSelect = document.getElementById('placa');
    if (!placaSelect) return;

    // Clear existing options except the placeholder
    placaSelect.innerHTML = '<option value="" disabled selected>Selecione a placa</option>';

    vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.placa;
        option.textContent = `${vehicle.placa} - Estoque: ${getTotalStock(vehicle.placa)}`;
        placaSelect.appendChild(option);
    });
}

// Get total stock for a given placa
function getTotalStock(placa) {
    const vehicle = vehicles.find(v => v.placa === placa);
    if (!vehicle || !vehicle.estoque) return 0;
    return Object.values(vehicle.estoque).reduce((acc, qty) => acc + qty, 0);
}

// Generate automatic request ID
function generateRequestId() {
    const idInput = document.getElementById('id-solicitacao');
    if (!idInput) return;

    // Simple auto-increment based on current timestamp
    idInput.value = 'REQ-' + Date.now();
}

// Clear equipment table body
function clearEquipmentTable() {
    const tbody = document.getElementById('equip-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
}

// Add new equipment row
function addEquipmentRow() {
    const tbody = document.getElementById('equip-tbody');
    if (!tbody) return;

    const row = document.createElement('tr');

    // Quantity input
    const qtyTd = document.createElement('td');
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.name = 'qtd';
    qtyInput.min = '1';
    qtyInput.value = '1';
    qtyTd.appendChild(qtyInput);
    row.appendChild(qtyTd);

    // Equip input
    const equipTd = document.createElement('td');
    const equipInput = document.createElement('input');
    equipInput.type = 'text';
    equipInput.name = 'equip';
    equipTd.appendChild(equipInput);
    row.appendChild(equipTd);

    // Mod input
    const modTd = document.createElement('td');
    const modInput = document.createElement('input');
    modInput.type = 'text';
    modInput.name = 'mod';
    modTd.appendChild(modInput);
    row.appendChild(modTd);

    // Stock available display
    const stockTd = document.createElement('td');
    stockTd.textContent = ''; // Will be updated based on placa and equip
    row.appendChild(stockTd);

    // Actions (remove button)
    const actionTd = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remover';
    removeBtn.className = 'btn-secondary';
    removeBtn.addEventListener('click', () => {
        row.remove();
    });
    actionTd.appendChild(removeBtn);
    row.appendChild(actionTd);

    tbody.appendChild(row);
}

// Update stock available for equipment rows based on selected placa
function updateStockAvailable() {
    const placaSelect = document.getElementById('placa');
    if (!placaSelect) return;
    const selectedPlaca = placaSelect.value;
    if (!selectedPlaca) return;

    const tbody = document.getElementById('equip-tbody');
    if (!tbody) return;

    Array.from(tbody.children).forEach(row => {
        const equipInput = row.querySelector('input[name="equip"]');
        const stockTd = row.children[3]; // 4th column is stock available
        if (equipInput && stockTd) {
            const equipName = equipInput.value.trim();
            const stockQty = getStockForEquip(selectedPlaca, equipName);
            stockTd.textContent = stockQty !== null ? stockQty : 'N/A';
        }
    });
}

// Get stock quantity for a specific equipment in a vehicle
function getStockForEquip(placa, equipName) {
    const vehicle = vehicles.find(v => v.placa === placa);
    if (!vehicle || !vehicle.estoque) return null;
    return vehicle.estoque[equipName] || 0;
}

document.addEventListener('DOMContentLoaded', () => {
    // Show modal on button click
    const btnRealizarSolicitacao = document.getElementById('btn-realizar-solicitacao');
    if (btnRealizarSolicitacao) {
        btnRealizarSolicitacao.addEventListener('click', () => {
            showRealizarSolicitacao();
        });
    }

    // Close modal button
    const closeModalBtn = document.getElementById('close-modal-solicitacao');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            const modal = document.getElementById('modal-solicitacao');
            if (modal) modal.classList.add('hidden');
        });
    }

    // Add equipment button
    const addEquipBtn = document.getElementById('add-equip-btn');
    if (addEquipBtn) {
        addEquipBtn.addEventListener('click', () => {
            addEquipmentRow();
        });
    }

    // Update stock available when placa changes
    const placaSelect = document.getElementById('placa');
    if (placaSelect) {
        placaSelect.addEventListener('change', () => {
            updateStockAvailable();
        });
    }

    // Update stock available when equipment name changes
    const equipTbody = document.getElementById('equip-tbody');
    if (equipTbody) {
        equipTbody.addEventListener('input', (event) => {
            if (event.target && event.target.name === 'equip') {
                updateStockAvailable();
            }
        });
    }

    // Form submission
    const requisicaoForm = document.getElementById('requisicao-form');
    if (requisicaoForm) {
        requisicaoForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Collect form data
            const formData = new FormData(requisicaoForm);
            const data = {
                id: formData.get('id-solicitacao'),
                status: formData.get('status'),
                placa: formData.get('placa'),
                supervisor: formData.get('supervisor'),
                tecnico: formData.get('tecnico'),
                cliente: formData.get('cliente'),
                cidade: formData.get('cidade'),
                requerente: formData.get('requerente'),
                receptor: formData.get('receptor'),
                data: formData.get('data'),
                motivo: formData.get('motivo'),
                observacao: formData.get('observacao'),
                responsavel: formData.get('responsavel'),
                equipamentos: []
            };

            // Collect equipment items
            const tbody = document.getElementById('equip-tbody');
            if (tbody) {
                Array.from(tbody.children).forEach(row => {
                    const qtdInput = row.querySelector('input[name="qtd"]');
                    const equipInput = row.querySelector('input[name="equip"]');
                    const modInput = row.querySelector('input[name="mod"]');
                    if (qtdInput && equipInput && modInput) {
                        const qtd = parseInt(qtdInput.value);
                        const equip = equipInput.value.trim();
                        const mod = modInput.value.trim();
                        if (qtd > 0 && equip) {
                            data.equipamentos.push({ qtd, equip, mod });
                        }
                    }
                });
            }

            // Validate quantities against stock
            for (const item of data.equipamentos) {
                const stockQty = getStockForEquip(data.placa, item.equip);
                if (stockQty === null) {
                    alert(`Veículo ou equipamento inválido para ${item.equip}`);
                    return;
                }
                if (item.qtd > stockQty) {
                    alert(`Quantidade solicitada (${item.qtd}) para ${item.equip} excede o estoque disponível (${stockQty})`);
                    return;
                }
            }

            // Check if editing or creating new
            const editIndex = requisicaoForm.dataset.editIndex;
            if (editIndex !== undefined) {
                // Update existing request
                equipmentRequests[editIndex] = data;
                delete requisicaoForm.dataset.editIndex;
                alert('Solicitação atualizada com sucesso!');
            } else {
                // Add new request
                equipmentRequests.push(data);
                alert('Requisição enviada com sucesso!');
            }

            // Save and render
            saveData();
            renderEquipmentRequests();

            requisicaoForm.reset();
            clearEquipmentTable();
            generateRequestId();

            // Reset modal title
            document.getElementById('modal-solicitacao-title').textContent = 'Realizar Solicitação';

            // Close modal
            const modal = document.getElementById('modal-solicitacao');
            if (modal) modal.classList.add('hidden');
        });
    }
})

// Render equipment requests in table format
function renderEquipmentRequests() {
    const listaPedidos = document.getElementById('lista-pedidos');
    if (!listaPedidos) return;

    listaPedidos.innerHTML = '';

    equipmentRequests.forEach((request, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${request.id}</td>
            <td>${request.status}</td>
            <td>${request.placa}</td>
            <td>${request.supervisor}</td>
            <td>${request.tecnico}</td>
            <td>${request.cliente}</td>
            <td>${request.data}</td>
            <td>
                <button class="btn-secondary edit-btn">Editar</button>
                <button class="btn-secondary delete-btn">Excluir</button>
            </td>
        `;

        // Add event listeners to buttons
        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => editEquipmentRequest(index));
        deleteBtn.addEventListener('click', () => deleteEquipmentRequest(index));

        listaPedidos.appendChild(row);
    });
}

// Edit equipment request
function editEquipmentRequest(index) {
    const request = equipmentRequests[index];
    if (!request) return;

    // Populate form with request data
    document.getElementById('id-solicitacao').value = request.id;
    document.getElementById('status').value = request.status;
    document.getElementById('placa').value = request.placa;
    document.getElementById('supervisor').value = request.supervisor;
    document.getElementById('tecnico').value = request.tecnico;
    document.getElementById('cliente').value = request.cliente;
    document.getElementById('cidade').value = request.cidade;
    document.getElementById('requerente').value = request.requerente;
    document.getElementById('receptor').value = request.receptor;
    document.getElementById('data').value = request.data;
    document.getElementById('motivo').value = request.motivo;
    document.getElementById('observacao').value = request.observacao;
    document.getElementById('responsavel').value = request.responsavel;

    // Populate equipment table
    clearEquipmentTable();
    request.equipamentos.forEach(equip => {
        addEquipmentRowWithData(equip.qtd, equip.equip, equip.mod);
    });

    // Update modal title
    document.getElementById('modal-solicitacao-title').textContent = 'Editar Solicitação';

    // Show modal
    const modal = document.getElementById('modal-solicitacao');
    if (modal) modal.classList.remove('hidden');

    // Store index for update
    document.getElementById('requisicao-form').dataset.editIndex = index;
}

// Add equipment row with data
function addEquipmentRowWithData(qtd, equip, mod) {
    const tbody = document.getElementById('equip-tbody');
    if (!tbody) return;

    const row = document.createElement('tr');

    // Quantity input
    const qtyTd = document.createElement('td');
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.name = 'qtd';
    qtyInput.min = '1';
    qtyInput.value = qtd;
    qtyTd.appendChild(qtyInput);
    row.appendChild(qtyTd);

    // Equip input
    const equipTd = document.createElement('td');
    const equipInput = document.createElement('input');
    equipInput.type = 'text';
    equipInput.name = 'equip';
    equipInput.value = equip;
    equipTd.appendChild(equipInput);
    row.appendChild(equipTd);

    // Mod input
    const modTd = document.createElement('td');
    const modInput = document.createElement('input');
    modInput.type = 'text';
    modInput.name = 'mod';
    modInput.value = mod;
    modTd.appendChild(modInput);
    row.appendChild(modTd);

    // Stock available display
    const stockTd = document.createElement('td');
    stockTd.textContent = ''; // Will be updated based on placa and equip
    row.appendChild(stockTd);

    // Actions (remove button)
    const actionTd = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remover';
    removeBtn.className = 'btn-secondary';
    removeBtn.addEventListener('click', () => {
        row.remove();
    });
    actionTd.appendChild(removeBtn);
    row.appendChild(actionTd);

    tbody.appendChild(row);
}

// Delete equipment request
function deleteEquipmentRequest(index) {
    if (confirm('Tem certeza que deseja excluir esta solicitação?')) {
        equipmentRequests.splice(index, 1);
        saveData();
        renderEquipmentRequests();
    }
}

