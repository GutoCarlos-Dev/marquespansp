-- Script de Migração para SupaBase - Marquespan
-- Execute este script no SQL Editor do SupaBase

-- Criar tabela usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    nivel TEXT NOT NULL
);

-- Criar tabela solicitacoes
CREATE TABLE IF NOT EXISTS solicitacoes (
    id BIGINT PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id),
    veiculo TEXT,
    pecas JSONB,
    status TEXT DEFAULT 'pendente',
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_aprovacao TIMESTAMP,
    observacoes TEXT
);

-- Criar tabela pecas
CREATE TABLE IF NOT EXISTS pecas (
    id BIGINT PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT
);

-- Criar tabela veiculos
CREATE TABLE IF NOT EXISTS veiculos (
    id BIGINT PRIMARY KEY,
    placa TEXT UNIQUE NOT NULL,
    modelo TEXT,
    ano INTEGER,
    usuario_id BIGINT REFERENCES usuarios(id)
);

-- Limpar tabela usuarios se necessário (descomente se quiser sobrescrever)
-- DELETE FROM usuarios;

-- Inserir usuários (será preenchido automaticamente pelo script de migração)
-- Os usuários serão inseridos via JavaScript na página migrate.html
-- Para evitar duplicatas, use INSERT ... ON CONFLICT

-- Exemplo de como inserir com tratamento de conflito:
-- INSERT INTO usuarios (id, nome, email, senha, nivel)
-- VALUES (123456789, 'Nome Usuario', 'email@exemplo.com', 'senha123', 'tecnico')
-- ON CONFLICT (email) DO UPDATE SET
--     nome = EXCLUDED.nome,
--     senha = EXCLUDED.senha,
--     nivel = EXCLUDED.nivel;

-- Para sobrescrever completamente (se necessário):
-- DELETE FROM usuarios WHERE email = 'gutoapollo@hotmail.com';

-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verificar usuários inseridos
SELECT COUNT(*) as total_usuarios FROM usuarios;
