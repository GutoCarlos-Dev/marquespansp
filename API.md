# Documentação da API - Sistema de Solicitação de Peças

Esta documentação descreve as operações da API utilizadas pelo sistema, baseada no SupaBase.

## 📋 Visão Geral

O sistema utiliza SupaBase como backend, que fornece uma API RESTful com autenticação e autorização integrada.

### Base URL
```
https://[seu-projeto].supabase.co/rest/v1
```

### Autenticação
Todas as requisições requerem autenticação via Bearer token:
```
Authorization: Bearer [token]
```

## 👥 Usuários

### Buscar Usuário por Credenciais
```javascript
// Método: POST
// Endpoint: /usuarios
// Query: ?select=*&or=(email.eq.{username},nome.eq.{username})&eq.senha.{password}

const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .or(`email.eq.${username},nome.eq.${username}`)
    .eq('senha', password);
```

**Resposta de Sucesso:**
```json
[
    {
        "id": "uuid",
        "nome": "joao.tecnico",
        "nomecompleto": "João Silva",
        "email": "joao@empresa.com",
        "nivel": "tecnico",
        "placa": "ABC-1234",
        "created_at": "2024-01-01T00:00:00Z"
    }
]
```

### Listar Todos os Usuários (Admin)
```javascript
const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('nome');
```

### Criar Novo Usuário (Admin)
```javascript
const { data, error } = await supabase
    .from('usuarios')
    .insert([{
        nome: 'novo.usuario',
        nomecompleto: 'Novo Usuário',
        email: 'novo@empresa.com',
        senha: 'senha123',
        nivel: 'tecnico',
        placa: 'XYZ-5678'
    }]);
```

### Atualizar Usuário (Admin)
```javascript
const { data, error } = await supabase
    .from('usuarios')
    .update({
        nomecompleto: 'Nome Atualizado',
        nivel: 'supervisor'
    })
    .eq('id', userId);
```

### Deletar Usuário (Admin)
```javascript
const { data, error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', userId);
```

## 🚗 Veículos

### Listar Veículos
```javascript
const { data, error } = await supabase
    .from('veiculos')
    .select(`
        *,
        supervisor:supervisor_id(nome),
        tecnico:tecnico_id(nome)
    `);
```

### Criar Veículo (Admin)
```javascript
const { data, error } = await supabase
    .from('veiculos')
    .insert([{
        placa: 'ABC-1234',
        qtd_equipe: 5,
        supervisor_id: 'uuid-supervisor',
        tecnico_id: 'uuid-tecnico'
    }]);
```

### Buscar Veículos por Supervisor
```javascript
const { data, error } = await supabase
    .from('veiculos')
    .select('id')
    .eq('supervisor_id', supervisorId);
```

## 🔧 Peças

### Listar Todas as Peças
```javascript
const { data, error } = await supabase
    .from('pecas')
    .select('*')
    .order('codigo');
```

### Buscar Peça por Código
```javascript
const { data, error } = await supabase
    .from('pecas')
    .select('*')
    .eq('codigo', codigoPeca);
```

### Criar Nova Peça (Admin)
```javascript
const { data, error } = await supabase
    .from('pecas')
    .insert([{
        codigo: 'PEC001',
        nome: 'Filtro de Óleo',
        descricao: 'Filtro de óleo motor'
    }]);
```

### Atualizar Peça (Admin)
```javascript
const { data, error } = await supabase
    .from('pecas')
    .update({
        nome: 'Nome Atualizado',
        descricao: 'Descrição atualizada'
    })
    .eq('id', pecaId);
```

## 📋 Solicitações

### Criar Nova Solicitação
```javascript
const { data, error } = await supabase
    .from('solicitacoes')
    .insert([{
        usuario_id: userId,
        veiculo_id: veiculoId,
        itens: [
            { codigo: 'PEC001', nome: 'Filtro de Óleo', quantidade: 2 },
            { codigo: 'PEC002', nome: 'Pastilha Freio', quantidade: 4 }
        ]
    }]);
```

### Listar Solicitações do Usuário
```javascript
const { data, error } = await supabase
    .from('solicitacoes')
    .select(`
        *,
        usuario:usuario_id(nome),
        veiculo:veiculo_id(placa)
    `)
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false });
```

### Listar Solicitações para Aprovação (Supervisor)
```javascript
// Buscar veículos do supervisor
const { data: veiculos, error: veiculosError } = await supabase
    .from('veiculos')
    .select('id')
    .eq('supervisor_id', supervisorId);

if (veiculos) {
    const veiculosIds = veiculos.map(v => v.id);

    const { data, error } = await supabase
        .from('solicitacoes')
        .select(`
            *,
            usuario:usuario_id(nome),
            veiculo:veiculo_id(placa)
        `)
        .in('veiculo_id', veiculosIds)
        .eq('status', 'pendente');
}
```

### Aprovar/Rejeitar Solicitação
```javascript
const { data, error } = await supabase
    .from('solicitacoes')
    .update({
        status: 'aprovado', // ou 'rejeitado'
        rota: 'Rota de entrega',
        data_aprovacao: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })
    .eq('id', solicitacaoId);
```

### Marcar como Enviada (Matriz)
```javascript
const { data, error } = await supabase
    .from('solicitacoes')
    .update({
        status: 'enviado',
        updated_at: new Date().toISOString()
    })
    .eq('id', solicitacaoId);
```

### Buscar Detalhes de Solicitação
```javascript
const { data, error } = await supabase
    .from('solicitacoes')
    .select(`
        *,
        usuario:usuario_id(nome),
        veiculo:veiculo_id(placa, qtd_equipe, supervisor:supervisor_id(nome))
    `)
    .eq('id', solicitacaoId)
    .single();
```

### Editar Itens da Solicitação (Admin/Matriz)
```javascript
const { data, error } = await supabase
    .from('solicitacoes')
    .update({
        itens: [
            { codigo: 'PEC001', nome: 'Filtro de Óleo', quantidade: 3 },
            { codigo: 'PEC002', nome: 'Pastilha Freio', quantidade: 6 }
        ],
        updated_at: new Date().toISOString()
    })
    .eq('id', solicitacaoId);
```

## 📊 Consultas do Dashboard

### Solicitações por Status (Admin/Matriz)
```javascript
const { data, error } = await supabase
    .from('solicitacoes')
    .select('id, created_at, status, itens, usuario:usuario_id(nome, nivel)')
    .gte('created_at', startDate)
    .lte('created_at', endDate);
```

### Solicitações por Supervisor
```javascript
const { data: veiculos, error: veiculosError } = await supabase
    .from('veiculos')
    .select('id')
    .eq('supervisor_id', supervisorId);

if (veiculos) {
    const veiculosIds = veiculos.map(v => v.id);

    const { data, error } = await supabase
        .from('solicitacoes')
        .select('id, created_at, status, itens, usuario:usuario_id(nome, nivel)')
        .in('veiculo_id', veiculosIds)
        .gte('created_at', startDate)
        .lte('created_at', endDate);
}
```

### Solicitações por Técnico
```javascript
const { data, error } = await supabase
    .from('solicitacoes')
    .select('id, created_at, status, itens, usuario:usuario_id(nome)')
    .eq('usuario_id', tecnicoId)
    .gte('created_at', startDate)
    .lte('created_at', endDate);
```

## 🔒 Políticas de Segurança (RLS)

### Usuários
- **SELECT**: Usuários podem ver apenas seus próprios dados (exceto admin)
- **INSERT/UPDATE/DELETE**: Apenas administradores

### Veículos
- **SELECT**: Todos os usuários autenticados
- **INSERT/UPDATE/DELETE**: Apenas administradores

### Peças
- **SELECT**: Todos os usuários autenticados
- **INSERT/UPDATE/DELETE**: Apenas administradores

### Solicitações
- **SELECT**:
  - Técnicos: Apenas suas próprias solicitações
  - Supervisores: Solicitações de técnicos sob sua supervisão
  - Matriz/Admin: Todas as solicitações
- **INSERT**: Todos os usuários autenticados
- **UPDATE**: Apenas supervisores/matríz/admin para aprovação, admin para edição
- **DELETE**: Apenas administradores

## 🚨 Tratamento de Erros

### Códigos de Erro Comuns

| Código | Descrição | Ação |
|--------|-----------|------|
| `PGRST116` | Não autorizado | Verificar permissões |
| `23505` | Violação de unicidade | Verificar dados duplicados |
| `23503` | Violação de chave estrangeira | Verificar referências |
| `42501` | Insufficient privilege | Verificar RLS policies |

### Exemplo de Tratamento
```javascript
try {
    const { data, error } = await supabase
        .from('solicitacoes')
        .insert([novaSolicitacao]);

    if (error) {
        switch (error.code) {
            case 'PGRST116':
                alert('Você não tem permissão para esta ação.');
                break;
            case '23505':
                alert('Dados duplicados. Verifique as informações.');
                break;
            default:
                alert('Erro inesperado: ' + error.message);
        }
        return;
    }

    // Sucesso
    console.log('Solicitação criada:', data);
} catch (error) {
    console.error('Erro de rede:', error);
    alert('Erro de conexão. Tente novamente.');
}
```

## 📈 Limites e Otimização

### Limites do SupaBase
- **Requests por hora**: 50.000 (free tier)
- **Database size**: 500MB (free tier)
- **Bandwidth**: 50GB (free tier)

### Otimizações
- Use `select` específico ao invés de `*`
- Implemente paginação para listas grandes
- Use índices apropriados
- Cache dados quando possível

## 🔧 Configuração

### Variáveis de Ambiente
```javascript
// js/config.js
const SUPABASE_URL = 'https://[seu-projeto].supabase.co';
const SUPABASE_ANON_KEY = '[sua-chave-anonima]';
```

### Inicialização do Cliente
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

**Para mais detalhes, consulte a [documentação oficial do SupaBase](https://supabase.com/docs).**
