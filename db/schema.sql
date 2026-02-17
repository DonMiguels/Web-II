-- schema.sql

CREATE TABLE tipo_categoria (
    tipo_categoria_id SERIAL PRIMARY KEY,
    tipo_categoria_de VARCHAR(100) NOT NULL
);

CREATE TABLE categoria (
    categoria_id SERIAL PRIMARY KEY,
    categoria_de VARCHAR(100) NOT NULL,
    tipo_categoria_id INTEGER REFERENCES tipo_categoria(tipo_categoria_id)
);

CREATE TABLE item (
    item_id SERIAL PRIMARY KEY,
    item_codigo VARCHAR(50) NOT NULL,
    item_nombre VARCHAR(100) NOT NULL,
    item_costo NUMERIC(12,2),
    item_fecha_adquisicion DATE,
    categoria_id INTEGER REFERENCES categoria(categoria_id)
);

CREATE TABLE caracteristica (
    caracteristica_id SERIAL PRIMARY KEY,
    caracteristica_de VARCHAR(100) NOT NULL
);

CREATE TABLE caracteristica_item (
    caracteristica_item_id SERIAL PRIMARY KEY,
    caracteristica_item_de VARCHAR(100),
    caracteristica_id INTEGER REFERENCES caracteristica(caracteristica_id),
    item_id INTEGER REFERENCES item(item_id)
);

CREATE TABLE periodo (
    periodo_id SERIAL PRIMARY KEY,
    periodo_de VARCHAR(100) NOT NULL,
    periodo_activo BOOLEAN
);

CREATE TABLE tipo_movimiento (
    tipo_movimiento_id SERIAL PRIMARY KEY,
    tipo_movimiento_de VARCHAR(100) NOT NULL
);

CREATE TABLE persona (
    persona_id SERIAL PRIMARY KEY,
    persona_ci VARCHAR(20) NOT NULL,
    persona_nombre VARCHAR(100) NOT NULL,
    persona_apellido VARCHAR(100) NOT NULL,
    persona_correo VARCHAR(100),
    persona_telefono VARCHAR(20),
    persona_carrera VARCHAR(100)
);

CREATE TABLE usuario (
    usuario_id SERIAL PRIMARY KEY,
    usuario_nombre VARCHAR(100) NOT NULL,
    usuario_clave VARCHAR(100) NOT NULL,
    persona_id INTEGER REFERENCES persona(persona_id)
);

CREATE TABLE notificacion (
    notificacion_id SERIAL PRIMARY KEY,
    notificacion_tipo VARCHAR(50),
    notificacion_prioridad VARCHAR(50),
    notificacion_titulo VARCHAR(100),
    notificacion_mensaje TEXT,
    notificacion_fecha TIMESTAMP,
    usuario_id INTEGER REFERENCES usuario(usuario_id)
);

CREATE TABLE ubicacion (
    ubicacion_id SERIAL PRIMARY KEY,
    ubicacion_de VARCHAR(100) NOT NULL,
    ubicacion_edificio VARCHAR(100),
    ubicacion_cuarto VARCHAR(100),
    ubicacion_estante VARCHAR(100),
    ubicacion_gabeta VARCHAR(100)
);

CREATE TABLE inventario (
    inventario_id SERIAL PRIMARY KEY,
    inventario_cantidad INTEGER NOT NULL,
    inventario_fecha_actualizacion TIMESTAMP,
    ubicacion_id INTEGER REFERENCES ubicacion(ubicacion_id),
    item_id INTEGER REFERENCES item(item_id)
);

CREATE TABLE movimiento (
    movimiento_id SERIAL PRIMARY KEY,
    movimiento_inicio_fe TIMESTAMP,
    movimiento_fecha_limite_apartado TIMESTAMP,
    movimiento_fecha_devolucion_estimada TIMESTAMP,
    movimiento_fecha_devolucion_real TIMESTAMP,
    movimiento_observaciones TEXT,
    usuario_id INTEGER REFERENCES usuario(usuario_id),
    tipo_movimiento_id INTEGER REFERENCES tipo_movimiento(tipo_movimiento_id),
    periodo_id INTEGER REFERENCES periodo(periodo_id)
);

CREATE TABLE detalle_movimiento (
    detalle_movimiento_id SERIAL PRIMARY KEY,
    detalle_movimiento_cantidad INTEGER,
    detalle_movimiento_observaciones TEXT,
    detalle_movimiento_multa NUMERIC(12,2),
    inventario_id INTEGER REFERENCES inventario(inventario_id),
    movimiento_id INTEGER REFERENCES movimiento(movimiento_id)
);

CREATE TABLE estado_devolucion (
    estado_devolucion_id SERIAL PRIMARY KEY,
    estado_devolucion_de VARCHAR(100),
    estado_devolucion_fecha TIMESTAMP,
    estado_devolucion_observaciones TEXT,
    detalle_movimiento_id INTEGER REFERENCES detalle_movimiento(detalle_movimiento_id)
);

CREATE TABLE auditoria (
    auditoria_id SERIAL PRIMARY KEY,
    auditoria_tabla VARCHAR(100),
    auditoria_accion VARCHAR(50),
    auditoria_fecha DATE,
    auditoria_hora TIME,
    auditoria_detalles TEXT,
    usuario_id INTEGER REFERENCES usuario(usuario_id)
);