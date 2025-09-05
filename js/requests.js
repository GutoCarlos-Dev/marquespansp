// requests.js - funções e eventos para gerenciamento de pedidos

// Variáveis declaradas em data.js: equipmentRequests, requests, notifications, vehicles

function toggleSection(sectionId) {
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });

    // Update active menu button
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach(button => {
        if (button.dataset.target === sectionId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Funções para mostrar/ocultar seções na tela de solicitações
function showRealizarSolicitacao() {
    const modal = document.getElementById('modal-solicitacao');
    if (modal) modal.classList.remove('hidden');

    // Esconder filtros e lista de pedidos
    const filtros = document.getElementById('buscar-solicitacao-filtros');
    const listaPedidos = document.getElementById('lista-pedidos');
    if (filtros) filtros.classList.add('hidden');
    if (listaPedidos) listaPedidos.classList.add('hidden');

    // Preencher dropdown de placa
    populatePlacaDropdown();

    // Gerar e definir ID de solicitação automático
    generateRequestId();

    // Limpar tabela de equipamentos
    clearEquipmentTable();

    // Limpar campos supervisor e tecnico
    document.getElementById('supervisor').value = '';
    document.getElementById('tecnico').value = '';

    // Set current date in data input and make it readonly
    const dataInput = document.getElementById('data');
    if (dataInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dataInput.value = `${yyyy}-${mm}-${dd}`;
        dataInput.readOnly = true;
    }
}

// Preencher dropdown de placa com placas de veículos
function populatePlacaDropdown() {
    const placaSelect = document.getElementById('placa');
    if (!placaSelect) return;

// Limpar opções existentes exceto o placeholder
    placaSelect.innerHTML = '<option value="" disabled selected>Selecione a placa</option>';

    vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.placa;
        option.textContent = `${vehicle.placa} - Estoque: ${getTotalStock(vehicle.placa)}`;
        placaSelect.appendChild(option);
    });
}

// Obter estoque total para uma placa dada
function getTotalStock(placa) {
    const vehicle = vehicles.find(v => v.placa === placa);
    if (!vehicle || !vehicle.estoque) return 0;
    return Object.values(vehicle.estoque).reduce((acc, qty) => acc + qty, 0);
}

// Gerar ID de solicitação automático
function generateRequestId() {
    const idInput = document.getElementById('id-solicitacao');
    if (!idInput) return;

// Gerar ID sequencial P-1, P-2, etc.
    let maxId = 0;
    equipmentRequests.forEach(request => {
        const match = request.id.match(/^P-(\d+)$/);
        if (match) {
            const num = parseInt(match[1]);
            if (num > maxId) maxId = num;
        }
    });
    idInput.value = 'P-' + (maxId + 1);
}

// Limpar corpo da tabela de equipamentos
function clearEquipmentTable() {
    const tbody = document.getElementById('equip-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
}

// Adicionar nova linha de equipamento
function addEquipmentRow() {
    const tbody = document.getElementById('equip-tbody');
    if (!tbody) return;

    const row = document.createElement('tr');

    // Campo de entrada de quantidade
    const qtyTd = document.createElement('td');
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.name = 'qtd';
    qtyInput.min = '1';
    qtyInput.value = '1';
    qtyTd.appendChild(qtyInput);
    row.appendChild(qtyTd);

    // Campo de entrada de equipamento
    const equipTd = document.createElement('td');
    const equipInput = document.createElement('input');
    equipInput.type = 'text';
    equipInput.name = 'equip';
    equipTd.appendChild(equipInput);
    row.appendChild(equipTd);

    // Campo de entrada de modelo
    const modTd = document.createElement('td');
    const modInput = document.createElement('input');
    modInput.type = 'text';
    modInput.name = 'mod';
    modTd.appendChild(modInput);
    row.appendChild(modTd);

    // Exibição de estoque disponível
    const stockTd = document.createElement('td');
    stockTd.textContent = ''; // Será atualizado baseado na placa e equipamento
    row.appendChild(stockTd);

    // Ações (botão remover)
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

// Atualizar estoque disponível para linhas de equipamento baseado na placa selecionada
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

// Obter quantidade de estoque para um equipamento específico em um veículo
function getStockForEquip(placa, equipName) {
    const vehicle = vehicles.find(v => v.placa === placa);
    if (!vehicle || !vehicle.estoque) return null;
    return vehicle.estoque[equipName] || 0;
}

document.addEventListener('DOMContentLoaded', () => {
    // Menu buttons toggle sections
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.target;
            if (target) {
                toggleSection(target);
            }
        });
    });

    // Mostrar modal no clique do botão
    const btnRealizarSolicitacao = document.getElementById('btn-realizar-solicitacao');
    if (btnRealizarSolicitacao) {
        btnRealizarSolicitacao.addEventListener('click', () => {
            showRealizarSolicitacao();
        });
    }

// Botão para fechar modal
    const closeModalBtn = document.getElementById('close-modal-solicitacao');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            const modal = document.getElementById('modal-solicitacao');
            if (modal) modal.classList.add('hidden');
        });
    }

// Botão para adicionar equipamento
    const addEquipBtn = document.getElementById('add-equip-btn');
    if (addEquipBtn) {
        addEquipBtn.addEventListener('click', () => {
            addEquipmentRow();
        });
    }

// Atualizar estoque disponível quando placa muda
    const placaSelect = document.getElementById('placa');
    if (placaSelect) {
        placaSelect.addEventListener('change', () => {
            updateStockAvailable();
        });
    }

// Atualizar estoque disponível quando nome do equipamento muda
    const equipTbody = document.getElementById('equip-tbody');
    if (equipTbody) {
        equipTbody.addEventListener('input', (event) => {
            if (event.target && event.target.name === 'equip') {
                updateStockAvailable();
            }
        });
    }

// Submissão do formulário
    const requisicaoForm = document.getElementById('requisicao-form');
    if (requisicaoForm) {
        requisicaoForm.addEventListener('submit', (e) => {
            e.preventDefault();

// Coletar dados do formulário
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

// Coletar itens de equipamento
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

// Validar quantidades contra o estoque
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

// Verificar se está editando ou criando novo
            const editIndex = requisicaoForm.dataset.editIndex;
            if (editIndex !== undefined) {
// Atualizar solicitação existente
                equipmentRequests[editIndex] = data;
                delete requisicaoForm.dataset.editIndex;
                alert('Solicitação atualizada com sucesso!');
            } else {
// Adicionar nova solicitação
                equipmentRequests.push(data);
                alert('Requisição enviada com sucesso!');
            }

// Salvar e renderizar
            saveData();
            renderEquipmentRequests();

            requisicaoForm.reset();
            clearEquipmentTable();
            generateRequestId();

// Resetar título do modal
            document.getElementById('modal-solicitacao-title').textContent = 'Realizar Solicitação';

// Fechar modal
            const modal = document.getElementById('modal-solicitacao');
            if (modal) modal.classList.add('hidden');
        });
    }
})

// Renderizar solicitações de equipamento em formato de tabela
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

// Adicionar event listeners aos botões
        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => editEquipmentRequest(index));
        deleteBtn.addEventListener('click', () => deleteEquipmentRequest(index));

        listaPedidos.appendChild(row);
    });
}

// Editar solicitação de equipamento
function editEquipmentRequest(index) {
    const request = equipmentRequests[index];
    if (!request) return;

// Preencher formulário com dados da solicitação
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

// Preencher tabela de equipamentos
    clearEquipmentTable();
    request.equipamentos.forEach(equip => {
        addEquipmentRowWithData(equip.qtd, equip.equip, equip.mod);
    });

// Atualizar título do modal
    document.getElementById('modal-solicitacao-title').textContent = 'Editar Solicitação';

// Mostrar modal
    const modal = document.getElementById('modal-solicitacao');
    if (modal) modal.classList.remove('hidden');

// Armazenar índice para atualização
    document.getElementById('requisicao-form').dataset.editIndex = index;
}

// Adicionar linha de equipamento com dados
function addEquipmentRowWithData(qtd, equip, mod) {
    const tbody = document.getElementById('equip-tbody');
    if (!tbody) return;

    const row = document.createElement('tr');

    // Campo de entrada de quantidade
    const qtyTd = document.createElement('td');
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.name = 'qtd';
    qtyInput.min = '1';
    qtyInput.value = qtd;
    qtyTd.appendChild(qtyInput);
    row.appendChild(qtyTd);

    // Campo de entrada de equipamento
    const equipTd = document.createElement('td');
    const equipInput = document.createElement('input');
    equipInput.type = 'text';
    equipInput.name = 'equip';
    equipInput.value = equip;
    equipTd.appendChild(equipInput);
    row.appendChild(equipTd);

    // Campo de entrada de modelo
    const modTd = document.createElement('td');
    const modInput = document.createElement('input');
    modInput.type = 'text';
    modInput.name = 'mod';
    modInput.value = mod;
    modTd.appendChild(modInput);
    row.appendChild(modTd);

    // Exibição de estoque disponível
    const stockTd = document.createElement('td');
    stockTd.textContent = ''; // Será atualizado baseado na placa e equipamento
    row.appendChild(stockTd);

    // Ações (botão remover)
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

// Excluir solicitação de equipamento
function deleteEquipmentRequest(index) {
    if (confirm('Tem certeza que deseja excluir esta solicitação?')) {
        equipmentRequests.splice(index, 1);
        saveData();
        renderEquipmentRequests();
    }
}

