# Guia de Manutenção - Sistema de Solicitação de Peças

Este documento contém procedimentos e informações essenciais para manutenção e suporte do sistema.

## 📋 Sumário

- [Monitoramento](#monitoramento)
- [Backup e Recuperação](#backup-e-recuperação)
- [Atualizações](#atualizações)
- [Troubleshooting](#troubleshooting)
- [Performance](#performance)
- [Segurança](#segurança)
- [Suporte aos Usuários](#suporte-aos-usuários)

## 📊 Monitoramento

### Métricas Principais

#### SupaBase Dashboard
- **Uptime**: Disponibilidade do serviço
- **Response Time**: Tempo de resposta das queries
- **Error Rate**: Taxa de erros
- **Database Size**: Tamanho do banco de dados
- **Bandwidth Usage**: Uso de banda

#### Aplicação
- **User Sessions**: Sessões ativas
- **Page Views**: Visualizações de página
- **API Calls**: Chamadas para a API
- **Error Logs**: Logs de erro da aplicação

### Ferramentas de Monitoramento

#### SupaBase Built-in
```bash
# Verificar status do serviço
curl https://[seu-projeto].supabase.co/rest/v1/

# Logs de erro
# Acesse: Project Settings > Logs
```

#### Google Analytics (Opcional)
```html
<!-- Adicionar ao index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### Custom Logging
```javascript
// js/logger.js
class Logger {
    static log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Log no console
        console[level](message, logEntry);

        // Enviar para serviço de logging (opcional)
        this.sendToService(logEntry);
    }

    static error(message, error, data = {}) {
        this.log('error', message, { ...data, error: error.message, stack: error.stack });
    }

    static info(message, data = {}) {
        this.log('info', message, data);
    }
}
```

## 💾 Backup e Recuperação

### Estratégia de Backup

#### SupaBase Automatic Backups
- **Free Tier**: Backups automáticos mantidos por 7 dias
- **Pro Tier**: Backups por 30 dias + point-in-time recovery

#### Backup Manual
```bash
# Exportar dados via SQL
pg_dump "postgresql://[user]:[password]@[host]:5432/postgres" > backup.sql

# Ou via SupaBase CLI
supabase db dump --db-url "postgresql://..." > backup.sql
```

#### Arquivos Estáticos
```bash
# Backup do código fonte
tar -czf backup_code_$(date +%Y%m%d).tar.gz .

# Backup do logo e assets
cp logo.png backups/
cp -r css/ backups/
cp -r js/ backups/
```

### Plano de Recuperação

#### Cenário 1: Perda de Dados
1. **Identificar** o ponto de falha
2. **Restaurar** backup mais recente
3. **Verificar** integridade dos dados
4. **Notificar** usuários afetados

#### Cenário 2: Corrupção de Dados
1. **Isolar** dados corrompidos
2. **Restaurar** backup limpo
3. **Executar** scripts de validação
4. **Corrigir** inconsistências manuais

#### Cenário 3: Ataque de Segurança
1. **Desconectar** sistemas comprometidos
2. **Analisar** logs de segurança
3. **Restaurar** backup seguro
4. **Atualizar** medidas de segurança

## 🔄 Atualizações

### Processo de Deploy

#### 1. Preparação
```bash
# Criar branch de release
git checkout -b release/v1.2.0

# Atualizar versão
echo "1.2.0" > VERSION

# Commit das mudanças
git add .
git commit -m "release: versão 1.2.0"
```

#### 2. Testes
```bash
# Executar testes automatizados
npm test

# Testes manuais
# - Login com todos os níveis
# - Criar solicitação
# - Workflow de aprovação
# - Geração de PDF
# - Responsividade
```

#### 3. Deploy
```bash
# Merge para main
git checkout main
git merge release/v1.2.0

# Criar tag
git tag v1.2.0
git push origin main --tags

# Deploy para produção
# (dependendo da plataforma: Netlify, Vercel, etc.)
```

### Rollback Plan
```bash
# Em caso de problemas
git checkout v1.1.0  # Versão anterior estável
git push origin main --force

# Ou restaurar backup do SupaBase
supabase db restore --db-url "postgresql://..." backup.sql
```

### Versionamento
- **Major**: Mudanças incompatíveis (1.x.x)
- **Minor**: Novas funcionalidades (x.1.x)
- **Patch**: Correções de bugs (x.x.1)

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Login
**Sintomas**: Usuário não consegue fazer login
**Causas Possíveis**:
- Credenciais incorretas
- Conta desativada
- Problema no SupaBase

**Soluções**:
```javascript
// Verificar conexão com SupaBase
console.log('SupaBase status:', supabase.auth.session());

// Resetar senha via SupaBase Dashboard
// Ou executar query SQL:
UPDATE usuarios SET senha = 'nova_senha' WHERE email = 'usuario@email.com';
```

#### 2. Solicitações Não Aparecem
**Sintomas**: Solicitações não são exibidas no dashboard
**Causas Possíveis**:
- Problema de permissões RLS
- Dados corrompidos
- Filtro de data incorreto

**Soluções**:
```sql
-- Verificar permissões
SELECT * FROM solicitacoes WHERE usuario_id = 'user_id';

-- Verificar RLS policies
SELECT * FROM pg_policies WHERE tablename = 'solicitacoes';
```

#### 3. PDFs Não Geram
**Sintomas**: Erro ao gerar PDF
**Causas Possíveis**:
- Biblioteca jsPDF não carregada
- Dados inválidos
- Problema de CORS

**Soluções**:
```javascript
// Verificar se jsPDF está carregado
console.log('jsPDF loaded:', typeof window.jspdf);

// Fallback para download direto
window.open('/api/generate-pdf?id=' + solicitacaoId);
```

#### 4. Gráficos Não Aparecem
**Sintomas**: Dashboard sem gráficos
**Causas Possíveis**:
- Chart.js não carregado
- Dados vazios
- Erro de JavaScript

**Soluções**:
```javascript
// Verificar Chart.js
if (typeof Chart === 'undefined') {
    console.error('Chart.js não carregado');
}

// Verificar dados
console.log('Dados para gráfico:', chartData);
```

### Logs de Debug

#### Habilitar Debug Mode
```javascript
// Adicionar ao config.js
const DEBUG_MODE = true;

if (DEBUG_MODE) {
    console.log = (...args) => {
        // Log personalizado
        const message = args.join(' ');
        // Enviar para serviço de logging
    };
}
```

#### Analisar Logs
```bash
# Logs do navegador
# F12 > Console

# Logs do SupaBase
# Project Dashboard > Logs > API

# Logs de erro customizados
# Verificar console do navegador
```

## ⚡ Performance

### Otimização Frontend

#### 1. Minificação
```bash
# Minificar CSS
cleancss css/*.css -o css/styles.min.css

# Minificar JS
terser js/*.js -o js/scripts.min.js
```

#### 2. Compressão
```html
<!-- Adicionar ao .htaccess ou server config -->
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

#### 3. Cache
```html
<!-- Cache de assets -->
<link rel="stylesheet" href="css/style.css?v=1.2.0">
<script src="js/app.js?v=1.2.0"></script>
```

### Otimização Backend

#### Queries Otimizadas
```javascript
// ✅ Bom: Select específico
const { data } = await supabase
    .from('solicitacoes')
    .select('id, status, created_at')
    .eq('usuario_id', userId);

// ❌ Ruim: Select tudo
const { data } = await supabase
    .from('solicitacoes')
    .select('*');
```

#### Índices no Banco
```sql
-- Índices importantes
CREATE INDEX idx_solicitacoes_usuario ON solicitacoes(usuario_id);
CREATE INDEX idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX idx_solicitacoes_created_at ON solicitacoes(created_at);
CREATE INDEX idx_veiculos_supervisor ON veiculos(supervisor_id);
```

### Métricas de Performance

#### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

#### Métricas Customizadas
- **Time to Login**: Tempo para fazer login
- **Dashboard Load Time**: Tempo para carregar dashboard
- **PDF Generation Time**: Tempo para gerar PDF

## 🔒 Segurança

### Medidas de Segurança

#### 1. Autenticação
- Senhas fortes (mínimo 8 caracteres)
- Bloqueio após tentativas falhidas
- Expiração de sessão

#### 2. Autorização
- Row Level Security (RLS) ativo
- Validação de permissões no frontend
- Sanitização de inputs

#### 3. Dados Sensíveis
- Não armazenar senhas em plain text
- Criptografia de dados sensíveis
- Logs de auditoria

### Auditoria de Segurança

#### Checklist Mensal
- [ ] Verificar logs de acesso suspeito
- [ ] Atualizar dependências
- [ ] Testar backup/restore
- [ ] Verificar certificados SSL
- [ ] Auditar permissões de usuários

#### Resposta a Incidentes
1. **Identificar** o incidente
2. **Isolar** sistemas afetados
3. **Investigar** causa raiz
4. **Recuperar** sistemas
5. **Documentar** lições aprendidas

## 👥 Suporte aos Usuários

### Canais de Suporte

#### 1. Documentação
- README.md com guia de uso
- FAQ frequente
- Tutoriais em vídeo

#### 2. Help Desk
- Sistema de tickets
- Chat de suporte
- Email de contato

#### 3. Auto-atendimento
- Base de conhecimento
- Forums da comunidade
- Chatbot inteligente

### Procedimentos de Suporte

#### Reset de Senha
```sql
-- Via SQL (admin only)
UPDATE usuarios
SET senha = 'nova_senha_temporaria'
WHERE email = 'usuario@email.com';
```

#### Recuperação de Dados
1. Verificar backup disponível
2. Identificar dados perdidos
3. Restaurar backup
4. Validar integridade

#### Escalation Matrix
- **Nível 1**: Suporte básico (documentação, FAQ)
- **Nível 2**: Suporte técnico (desenvolvedores)
- **Nível 3**: Gestão (problemas críticos)

### Métricas de Suporte

#### KPIs
- **Tempo Médio de Resolução**: < 4 horas
- **Taxa de Satisfação**: > 90%
- **Tempo Médio de Primeiro Contato**: < 30 minutos

#### Relatórios
- Volume de chamados por categoria
- Tempo de resolução por tipo
- Satisfação dos usuários

## 📞 Contatos de Emergência

### Equipe Técnica
- **Líder Técnico**: [nome] - [email] - [telefone]
- **Desenvolvedor Senior**: [nome] - [email] - [telefone]
- **DevOps**: [nome] - [email] - [telefone]

### Fornecedores
- **SupaBase Support**: https://supabase.com/support
- **Hospedagem**: [contato do provedor]

### Plano de Contingência
- **Cenário A**: Indisponibilidade total
  - Ativar site de manutenção
  - Notificar usuários
  - Estimar tempo de resolução

- **Cenário B**: Perda de dados
  - Executar restore do backup
  - Verificar integridade
  - Comunicar impacto

---

**Última atualização: [Data]**
**Responsável: [Nome]**
