# Inventario Hard-Delete Residual (Fase 4)

Fecha: 26-03-2026
Fuente: backend/config/queries.yaml (parse automatizado)

## 1. Objetivo

Registrar y controlar las queries que aun ejecutan DELETE FROM, separando:

1. Casos permitidos por politica (catalogos/relaciones de seguridad).
2. Casos historicos bloqueados por BO publico.
3. Casos a migrar a soft-delete.

## 2. Cambios aplicados en esta iteracion

Se migraron a soft-delete (legacy keys con soporte deleted_at):

1. deleteEstadoEquipo
2. deleteInventario
3. deleteCompensacion
4. deletePeriodoAcademico

Todas ahora usan UPDATE ... SET deleted_at = NOW(), updated_at = NOW() (y is_active = FALSE cuando aplica), con guardia AND deleted_at IS NULL.

## 3. Whitelist actual de DELETE FROM

### 3.1 Relaciones y seguridad (permitidos)

1. delClassMethod
2. delMenuOption
3. delProfileMethod
4. delProfileOption
5. delUserProfile
6. deleteSecurityClass
7. deleteSecurityMenu
8. deleteSecurityMethod
9. deleteSecurityOption
10. deleteSecurityProfile
11. deleteSecuritySubsystem
12. deleteSecurityTransaction
13. removeSecurityClassMethod
14. removeSecurityMethodProfile
15. removeSecurityOptionMenu
16. removeSecurityOptionProfile
17. removeSecuritySubsystemClass
18. removeSecurityUserProfile
19. normalizeLegacyBoNaming (script de migracion controlada)

### 3.2 Entidades historicas (DELETE residual en query, bloqueo en BO publico)

1. deleteLoan
2. deletePrestamo
3. deleteReturn
4. deleteDevolucion
5. deleteNotification
6. deleteNotificacion
7. deleteAudit
8. deleteAuditoria

Nota: En BO publico se bloquean hard-deletes historicos con DOMAIN_ERROR_CODES.HARD_DELETE_BLOCKED para las rutas canonicas de fase 4.

## 4. Control automatizado implementado

Se agrego cobertura en:

1. backend/testing/tests/bo/bo-phase4-governance.test.mjs

Controles nuevos:

1. Las keys legacy con soporte soft-delete no deben volver a usar DELETE FROM.
2. El conjunto de DELETE FROM debe permanecer acotado a la whitelist aprobada.

## 5. Siguientes tareas de cierre

1. Definir si deleteDevolucion/deleteNotificacion/deleteAuditoria deben mantenerse por compatibilidad legacy o bloquearse a nivel de query.
2. Alinear una whitelist formal aprobada por negocio/arquitectura para criterio de salida Fase 4.
3. Incorporar validacion equivalente en pipeline CI para bloquear regresiones fuera de desarrollo local.
