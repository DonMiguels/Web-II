# Guia de Entornos - Web-II

Este directorio centraliza la configuracion externa de backend, frontend y docker.

## Objetivo

El modelo de entornos busca:

1. Evitar secretos hardcodeados.
2. Separar responsabilidades por dominio.
3. Simplificar onboarding.
4. Permitir ejecucion por perfiles sin tocar codigo fuente.

## Convenciones oficiales

1. Formato: UPPER_SNAKE_CASE.
2. Backend: APP_ENV define perfil activo.
3. Frontend: variables publicas con prefijo FRONT\_.
4. Seguridad: nunca subir secretos reales.
5. Configuracion global base: env/.env.

## Comandos de inicializacion de archivos .env

Ejecutar desde la raiz del repositorio.

1. Crear archivos faltantes sin sobreescribir:

```powershell
node setup-env.js
```

1. Regenerar plantillas y sobreescribir existentes:

```powershell
node setup-env.js --force
```

1. Definir perfil activo en PowerShell:

```powershell
$env:APP_ENV='development'
```

1. Definir perfil activo en Bash:

```bash
APP_ENV=development
```

1. Levantar DB por perfil (Windows):

```powershell
docker compose --env-file ./env/development/docker.env -f db-win/docker-compose.yml up -d
```

1. Arrancar backend:

```powershell
npm --prefix backend run dev
```

1. Arrancar frontend:

```powershell
npm --prefix frontend run dev -- --host
```

## Ejecutables de arranque rapido

Desde la raiz del repositorio.

1. Windows (PowerShell):

```powershell
.\start.ps1 -Profile development
```

1. macOS (bash):

```bash
./start-mac.sh --profile development
```

1. Probar scripts sin levantar procesos (dry-run):

```powershell
.\start.ps1 -DryRun -SkipInstall -SkipEnvSetup -Profile development
```

```bash
./start-mac.sh --dry-run --skip-install --skip-env-setup --profile development
```

## Estructura actual por perfiles

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

## Carga de variables en backend

Implementado por validador central en backend/config/env/runtime.js.

Orden de lectura:

1. env/.env
2. env/{APP_ENV}/server.env
3. env/{APP_ENV}/db.env
4. env/{APP_ENV}/auth.env
5. env/{APP_ENV}/session.env
6. env/{APP_ENV}/services.env
7. env/{APP_ENV}/frontend.env

Reglas:

1. APP_ENV por defecto: development.
2. docker.env no se carga en runtime backend.
3. Fail-fast: si una variable requerida es invalida, el backend termina al iniciar.
4. Modo actual estricto: variables legacy no son aceptadas por el validador central.

## Tabla de dominios y variables actuales

1. Base global | env/.env | APP_ENV, APP_NAME, APP_LOG_LEVEL
2. Servidor/CORS | env/{perfil}/server.env | SERVER_BIND_PROTOCOL, SERVER_BIND_HOST, SERVER_BIND_PORT, SERVER_MESSAGES_LANGUAGE, CORS_ALLOWED_ORIGINS, CORS_ALLOWED_METHODS, CORS_ALLOWED_HEADERS, CORS_ALLOW_CREDENTIALS
3. Session | env/{perfil}/session.env | SESSION_SECRET, SESSION_COOKIE_NAME, SESSION_COOKIE_SECURE, SESSION_COOKIE_HTTP_ONLY, SESSION_COOKIE_SAME_SITE, SESSION_COOKIE_MAX_AGE_SECONDS, SESSION_RESAVE, SESSION_SAVE_UNINITIALIZED
4. Auth | env/{perfil}/auth.env | AUTH_JWT_SECRET, AUTH_JWT_EXPIRES_IN, AUTH_JWT_ISSUER, AUTH_JWT_AUDIENCE, AUTH_JWT_ALGORITHM
5. DB | env/{perfil}/db.env | DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL, DB_SSL_REJECT_UNAUTHORIZED, DB_POOL_MAX, DB_POOL_IDLE_TIMEOUT_MS, DB_POOL_CONNECTION_TIMEOUT_MS, DB_SCHEMA_DEFAULT
6. Servicios | env/{perfil}/services.env | MAIL_RESEND_API_KEY, MAIL_DEFAULT_FROM, MAIL_REPLY_TO, MAIL_ENABLED
7. Frontend | env/{perfil}/frontend.env | FRONT_API_URL, FRONT_PUBLIC_URL, FRONT_APP_NAME, FRONT_APP_ENV
8. Docker | env/{perfil}/docker.env | variables de infraestructura para compose

## Carga de variables en frontend

Implementado en frontend/vite.config.js con envDir="../env".

Vite solo expone al navegador variables con prefijo FRONT\_.

## Carga de variables en docker

db/docker-compose.yml y db-win/docker-compose.yml usan env_file por perfil, por ejemplo ../env/development/docker.env.

## Flujo recomendado del equipo

1. Ejecutar node setup-env.js para crear faltantes.
2. Definir APP_ENV de la sesion.
3. Verificar archivos del perfil en env/{APP_ENV}.
4. Levantar DB, backend y frontend.
5. Documentar cambios de contrato y validaciones.

## Navegacion de documentacion

1. env/docs/01-division-de-archivos.md
2. env/docs/02-catalogo-de-variables.md
3. env/docs/03-operacion-y-recetas.md
4. env/docs/04-troubleshooting.md
5. env/docs/05-seguridad-y-gobernanza.md
6. env/docs/06-contrato-final-de-variables-fase1.md
7. env/docs/07-runbook-fase3.md
