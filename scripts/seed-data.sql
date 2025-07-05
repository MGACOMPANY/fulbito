-- Insertar datos de ejemplo

-- Insertar jugadores
INSERT INTO jugadores (nombre) VALUES 
('Luiggi'), ('Kriko'), ('Ciro'), ('Muru'), ('Guido'), ('Leo'), ('Javi'), ('Dours'),
('Ñery'), ('Pela'), ('Nico'), ('Justo'), ('Tobinho'), ('Marce'), ('Lula'), ('Juan')
ON CONFLICT DO NOTHING;

-- Insertar partidos de ejemplo
INSERT INTO partidos (fecha, goles_blanco, goles_negro, figura_partido, estado) VALUES 
('2024-01-18', 3, 2, 'Luiggi', 'finalizado'),
('2024-01-11', 1, 4, 'Ñery', 'finalizado'),
('2024-01-04', 2, 1, 'Ciro', 'finalizado'),
('2023-12-28', 0, 3, 'Pela', 'finalizado'),
('2023-12-21', 4, 1, 'Luiggi', 'finalizado')
ON CONFLICT DO NOTHING;
