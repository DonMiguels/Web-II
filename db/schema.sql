-- schema.sql - Esquema de la base de datos

-- Tipos de categorías
CREATE TABLE category_type (
    category_type_id SERIAL PRIMARY KEY,
    category_type_name VARCHAR(100) NOT NULL
);

-- Categorías de items
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    category_type_id INTEGER REFERENCES category_type(category_type_id)
);

-- Items del inventario
CREATE TABLE item (
    item_id SERIAL PRIMARY KEY,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_cost NUMERIC(12,2),
    item_acquisition_date DATE,
    category_id INTEGER REFERENCES category(category_id)
);

-- Características de los items
CREATE TABLE feature (
    feature_id SERIAL PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL
);

-- Relación entre items y características
CREATE TABLE item_feature (
    item_feature_id SERIAL PRIMARY KEY,
    item_feature_value VARCHAR(100),
    feature_id INTEGER REFERENCES feature(feature_id),
    item_id INTEGER REFERENCES item(item_id)
);

-- Períodos académicos
CREATE TABLE period (
    period_id SERIAL PRIMARY KEY,
    period_name VARCHAR(100) NOT NULL,
    period_active BOOLEAN
);

-- Tipos de movimientos
CREATE TABLE movement_type (
    movement_type_id SERIAL PRIMARY KEY,
    movement_type_name VARCHAR(100) NOT NULL
);

-- Personas registradas
CREATE TABLE person (
    person_id SERIAL PRIMARY KEY,
    person_id_number VARCHAR(20) NOT NULL,
    person_first_name VARCHAR(100) NOT NULL,
    person_last_name VARCHAR(100) NOT NULL,
    person_email VARCHAR(100),
    person_phone VARCHAR(20),
    person_career VARCHAR(100)
);

-- Usuarios del sistema
CREATE TABLE "user" (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_password VARCHAR(100) NOT NULL,
    person_id INTEGER REFERENCES person(person_id)
);

-- Notificaciones del sistema
CREATE TABLE notification (
    notification_id SERIAL PRIMARY KEY,
    notification_type VARCHAR(50),
    notification_priority VARCHAR(50),
    notification_title VARCHAR(100),
    notification_message TEXT,
    notification_date TIMESTAMP,
    user_id INTEGER REFERENCES "user"(user_id)
);

-- Ubicaciones físicas
CREATE TABLE location (
    location_id SERIAL PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL,
    location_building VARCHAR(100),
    location_room VARCHAR(100),
    location_shelf VARCHAR(100),
    location_drawer VARCHAR(100)
);

-- Inventario de items
CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    inventory_quantity INTEGER NOT NULL,
    inventory_update_date TIMESTAMP,
    location_id INTEGER REFERENCES location(location_id),
    item_id INTEGER REFERENCES item(item_id)
);

-- Movimientos de préstamo/devolución
CREATE TABLE movement (
    movement_id SERIAL PRIMARY KEY,
    movement_start_date TIMESTAMP,
    movement_reserve_limit_date TIMESTAMP,
    movement_estimated_return_date TIMESTAMP,
    movement_actual_return_date TIMESTAMP,
    movement_observations TEXT,
    user_id INTEGER REFERENCES "user"(user_id),
    movement_type_id INTEGER REFERENCES movement_type(movement_type_id),
    period_id INTEGER REFERENCES period(period_id)
);

-- Detalles de los movimientos
CREATE TABLE movement_detail (
    movement_detail_id SERIAL PRIMARY KEY,
    movement_detail_quantity INTEGER,
    movement_detail_observations TEXT,
    movement_detail_fine NUMERIC(12,2),
    inventory_id INTEGER REFERENCES inventory(inventory_id),
    movement_id INTEGER REFERENCES movement(movement_id)
);

-- Estados de devolución
CREATE TABLE return_status (
    return_status_id SERIAL PRIMARY KEY,
    return_status_name VARCHAR(100),
    return_status_date TIMESTAMP,
    return_status_observations TEXT,
    movement_detail_id INTEGER REFERENCES movement_detail(movement_detail_id)
);

-- Auditoría del sistema
CREATE TABLE audit (
    audit_id SERIAL PRIMARY KEY,
    audit_table VARCHAR(100),
    audit_action VARCHAR(50),
    audit_date DATE,
    audit_time TIME,
    audit_details TEXT,
    user_id INTEGER REFERENCES "user"(user_id)
);