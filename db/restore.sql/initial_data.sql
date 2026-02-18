-- Initial data for Web-II database
-- This file executes automatically when container starts

-- Insert category types
INSERT INTO category_type (category_type_name) VALUES 
('Equipment'),
('Materials'),
('Tools'),
('Books'),
('Software');

-- Insert categories
INSERT INTO category (category_name, category_type_id) VALUES 
('Laptops', 1),
('Desktops', 1),
('Tablets', 1),
('Monitors', 1),
('Keyboards', 3),
('Mouses', 3),
('Textbooks', 4),
('Reference Books', 4),
('Software Licenses', 5);

-- Insert features
INSERT INTO feature (feature_name) VALUES 
('Brand'),
('Model'),
('Series'),
('Color'),
('Capacity'),
('Speed'),
('Condition'),
('Warranty');

-- Insert movement types
INSERT INTO movement_type (movement_type_name) VALUES 
('Loan'),
('Return'),
('Maintenance'),
('Transfer');

-- Insert periods
INSERT INTO period (period_name, period_active) VALUES 
('2024-1', true),
('2024-2', false),
('2025-1', false),
('2025-2', false);

-- Insert locations
INSERT INTO location (location_name, location_building, location_room, location_shelf) VALUES 
('Main Warehouse', 'Building A', '101', 'A1'),
('Laboratory 1', 'Building B', '201', 'B1'),
('Laboratory 2', 'Building B', '202', 'B2'),
('Faculty Room', 'Building C', '301', 'C1'),
('Library', 'Building D', '401', 'D1');

-- Insert sample people
INSERT INTO person (person_id_number, person_first_name, person_last_name, person_email, person_phone, person_career) VALUES 
('12345678', 'Juan', 'Pérez', 'juan.perez@universidad.edu', '555-0101', 'Engineering'),
('87654321', 'María', 'González', 'maria.gonzalez@universidad.edu', '555-0102', 'Architecture'),
('13579246', 'Carlos', 'Rodríguez', 'carlos.rodriguez@universidad.edu', '555-0103', 'Medicine');

-- Insert users
INSERT INTO "user" (user_name, user_password, person_id) VALUES 
('jperez', '$2b$10$placeholder_hash_1', 1),
('mgonzalez', '$2b$10$placeholder_hash_2', 2),
('crodriguez', '$2b$10$placeholder_hash_3', 3);

-- Insert sample items
INSERT INTO item (item_code, item_name, item_cost, item_acquisition_date, category_id) VALUES 
('LAP001', 'Laptop Dell XPS 15', 1500.00, '2024-01-15', 1),
('LAP002', 'Laptop HP Pavilion', 800.00, '2024-02-20', 1),
('MON001', 'Monitor LG 27"', 300.00, '2024-01-10', 4),
('KEY001', 'Mechanical Keyboard RGB', 120.00, '2024-03-01', 5),
('LIB001', 'Differential Calculus', 45.00, '2024-01-05', 7);

-- Insert initial inventory
INSERT INTO inventory (inventory_quantity, inventory_update_date, location_id, item_id) VALUES 
(10, CURRENT_TIMESTAMP, 1, 1),
(15, CURRENT_TIMESTAMP, 1, 2),
(8, CURRENT_TIMESTAMP, 2, 3),
(20, CURRENT_TIMESTAMP, 1, 4),
(5, CURRENT_TIMESTAMP, 5, 5);

-- Insert item features
INSERT INTO item_feature (item_feature_value, feature_id, item_id) VALUES 
('Dell', 1, 1),
('XPS 15', 2, 1),
('HP', 1, 2),
('Pavilion', 2, 2),
('LG', 1, 3),
('27 inches', 2, 3);
