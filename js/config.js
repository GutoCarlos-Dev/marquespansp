// js/config.js - Configurações do SupaBase

// Substitua pelas suas credenciais do SupaBase
const SUPABASE_URL = 'https://tetshxfxrdbzovajmfoz.supabase.co'; // Substitua pela URL do seu projeto
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRldHNoeGZ4cmRiem92YWptZm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDI1NDUsImV4cCI6MjA3MjY3ODU0NX0.dG09yVDrzofmRc7XmVHwgVJKVOG1xjPGkwxJGdYpk4U'; // Substitua pela chave anônima

// Inicializar cliente SupaBase
// A variável 'supabase' será reinicializada com o cliente.
var supabase = null;

try {
    // O objeto global do CDN v2 é 'supabase', não 'supabaseJs'.
    if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ SupaBase inicializado com sucesso');
    } else {
        console.warn('⚠️ SupaBase não está carregado. Certifique-se de que o CDN está incluído no HTML.');
    }
} catch (error) {
    console.error('❌ Erro ao inicializar SupaBase:', error);
}
