// js/migrate.js - Script de migração para import dinâmico

export async function migrarUsuarios() {
    try {
        // Buscar usuários do localStorage
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        if (usuarios.length === 0) {
            alert('Nenhum usuário encontrado no localStorage. Certifique-se de ter usuários cadastrados.');
            return;
        }

        // Gerar script SQL
        let sql = `-- Script SQL para migrar usuários do localStorage para SupaBase
-- Execute este script no SQL Editor do SupaBase

-- Inserir usuários
`;

        usuarios.forEach(usuario => {
            sql += `INSERT INTO usuarios (id, nome, email, senha, nivel) VALUES
(${usuario.id}, '${usuario.nome.replace(/'/g, "''")}', '${usuario.email.replace(/'/g, "''")}', '${usuario.senha.replace(/'/g, "''")}', '${usuario.nivel}')
ON CONFLICT (email) DO UPDATE SET
    nome = EXCLUDED.nome,
    senha = EXCLUDED.senha,
    nivel = EXCLUDED.nivel;

`;
        });

        // Exibir em um alert ou console
        console.log('=== SCRIPT SQL GERADO ===');
        console.log(sql);
        console.log('=== FIM DO SCRIPT ===');

        // Tentar copiar para clipboard
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(sql);
            alert(`Script SQL gerado e copiado para a área de transferência!\n\nTotal de usuários: ${usuarios.length}\n\nCole o script no SQL Editor do SupaBase.`);
        } else {
            alert(`Script SQL gerado!\n\nTotal de usuários: ${usuarios.length}\n\nCopie o script do console e execute no SQL Editor do SupaBase.`);
        }

    } catch (error) {
        console.error('Erro na migração:', error);
        alert('Erro ao gerar script de migração: ' + error.message);
    }
}

// Executar se chamado diretamente (não como módulo)
if (typeof window !== 'undefined' && !window.migrarUsuarios) {
    window.migrarUsuarios = migrarUsuarios;
    console.log('Função migrarUsuarios() disponível globalmente.');
}
