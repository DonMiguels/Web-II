# Division de Archivos de Entorno

Este documento define para que sirve cada archivo de `env/` y como decidir donde agregar una variable.

## Principio de diseno

La separacion por dominio reduce acoplamiento y evita errores de operacion. Una variable de servidor no debe convivir en el mismo archivo que una credencial de proveedor externo, y una variable de Docker no debe mezclarse con runtime de frontend.

## Matriz de responsabilidad

1. `.env.example`: contrato global. Responsable habitual: arquitectura/backend. Uso: todo el proyecto.
1. `.env.test`: entorno consolidado de pruebas. Responsable habitual: QA/backend. Uso: backend y frontend en test.
1. `server.env`: dominio HTTP, host, protocolo, idioma y CORS. Responsable habitual: backend. Uso: API Node.
1. `db.env`: dominio de conexion app a PostgreSQL. Responsable habitual: backend/DBA. Uso: API Node.
1. `auth.env`: dominio JWT. Responsable habitual: backend/seguridad. Uso: API Node.
1. `session.env`: dominio sesion/cookies. Responsable habitual: backend/seguridad. Uso: API Node.
1. `services.env`: dominio integraciones externas. Responsable habitual: backend/devops. Uso: API Node.
1. `frontend.env`: dominio cliente Vite. Responsable habitual: frontend. Uso: React/Vite.
1. `docker.env`: dominio infra de base y backup. Responsable habitual: devops/DBA. Uso: docker-compose.

## Scope detallado por archivo

### .env.example

Es la fuente de verdad de nombres de variables. Debe incluir ejemplos no sensibles y comentarios claros. Toda variable nueva nace aqui.

### .env.test

Es un perfil completo de testing. Permite ejecucion reproducible y puede usarse en modo exclusivo con `ENV_ONLY_FILE=.env.test`.

### server.env

Contiene configuracion de red y comportamiento de servidor, por ejemplo `SERVER_PORT` y `SERVER_CORS_ALLOWED_ORIGINS`.

### db.env

Contiene configuracion de conexion del backend a la base de datos, por ejemplo `DB_POSTGRES_HOST` y `DB_POSTGRES_PASSWORD`.

### auth.env

Contiene la configuracion de tokens, por ejemplo `JWT_SECRET` y `JWT_EXPIRES_IN`.

### session.env

Contiene la configuracion de sesion y cookies, por ejemplo `SESSION_SECRET`, `SESSION_COOKIE_SECURE` y `SESSION_COOKIE_MAX_AGE_MS`.

### services.env

Contiene variables de servicios externos, por ejemplo `SERVICE_RESEND_API_KEY` y `SERVICE_MAIL_FROM`.

### frontend.env

Contiene variables del frontend. En Vite solo son visibles en cliente aquellas con prefijo `VITE_`.

### docker.env

Contiene variables consumidas por compose, postgres, pgadmin y backup, por ejemplo `POSTGRES_USER`, `PGADMIN_DEFAULT_EMAIL` y `SCHEDULE`.

## Regla de decision

Usa esta tabla para ubicar una variable nueva en segundos.

1. Cambiar puerto de API o CORS: `server.env`.
1. Cambiar credenciales DB de la app: `db.env`.
1. Cambiar politica JWT: `auth.env`.
1. Cambiar cookies/sesion: `session.env`.
1. Cambiar API key de terceros: `services.env`.
1. Cambiar URL/API del frontend: `frontend.env`.
1. Cambiar postgres/pgadmin/backups en compose: `docker.env`.

## Compatibilidad legacy

El sistema mantiene variables legacy para transicion sin corte. Ejemplos: `PORT`, `DB_HOST`, `SECRET`, `EMAIL`, `FRONTEND_URL`.

Politica recomendada:

1. No crear nuevas variables legacy.
1. Mantener mapeos legacy solo durante migracion.
1. Priorizar nombres canonicos definidos en `.env.example`.
