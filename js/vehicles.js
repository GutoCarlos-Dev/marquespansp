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
        tr.innerHTML = '<td colspan="4" style="text-align: center; padding: 2rem;">Nenhum veículo cadastrado</td>';
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
async function addVehicle(placa, modelo, ano) {
    const vehicle = {
        placa: placa.toUpperCase(),
        modelo,
        ano: parseInt(ano),
        tecnicos: [],
        estoque: {}
    };

    try {
        // Upload to Supabase
        const { data, error } = await supabase
            .from('vehicles')
            .insert([{
                placa: vehicle.placa,
                modelo: vehicle.modelo,
                ano: vehicle.ano,
                estoque: vehicle.estoque
            }]);

        if (error) {
            console.error('Erro ao salvar no Supabase:', error);
            alert('Erro ao salvar veículo no banco de dados.');
            return;
        }

        vehicles.push(vehicle);
        saveData();
        renderVehicles();
        renderStockSummary();
        alert('Veículo cadastrado com sucesso!');
    } catch (err) {
        console.error('Erro inesperado:', err);
        alert('Erro ao cadastrar veículo.');
    }
}

// Editar veículo usando modal
function editVehicle(index) {
    editingVehicleIndex = index;
    const vehicle = vehicles[index];

    // Preencher o formulário do modal com os dados do veículo
    document.getElementById('placa').value = vehicle.placa || '';
    document.getElementById('modelo').value = vehicle.modelo || '';
    document.getElementById('ano').value = vehicle.ano || '';

    // Atualizar título do modal
    document.getElementById('modal-title').textContent = 'Editar Veículo';

    // Mostrar modal
    document.getElementById('vehicle-modal').classList.remove('hidden');
}

// Editar veículo no Supabase
async function editVehicleInSupabase(index, placa, modelo, ano) {
    const vehicle = vehicles[index];
    const updatedVehicle = {
        ...vehicle,
        placa: placa.toUpperCase(),
        modelo,
        ano: parseInt(ano),
    };

    try {
        // Update in Supabase
        const { data, error } = await supabase
            .from('vehicles')
            .update({
                placa: updatedVehicle.placa,
                modelo: updatedVehicle.modelo,
                ano: updatedVehicle.ano,
                estoque: updatedVehicle.estoque
            })
            .eq('placa', vehicle.placa);

        if (error) {
            console.error('Erro ao atualizar no Supabase:', error);
            alert('Erro ao atualizar veículo no banco de dados.');
            return;
        }

        vehicles[index] = updatedVehicle;
        saveData();
        renderVehicles();
        renderStockSummary();
        alert('Veículo atualizado com sucesso!');
    } catch (err) {
        console.error('Erro inesperado:', err);
        alert('Erro ao atualizar veículo.');
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
    vehicleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const placa = document.getElementById('placa').value.trim();
        const modelo = document.getElementById('modelo').value.trim();
        const ano = document.getElementById('ano').value.trim();

        if (!placa || !modelo || !ano) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (editingVehicleIndex !== null) {
            // Editar veículo existente
            await editVehicleInSupabase(editingVehicleIndex, placa, modelo, ano);
        } else {
            // Adicionar novo veículo
            await addVehicle(placa, modelo, ano);
        }

        document.getElementById('vehicle-modal').classList.add('hidden');
    });
}
