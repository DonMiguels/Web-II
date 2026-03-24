-- ============================================================
-- V3__Insert_Base_Catalogs.sql
-- Objetivo: Seeds minimos de catalogos base y perfiles.
-- ============================================================

BEGIN;

INSERT INTO movement_type (name, description)
VALUES
    ('loan', 'Prestamo de item'),
    ('return', 'Devolucion de item'),
    ('reserve', 'Reserva de item')
ON CONFLICT (name) DO NOTHING;

INSERT INTO period_type (name, description)
VALUES
    ('semester', 'Periodo semestral'),
    ('trimester', 'Periodo trimestral'),
    ('annual', 'Periodo anual')
ON CONFLICT (name) DO NOTHING;

INSERT INTO audit_type (name, description)
VALUES
    ('security', 'Eventos de seguridad y acceso'),
    ('business', 'Eventos funcionales de negocio'),
    ('system', 'Eventos tecnicos del sistema')
ON CONFLICT (name) DO NOTHING;

INSERT INTO notification_type (name, description)
VALUES
    ('info', 'Notificacion informativa'),
    ('warning', 'Notificacion de advertencia'),
    ('critical', 'Notificacion critica')
ON CONFLICT (name) DO NOTHING;

INSERT INTO return_status_type (name, description)
VALUES
    ('returned_ok', 'Item devuelto sin novedades'),
    ('returned_late', 'Item devuelto fuera de plazo'),
    ('damaged', 'Item devuelto con dano'),
    ('lost', 'Item marcado como perdido')
ON CONFLICT (name) DO NOTHING;

INSERT INTO condition_status_type (name, description)
VALUES
    ('OPERATIONAL', 'Equipo operativo y disponible'),
    ('IN_MAINTENANCE', 'Equipo en proceso de mantenimiento'),
    ('DAMAGED', 'Equipo danado, pendiente de reparacion o compensacion'),
    ('LOST', 'Equipo extraviado o no localizado')
ON CONFLICT (name) DO NOTHING;

INSERT INTO payment_method_type (name, description)
VALUES
    ('cash', 'Pago en efectivo'),
    ('transfer', 'Transferencia bancaria'),
    ('physical_replacement', 'Reposicion fisica de equipo/componente')
ON CONFLICT (name) DO NOTHING;

INSERT INTO profile (name, description, is_active)
VALUES
    ('admin', 'Administrador del sistema', TRUE),
    ('operator', 'Operador funcional', TRUE),
    ('viewer', 'Consulta y reportes', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- V4__Create_Default_Admin_User
-- Objetivo: Crear usuario administrador y persona asociada
-- ============================================================

-- Crear persona administradora
INSERT INTO public.person (document_id, first_name, last_name, phone, address, birth_date, created_at, updated_at)
SELECT 'ADMIN001', 'Administrador', 'Sistema', '+000000000', 'Sistema', NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.person WHERE document_id = 'ADMIN001');

-- Crear usuario administrador con contraseña encriptada
-- Contraseña: Admin123!@#
-- Hash bcrypt generado con rounds=10
INSERT INTO public."user" (name, email, password_hash, is_solvency, is_active, person_id, created_at, updated_at)
SELECT
  'super_admin',
  'admin@sistema.local',
  '$2a$10$hOLy6hPWtJH0UKpxMivo1eyO4kZwdlbfktFV.cS1v.VBHcdEG/lc2',
  TRUE,
  TRUE,
  (SELECT id FROM public.person WHERE document_id = 'ADMIN001'),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public."user" WHERE name = 'super_admin');

-- Asignar perfil administrador al usuario super_admin
INSERT INTO public.user_profile (user_id, profile_id)
SELECT
  (SELECT id FROM public."user" WHERE name = 'super_admin'),
  (SELECT id FROM public.profile WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profile
  WHERE user_id = (SELECT id FROM public."user" WHERE name = 'super_admin')
  AND profile_id = (SELECT id FROM public.profile WHERE name = 'admin')
);

COMMIT;

