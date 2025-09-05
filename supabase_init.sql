-- Script SQL para criar as tabelas iniciais no Supabase para o projeto de controle de estoque da frota leve

-- Tabela de veículos
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    modelo VARCHAR(100),
    ano INT,
    estoque JSONB -- Armazena o estoque dos equipamentos em formato JSON { "equipamento": quantidade }
);

-- Tabela de solicitações
CREATE TABLE equipment_requests (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(20) UNIQUE NOT NULL, -- Exemplo: P-1, P-2
    status VARCHAR(20) NOT NULL,
    placa VARCHAR(20) REFERENCES vehicles(placa),
    supervisor VARCHAR(100),
    tecnico VARCHAR(100),
    cliente VARCHAR(100),
    cidade VARCHAR(100),
    requerente VARCHAR(100),
    receptor VARCHAR(100),
    data DATE,
    motivo TEXT,
    observacao TEXT,
    responsavel VARCHAR(100)
);

-- Tabela de equipamentos por solicitação
CREATE TABLE request_equipments (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(20) REFERENCES equipment_requests(request_id) ON DELETE CASCADE,
    qtd INT NOT NULL,
    equip VARCHAR(100) NOT NULL,
    mod VARCHAR(100)
);

-- Índices para melhorar performance
CREATE INDEX idx_vehicles_placa ON vehicles(placa);
CREATE INDEX idx_requests_request_id ON equipment_requests(request_id);
CREATE INDEX idx_request_equipments_request_id ON request_equipments(request_id);
