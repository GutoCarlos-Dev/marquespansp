# Guia de Migração para SupaBase - Marquespan

## Problema
A aplicação atualmente usa localStorage para armazenar dados dos usuários. Isso funciona localmente, mas quando você publica no GitHub Pages, o localStorage é específico do domínio, então os usuários cadastrados localmente não aparecem no GitHub.

## Solução: SupaBase
Vamos migrar os dados para SupaBase, um banco de dados PostgreSQL na nuvem.

## Passo 1: Gerar Script SQL dos Usuários Locais

### Método 1: Usando import (Recomendado)
1. Abra a aplicação localmente em `http://localhost:porta/index.html` (ou apenas abra o arquivo `index.html` no navegador)
2. Pressione `F12` para abrir as ferramentas de desenvolvedor
3. Clique na aba **"Console"**
4. No console, digite exatamente:
   ```javascript
   import('./js/migrate.js')
   ```
5. Pressione `Enter`
6. O script será executado e mostrará o SQL no console
7. Copie todo o texto gerado (desde "=== SCRIPT SQL PARA SUPABASE ===" até "=== FIM DO SCRIPT ===")

### Método 2: Copiando e colando o código
1. Abra o arquivo `js/migrate.js` em um editor
2. Copie todo o conteúdo do arquivo
3. Abra a aplicação localmente e pressione `F12` para abrir o console
4. Cole o código copiado no console
5. Pressione `Enter`
6. O script será executado e mostrará o SQL

### Método 3: Usando o botão temporário (Mais fácil)
Já adicionei um botão temporário na página de login para facilitar:

1. Abra a aplicação localmente (index.html no navegador)
2. Você verá um botão laranja "Gerar SQL Migração" abaixo do formulário de login
3. Clique no botão
4. Abra o console do navegador (F12 > Console)
5. O SQL será gerado automaticamente no console
6. Copie todo o texto gerado

**Importante:** Após a migração, lembre-se de remover o botão e o script temporário do `index.html` para manter a página limpa.

### Método 4: Botão de Exportar na Página de Cadastro (Mais fácil - Altamente Recomendado)
Adicionei um botão diretamente na página de cadastro de usuários:

1. **Acesse a página de cadastro de usuários** (`pages/cadastro_usuarios.html`)
2. **Certifique-se de que há usuários cadastrados** na tabela
3. **Clique no botão verde "📤 Exportar SQL para SupaBase"**
4. **O arquivo SQL será baixado automaticamente** no seu computador
5. **Abra o arquivo baixado** e copie todo o conteúdo
6. **Cole no SQL Editor do SupaBase**

**Vantagens:**
- ✅ Integrado diretamente na aplicação
- ✅ Funciona com usuários já cadastrados
- ✅ Download automático do arquivo SQL
- ✅ Formato exato para importação no SupaBase
- ✅ Não precisa de servidor local

### Método 5: Arquivo HTML dedicado (Alternativo)
Criei um arquivo `migrate.html` que resolve todos os problemas de CORS:

1. **Abra o arquivo `migrate.html`** diretamente no navegador (clique duplo)
2. **Clique no botão "Gerar SQL de Migração"**
3. **O SQL será gerado automaticamente** na caixa de texto
4. **Copie o SQL** da caixa de texto
5. **Cole no SQL Editor do SupaBase**

**Vantagens:**
- ✅ Sem problemas de CORS
- ✅ Interface visual clara
- ✅ Não precisa colar código no console
- ✅ Funciona abrindo o arquivo diretamente

### Método 5: Script direto no console (Se o método 4 não funcionar)
Se você tiver problemas com CORS (arquivo aberto diretamente no navegador):

1. Abra o arquivo `js/migrate_console.js` em um editor
2. Copie todo o conteúdo do arquivo
3. Abra a aplicação localmente e pressione `F12` para abrir o console
4. **Digite `allow pasting`** no console e pressione Enter (para permitir colar)
5. Cole o código copiado no console e pressione `Enter`
6. O script será executado imediatamente e mostrará o SQL

### 🔧 Resolvendo problemas comuns

#### Problema: "Access to script... blocked by CORS policy"
**Solução:** Você está abrindo o arquivo HTML diretamente no navegador (file://). Use um servidor local:
- Instale Node.js e execute: `npx http-server` na pasta do projeto
- Ou use VS Code com extensão "Live Server"
- Ou use Python: `python -m http.server 8000`

#### Problema: "Cannot access 'supabase' before initialization"
**Solução:** O SupaBase não está carregado. Verifique se o CDN está no HTML.

#### Problema: "Nenhum usuário encontrado no localStorage"
**Solução:** Você precisa cadastrar usuários primeiro:
1. Abra a aplicação localmente
2. Vá para a página de cadastro de usuários
3. Cadastre pelo menos um usuário
4. Depois execute a migração novamente

### Verificando se funcionou
Após executar qualquer método, você deve ver no console:
- "Iniciando migração..."
- "=== SCRIPT SQL PARA SUPABASE ==="
- Os comandos CREATE TABLE e INSERT
- "=== INSTRUÇÕES ==="

Se aparecer erro como "Failed to fetch" ou "CORS error", certifique-se de que está executando em localhost ou que o arquivo está sendo servido por um servidor web.

## Passo 2: Configurar SupaBase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá para **SQL Editor** no painel lateral
4. Cole o script SQL gerado no Passo 1 e execute
5. Vá para **Settings > API** para obter:
   - Project URL
   - Anon Key

## Passo 3: Atualizar Configurações

1. Abra `js/config.js`
2. Substitua:
   ```javascript
   const SUPABASE_URL = 'https://seu-projeto.supabase.co'; // Cole sua URL
   const SUPABASE_ANON_KEY = 'sua-chave-anonima'; // Cole sua chave
   ```

## Passo 4: Testar

1. Faça commit e push das mudanças para GitHub
2. Acesse https://gutocarlos-dev.github.io/marquespansp/
3. Teste o login com um usuário migrado

## Estrutura da Tabela `usuarios`

```sql
CREATE TABLE usuarios (
    id BIGINT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    nivel TEXT NOT NULL
);
```

## Próximos Passos (Opcionais)

Após testar usuários, podemos migrar:
- Solicitações
- Peças
- Veículos

Para isso, execute novamente o script de migração e ele gerará SQL para essas tabelas também.

## Suporte

Se tiver problemas:
1. Verifique se a URL e chave do SupaBase estão corretas
2. Confirme se o script SQL foi executado sem erros no SupaBase
3. Verifique o console do navegador para erros de JavaScript
