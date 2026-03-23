# Division de Archivos de Entorno

Este documento define la arquitectura vigente de env y donde debe vivir cada variable.

## Estructura oficial

1. env/.env
2. env/development/server.env
3. env/development/db.env
4. env/development/auth.env
5. env/development/session.env
6. env/development/services.env
7. env/development/frontend.env
8. env/development/docker.env
9. env/test/server.env
10. env/test/db.env
11. env/test/auth.env
12. env/test/session.env
13. env/test/services.env
14. env/test/frontend.env
15. env/test/docker.env
16. env/production/server.env
17. env/production/db.env
18. env/production/auth.env
19. env/production/session.env
20. env/production/services.env
21. env/production/frontend.env
22. env/production/docker.env

## Principios

1. APP_ENV define el perfil activo y por defecto es development.
2. env/.env es solo base global de app.
3. docker.env es exclusivo para Docker Compose.
4. Backend no carga docker.env en runtime.
5. Frontend solo expone FRONT_ al cliente.

## Responsabilidad por archivo

1. .env: APP_ENV, APP_NAME, APP_LOG_LEVEL.
2. server.env: bind, idioma, CORS.
3. db.env: conexion app a PostgreSQL.
4. auth.env: AUTH_JWT_*.
5. session.env: politica de sesion y cookie.
6. services.env: MAIL_* y servicios externos.
7. frontend.env: FRONT_*.
8. docker.env: imagenes, puertos y credenciales de compose.

## Regla de decision rapida

1. API, host, puerto o CORS: server.env.
2. Conexion a DB de la app: db.env.
3. JWT: auth.env.
4. Cookies/sesion: session.env.
5. Integraciones externas: services.env.
6. URL y metadata del frontend: frontend.env.
7. Infra docker postgres/pgadmin/backups: docker.env.

## Convencion de nombres canonicos

1. APP_* para metadatos globales.
2. SERVER_\* y CORS_\* para backend HTTP.
3. DB_* para conexion de aplicacion.
4. AUTH_JWT_* para autenticacion.
5. SESSION_* para sesion.
6. MAIL_* para correo.
7. FRONT_* para frontend.
8. POSTGRES_\*, PGADMIN_\*, BACKUP_\*, SCHEDULE, HEALTHCHECK_PORT para docker.

## Catalogo de valores permitidos por enum

Las variables de entorno con valores cerrados se centralizan en:

1. backend/config/env-allowed-values.json

Ejemplos:

1. CORS_ALLOWED_METHODS
2. CORS_ALLOWED_HEADERS
3. APP_LOG_LEVEL
4. SESSION_COOKIE_SAME_SITE
