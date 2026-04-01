CREATE DATABASE petlife;
USE petlife;
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    cep VARCHAR(10),
    logradouro VARCHAR(150),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO usuario (nome, email, senha, data_nascimento, cpf, cep, logradouro, cidade, estado)
VALUES (
    'Joao Abora',
    'abora@gmail.com',
    '123456',
    '2002-08-10',
    '123.456.789-00',
    '80000-000',
    'Rua Teste',
    'Curitiba',
    'PR'
);
SELECT * FROM usuario;
