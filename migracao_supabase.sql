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
    veiculo TEXT,
    pecas JSONB,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS (Row Level Security) - permitir acesso público para desenvolvimento
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (permitir tudo para desenvolvimento)
CREATE POLICY "Permitir tudo para usuarios" ON usuarios FOR ALL USING (true);
CREATE POLICY "Permitir tudo para solicitacoes" ON solicitacoes FOR ALL USING (true);
CREATE POLICY "Permitir tudo para pecas" ON pecas FOR ALL USING (true);
CREATE POLICY "Permitir tudo para veiculos" ON veiculos FOR ALL USING (true);
