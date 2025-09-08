// vehicles.js - funções e eventos para gerenciamento de veículos

import { supabase } from './supabaseClient.js';

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

    // Ordenar veículos por placa antes de renderizar
    const sortedVehicles = vehicles.slice().sort((a, b) => {
        if (!a.placa) return 1;
        if (!b.placa) return -1;
        return a.placa.localeCompare(b.placa);
    });

    sortedVehicles.forEach((vehicle, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${vehicle.placa || ''}</td>
            <td>${vehicle.modelo || ''}</td>
            <td>${vehicle.marca || ''}</td>
            <td>${vehicle.renavan || ''}</td>
            <td>${vehicle.ano || ''}</td>
            <td>
                <button class="action-btn edit" onclick="editVehicle(${index})" style="margin-right: 5px;">Editar</button>
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
async function deleteVehicle(index) {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
        const success = await deleteVehicleFromSupabase(index);
        if (success) {
            renderVehicles();
            renderStockSummary();
        }
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



// Função para adicionar veículo no Supabase
async function addVehicleToSupabase(placa, modelo, marca, renavan, ano) {
    const vehicle = {
        placa: placa.toUpperCase(),
        modelo,
        marca,
        renavan,
        ano,
        tecnicos: [],
        estoque: {}
    };

    const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicle]);

    if (error) {
        console.error('Erro ao adicionar veículo no Supabase:', error);
        alert('Erro ao salvar veículo no banco de dados.');
        return false;
    } else {
        vehicles.push(vehicle);
        renderVehicles();
        renderStockSummary();
        return true;
    }
}

// Função para editar veículo no Supabase
async function editVehicleInSupabase(index, placa, modelo, marca, renavan, ano) {
    const vehicle = vehicles[index];
    const updatedVehicle = {
        ...vehicle,
        placa: placa.toUpperCase(),
        modelo,
        marca,
        renavan,
        ano
    };

    const { data, error } = await supabase
        .from('vehicles')
        .update(updatedVehicle)
        .eq('placa', vehicle.placa);

    if (error) {
        console.error('Erro ao editar veículo no Supabase:', error);
        alert('Erro ao atualizar veículo no banco de dados.');
        return false;
    } else {
        vehicles[index] = updatedVehicle;
        renderVehicles();
        renderStockSummary();
        return true;
    }
}

// Função para excluir veículo no Supabase
async function deleteVehicleFromSupabase(index) {
    const vehicle = vehicles[index];

    const { data, error } = await supabase
        .from('vehicles')
        .delete()
        .eq('placa', vehicle.placa);

    if (error) {
        console.error('Erro ao excluir veículo no Supabase:', error);
        alert('Erro ao excluir veículo no banco de dados.');
        return false;
    } else {
        vehicles.splice(index, 1);
        renderVehicles();
        renderStockSummary();
        return true;
    }
}

// Exportar funções para uso em outros módulos
export { addVehicleToSupabase, editVehicleInSupabase, deleteVehicleFromSupabase };
