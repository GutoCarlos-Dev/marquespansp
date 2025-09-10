# TODO - Integração SupaBase para Marquespan

## ✅ Concluído
1. **Configurar SupaBase**
   - ✅ Criar projeto no SupaBase
   - ✅ Obter URL e chave anônima
   - ✅ Criar tabelas: usuarios, solicitacoes, pecas, veiculos

2. **Instalar SupaBase Client**
   - ✅ Adicionar CDN do SupaBase no index.html
   - ✅ Inicializar cliente SupaBase em js/config.js

3. **Modificar cadastro_usuarios.js**
   - ✅ Substituir localStorage por SupaBase
   - ✅ Funções: salvar, editar, excluir, listar usuários

4. **Modificar app.js**
   - ✅ Login buscar usuários do SupaBase
   - ✅ Atualizar lógica de autenticação

5. **Ferramentas de Migração**
   - ✅ migrate.html - Gera SQL para usuários do localStorage
   - ✅ migracao_supabase.sql - Schema completo do banco
   - ✅ README_SUPABASE.md - Instruções completas

## 🔄 Próximos Passos
6. **Migrar outros dados**
   - [ ] Solicitações para SupaBase
   - [ ] Peças para SupaBase
   - [ ] Veículos para SupaBase

7. **Testar**
   - [ ] Configurar projeto no SupaBase
   - [ ] Executar migração de usuários
   - [ ] Testar cadastro e login no GitHub Pages
   - [ ] Verificar sincronização de dados

## 📋 Instruções para Usuário
1. Criar projeto no SupaBase
2. Executar `migracao_supabase.sql` no SQL Editor
3. Abrir `migrate.html` localmente e gerar SQL dos usuários
4. Executar SQL gerado no SupaBase
5. Atualizar `js/config.js` com URL e chave do SupaBase
6. Testar login no GitHub Pages
