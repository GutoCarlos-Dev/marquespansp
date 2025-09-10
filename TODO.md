# TODO - Integração SupaBase para Marquespan

## Problema Identificado
- Aplicação usa localStorage para dados de usuários
- localStorage não persiste entre domínios (localhost vs GitHub Pages)
- Usuários cadastrados localmente não aparecem no GitHub

## Solução: Integrar SupaBase
1. **✅ Criar script de migração**
   - Criado js/migrate.js para gerar SQL dos usuários do localStorage
   - Criado js/migrate_console.js como alternativa sem problemas de CORS
   - Criado migrate.html - arquivo HTML dedicado sem problemas de CORS (recomendado)
   - Adicionado botão temporário no index.html para facilitar execução
   - Corrigido problema de inicialização do SupaBase em js/config.js

2. **✅ Configurar SupaBase**
   - Criado README_SUPABASE.md com instruções detalhadas
   - Criado js/migrate.js para gerar SQL dos usuários locais
   - Instruções para criar projeto no SupaBase e executar SQL
   - Após configurar, atualizar js/config.js com credenciais

3. **✅ Instalar SupaBase Client**
   - Adicionado CDN do SupaBase no index.html
   - Cliente inicializado em js/config.js

4. **Modificar cadastro_usuarios.js**
   - Substituir localStorage por SupaBase
   - Funções: salvar, editar, excluir, listar usuários

5. **Modificar app.js**
   - Login buscar usuários do SupaBase
   - Atualizar lógica de autenticação

6. **Migrar outros dados**
   - Solicitações para SupaBase
   - Peças para SupaBase
   - Veículos para SupaBase

7. **Testar**
   - Testar cadastro e login no GitHub Pages
   - Verificar sincronização de dados
