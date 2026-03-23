# Catalogo de Variables de Entorno

Referencia central del contrato vigente por dominio.

## 1. Base global (env/.env)

1. APP_ENV: perfil activo. Ejemplo: development.
2. APP_NAME: nombre logico de aplicacion.
3. APP_LOG_LEVEL: nivel de logs (debug, info, warn, error, fatal).

## 2. Servidor y CORS (env/{APP_ENV}/server.env)

1. SERVER_BIND_PROTOCOL: http o https.
2. SERVER_BIND_HOST: host o IP de bind.
3. SERVER_BIND_PORT: puerto de backend.
4. SERVER_MESSAGES_LANGUAGE: idioma de mensajes (es, en).
5. CORS_ALLOWED_ORIGINS: lista CSV de origenes.
6. CORS_ALLOWED_METHODS: lista CSV filtrada por catalogo permitido.
7. CORS_ALLOWED_HEADERS: lista CSV filtrada por catalogo permitido.
8. CORS_ALLOW_CREDENTIALS: true o false.

## 3. Sesion (env/{APP_ENV}/session.env)

1. SESSION_SECRET.
2. SESSION_COOKIE_NAME.
3. SESSION_COOKIE_SECURE.
4. SESSION_COOKIE_HTTP_ONLY.
5. SESSION_COOKIE_SAME_SITE.
6. SESSION_COOKIE_MAX_AGE_SECONDS.
7. SESSION_RESAVE.
8. SESSION_SAVE_UNINITIALIZED.

## 4. Auth JWT (env/{APP_ENV}/auth.env)

1. AUTH_JWT_SECRET.
2. AUTH_JWT_EXPIRES_IN.
3. AUTH_JWT_ISSUER.
4. AUTH_JWT_AUDIENCE.
5. AUTH_JWT_ALGORITHM.

## 5. Base de datos app (env/{APP_ENV}/db.env)

1. DB_HOST.
2. DB_PORT.
3. DB_NAME.
4. DB_USER.
5. DB_PASSWORD.
6. DB_SSL.
7. DB_SSL_REJECT_UNAUTHORIZED.
8. DB_POOL_MAX.
9. DB_POOL_IDLE_TIMEOUT_MS.
10. DB_POOL_CONNECTION_TIMEOUT_MS.
11. DB_SCHEMA_DEFAULT.

## 6. Servicios externos (env/{APP_ENV}/services.env)

1. MAIL_RESEND_API_KEY.
2. MAIL_DEFAULT_FROM.
3. MAIL_REPLY_TO.
4. MAIL_ENABLED.

## 7. Frontend (env/{APP_ENV}/frontend.env)

1. FRONT_API_URL.
2. FRONT_PUBLIC_URL.
3. FRONT_APP_NAME.
4. FRONT_APP_ENV.

## 8. Docker Compose (env/{APP_ENV}/docker.env)

1. POSTGRES_IMAGE.
2. PGADMIN_IMAGE.
3. BACKUP_IMAGE.
4. POSTGRES_CONTAINER_NAME.
5. PGADMIN_CONTAINER_NAME.
6. BACKUP_CONTAINER_NAME.
7. POSTGRES_BIND_IP.
8. POSTGRES_BIND_PORT.
9. PGADMIN_BIND_IP.
10. PGADMIN_BIND_PORT.
11. POSTGRES_USER.
12. POSTGRES_PASSWORD.
13. POSTGRES_DB.
14. POSTGRES_MULTIPLE_DATABASES.
15. RESTORE_FROM_BACKUP.
16. PGADMIN_DEFAULT_EMAIL.
17. PGADMIN_DEFAULT_PASSWORD.
18. BACKUP_ON_START.
19. BACKUP_ON_STOP.
20. BACKUP_KEEP_DAYS.
21. SCHEDULE.
22. HEALTHCHECK_PORT.

## 9. Valores permitidos de tipo enum

Catalogo central:

1. backend/config/env-allowed-values.json

Variables con control de valores concretos:

1. APP_ENV.
2. APP_LOG_LEVEL.
3. SERVER_BIND_PROTOCOL.
4. SERVER_MESSAGES_LANGUAGE.
5. CORS_ALLOWED_METHODS.
6. CORS_ALLOWED_HEADERS.
7. SESSION_COOKIE_SAME_SITE.
8. AUTH_JWT_ALGORITHM.

## 10. Politica de consumo

1. No usar aliases legacy.
2. Usar solo nombres canonicos listados arriba.
3. Si una variable nueva es enum, agregar sus valores en env-allowed-values.json.
