// js/migrate_console.js - Script de migração para console
// Execute no console do navegador: import('./js/migrate_console.js')

function gerarSQLMigracao() {
    // Buscar usuários do localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    if (usuarios.length === 0) {
        console.error('Nenhum usuário encontrado no localStorage');
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

    console.log('=== SCRIPT SQL GERADO ===');
    console.log(sql);
    console.log('=== FIM DO SCRIPT ===');
    console.log(`Total de usuários: ${usuarios.length}`);

    // Copiar para clipboard se possível
    if (navigator.clipboard) {
        navigator.clipboard.writeText(sql).then(() => {
            console.log('Script copiado para a área de transferência!');
        });
    }

    return sql;
}

// Executar automaticamente se chamado diretamente
if (typeof window !== 'undefined') {
    console.log('Script de migração carregado. Execute gerarSQLMigracao() para gerar o SQL.');
    // gerarSQLMigracao(); // Descomentado para executar automaticamente
}
