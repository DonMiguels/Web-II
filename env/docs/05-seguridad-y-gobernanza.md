# Seguridad y Gobernanza de Variables

## Principios

- Minimo privilegio: cada secreto solo en el archivo que lo necesita.
- Separacion de responsabilidades: runtime app vs docker infra.
- Trazabilidad: todo cambio de variable debe quedar documentado.
- No repudio: cambios de entorno relevantes deben pasar por PR.

## Que nunca debe subirse al repositorio

- Credenciales reales de BD.
- Secretos JWT o de sesion reales.
- API keys de proveedores externos.

## Politica de versionado

1. Commit permitido: estructura de env por perfiles, setup-env.js y documentacion.
2. Commit no permitido: secretos reales en cualquier archivo de env.

## Politica de nombres

Canonicos vigentes:

1. APP\_\*.
2. SERVER*\* y CORS*\*.
3. DB\_\*.
4. AUTH*JWT*\*.
5. SESSION\_\*.
6. MAIL\_\*.
7. FRONT\_\*.
8. POSTGRES*\*, PGADMIN*\*, BACKUP\_\*, SCHEDULE, HEALTHCHECK_PORT.

Variables enum y valores permitidos:

1. Se definen en backend/config/env-allowed-values.json.

Regla:

1. No introducir enums hardcodeados en codigo si ya existen en ese catalogo.

## Rotacion de secretos

Cuándo rotar:

1. Fuga sospechada de repositorio.
1. Acceso no autorizado a logs o backups.
1. Cambio de personal con acceso a infraestructura.

Qué rotar como minimo:

1. AUTH_JWT_SECRET.
1. `SESSION_SECRET`.
1. DB_PASSWORD.
1. MAIL_RESEND_API_KEY.

## Auditoria minima por sprint

1. Verificar consistencia entre env/.env y perfiles development/test/production.
2. Verificar que no hay secretos en commits.
3. Verificar que nuevos servicios usan prefijo MAIL\_ cuando aplique.
4. Verificar consistencia del catalogo de enums en env-allowed-values.json.

## Checklist de hardening para produccion

1. `SESSION_COOKIE_SECURE=true`.
2. Origenes CORS restringidos.
3. Secrets con entropia alta y rotados.
4. Credenciales Docker distintas de desarrollo.
5. Backups con retencion y accesos controlados.
