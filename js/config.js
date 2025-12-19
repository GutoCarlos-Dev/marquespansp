// js/config.js - Configurações do SupaBase

// Substitua pelas suas credenciais do SupaBase
var SUPABASE_URL = 'https://tetshxfxrdbzovajmfoz.supabase.co'; // Substitua pela URL do seu projeto
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRldHNoeGZ4cmRiem92YWptZm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDI1NDUsImV4cCI6MjA3MjY3ODU0NX0.dG09yVDrzofmRc7XmVHwgVJKVOG1xjPGkwxJGdYpk4U'; // Substitua pela chave anônima
//const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRldHNoeGZ4cmRiem92YWptZm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDI1NDUsImV4cCI6MjA3MjY3ODU0NX0.dG09yVDrzofmRc7XmVHwgVJKVOG1xjPGkwxJGdYpk4U'; // Substitua pela chave anônima

// Inicializar cliente SupaBase
// A variável global 'supabase' será criada aqui para conter o CLIENTE inicializado.
// Usamos 'let' para evitar conflito imediato com 'window.supabase' da CDN.
var supabase;

try {
    // O objeto da CDN (a biblioteca) está em 'window.supabase'.
    if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined') {
        // Verifica se window.supabase é a biblioteca (tem o método createClient) ou se já é o cliente inicializado
        if (typeof window.supabase.createClient === 'function') {
            // Criamos o cliente usando a biblioteca
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            // Já está inicializado, apenas reutiliza
            supabase = window.supabase;
        }
        console.log('✅ SupaBase inicializado com sucesso');
    } else {
        supabase = null; // Garante que supabase seja nulo se a biblioteca não carregar.
        console.warn('⚠️ SupaBase não está carregado. Certifique-se de que o CDN está incluído no HTML.');
    }
} catch (error) {
    supabase = null;
    console.error('❌ Erro ao inicializar SupaBase:', error);
}
