# Catalogo de Variables de Entorno

Referencia central de todas las variables conocidas en el proyecto.

## Variables canonicas

### Runtime

1. `NODE_ENV`: requerida. Ejemplo: `development`. Define el entorno de ejecucion general.
1. `APP_NAME`: opcional. Ejemplo: `web-ii`. Nombre logico de la aplicacion.

### Server

1. `SERVER_PORT`: requerida. Ejemplo: `3000`. Puerto de escucha del backend.
1. `SERVER_HOST`: requerida. Ejemplo: `localhost`. Host o IP de bind.
1. `SERVER_PROTOCOL`: requerida. Ejemplo: `http`. Protocolo publico esperado.
1. `SERVER_LANGUAGE`: opcional. Ejemplo: `es`. Idioma por defecto.
1. `SERVER_PUBLIC_URL`: opcional. Ejemplo: `http://localhost:3000`. URL publica del backend.
1. `SERVER_CORS_ALLOWED_ORIGINS`: requerida. Ejemplo: `http://localhost:5173`. Lista separada por coma.

### Session

1. `SESSION_SECRET`: requerida. Clave de firma de sesion.
1. `SESSION_COOKIE_NAME`: opcional. Ejemplo: `webii.sid`.
1. `SESSION_COOKIE_SECURE`: requerida. `true` solo en HTTPS.
1. `SESSION_COOKIE_HTTP_ONLY`: requerida. Recomendado `true`.
1. `SESSION_COOKIE_MAX_AGE_MS`: requerida. TTL de cookie en milisegundos.
1. `SESSION_RESAVE`: requerida. Flag de express-session.
1. `SESSION_SAVE_UNINITIALIZED`: requerida. Flag de express-session.

### Auth

1. `JWT_SECRET`: requerida. Clave de firma JWT.
1. `JWT_EXPIRES_IN`: requerida. Ejemplo: `5m`.

### Database

1. `DB_POSTGRES_HOST`: requerida. Ejemplo: `127.0.0.1`.
1. `DB_POSTGRES_PORT`: requerida. Ejemplo: `5432`.
1. `DB_POSTGRES_NAME`: requerida. Ejemplo: `webii`.
1. `DB_POSTGRES_USER`: requerida. Usuario DB.
1. `DB_POSTGRES_PASSWORD`: requerida. Password DB.
1. `DB_POSTGRES_SSL`: opcional. Ejemplo: `false`.

### Services

1. `SERVICE_RESEND_API_KEY`: requerida si se usa envio de correos.
1. `SERVICE_MAIL_FROM`: opcional. Ejemplo: `onboarding@resend.dev`.

### Frontend

1. `VITE_API_URL`: requerida. Ejemplo: `http://localhost:3000/user`.
1. `FRONTEND_PUBLIC_URL`: requerida para links y callbacks.

### Docker aliases

1. `DOCKER_POSTGRES_USER`.
1. `DOCKER_POSTGRES_PASSWORD`.
1. `DOCKER_POSTGRES_DB`.
1. `DOCKER_POSTGRES_MULTIPLE_DATABASES`.
1. `DOCKER_RESTORE_FROM_BACKUP`.
1. `DOCKER_POSTGRES_BIND_PORT`.
1. `DOCKER_PGADMIN_PORT`.
1. `DOCKER_PGADMIN_DEFAULT_EMAIL`.
1. `DOCKER_PGADMIN_DEFAULT_PASSWORD`.
1. `DOCKER_BACKUP_ON_START`.
1. `DOCKER_BACKUP_ON_STOP`.
1. `DOCKER_BACKUP_KEEP_DAYS`.
1. `DOCKER_BACKUP_SCHEDULE`.
1. `DOCKER_BACKUP_HEALTHCHECK_PORT`.

## Variables usadas por docker-compose

Estas son leidas directamente por compose desde `docker.env`.

1. `POSTGRES_USER`: credencial principal de postgres.
1. `POSTGRES_PASSWORD`: password principal de postgres.
1. `POSTGRES_DB`: DB por defecto.
1. `POSTGRES_MULTIPLE_DATABASES`: DB objetivo de inicializacion/restauracion.
1. `RESTORE_FROM_BACKUP`: habilita restauracion automatica.
1. `PGADMIN_DEFAULT_EMAIL`: usuario de pgAdmin.
1. `PGADMIN_DEFAULT_PASSWORD`: password de pgAdmin.
1. `BACKUP_ON_START`: backup al inicio.
1. `BACKUP_ON_STOP`: backup al detenerse.
1. `BACKUP_KEEP_DAYS`: retencion de backups.
1. `SCHEDULE`: programacion de backup.
1. `HEALTHCHECK_PORT`: puerto healthcheck.

## Variables legacy compatibles

No crear nuevas configuraciones con estas, usar solo como puente de migracion.

1. `PORT` -> `SERVER_PORT`.
1. `IP` -> `SERVER_HOST`.
1. `PROTOCOL` -> `SERVER_PROTOCOL`.
1. `LANGUAGE` -> `SERVER_LANGUAGE`.
1. `DB_HOST` -> `DB_POSTGRES_HOST`.
1. `DB_PORT` -> `DB_POSTGRES_PORT`.
1. `DB_NAME` -> `DB_POSTGRES_NAME`.
1. `DB_USER` -> `DB_POSTGRES_USER`.
1. `DB_PASSWORD` -> `DB_POSTGRES_PASSWORD`.
1. `SECRET` -> `SESSION_SECRET`.
1. `RESEND_API_KEY` -> `SERVICE_RESEND_API_KEY`.
1. `EMAIL` -> `SERVICE_MAIL_FROM`.
1. `FRONTEND_URL` -> `FRONTEND_PUBLIC_URL`.

## Politicas de seguridad

- No colocar secretos reales en `.env.example`.
- Rotar `JWT_SECRET` y `SESSION_SECRET` cuando exista sospecha de filtracion.
- En produccion, usar valores unicos y de alta entropia.
- Mantener fuera del repositorio cualquier archivo `.env.*` excepto `.env.example`.
