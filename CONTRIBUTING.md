# Guia de Contribuição

Bem-vindo ao projeto Sistema de Solicitação de Peças! Este documento contém diretrizes para contribuir com o desenvolvimento do projeto.

## 📋 Sumário

- [Como Começar](#como-começar)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Pull Requests](#pull-requests)
- [Issues](#issues)
- [Comunicação](#comunicação)

## 🚀 Como Começar

### 1. Configuração do Ambiente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sistema-solicitacao-pecas.git
cd sistema-solicitacao-pecas

# Instale dependências (se aplicável)
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações
```

### 2. Configure o SupaBase

1. Crie um projeto no [SupaBase](https://supabase.com)
2. Execute os scripts SQL em `scripts/setup-database.sql`
3. Configure as chaves em `js/config.js`

### 3. Executar Localmente

```bash
# Opção 1: Abrir index.html diretamente
# Opção 2: Usar servidor local
python -m http.server 8000
# Acesse http://localhost:8000
```

## 🔄 Fluxo de Desenvolvimento

### Branches

- **`main`**: Branch de produção (sempre estável)
- **`develop`**: Branch de desenvolvimento
- **`feature/nome-da-feature`**: Novas funcionalidades
- **`bugfix/nome-do-bug`**: Correções de bugs
- **`hotfix/nome-do-hotfix`**: Correções críticas em produção

### Workflow Git

```bash
# 1. Atualize sua branch principal
git checkout develop
git pull origin develop

# 2. Crie uma branch para sua feature
git checkout -b feature/nova-funcionalidade

# 3. Desenvolva e faça commits
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 4. Push para o repositório
git push origin feature/nova-funcionalidade

# 5. Abra um Pull Request
```

## 📝 Padrões de Código

### JavaScript

#### Estilo Geral
- Use **ES6+** features (arrow functions, template literals, destructuring)
- **Comentários em português brasileiro**
- Nomes de variáveis e funções em português ou inglês técnico
- Use `const` e `let` ao invés de `var`

#### Exemplo de Função
```javascript
/**
 * Carrega os detalhes de uma solicitação específica
 * @param {string} id - ID da solicitação
 * @returns {Promise<Object>} Dados da solicitação
 */
async function carregarDetalhesSolicitacao(id) {
    try {
        const { data, error } = await supabase
            .from('solicitacoes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao carregar solicitação:', error);
        throw error;
    }
}
```

#### Tratamento de Erros
```javascript
// ✅ Correto
try {
    const resultado = await funcaoAssincrona();
    return resultado;
} catch (error) {
    console.error('Erro específico:', error);
    alert('Mensagem amigável para o usuário');
}

// ❌ Evite
// try {
//     // código
// } catch (error) {
//     console.log(error); // Muito genérico
// }
```

### CSS

#### Estrutura
- Use abordagem **mobile-first**
- Organize estilos por componente/página
- Use variáveis CSS para cores e espaçamentos
- Classes descritivas (BEM-like)

#### Exemplo
```css
/* Variáveis globais */
:root {
    --cor-primaria: #4CAF50;
    --cor-secundaria: #f44336;
    --espacamento-padrao: 1rem;
}

/* Componente específico */
.card-solicitacao {
    background: white;
    border-radius: 8px;
    padding: var(--espacamento-padrao);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-solicitacao__titulo {
    color: var(--cor-primaria);
    margin-bottom: var(--espacamento-padrao);
}

.card-solicitacao__conteudo {
    line-height: 1.6;
}
```

### HTML

#### Semântica
- Use tags semânticas (`<header>`, `<main>`, `<section>`, `<article>`)
- Estrutura lógica e acessível
- Atributos ARIA quando necessário

#### Exemplo
```html
<!-- ✅ Correto -->
<main>
    <section class="dashboard">
        <h2>Dashboard</h2>
        <div class="cards-container">
            <article class="card">
                <h3>Total de Solicitações</h3>
                <p>42</p>
            </article>
        </div>
    </section>
</main>

<!-- ❌ Evite -->
<!-- <div class="main">
    <div class="dashboard">
        <h2>Dashboard</h2>
        <div class="cards">
            <div class="card">
                <div>Total de Solicitações</div>
                <div>42</div>
            </div>
        </div>
    </div>
</div> -->
```

## 🧪 Testes

### Estratégia de Testes

1. **Testes Manuais**: Funcionalidades críticas
2. **Testes de Integração**: Fluxos completos
3. **Testes de Responsividade**: Diferentes dispositivos

### Checklist de Testes

#### Funcionalidades Core
- [ ] Login com diferentes níveis de usuário
- [ ] Criação de solicitações
- [ ] Workflow de aprovação
- [ ] Geração de PDFs
- [ ] Dashboard e gráficos

#### Responsividade
- [ ] Desktop (1920x1080+)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

#### Navegadores
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## 🔄 Pull Requests

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças implementadas.

## Tipo de Mudança
- [ ] 🐛 Bug fix
- [ ] ✨ Nova funcionalidade
- [ ] 💥 Breaking change
- [ ] 📚 Documentação
- [ ] 🎨 Estilo/interface
- [ ] ♻️ Refatoração
- [ ] ⚡ Performance
- [ ] ✅ Testes

## Checklist
- [ ] Testei localmente
- [ ] Atualizei a documentação
- [ ] Segui os padrões de código
- [ ] Adicionei testes (se aplicável)

## Issues Relacionadas
- Closes #123
- Relates to #456

## Screenshots (se aplicável)
<!-- Adicione screenshots das mudanças visuais -->
```

### Revisão de Código

#### Critérios de Aprovação
- ✅ Código segue padrões estabelecidos
- ✅ Funcionalidade testada
- ✅ Documentação atualizada
- ✅ Não quebra funcionalidades existentes
- ✅ Performance adequada

#### Comentários Comuns
- **Sugestões**: Melhorias opcionais
- **Bloqueadores**: Issues que impedem merge
- **Questões**: Dúvidas sobre implementação

## 🐛 Issues

### Templates Disponíveis

#### Bug Report
```markdown
**Descrição do Bug**
Descrição clara do problema.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Comportamento Atual**
O que está acontecendo.

**Screenshots**
Se aplicável.

**Ambiente**
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 91]
- Versão: [ex: 1.0.0]
```

#### Feature Request
```markdown
**Descrição da Feature**
Descrição da funcionalidade desejada.

**Solução Proposta**
Como implementar.

**Alternativas Consideradas**
Outras abordagens.

**Contexto Adicional**
Por que essa feature é importante.
```

### Labels
- `bug`: Problemas no código
- `enhancement`: Melhorias
- `documentation`: Documentação
- `question`: Dúvidas
- `wontfix`: Não será implementado
- `duplicate`: Issue duplicada

## 💬 Comunicação

### Canais
- **GitHub Issues**: Bugs e features
- **GitHub Discussions**: Perguntas gerais
- **Pull Request Comments**: Discussões técnicas

### Código de Conduta
- Seja respeitoso e profissional
- Foque em soluções, não em culpar
- Ajude outros contribuidores
- Mantenha discussões técnicas produtivas

## 🎯 Métricas de Qualidade

### Code Quality
- **Maintainability**: Código fácil de manter
- **Readability**: Código fácil de entender
- **Performance**: Funcionamento eficiente
- **Security**: Segurança adequada

### Process Quality
- **Test Coverage**: Cobertura de testes adequada
- **Documentation**: Documentação atualizada
- **CI/CD**: Pipeline funcionando
- **Code Review**: Revisões obrigatórias

## 📚 Recursos Adicionais

### Documentação Técnica
- [Arquitetura do Sistema](ARCHITECTURE.md)
- [README Principal](README.md)
- [API SupaBase](https://supabase.com/docs)

### Ferramentas
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

### Comunidade
- [SupaBase Community](https://github.com/supabase-community)
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)

---

**Obrigado por contribuir com o Sistema de Solicitação de Peças! 🚀**
