# Sistema de Solicitação de Peças

Este é um sistema web simples para solicitação de peças, desenvolvido em HTML, CSS e JavaScript puro. O sistema é dividido em três níveis de usuários: Técnico, Supervisor e Matriz.

## Funcionalidades

### Técnico
- Login no sistema
- Criar solicitações de peças com grid de itens
- Visualizar solicitações pendentes de aprovação

### Supervisor
- Todas as funcionalidades do Técnico
- Aprovar ou rejeitar solicitações dos técnicos sob sua responsabilidade

### Administrador
- Acesso total ao sistema, incluindo todas as funcionalidades da Matriz.
- Cadastro de usuários, peças e veículos

### Matriz
- Todas as funcionalidades do Supervisor
- Visualizar solicitações aprovadas
- Marcar solicitações como enviadas
- Imprimir solicitações (simulação)

## Estrutura do Projeto

```
sistema-solicitacao-pecas/
├── index.html          # Página principal de login
├── css/
│   └── style.css       # Estilos globais (tema verde e branco)
├── js/
│   ├── app.js          # Lógica principal e navegação
│   ├── cadastro_usuarios.js
│   ├── cadastro_pecas.js
│   ├── cadastro_veiculos.js
│   ├── solicitacao.js
│   ├── aprovacao.js
│   └── aprovados.js
└── pages/
    ├── cadastro_usuarios.html
    ├── cadastro_pecas.html
    ├── cadastro_veiculos.html
    ├── solicitacao.html
    ├── aprovacao.html
    └── aprovados.html
```

## Como Usar

1. Abra o arquivo `index.html` em um navegador web.
2. Faça login com um usuário (ex: "tecnico1", "supervisor1", "matriz1").
3. Navegue pelas funcionalidades disponíveis no menu superior.

## Banco de Dados

Atualmente, os dados são armazenados no localStorage do navegador para simulação. Em produção, conectar com SupaBase.

### Tabelas Necessárias no SupaBase
- `usuarios`: id, nome, email, senha, nivel, placa
- `pecas`: id, codigo, nome, descricao
- `veiculos`: id, placa, qtd_equipe, supervisor_id, tecnico_id
- `solicitacoes`: id, codigo, nome_tecnico, status, placa, supervisor, rota, itens (JSON)

## Próximos Passos

- Integrar com SupaBase para persistência real
- Implementar autenticação segura
- Adicionar validações de formulário
- Melhorar UI/UX
- Implementar geração de PDF real
- Adicionar relatórios

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- localStorage (simulação de BD)

## Comentários

Todos os comentários no código estão em português, conforme solicitado.
