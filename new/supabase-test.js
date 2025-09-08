// Projeto de teste local para inserção no Supabase

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configurações do Supabase - substitua pelos seus valores
const SUPABASE_URL = 'https://tetshxfxrdbzovajmfoz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRldHNoeGZ4cmRiem92YWptZm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDI1NDUsImV4cCI6MjA3MjY3ODU0NX0.dG09yVDrzofmRc7XmVHwgVJKVOG1xjPGkwxJGdYpk4U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function insertVehicle() {
    const vehicle = {
        placa: 'ABC1234',
        modelo: 'Modelo Teste',
        marca: 'Marca Teste',
        renavan: '123456789',
        ano: 2023,
        tecnicos: [],
        estoque: {}
    };

    const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicle]);

    if (error) {
        console.error('Erro ao inserir veículo:', error);
    } else {
        console.log('Veículo inserido com sucesso:', data);
    }
}

insertVehicle();
