// js/migrate_console.js - Versão para executar diretamente no console
// Copie e cole este código no console do navegador (F12 > Console)

(function() {
    'use strict';

    console.log('🚀 Iniciando migração de dados do localStorage para SupaBase...');
    console.log('');

    // Verificar se localStorage está disponível
    if (typeof localStorage === 'undefined') {
        console.error('❌ localStorage não está disponível neste navegador.');
        return;
    }

    // Função para gerar SQL INSERT para usuários
    function gerarSQLUsuarios() {
        try {
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

            if (usuarios.length === 0) {
                console.log('❌ Nenhum usuário encontrado no localStorage.');
                console.log('💡 Certifique-se de que você tem usuários cadastrados localmente.');
                console.log('   Vá para a página de cadastro de usuários e cadastre alguns usuários primeiro.');
                return false;
            }

            console.log('✅ Encontrados', usuarios.length, 'usuários no localStorage');
            console.log('');

            // Mostrar usuários encontrados
            console.log('👥 Usuários encontrados:');
            usuarios.forEach((u, i) => {
                console.log(`   ${i + 1}. ${u.nome} (${u.email}) - ${u.nivel}`);
            });
            console.log('');

            console.log('=== SCRIPT SQL PARA SUPABASE ===');
            console.log('');
            console.log('-- Criar tabela usuarios');
            console.log('CREATE TABLE IF NOT EXISTS usuarios (');
            console.log('    id BIGINT PRIMARY KEY,');
            console.log('    nome TEXT NOT NULL,');
            console.log('    email TEXT UNIQUE NOT NULL,');
            console.log('    senha TEXT NOT NULL,');
            console.log('    nivel TEXT NOT NULL');
            console.log(');');
            console.log('');

            console.log('-- Inserir usuários');
            usuarios.forEach((usuario, index) => {
                try {
                    const nome = usuario.nome ? usuario.nome.replace(/'/g, "''") : '';
                    const email = usuario.email ? usuario.email.replace(/'/g, "''") : '';
                    const senha = usuario.senha ? usuario.senha.replace(/'/g, "''") : '';
                    const nivel = usuario.nivel || 'tecnico';

                    const sql = `INSERT INTO usuarios (id, nome, email, senha, nivel) VALUES (${usuario.id}, '${nome}', '${email}', '${senha}', '${nivel}');`;
                    console.log(sql);
                } catch (error) {
                    console.error(`❌ Erro ao processar usuário ${index + 1}:`, error);
                }
            });

            console.log('');
            console.log('-- Verificar inserção');
            console.log('SELECT * FROM usuarios;');
            console.log('');
            console.log('=== FIM DO SCRIPT ===');
            return true;
        } catch (error) {
            console.error('❌ Erro ao gerar SQL de usuários:', error);
            return false;
        }
    }

    // Executar migração
    const sucesso = gerarSQLUsuarios();

    // Instruções finais
    console.log('');
    if (sucesso) {
        console.log('✅ Script SQL gerado com sucesso!');
        console.log('');
        console.log('=== PRÓXIMOS PASSOS ===');
        console.log('1. 📋 Copie todo o script SQL mostrado acima (desde "SCRIPT SQL PARA SUPABASE" até "FIM DO SCRIPT")');
        console.log('2. 🌐 Vá para https://supabase.com e faça login');
        console.log('3. 📁 Crie um novo projeto ou acesse um existente');
        console.log('4. 🛠️ Vá para "SQL Editor" no painel lateral');
        console.log('5. 📝 Cole o script SQL e clique em "Run"');
        console.log('6. ✅ Verifique se os dados foram inseridos corretamente');
        console.log('7. 🔑 Vá para "Settings > API" para obter URL e chave');
        console.log('8. 📝 Atualize o arquivo js/config.js com suas credenciais');
        console.log('========================');
    } else {
        console.log('❌ Falha ao gerar script SQL. Verifique os erros acima.');
    }

    console.log('');
    console.log('💡 Dica: Se não há usuários no localStorage, cadastre alguns primeiro na página de cadastro de usuários.');

})();
