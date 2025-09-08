// catalog.js - funções para gerenciamento do catálogo de itens com Supabase

import { supabase } from './supabaseClient.js';

let catalogItems = [];

// Carregar catálogo do Supabase
async function loadCatalogFromSupabase() {
    const { data, error } = await supabase
        .from('catalog_items')
        .select('*');
    if (error) {
        console.error('Erro ao carregar catálogo:', error);
        catalogItems = [];
    } else {
        catalogItems = data;
    }
}

// Adicionar item ao catálogo no Supabase
async function addCatalogItemToSupabase(codigo, nomeSale) {
    const { data, error } = await supabase
        .from('catalog_items')
        .insert([{ codigo, nome_sale: nomeSale }]);
    if (error) {
        console.error('Erro ao adicionar item ao catálogo:', error);
        alert('Erro ao salvar item no catálogo.');
        return false;
    } else {
        catalogItems.push({ codigo, nome_sale: nomeSale });
        return true;
    }
}

// Editar item do catálogo no Supabase
async function editCatalogItemInSupabase(id, codigo, nomeSale) {
    const { data, error } = await supabase
        .from('catalog_items')
        .update({ codigo, nome_sale: nomeSale })
        .eq('id', id);
    if (error) {
        console.error('Erro ao editar item do catálogo:', error);
        alert('Erro ao atualizar item do catálogo.');
        return false;
    } else {
        const index = catalogItems.findIndex(item => item.id === id);
        if (index !== -1) {
            catalogItems[index] = { id, codigo, nome_sale: nomeSale };
        }
        return true;
    }
}

// Excluir item do catálogo no Supabase
async function deleteCatalogItemFromSupabase(id) {
    const { data, error } = await supabase
        .from('catalog_items')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Erro ao excluir item do catálogo:', error);
        alert('Erro ao excluir item do catálogo.');
        return false;
    } else {
        catalogItems = catalogItems.filter(item => item.id !== id);
        return true;
    }
}

export { catalogItems, loadCatalogFromSupabase, addCatalogItemToSupabase, editCatalogItemInSupabase, deleteCatalogItemFromSupabase };
