CREATE DATABASE petlife;
USE petlife;

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    num_telefone VARCHAR(15), 
    data_nascimento DATE NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Pet (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50),
    raca VARCHAR(50),
    idade INT,
    fk_usuario_id INT NOT NULL,
    FOREIGN KEY (fk_usuario_id) REFERENCES usuario(id)
);

CREATE TABLE RegistroDiario (
    registro_id INT AUTO_INCREMENT PRIMARY KEY,
    data DATE NOT NULL,
    atividade VARCHAR(200),
    observacoes TEXT,
    fk_pet_id INT NOT NULL,
    FOREIGN KEY (fk_pet_id) REFERENCES Pet(pet_id)
);

INSERT INTO usuario (nome, email, senha, num_telefone, data_nascimento, cpf)
VALUES (
    'Joao Abora',
    'abora@gmail.com',
    '123456',
    '(41) 99999-9999',
    '2002-08-10',
    '123.456.789-00'
);

INSERT INTO Pet (nome, especie, raca, idade, fk_usuario_id)
VALUES (
    'Rex',
    'Cachorro',
    'Vira-lata',
    3,
    1
);

INSERT INTO RegistroDiario (data, atividade, observacoes, fk_pet_id)
VALUES (
    '2026-04-01',
    'Passeio',
    'Passeio no parque',
    1
);

SELECT 
    u.id AS id_usuario,
    u.nome AS nome_usuario,
    p.pet_id,
    p.nome AS nome_pet,
    r.registro_id,
    r.data,
    r.atividade,
    r.observacoes
FROM RegistroDiario r
JOIN Pet p ON r.fk_pet_id = p.pet_id
JOIN usuario u ON p.fk_usuario_id = u.id;
DROP DATABASE petlife;
