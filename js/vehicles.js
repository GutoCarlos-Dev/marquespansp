// vehicles.js - funções e eventos para gerenciamento de veículos

// Variável para controlar o índice do veículo sendo editado
let editingVehicleIndex = null;

// Renderizar lista de veículos na página
function renderVehicles() {
    const listaVeiculos = document.getElementById('lista-veiculos');
    if (!listaVeiculos) return;

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
                <button class="action-btn edit" onclick="editVehicle(${index})">Editar</button>
                <button class="action-btn delete" onclick="deleteVehicle(${index})">Excluir</button>
            </td>
        `;
        listaVeiculos.appendChild(tr);
    });
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

// Eventos para botões relacionados a veículos
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

const closeModalBtn = document.getElementById('close-modal');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        document.getElementById('vehicle-modal').classList.add('hidden');
    });
}

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
