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

- Commit permitido: `env/.env.example`.
- Commit no permitido: cualquier `env/.env.*` con secretos reales.

## Politica de nombres

- Canonicos nuevos:
  - `SERVER_*`
  - `DB_POSTGRES_*`
  - `SESSION_*`
  - `JWT_*`
  - `SERVICE_*`
  - `VITE_*`
  - `DOCKER_*`

- Legacy se mantiene temporalmente solo por compatibilidad.

## Rotacion de secretos

Cuándo rotar:

1. Fuga sospechada de repositorio.
1. Acceso no autorizado a logs o backups.
1. Cambio de personal con acceso a infraestructura.

Qué rotar como minimo:

1. `JWT_SECRET`.
1. `SESSION_SECRET`.
1. `DB_POSTGRES_PASSWORD`.
1. `SERVICE_RESEND_API_KEY`.

## Auditoria minima por sprint

- Verificar que `.env.example` este al dia.
- Verificar que no hay secretos en commits.
- Verificar que variables legacy no aumentan.
- Verificar que nuevos servicios usan prefijo `SERVICE_`.

## Checklist de hardening para produccion

1. `SESSION_COOKIE_SECURE=true`.
2. Origenes CORS restringidos.
3. Secrets con entropia alta y rotados.
4. Credenciales Docker distintas de desarrollo.
5. Backups con retencion y accesos controlados.
