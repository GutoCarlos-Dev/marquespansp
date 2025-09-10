// js/config.js - Configurações do SupaBase

// Substitua pelas suas credenciais do SupaBase
const SUPABASE_URL = 'https://tetshxfxrdbzovajmfoz.supabase.co'; // Substitua pela URL do seu projeto
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRldHNoeGZ4cmRiem92YWptZm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDI1NDUsImV4cCI6MjA3MjY3ODU0NX0.dG09yVDrzofmRc7XmVHwgVJKVOG1xjPGkwxJGdYpk4U'; // Substitua pela chave anônima

// Inicializar cliente SupaBase
let supabase = null;

try {
    if (typeof window !== 'undefined' && typeof supabaseJs !== 'undefined') {
        supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ SupaBase inicializado com sucesso');
    } else {
        console.warn('⚠️ SupaBase não está carregado. Certifique-se de que o CDN está incluído no HTML.');
    }
} catch (error) {
    console.error('❌ Erro ao inicializar SupaBase:', error);
}

// Função para obter o cliente SupaBase
function getSupabaseClient() {
    return supabase;
}

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase, getSupabaseClient };
}
