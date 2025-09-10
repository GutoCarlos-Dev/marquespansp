// js/migrate.js - Script para migrar dados do localStorage para SupaBase

// Função para gerar SQL INSERT para usuários
function gerarSQLUsuarios() {
    try {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        if (usuarios.length === 0) {
            console.log('❌ Nenhum usuário encontrado no localStorage.');
            console.log('💡 Certifique-se de que você tem usuários cadastrados localmente.');
            return false;
        }

        console.log('✅ Encontrados', usuarios.length, 'usuários no localStorage');
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

// Função para gerar SQL para outras tabelas (se necessário)
function gerarSQLSolicitacoes() {
    try {
        const solicitacoes = JSON.parse(localStorage.getItem('solicitacoes')) || [];

        if (solicitacoes.length === 0) {
            console.log('ℹ️ Nenhuma solicitação encontrada no localStorage.');
            return true;
        }

        console.log('');
        console.log('-- Criar tabela solicitacoes (exemplo)');
        console.log('CREATE TABLE IF NOT EXISTS solicitacoes (');
        console.log('    id BIGINT PRIMARY KEY,');
        console.log('    dados JSONB');
        console.log(');');
        console.log('');

        console.log('-- Inserir solicitações');
        solicitacoes.forEach(solicitacao => {
            try {
                const sql = `INSERT INTO solicitacoes (id, dados) VALUES (${solicitacao.id || Date.now()}, '${JSON.stringify(solicitacao).replace(/'/g, "''")}');`;
                console.log(sql);
            } catch (error) {
                console.error('❌ Erro ao processar solicitação:', error);
            }
        });
        return true;
    } catch (error) {
        console.error('❌ Erro ao gerar SQL de solicitações:', error);
        return false;
    }
}

// Função principal de migração
function executarMigracao() {
    console.log('🚀 Iniciando migração de dados do localStorage para SupaBase...');
    console.log('');

    let sucesso = true;

    // Verificar se localStorage está disponível
    if (typeof localStorage === 'undefined') {
        console.error('❌ localStorage não está disponível neste navegador.');
        return false;
    }

    // Executar migração de usuários
    const usuariosOK = gerarSQLUsuarios();
    if (!usuariosOK) {
        sucesso = false;
    }

    // Executar migração de solicitações
    const solicitacoesOK = gerarSQLSolicitacoes();
    if (!solicitacoesOK) {
        sucesso = false;
    }

    // Instruções finais
    console.log('');
    if (sucesso) {
        console.log('✅ Migração concluída com sucesso!');
        console.log('');
        console.log('=== PRÓXIMOS PASSOS ===');
        console.log('1. 📋 Copie todo o script SQL mostrado acima');
        console.log('2. 🌐 Vá para https://supabase.com e faça login');
        console.log('3. 📁 Crie um novo projeto ou acesse um existente');
        console.log('4. 🛠️ Vá para "SQL Editor" no painel lateral');
        console.log('5. 📝 Cole o script SQL e clique em "Run"');
        console.log('6. ✅ Verifique se os dados foram inseridos corretamente');
        console.log('7. 🔑 Vá para "Settings > API" para obter URL e chave');
        console.log('8. 📝 Atualize o arquivo js/config.js com suas credenciais');
        console.log('========================');
    } else {
        console.log('❌ Migração concluída com erros. Verifique as mensagens acima.');
    }

    return sucesso;
}

// Executar migração automaticamente quando o script for carregado
if (typeof window !== 'undefined') {
    // Aguardar um pouco para garantir que a página esteja carregada
    setTimeout(() => {
        executarMigracao();
    }, 100);
}

// Também exportar a função para uso manual
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { executarMigracao, gerarSQLUsuarios, gerarSQLSolicitacoes };
}
