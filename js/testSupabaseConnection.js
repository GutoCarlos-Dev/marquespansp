import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://tetshxfxrdbzovajmfoz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRldHNoeGZ4cmRiem92YWptZm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDI1NDUsImV4cCI6MjA3MjY3ODU0NX0.dG09yVDrzofmRc7XmVHwgVJKVOG1xjPGkwxJGdYpk4U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*');

        if (error) {
            console.error('Erro ao buscar veículos:', error);
        } else {
            console.log('Dados dos veículos:', data);
            alert('Conexão com Supabase bem-sucedida. Verifique o console para os dados.');
        }
    } catch (err) {
        console.error('Erro inesperado:', err);
    }
}

testConnection();
