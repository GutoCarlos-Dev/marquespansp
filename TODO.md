# TODO - Integração SupaBase para Marquespan

## Problema Identificado
- Aplicação usa localStorage para dados de usuários
- localStorage não persiste entre domínios (localhost vs GitHub Pages)
- Usuários cadastrados localmente não aparecem no GitHub

## Solução: Integrar SupaBase
1. **✅ Configurar SupaBase**
   - Criar projeto no SupaBase
   - Obter URL e chave anônima
   - ✅ Criar tabelas: usuarios, solicitacoes, pecas, veiculos (migracao_supabase.sql)

2. **✅ Instalar SupaBase Client**
   - ✅ Adicionar CDN do SupaBase no index.html
   - ✅ Inicializar cliente SupaBase (js/config.js)

3. **✅ Gerar Script de Migração**
   - ✅ Criar migrate.html para gerar SQL dos usuários do localStorage
   - ✅ Criar migracao_supabase.sql com estrutura das tabelas

4. **✅ Modificar cadastro_usuarios.js**
   - ✅ Substituir localStorage por SupaBase
   - ✅ Funções: salvar, editar, excluir, listar usuários
   - ✅ Corrigido erro getSupabaseClient is not defined

5. **✅ Modificar app.js**
   - ✅ Login buscar usuários do SupaBase
   - ✅ Atualizar lógica de autenticação
   - ✅ Corrigido erro getSupabaseClient is not defined

6. **Migrar outros dados**
   - Solicitações para SupaBase
   - Peças para SupaBase
   - Veículos para SupaBase

7. **Testar**
   - Testar cadastro e login no GitHub Pages
   - Verificar sincronização de dados

## Próximos Passos
- ✅ Removido botão temporário de migração da tela de login
- Execute o script migracao_supabase.sql no SupaBase
- Abra migrate.html localmente para gerar SQL dos usuários
- Execute o SQL gerado no SupaBase
- Atualize as credenciais em js/config.js
- Teste o login no GitHub Pages
