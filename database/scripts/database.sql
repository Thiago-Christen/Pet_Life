CREATE DATABASE IF NOT EXISTS petlife CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petlife;

CREATE TABLE usuario (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    nome             VARCHAR(100)  NOT NULL,
    email            VARCHAR(100)  NOT NULL UNIQUE,
    senha            VARCHAR(255)  NOT NULL,
    num_telefone     VARCHAR(15)   DEFAULT NULL,
    data_nascimento  DATE          NOT NULL,
    cpf              VARCHAR(14)   NOT NULL UNIQUE,
    data_criacao     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pet (
    pet_id           INT AUTO_INCREMENT PRIMARY KEY,
    nome             VARCHAR(100)  NOT NULL,
    genero           ENUM('macho', 'femea') NOT NULL,
    raca             VARCHAR(50)   DEFAULT NULL,
    idade            INT           DEFAULT NULL,
    foto             VARCHAR(255)  DEFAULT NULL,
    fk_usuario_id    INT           NOT NULL,
    FOREIGN KEY (fk_usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE registrodiario (
    registro_id      INT AUTO_INCREMENT PRIMARY KEY,
    tipo             ENUM('passeio', 'alimentacao', 'brincadeira', 'vacina', 'consulta', 'medicamento', 'observacao') NOT NULL,
    data             DATE          NOT NULL,
    observacoes      TEXT          DEFAULT NULL,
    fk_pet_id        INT           NOT NULL,
    FOREIGN KEY (fk_pet_id) REFERENCES pet(pet_id) ON DELETE CASCADE
);

INSERT INTO usuario (nome, email, senha, num_telefone, data_nascimento, cpf)
VALUES
    ('João Abora',  'joao@gmail.com',  '123456', '(41) 99999-9999', '2002-08-10', '123.456.789-00'),
    ('Maria Silva', 'maria@gmail.com', '123456', '(41) 98888-8888', '1998-03-25', '987.654.321-00');

INSERT INTO pet (nome, genero, raca, idade, fk_usuario_id)
VALUES
    ('Rex',   'macho', 'Vira-lata', 3, 1),
    ('Bella', 'femea', 'Golden',    5, 1),
    ('Mimi',  'femea', 'Siamês',    2, 2);

INSERT INTO registrodiario (tipo, data, observacoes, fk_pet_id)
VALUES
    ('passeio',     '2026-04-01', 'Passeio no parque, 30 min',      1),
    ('alimentacao', '2026-04-02', 'Comeu ração às 8h e 18h',        1),
    ('brincadeira', '2026-04-01', 'Brincou com bolinha por 20 min', 2),
    ('passeio',     '2026-04-03', 'Passeio curto no quarteirão',    3),
    ('vacina',      '2026-03-15', 'Antirrábica, próxima em 2027',   1),
    ('consulta',    '2026-02-10', 'Check-up anual, tudo normal',    1),
    ('medicamento', '2026-04-01', 'Vermífugo, próxima em julho',    2),
    ('vacina',      '2026-01-20', 'V4, próxima em 2027',            3);

SELECT
    u.id            AS id_usuario,
    u.nome          AS dono,
    p.pet_id,
    p.nome          AS pet,
    p.genero,
    p.raca,
    p.idade
FROM pet p
JOIN usuario u ON p.fk_usuario_id = u.id
ORDER BY u.id;

SELECT
    u.id            AS id_usuario,
    u.nome          AS dono,
    p.nome          AS pet,
    r.tipo,
    r.data,
    r.observacoes
FROM registrodiario r
JOIN pet p          ON r.fk_pet_id     = p.pet_id
JOIN usuario u      ON p.fk_usuario_id = u.id
ORDER BY r.data;
 
