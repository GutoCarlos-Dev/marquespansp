// notifications.js - funções para gerenciamento de notificações com Supabase

import { supabase } from './supabaseClient.js';

let notifications = [];

// Carregar notificações do Supabase
async function loadNotificationsFromSupabase() {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('data', { ascending: false });
    if (error) {
        console.error('Erro ao carregar notificações:', error);
        notifications = [];
    } else {
        notifications = data;
    }
}

// Adicionar notificação no Supabase
async function addNotificationToSupabase(mensagem) {
    const { data, error } = await supabase
        .from('notifications')
        .insert([{ mensagem }]);
    if (error) {
        console.error('Erro ao adicionar notificação:', error);
        return false;
    } else {
        notifications.unshift(data[0]); // Adicionar no início
        return true;
    }
}

// Excluir notificação no Supabase
async function deleteNotificationFromSupabase(id) {
    const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Erro ao excluir notificação:', error);
        return false;
    } else {
        notifications = notifications.filter(notif => notif.id !== id);
        return true;
    }
}

export { notifications, loadNotificationsFromSupabase, addNotificationToSupabase, deleteNotificationFromSupabase };
