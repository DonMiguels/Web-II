    -- ============================================================
    -- initial_data.sql
    -- Seeds minimos: seguridad + catalogos de negocio
    -- ============================================================

    BEGIN;

    -- ------------------------------------------------------------
    -- Seguridad
    -- ------------------------------------------------------------
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

    INSERT INTO profile (name, description, is_active)
    VALUES
        ('admin', 'Administrador del sistema', TRUE),
        ('operator', 'Operador funcional', TRUE),
        ('viewer', 'Consulta y reportes', TRUE)
    ON CONFLICT DO NOTHING;

    -- ------------------------------------------------------------
    -- Negocio: catalogo / inventario
    -- ------------------------------------------------------------
    INSERT INTO item_category (name, description, is_consumable)
    VALUES
        ('equipos', 'Equipos reutilizables sujetos a prestamo unitario', FALSE),
        ('componentes', 'Insumos/componentes con control de cantidad', TRUE)
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO item_condition (name, description)
    VALUES
        ('Nuevo', 'Sin uso previo'),
        ('Bueno', 'En buen estado operativo'),
        ('Usado', 'Con signos de uso normal'),
        ('Danado', 'Requiere reparacion o reposicion')
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO item_status (name, description)
    VALUES
        ('Disponible', 'Listo para prestamo'),
        ('Ocupado', 'Actualmente prestado'),
        ('Mantenimiento', 'En mantenimiento'),
        ('Stock', 'Disponible en inventario de insumos'),
        ('Asignado', 'Asignado a un prestamo o kit'),
        ('Agotado', 'Sin unidades disponibles')
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO loan_status (name, description)
    VALUES
        ('reserved', 'Reserva pendiente de retiro'),
        ('active', 'Prestamo vigente'),
        ('returned', 'Devuelto completamente'),
        ('overdue', 'Vencido sin devolucion completa'),
        ('cancelled', 'Cancelado')
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO payment_method (name, description)
    VALUES
        ('cash', 'Pago en efectivo'),
        ('transfer', 'Transferencia bancaria'),
        ('physical_replacement', 'Reposicion fisica de equipo/componente')
    ON CONFLICT (name) DO NOTHING;

    -- ------------------------------------------------------------
    -- Usuario administrador por defecto
    -- ------------------------------------------------------------
    INSERT INTO public.person (document_id, first_name, last_name, phone, address, birth_date, created_at, updated_at)
    SELECT 'ADMIN001', 'Administrador', 'Sistema', '+000000000', 'Sistema', NULL, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM public.person WHERE document_id = 'ADMIN001');

    -- Password: Admin123!@#
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
