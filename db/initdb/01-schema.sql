-- Schema Web II - Inicialización de Base de Datos
-- Creado según las queries del backend (queries.yaml)

-- Limpiar sesión
SET search_path TO public;

-- Crear tablas principales del sistema de seguridad y gestión

-- Tabla de Subsistemas
CREATE TABLE IF NOT EXISTS public.subsystem (
    subsystem_id SERIAL PRIMARY KEY,
    subsystem_na VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla de Clases
CREATE TABLE IF NOT EXISTS public."class" (
    class_id SERIAL PRIMARY KEY,
    class_na VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla de Métodos
CREATE TABLE IF NOT EXISTS public.method (
    method_id SERIAL PRIMARY KEY,
    method_na VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla de Perfiles
CREATE TABLE IF NOT EXISTS public.profile (
    profile_id SERIAL PRIMARY KEY,
    profile_de VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla de Personas
CREATE TABLE IF NOT EXISTS public.person (
    person_id SERIAL PRIMARY KEY,
    person_ci VARCHAR(20) UNIQUE NOT NULL,
    person_na VARCHAR(100) NOT NULL,
    person_ln VARCHAR(100) NOT NULL,
    person_em VARCHAR(100) UNIQUE,
    person_ph VARCHAR(20)
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS public."user" (
    user_id SERIAL PRIMARY KEY,
    user_na VARCHAR(100) UNIQUE NOT NULL,
    user_pw VARCHAR(255) NOT NULL,
    user_sol BOOLEAN DEFAULT true,
    person_id INTEGER REFERENCES public.person(person_id)
);

-- Tabla de Transacciones (para el sistema de seguridad)
CREATE TABLE IF NOT EXISTS public."transaction" (
    transaction_id SERIAL PRIMARY KEY,
    transaction_nu INTEGER UNIQUE NOT NULL,
    method_id INTEGER REFERENCES public.method(method_id),
    class_id INTEGER REFERENCES public."class"(class_id),
    subsystem_id INTEGER REFERENCES public.subsystem(subsystem_id)
);

-- Tablas de Relación (Muchos a Muchos)

-- Clases-Métodos
CREATE TABLE IF NOT EXISTS public.class_method (
    class_id INTEGER REFERENCES public."class"(class_id),
    method_id INTEGER REFERENCES public.method(method_id),
    PRIMARY KEY (class_id, method_id)
);

-- Clases-Subsistemas
CREATE TABLE IF NOT EXISTS public.class_subsystem (
    class_id INTEGER REFERENCES public."class"(class_id),
    subsystem_id INTEGER REFERENCES public.subsystem(subsystem_id),
    PRIMARY KEY (class_id, subsystem_id)
);

-- Métodos-Perfiles
CREATE TABLE IF NOT EXISTS public.method_profile (
    method_id INTEGER REFERENCES public.method(method_id),
    profile_id INTEGER REFERENCES public.profile(profile_id),
    PRIMARY KEY (method_id, profile_id)
);

-- Usuarios-Perfiles
CREATE TABLE IF NOT EXISTS public.user_profile (
    user_id INTEGER REFERENCES public."user"(user_id),
    profile_id INTEGER REFERENCES public.profile(profile_id),
    PRIMARY KEY (user_id, profile_id)
);

-- Tablas de Menús y Opciones (para el sistema de UI)

-- Tabla de Menús
CREATE TABLE IF NOT EXISTS public.menu (
    menu_id SERIAL PRIMARY KEY,
    id_parent INTEGER REFERENCES public.menu(menu_id),
    menu_na VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla de Opciones
CREATE TABLE IF NOT EXISTS public."option" (
    option_id SERIAL PRIMARY KEY,
    option_na VARCHAR(100) UNIQUE NOT NULL,
    tx TEXT,
    description TEXT
);

-- Relaciones de Menús-Opciones
CREATE TABLE IF NOT EXISTS public.option_menu (
    menu_id INTEGER REFERENCES public.menu(menu_id),
    option_id INTEGER REFERENCES public."option"(option_id),
    PRIMARY KEY (menu_id, option_id)
);

-- Relaciones de Opciones-Perfiles
CREATE TABLE IF NOT EXISTS public.option_profile (
    option_id INTEGER REFERENCES public."option"(option_id),
    profile_id INTEGER REFERENCES public.profile(profile_id),
    PRIMARY KEY (option_id, profile_id)
);

-- Crear secuencia para transaction_nu si no existe
CREATE SEQUENCE IF NOT EXISTS public.transaction_nu_seq
    AS INTEGER
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Comentarios para documentación
COMMENT ON TABLE public.subsystem IS 'Subsistemas del sistema (Security, etc.)';
COMMENT ON TABLE public."class" IS 'Clases de negocio (Person, User, etc.)';
COMMENT ON TABLE public.method IS 'Métodos de las clases (createPerson, etc.)';
COMMENT ON TABLE public.profile IS 'Perfiles de usuario (admin, user, etc.)';
COMMENT ON TABLE public.person IS 'Datos personales de los usuarios';
COMMENT ON TABLE public."user" IS 'Cuentas de usuario del sistema';
COMMENT ON TABLE public."transaction" IS 'Transacciones del sistema de seguridad';
COMMENT ON TABLE public.menu IS 'Estructura de menús de la aplicación';
COMMENT ON TABLE public."option" IS 'Opciones de menú y acciones del sistema';

-- Sincronizacion incremental con esquema principal:
-- traza devoluciones parciales contra detail de prestamo origen cuando exista la tabla.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'movement_detail'
    ) THEN
        ALTER TABLE public.movement_detail
        ADD COLUMN IF NOT EXISTS source_movement_detail_id BIGINT REFERENCES public.movement_detail(id) ON DELETE SET NULL;
    END IF;
END $$;

COMMIT;
