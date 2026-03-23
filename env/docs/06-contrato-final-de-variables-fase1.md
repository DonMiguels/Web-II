# Contrato Final de Variables (Fase 1)

## Objetivo

Este documento define el contrato final aprobado para variables de entorno antes de ejecutar la Fase 2.

Reglas aprobadas:

1. No se usará .env.example como contrato final.
2. El contrato vivirá en un script JS único (a implementar en Fase 2).
3. La arquitectura de entornos será por perfiles directos dentro de env:
4. env/development
5. env/test
6. env/production
7. Se cargará siempre env/.env como configuración base global.
8. APP_ENV reemplaza completamente a NODE_ENV.
9. El backend no cargará docker.env.
10. Se mantienen AUTH*JWT*_ y DB\__.
11. En frontend se reemplaza VITE*\* por FRONT*\*.

## Estructura de archivos de entorno aprobada

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

## Orden de carga objetivo del backend

1. env/.env
2. env/{APP_ENV}/server.env
3. env/{APP_ENV}/db.env
4. env/{APP_ENV}/auth.env
5. env/{APP_ENV}/session.env
6. env/{APP_ENV}/services.env
7. env/{APP_ENV}/frontend.env

Nota:

1. docker.env es solo para Docker Compose/infraestructura.
2. No se debe cargar en runtime del backend salvo necesidad explícita futura.

## Contrato final de variables por dominio

## 1) Base global (env/.env)

1. APP_ENV
1. Significado: perfil activo de entorno.
1. Ejemplo: development

1. APP_NAME
1. Significado: nombre lógico de la aplicación para logs, identidad y metadata.
1. Ejemplo: web-ii

1. APP_LOG_LEVEL
1. Significado: nivel de logs del backend.
1. Ejemplo: info

Valores permitidos:

1. debug: máxima verbosidad; útil para desarrollo y diagnóstico profundo.
2. info: eventos normales de operación (arranque, conexiones, flujos principales).
3. warn: situaciones anómalas no fatales.
4. error: fallos de operación que afectan una acción.
5. fatal: errores críticos que impiden continuar.

6. Recomendación por entorno:
7. development: debug o info.
8. test: info o warn.
9. production: warn o error.

## 2) Servidor (server.env)

1. SERVER_BIND_PROTOCOL
1. Significado: protocolo de acceso esperado.
1. Ejemplo: http

1. SERVER_BIND_HOST
1. Significado: host/IP de bind del servidor.
1. Ejemplo: 127.0.0.1

1. SERVER_BIND_PORT
1. Significado: puerto de escucha del backend.
1. Ejemplo: 3000

1. SERVER_MESSAGES_LANGUAGE
1. Significado: idioma de los mensajes de respuesta del servidor.
1. Ejemplo: es

1. SERVER_PUBLIC_URL
1. Estado final: variable derivada en runtime.
1. Regla: se compone internamente desde SERVER_BIND_PROTOCOL, SERVER_BIND_HOST y SERVER_BIND_PORT.
1. Uso aceptado: logging de URL accesible al iniciar servidor.
1. Ejemplo derivado: http://127.0.0.1:3000

## 3) CORS (server.env)

1. CORS_ALLOWED_ORIGINS
1. Significado: lista explícita de orígenes permitidos (separados por coma).
1. Ejemplo: http://localhost:5173,https://app.ejemplo.com

1. CORS_ALLOWED_METHODS
1. Significado: métodos HTTP permitidos.
1. Ejemplo: GET,POST,PUT,PATCH,DELETE,OPTIONS

1. CORS_ALLOWED_HEADERS
1. Significado: cabeceras HTTP permitidas.
1. Ejemplo: Content-Type,Authorization

1. CORS_ALLOW_CREDENTIALS
1. Significado: habilita envío de cookies/credenciales.
1. Ejemplo: true

## 4) Sesión (session.env)

1. SESSION_SECRET
1. Significado: clave de firma de sesión.
1. Ejemplo: cambia_este_secret_en_local

1. SESSION_COOKIE_NAME
1. Significado: nombre de cookie de sesión.
1. Ejemplo: webii.sid

1. SESSION_COOKIE_SECURE
1. Significado: cookie solo sobre HTTPS.
1. Ejemplo: false (development), true (production)

1. SESSION_COOKIE_HTTP_ONLY
1. Significado: bloquea acceso desde JavaScript cliente.
1. Ejemplo: true

1. SESSION_COOKIE_SAME_SITE
1. Significado: política de envío de cookie cross-site.
1. Ejemplo: lax

1. SESSION_COOKIE_MAX_AGE_SECONDS
1. Significado: TTL de la cookie en segundos para mejorar legibilidad de configuración.
1. Ejemplo: 300
1. Nota técnica: en runtime se convierte a milisegundos antes de pasarse a express-session.

1. SESSION_RESAVE
1. Significado: opción de express-session para re-guardado.
1. Ejemplo: false

1. SESSION_SAVE_UNINITIALIZED
1. Significado: opción de express-session para sesión vacía.
1. Ejemplo: false

## 5) Autenticación JWT (auth.env)

1. AUTH_JWT_SECRET
1. Significado: clave de firma de JWT.
1. Ejemplo: cambia_este_jwt_secret_local

1. AUTH_JWT_EXPIRES_IN
1. Significado: tiempo de expiración de JWT.
1. Ejemplo: 5m

1. AUTH_JWT_ISSUER
1. Significado: emisor válido del token JWT.
1. Ejemplo: web-ii-api

1. AUTH_JWT_AUDIENCE
1. Significado: audiencia válida del token JWT.
1. Ejemplo: web-ii-frontend

1. AUTH_JWT_ALGORITHM
1. Significado: algoritmo de firma/validación.
1. Ejemplo: HS256

## 6) Base de datos (db.env)

1. DB_HOST
1. Significado: host de PostgreSQL para el backend.
1. Ejemplo: 127.0.0.1

1. DB_PORT
1. Significado: puerto de PostgreSQL.
1. Ejemplo: 5432

1. DB_NAME
1. Significado: nombre de base de datos de aplicación.
1. Ejemplo: webii

1. DB_USER
1. Significado: usuario de base de datos.
1. Ejemplo: app_user

1. DB_PASSWORD
1. Significado: password de base de datos.
1. Ejemplo: app_password_local

1. DB_SSL
1. Significado: habilita SSL para conexión de DB.
1. Ejemplo: false

1. DB_SSL_REJECT_UNAUTHORIZED
1. Significado: validación estricta de certificados SSL.
1. Ejemplo: true

1. DB_POOL_MAX
1. Significado: máximo de conexiones del pool.
1. Ejemplo: 10

1. DB_POOL_IDLE_TIMEOUT_MS
1. Significado: timeout de conexiones inactivas.
1. Ejemplo: 30000

1. DB_POOL_CONNECTION_TIMEOUT_MS
1. Significado: timeout al abrir nueva conexión.
1. Ejemplo: 2000

1. DB_SCHEMA_DEFAULT
1. Significado: esquema SQL por defecto.
1. Ejemplo: public

## 7) Servicios externos (services.env)

1. MAIL_RESEND_API_KEY
1. Significado: API key del proveedor de correo.
1. Ejemplo: re_xxx_reemplazar

1. MAIL_DEFAULT_FROM
1. Significado: remitente por defecto.
1. Ejemplo: no-reply@local.dev

1. MAIL_REPLY_TO
1. Significado: dirección de respuesta de correo.
1. Ejemplo: soporte@local.dev

1. MAIL_ENABLED
1. Significado: habilita o deshabilita envío de correos.
1. Ejemplo: true

## 8) Frontend (frontend.env)

1. FRONT_API_URL
1. Significado: URL base de API consumida por cliente.
1. Ejemplo: http://localhost:3000/user

1. FRONT_PUBLIC_URL
1. Significado: URL pública del frontend para callbacks y enlaces.
1. Ejemplo: http://localhost:5173

1. FRONT_APP_NAME
1. Significado: nombre visible de aplicación en frontend.
1. Ejemplo: Web II

1. FRONT_APP_ENV
1. Significado: etiqueta de entorno visible en frontend.
1. Ejemplo: development

## 9) Docker/Infra (docker.env)

Nota: por decisión final, no usar prefijo DOCKER\_ en este archivo.

1. POSTGRES_IMAGE
1. Significado: imagen estable de postgres.
1. Ejemplo: postgres:16

1. PGADMIN_IMAGE
1. Significado: imagen estable de pgAdmin (sin snapshot).
1. Ejemplo: dpage/pgadmin4:8.12

1. BACKUP_IMAGE
1. Significado: imagen del servicio de backups.
1. Ejemplo: prodrigestivill/postgres-backup-local:16

1. POSTGRES_CONTAINER_NAME
1. Significado: nombre del contenedor postgres.
1. Ejemplo: uni_postgres

1. PGADMIN_CONTAINER_NAME
1. Significado: nombre del contenedor pgAdmin.
1. Ejemplo: uni_pgadmin

1. BACKUP_CONTAINER_NAME
1. Significado: nombre del contenedor backup.
1. Ejemplo: uni_pg_backups

1. POSTGRES_BIND_IP
1. Significado: IP de bind del puerto de postgres.
1. Ejemplo: 127.0.0.1

1. POSTGRES_BIND_PORT
1. Significado: puerto externo de postgres.
1. Ejemplo: 5431

1. PGADMIN_BIND_IP
1. Significado: IP de bind del puerto de pgAdmin.
1. Ejemplo: 127.0.0.1

1. PGADMIN_BIND_PORT
1. Significado: puerto externo de pgAdmin.
1. Ejemplo: 5050

1. POSTGRES_USER
1. Significado: usuario principal de postgres.
1. Ejemplo: admin_uni

1. POSTGRES_PASSWORD
1. Significado: password principal de postgres.
1. Ejemplo: cambia_password_local

1. POSTGRES_DB
1. Significado: base por defecto de postgres.
1. Ejemplo: postgres

1. POSTGRES_MULTIPLE_DATABASES
1. Significado: base objetivo para inicialización/restauración.
1. Ejemplo: webii

1. RESTORE_FROM_BACKUP
1. Significado: habilita restauración automática desde backup.
1. Ejemplo: false

1. PGADMIN_DEFAULT_EMAIL
1. Significado: usuario de acceso a pgAdmin.
1. Ejemplo: admin@local.dev

1. PGADMIN_DEFAULT_PASSWORD
1. Significado: password de acceso a pgAdmin.
1. Ejemplo: cambia_password_pgadmin

1. BACKUP_ON_START
1. Significado: ejecuta backup al iniciar el contenedor.
1. Ejemplo: true

1. BACKUP_ON_STOP
1. Significado: ejecuta backup al detener el contenedor.
1. Ejemplo: true

1. BACKUP_KEEP_DAYS
1. Significado: retención de backups en días.
1. Ejemplo: 7

1. SCHEDULE
1. Significado: programación de backups.
1. Ejemplo: @daily

1. HEALTHCHECK_PORT
1. Significado: puerto de healthcheck del servicio backup.
1. Ejemplo: 8080

## Advertencias de variables declaradas y no utilizadas actualmente

Estas variables se declaran en el contrato, pero hoy no están totalmente implementadas en runtime en el proyecto actual.

1. APP_LOG_LEVEL
1. Advertencia: declarada para estandarizar nivel de logs, pero actualmente no centralizada en todos los módulos.
1. Recomendación: usar en backend/config/env.validation.js y en un logger único (inicio de app, errores DB, auth, mailer).

1. CORS_ALLOWED_METHODS
1. Advertencia: en estado actual se usa lista fija en código.
1. Recomendación: leerla desde env y validarla como lista no vacía.

1. CORS_ALLOWED_HEADERS
1. Advertencia: en estado actual se usa lista fija en código.
1. Recomendación: leerla desde env con validación de formato CSV.

1. DB_SSL
1. Advertencia: históricamente declarada y no aplicada consistentemente.
1. Recomendación: aplicar en backend/config/db.js al construir Pool.

1. DB_SSL_REJECT_UNAUTHORIZED
1. Advertencia: no usada actualmente.
1. Recomendación: acoplarla a DB_SSL en configuración SSL de pg.

1. DB_POOL_MAX
1. Advertencia: no usada actualmente.
1. Recomendación: mapear a opción max del pool pg.

1. DB_POOL_IDLE_TIMEOUT_MS
1. Advertencia: no usada actualmente.
1. Recomendación: mapear a idleTimeoutMillis del pool pg.

1. DB_POOL_CONNECTION_TIMEOUT_MS
1. Advertencia: no usada actualmente.
1. Recomendación: mapear a connectionTimeoutMillis del pool pg.

1. DB_SCHEMA_DEFAULT
1. Advertencia: hoy DBMS usa public por defecto en varios métodos.
1. Recomendación: reemplazar defaults hardcodeados por esta variable en backend/src/dbms/dbms.js.

1. MAIL_REPLY_TO
1. Advertencia: no usada actualmente por mailer.
1. Recomendación: incluirla en payload de envío cuando exista.

1. MAIL_ENABLED
1. Advertencia: hoy el control depende de existencia de API key.
1. Recomendación: usar flag explícita para apagar correos en development/test.

1. FRONT_APP_NAME
1. Advertencia: no usada actualmente.
1. Recomendación: mostrar en título de interfaz o footer.

1. FRONT_APP_ENV
1. Advertencia: no usada actualmente.
1. Recomendación: mostrar etiqueta de entorno visible en login/header.

1. POSTGRES_IMAGE
1. Advertencia: no parametrizada aún en compose actual.
1. Recomendación: externalizar image en db/docker-compose.yml y db-win/docker-compose.yml.

1. PGADMIN_IMAGE
1. Advertencia: en db-win se usa snapshot hardcodeado.
1. Recomendación: sustituir por tag estable parametrizado.

1. BACKUP_IMAGE
1. Advertencia: no parametrizada aún.
1. Recomendación: externalizar image de backup en ambos compose.

## Variables obsoletas aprobadas para eliminación

1. NODE_ENV
2. ENV_ONLY_FILE
3. ENV_ONLY_MODE

## Notas finales de aprobación

1. Este contrato es la base final para implementación en Fase 2.
2. La documentación final de arquitectura completa se actualizará en Fase 3.
3. El script JS único será la fuente versionada del contrato y de la generación de estructura de envs.
