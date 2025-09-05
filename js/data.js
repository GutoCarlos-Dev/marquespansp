// data.js - funções para carregar e salvar dados no localStorage

let vehicles = []; // Array de veículos
let requests = []; // Array de pedidos pendentes
let notifications = []; // Array de notificações
let equipmentRequests = []; // Array de solicitações de equipamento

// Carregar dados do localStorage ao iniciar
function loadData() {
    const storedVehicles = localStorage.getItem('vehicles');
    const storedRequests = localStorage.getItem('requests');
    const storedNotifications = localStorage.getItem('notifications');
    const storedEquipmentRequests = localStorage.getItem('equipmentRequests');

    if (storedVehicles) vehicles = JSON.parse(storedVehicles);
    if (storedRequests) requests = JSON.parse(storedRequests);
    if (storedNotifications) notifications = JSON.parse(storedNotifications);
    if (storedEquipmentRequests) equipmentRequests = JSON.parse(storedEquipmentRequests);
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    localStorage.setItem('requests', JSON.stringify(requests));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('equipmentRequests', JSON.stringify(equipmentRequests));
}
