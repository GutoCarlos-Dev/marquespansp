# Projeto de Teste Local para Supabase

Este projeto permite testar inserções no banco de dados Supabase diretamente do navegador, sem precisar de Node.js instalado.

## Como usar:

1. Abra o arquivo `test-supabase.html` no seu navegador (duplo clique ou arraste para o navegador).

2. Clique nos botões para testar as inserções:
   - **Inserir Veículo**: Insere um veículo de teste na tabela `vehicles`.
   - **Inserir Item no Catálogo**: Insere um item no catálogo na tabela `catalog`.
   - **Inserir Solicitação**: Insere uma solicitação de equipamento na tabela `equipment_requests`.

3. Verifique o resultado na página e no console do navegador (F12 > Console).

## Configurações:

As configurações do Supabase estão hardcoded no arquivo HTML:
- URL: https://tetshxfxrdbzovajmfoz.supabase.co
- Chave anônima: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

**Atenção:** Em produção, nunca deixe chaves de API hardcoded. Use variáveis de ambiente.

## Estrutura do Projeto:

- `test-supabase.html`: Página principal para testes.
- `supabase-test.js`: Versão Node.js (requer instalação do Node.js e npm).
- `package.json`: Configuração para projeto Node.js.

## Requisitos:

- Navegador moderno com suporte a ES Modules.
- Conexão com internet para acessar o Supabase.

## Notas:

- Os dados inseridos são de teste e podem ser removidos do Supabase posteriormente.
- Verifique se as tabelas existem no seu projeto Supabase antes de executar os testes.
