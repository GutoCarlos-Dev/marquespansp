# Integração SupaBase - Marquespan

## Problema
A aplicação usa localStorage para armazenar dados de usuários, que não persistem entre domínios diferentes (localhost vs GitHub Pages). Quando você acessa localmente, os usuários estão no localStorage do localhost, mas no GitHub Pages o domínio é diferente, então o localStorage está vazio.

## Solução
Integrar SupaBase como backend para armazenar dados de forma persistente e acessível de qualquer domínio.

## Passos para Implementar

### 1. Criar Projeto no SupaBase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Clique em "New Project"
4. Preencha os dados do projeto
5. Aguarde a criação (pode levar alguns minutos)

### 2. Configurar Banco de Dados
1. No painel do SupaBase, vá para "SQL Editor"
2. Execute o script `migracao_supabase.sql` que foi criado
3. Isso criará as tabelas necessárias: usuarios, solicitacoes, pecas, veiculos

### 3. Migrar Usuários Existentes
1. Abra o arquivo `migrate.html` no seu navegador (localmente)
2. Clique no botão "Gerar Script SQL"
3. Copie o SQL gerado
4. Cole e execute no SQL Editor do SupaBase
5. Isso migrará todos os usuários do localStorage para o SupaBase

### 4. Configurar Credenciais
1. No painel do SupaBase, vá para "Settings" > "API"
2. Copie a "Project URL" e "anon public" key
3. Abra o arquivo `js/config.js`
4. Substitua os placeholders pelas suas credenciais:
   ```javascript
   const SUPABASE_URL = 'https://seu-projeto.supabase.co';
   const SUPABASE_ANON_KEY = 'sua-chave-anonima';
   ```

### 5. Testar
1. Faça commit e push das mudanças para o GitHub
2. Acesse sua aplicação no GitHub Pages
3. Tente fazer login com um usuário migrado
4. Deve funcionar agora!

## Arquivos Modificados/Criados
- `js/config.js` - Configurações do SupaBase
- `migrate.html` - Script para migrar usuários
- `migracao_supabase.sql` - Estrutura das tabelas
- `index.html` - Adicionado CDN do SupaBase
- `TODO.md` - Lista de tarefas atualizada

## Próximos Passos (Opcionais)
Após testar o básico, podemos migrar também:
- Solicitações
- Peças
- Veículos

Para isso, seria necessário modificar os outros arquivos JS para usar SupaBase em vez de localStorage.

## Suporte
Se tiver problemas, verifique:
1. Credenciais corretas no `js/config.js`
2. Tabelas criadas no SupaBase
3. Usuários migrados corretamente
4. Console do navegador para erros JavaScript
