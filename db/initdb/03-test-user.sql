-- Usuario de Prueba Web II
-- Crear usuario admin para pruebas iniciales

-- Insertar persona de prueba
INSERT INTO public.person (person_ci, person_na, person_ln, person_em, person_ph) 
VALUES ('31005749', 'Marcelo', 'Perozo', 'marcelo.perozo@example.com', '555-1234567')
ON CONFLICT (person_ci) DO NOTHING;

-- Obtener ID de la persona insertada
-- (Esto se manejará en el siguiente paso con una transacción)

-- Insertar usuario de prueba
INSERT INTO public."user" (user_na, user_pw, person_id) 
SELECT 'marcelo_pcx', '$2b$10$rQZ8ZKqKqKqKqKqKqKqKqO', person_id 
FROM public.person 
WHERE person_ci = '31005749'
ON CONFLICT (user_na) DO NOTHING;

-- Asignar perfil admin al usuario de prueba
INSERT INTO public.user_profile (user_id, profile_id) 
SELECT u.user_id, p.profile_id 
FROM public."user" u 
JOIN public.person pe ON u.person_id = pe.person_id
JOIN public.profile p ON p.profile_de = 'admin'
WHERE u.user_na = 'marcelo_pcx'
ON CONFLICT (user_id, profile_id) DO NOTHING;

COMMIT;

-- Nota: La contraseña 'Maraca1bo_214' debe ser hasheada con bcrypt
-- Para desarrollo, puedes usar: $2b$10$rQZ8ZKqKqKqKqKqKqKqKqO (placeholder)
-- En producción, genera el hash real con: bcrypt.hashSync('Maraca1bo_214', 10)
