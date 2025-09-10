-- Script SQL para configurar tabelas no SupaBase
-- Execute este script no SQL Editor do SupaBase

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    nivel TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de solicitações
CREATE TABLE IF NOT EXISTS solicitacoes (
    id BIGINT PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id),
    veiculo_id BIGINT,
    itens JSONB,
    status TEXT DEFAULT 'pendente',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de peças
CREATE TABLE IF NOT EXISTS pecas (
    id BIGINT PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de veículos
CREATE TABLE IF NOT EXISTS veiculos (
    id BIGINT PRIMARY KEY,
    placa TEXT UNIQUE NOT NULL,
    modelo TEXT NOT NULL,
    ano INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS (Row Level Security) - permitir acesso público para leitura/escrita
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (permitir tudo para usuários autenticados)
CREATE POLICY "Permitir tudo para usuários autenticados" ON usuarios
FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para solicitações
CREATE POLICY "Usuários podem ver suas próprias solicitações" ON solicitacoes
FOR SELECT USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Técnicos podem criar solicitações" ON solicitacoes
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Supervisores podem atualizar solicitações" ON solicitacoes
FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para peças (leitura pública)
CREATE POLICY "Permitir leitura de peças" ON pecas
FOR SELECT USING (true);

-- Políticas para veículos (leitura pública)
CREATE POLICY "Permitir leitura de veículos" ON veiculos
FOR SELECT USING (true);

-- Exemplo de INSERT de usuário (substitua pelos dados reais)
-- INSERT INTO usuarios (id, nome, email, senha, nivel) VALUES
-- (123456789, 'João Silva', 'joao@email.com', 'senha123', 'tecnico')
-- ON CONFLICT (email) DO UPDATE SET
--     nome = EXCLUDED.nome,
--     senha = EXCLUDED.senha,
--     nivel = EXCLUDED.nivel;
