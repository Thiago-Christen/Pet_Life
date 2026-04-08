CREATE DATABASE IF NOT EXISTS petlife CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petlife;

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    num_telefone VARCHAR(15) DEFAULT NULL,
    data_nascimento DATE NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pet (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    genero ENUM('macho', 'femea') NOT NULL,
    especie ENUM('gato', 'cachorro') NOT NULL,
    raca VARCHAR(50)   DEFAULT NULL,
    data_nascimento DATE NOT NULL,
    peso DECIMAL(5,2)  DEFAULT NULL,
    porte ENUM('pequeno', 'medio', 'grande') NOT NULL,
    foto VARCHAR(255)  DEFAULT NULL,
    fk_usuario_id INT NOT NULL,
    FOREIGN KEY (fk_usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE registrodiario (
    registro_id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('passeio', 'alimentacao', 'brincadeira', 'vacina', 'consulta', 'medicamento', 'observacao') NOT NULL,
    data DATE NOT NULL,
    observacoes TEXT DEFAULT NULL,
    fk_pet_id INT NOT NULL,
    FOREIGN KEY (fk_pet_id) REFERENCES pet(pet_id) ON DELETE CASCADE
);

SELECT
    u.id AS id_usuario,
    u.nome AS dono,
    p.pet_id,
    p.nome AS pet,
    p.especie,
    p.genero,
    p.raca,
    p.data_nascimento,
    TIMESTAMPDIFF(YEAR, p.data_nascimento, CURDATE()) AS idade_anos,
    p.peso,
    p.porte
FROM pet p
JOIN usuario u ON p.fk_usuario_id = u.id
ORDER BY u.id;

SELECT
    u.id AS id_usuario,
    u.nome AS dono,
    p.nome AS pet,
    r.tipo,
    r.data,
    r.observacoes
FROM registrodiario r
JOIN pet p ON r.fk_pet_id     = p.pet_id
JOIN usuario u ON p.fk_usuario_id = u.id
ORDER BY r.data;

DROP DATABASE IF EXISTS petlife;
 
