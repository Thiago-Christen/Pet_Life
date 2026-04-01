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

INSERT INTO usuario (nome, email, senha, num_telefone, data_nascimento, cpf)
VALUES (
    'Joao Abora',
    'abora@gmail.com',
    '123456',
    '(41) 99999-9999',
    '2002-08-10',
    '123.456.789-00'
);

SELECT * FROM usuario;
