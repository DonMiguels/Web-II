-- Datos Iniciales Web II
-- Insertar datos base para el funcionamiento del sistema

-- Insertar subsistemas básicos
INSERT INTO public.subsystem (subsystem_na) VALUES 
    ('Security'),
    ('Admin'),
    ('Reports')
ON CONFLICT (subsystem_na) DO NOTHING;

-- Insertar clases principales
INSERT INTO public."class" (class_na) VALUES 
    ('Person'),
    ('User'),
    ('Profile'),
    ('Menu'),
    ('Option')
ON CONFLICT (class_na) DO NOTHING;

-- Insertar métodos básicos
INSERT INTO public.method (method_na) VALUES 
    ('createPerson'),
    ('getPerson'),
    ('updatePerson'),
    ('deletePerson'),
    ('registerUser'),
    ('login'),
    ('logout'),
    ('getUser'),
    ('updateUser'),
    ('createProfile'),
    ('getProfile'),
    ('assignProfile'),
    ('getMenuOptions'),
    ('getPermissions')
ON CONFLICT (method_na) DO NOTHING;

-- Insertar perfiles básicos
INSERT INTO public.profile (profile_de) VALUES 
    ('admin'),
    ('user'),
    ('guest')
ON CONFLICT (profile_de) DO NOTHING;

-- Insertar estructura de menús básica
INSERT INTO public.menu (menu_na, id_parent) VALUES 
    ('Principal', NULL),
    ('Seguridad', 1),
    ('Usuarios', 2),
    ('Perfiles', 2),
    ('Reportes', 1)
ON CONFLICT (menu_na) DO NOTHING;

-- Insertar opciones de menú
INSERT INTO public."option" (option_na, tx, description) VALUES 
    ('dashboard', 'Dashboard', 'Panel principal'),
    ('users_list', 'Usuarios', 'Lista de usuarios'),
    ('users_create', 'Crear Usuario', 'Crear nuevo usuario'),
    ('profiles_list', 'Perfiles', 'Lista de perfiles'),
    ('profiles_create', 'Crear Perfil', 'Crear nuevo perfil'),
    ('reports_view', 'Reportes', 'Ver reportes'),
    ('security_config', 'Configuración', 'Configuración de seguridad')
ON CONFLICT (option_na) DO NOTHING;

-- Relaciones Clases-Métodos (según el sistema de seguridad)
INSERT INTO public.class_method (class_id, method_id) 
SELECT c.class_id, m.method_id 
FROM public."class" c, public.method m 
WHERE c.class_na = 'Person' AND m.method_na IN ('createPerson', 'getPerson', 'updatePerson', 'deletePerson')
ON CONFLICT (class_id, method_id) DO NOTHING;

INSERT INTO public.class_method (class_id, method_id) 
SELECT c.class_id, m.method_id 
FROM public."class" c, public.method m 
WHERE c.class_na = 'User' AND m.method_na IN ('registerUser', 'login', 'logout', 'getUser', 'updateUser')
ON CONFLICT (class_id, method_id) DO NOTHING;

INSERT INTO public.class_method (class_id, method_id) 
SELECT c.class_id, m.method_id 
FROM public."class" c, public.method m 
WHERE c.class_na = 'Profile' AND m.method_na IN ('createProfile', 'getProfile', 'assignProfile')
ON CONFLICT (class_id, method_id) DO NOTHING;

-- Relaciones Clases-Subsistemas
INSERT INTO public.class_subsystem (class_id, subsystem_id) 
SELECT c.class_id, s.subsystem_id 
FROM public."class" c, public.subsystem s 
WHERE c.class_na IN ('Person', 'User', 'Profile') AND s.subsystem_na = 'Security'
ON CONFLICT (class_id, subsystem_id) DO NOTHING;

-- Relaciones Menús-Opciones
INSERT INTO public.option_menu (menu_id, option_id) 
SELECT m.menu_id, o.option_id 
FROM public.menu m, public."option" o 
WHERE m.menu_na = 'Principal' AND o.option_na = 'dashboard'
ON CONFLICT (menu_id, option_id) DO NOTHING;

INSERT INTO public.option_menu (menu_id, option_id) 
SELECT m.menu_id, o.option_id 
FROM public.menu m, public."option" o 
WHERE m.menu_na = 'Usuarios' AND o.option_na IN ('users_list', 'users_create')
ON CONFLICT (menu_id, option_id) DO NOTHING;

INSERT INTO public.option_menu (menu_id, option_id) 
SELECT m.menu_id, o.option_id 
FROM public.menu m, public."option" o 
WHERE m.menu_na = 'Perfiles' AND o.option_na IN ('profiles_list', 'profiles_create')
ON CONFLICT (menu_id, option_id) DO NOTHING;

INSERT INTO public.option_menu (menu_id, option_id) 
SELECT m.menu_id, o.option_id 
FROM public.menu m, public."option" o 
WHERE m.menu_na = 'Reportes' AND o.option_na = 'reports_view'
ON CONFLICT (menu_id, option_id) DO NOTHING;

-- Asignar opciones al perfil admin
INSERT INTO public.option_profile (option_id, profile_id) 
SELECT o.option_id, p.profile_id 
FROM public."option" o, public.profile p 
WHERE p.profile_de = 'admin'
ON CONFLICT (option_id, profile_id) DO NOTHING;

-- Asignar opciones básicas al perfil user
INSERT INTO public.option_profile (option_id, profile_id) 
SELECT o.option_id, p.profile_id 
FROM public."option" o, public.profile p 
WHERE p.profile_de = 'user' AND o.option_na IN ('dashboard', 'users_list')
ON CONFLICT (option_id, profile_id) DO NOTHING;

-- Permisos básicos para admin
INSERT INTO public.method_profile (method_id, profile_id) 
SELECT m.method_id, p.profile_id 
FROM public.method m, public.profile p 
WHERE p.profile_de = 'admin'
ON CONFLICT (method_id, profile_id) DO NOTHING;

-- Permisos básicos para user (solo lectura)
INSERT INTO public.method_profile (method_id, profile_id) 
SELECT m.method_id, p.profile_id 
FROM public.method m, public.profile p 
WHERE p.profile_de = 'user' AND m.method_na IN ('getPerson', 'getUser', 'getProfile', 'getMenuOptions')
ON CONFLICT (method_id, profile_id) DO NOTHING;

-- Crear transacciones para el sistema de seguridad
INSERT INTO public."transaction" (transaction_nu, method_id, class_id, subsystem_id) 
SELECT 
    nextval('public.transaction_nu_seq'),
    m.method_id, 
    c.class_id, 
    s.subsystem_id 
FROM public.method m 
JOIN public.class_method cm ON m.method_id = cm.method_id
JOIN public."class" c ON cm.class_id = c.class_id
JOIN public.class_subsystem cs ON c.class_id = cs.class_id
JOIN public.subsystem s ON cs.subsystem_id = s.subsystem_id
WHERE s.subsystem_na = 'Security'
ON CONFLICT (transaction_nu) DO NOTHING;

COMMIT;
