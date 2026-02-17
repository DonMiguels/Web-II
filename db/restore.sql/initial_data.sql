-- Datos iniciales para la base de datos Web-II
-- Este archivo se ejecuta automáticamente al iniciar el contenedor

-- Insertar tipos de categoría
INSERT INTO tipo_categoria (tipo_categoria_de) VALUES 
('Equipos'),
('Materiales'),
('Herramientas'),
('Libros'),
('Software');

-- Insertar categorías
INSERT INTO categoria (categoria_de, tipo_categoria_id) VALUES 
('Laptops', 1),
('Desktops', 1),
('Tablets', 1),
('Monitores', 1),
('Teclados', 3),
('Mouses', 3),
('Libros Texto', 4),
('Libros Referencia', 4),
('Licencias Software', 5);

-- Insertar características
INSERT INTO caracteristica (caracteristica_de) VALUES 
('Marca'),
('Modelo'),
('Serie'),
('Color'),
('Capacidad'),
('Velocidad'),
('Estado'),
('Garantía');

-- Insertar tipos de movimiento
INSERT INTO tipo_movimiento (tipo_movimiento_de) VALUES 
('Préstamo'),
('Devolución'),
('Mantenimiento'),
('Transferencia');

-- Insertar períodos
INSERT INTO periodo (periodo_de, periodo_activo) VALUES 
('2024-1', true),
('2024-2', false),
('2025-1', false),
('2025-2', false);

-- Insertar ubicaciones
INSERT INTO ubicacion (ubicacion_de, ubicacion_edificio, ubicacion_cuarto, ubicacion_estante) VALUES 
('Bodega Principal', 'Edificio A', '101', 'A1'),
('Laboratorio 1', 'Edificio B', '201', 'B1'),
('Laboratorio 2', 'Edificio B', '202', 'B2'),
('Sala de Profesores', 'Edificio C', '301', 'C1'),
('Biblioteca', 'Edificio D', '401', 'D1');

-- Insertar personas de ejemplo
INSERT INTO persona (persona_ci, persona_nombre, persona_apellido, persona_correo, persona_telefono, persona_carrera) VALUES 
('12345678', 'Juan', 'Pérez', 'juan.perez@universidad.edu', '555-0101', 'Ingeniería'),
('87654321', 'María', 'González', 'maria.gonzalez@universidad.edu', '555-0102', 'Arquitectura'),
('13579246', 'Carlos', 'Rodríguez', 'carlos.rodriguez@universidad.edu', '555-0103', 'Medicina');

-- Insertar usuarios
INSERT INTO usuario (usuario_nombre, usuario_clave, persona_id) VALUES 
('jperez', '$2b$10$placeholder_hash_1', 1),
('mgonzalez', '$2b$10$placeholder_hash_2', 2),
('crodriguez', '$2b$10$placeholder_hash_3', 3);

-- Insertar items de ejemplo
INSERT INTO item (item_codigo, item_nombre, item_costo, item_fecha_adquisicion, categoria_id) VALUES 
('LAP001', 'Laptop Dell XPS 15', 1500.00, '2024-01-15', 1),
('LAP002', 'Laptop HP Pavilion', 800.00, '2024-02-20', 1),
('MON001', 'Monitor LG 27"', 300.00, '2024-01-10', 4),
('KEY001', 'Teclado Mecánico RGB', 120.00, '2024-03-01', 5),
('LIB001', 'Cálculo Diferencial', 45.00, '2024-01-05', 7);

-- Insertar inventario inicial
INSERT INTO inventario (inventario_cantidad, inventario_fecha_actualizacion, ubicacion_id, item_id) VALUES 
(10, CURRENT_TIMESTAMP, 1, 1),
(15, CURRENT_TIMESTAMP, 1, 2),
(8, CURRENT_TIMESTAMP, 2, 3),
(20, CURRENT_TIMESTAMP, 1, 4),
(5, CURRENT_TIMESTAMP, 5, 5);

-- Insertar características de items
INSERT INTO caracteristica_item (caracteristica_item_de, caracteristica_id, item_id) VALUES 
('Dell', 1, 1),
('XPS 15', 2, 1),
('HP', 1, 2),
('Pavilion', 2, 2),
('LG', 1, 3),
('27 pulgadas', 2, 3);
