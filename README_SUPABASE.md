# Configuração SupaBase para Marquespan

## Problema
A aplicação usa localStorage para armazenar dados, que não persiste entre domínios diferentes (localhost vs GitHub Pages).

## Solução
Migrar para SupaBase para persistência de dados cross-domain.

## Passos para Configuração

### 1. Criar Projeto no SupaBase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Anote a **URL do projeto** e **chave anônima**

### 2. Configurar Banco de Dados
1. No painel do SupaBase, vá para **SQL Editor**
2. Execute o script `migracao_supabase.sql` para criar as tabelas

### 3. Migrar Usuários Existentes
1. Abra `migrate.html` no navegador (localmente)
2. Clique em "Gerar Script SQL"
3. Copie o SQL gerado
4. Execute no SQL Editor do SupaBase

### 4. Configurar Aplicação
1. Edite `js/config.js`:
   ```javascript
   const SUPABASE_URL = 'https://seu-projeto.supabase.co';
   const SUPABASE_ANON_KEY = 'sua-chave-anonima';
   ```

2. Verifique se o CDN do SupaBase está no `index.html`:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```

### 5. Configurar CORS (se necessário)
No painel do SupaBase:
1. Vá para **Settings > API**
2. Adicione o domínio do GitHub Pages em **Site URL**
3. Adicione `https://gutocarlos-dev.github.io` em **Redirect URLs**

### 6. Testar
1. Faça login localmente
2. Faça login no GitHub Pages
3. Cadastre novos usuários
4. Verifique se os dados persistem

## Arquivos Modificados
- `js/config.js` - Configuração SupaBase
- `js/app.js` - Login com SupaBase
- `js/cadastro_usuarios.js` - CRUD usuários com SupaBase
- `index.html` - CDN SupaBase
- `migrate.html` - Migração de dados
- `migracao_supabase.sql` - Schema do banco

## Próximos Passos
Após testar a migração, migrar também:
- Solicitações
- Peças
- Veículos

Para isso, seguir o mesmo padrão dos usuários.
