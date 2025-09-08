// data.js - funções para carregar e salvar dados no Supabase

import { supabase } from './supabaseClient.js';
import { loadCatalogFromSupabase, catalogItems } from './catalog.js';
import { loadNotificationsFromSupabase, notifications } from './notifications.js';

let vehicles = []; // Array de veículos
let requests = []; // Array de pedidos pendentes (legacy, agora em equipmentRequests)
let equipmentRequests = []; // Array de solicitações de equipamento

// Carregar dados do Supabase ao iniciar
async function loadData() {
    // Carregar veículos
    const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*');
    if (vehiclesError) {
        console.error('Erro ao carregar veículos:', vehiclesError);
        vehicles = [];
    } else {
        vehicles = vehiclesData;
    }

    // Carregar solicitações de equipamento
    const { data: requestsData, error: requestsError } = await supabase
        .from('equipment_requests')
        .select(`
            *,
            request_equipments (*)
        `);
    if (requestsError) {
        console.error('Erro ao carregar solicitações:', requestsError);
        equipmentRequests = [];
    } else {
        equipmentRequests = requestsData.map(req => ({
            ...req,
            equipamentos: req.request_equipments || []
        }));
    }

    // Carregar catálogo e notificações
    await loadCatalogFromSupabase();
    await loadNotificationsFromSupabase();

    // Manter requests como array vazio para compatibilidade
    requests = [];
}

// Salvar dados no Supabase (não mais necessário salvar manualmente, pois operações são síncronas)
function saveData() {
    // Dados são salvos diretamente nas operações CRUD
    console.log('Dados salvos no Supabase');
}
