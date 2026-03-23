# Integracion de entorno centralizado

Este proyecto usa una carpeta unica de configuracion en env/ con perfiles por entorno.

## 1) Inicializar plantillas locales

Desde la raiz del repositorio:

```bash
node setup-env.js
```

Se crean (si no existen):

1. env/.env
2. env/development/\*.env
3. env/test/\*.env
4. env/production/\*.env

## 2) Backend (Node + dotenv)

El backend carga automaticamente archivos desde env/ en este orden:

1. env/.env
2. env/{APP_ENV}/server.env
3. env/{APP_ENV}/db.env
4. env/{APP_ENV}/auth.env
5. env/{APP_ENV}/session.env
6. env/{APP_ENV}/services.env
7. env/{APP_ENV}/frontend.env

APP_ENV por defecto: development.

Nota:

1. docker.env no se carga en runtime de backend.

Archivo responsable: backend/main.js.

## 3) Frontend (Vite)

Vite usa envDir="../env" y carga env/.env + env/{APP_ENV}/frontend.env.

Regla de exposicion a cliente:

1. Prefijo FRONT\_.

Archivo responsable: frontend/vite.config.js.

## 4) Docker Compose

Los stacks db/ y db-win/ usan:

1. env_file: ../env/${APP_ENV:-development}/docker.env

Archivos responsables:

1. db/docker-compose.yml
2. db-win/docker-compose.yml

## 5) Seguridad Git

Regla de seguridad principal:

1. No subir secretos reales en archivos de env.

## 6) Variables canonicas

El codigo operativo consume unicamente variables canonicas del contrato vigente.

Catalogo de enums permitidos:

1. backend/config/env-allowed-values.json

Schema y defaults de validacion:

1. backend/config/env-validation-schema.base.json
2. backend/config/env-validation-schema.overrides.json

Catalogo de rutas de configuracion:

1. backend/config/env-config-paths.json

## 7) Sanitizer de payloads

El backend aplica sanitizacion de payload en puntos de entrada criticos antes de validacion de negocio.

Componentes:

1. backend/src/sanitizer/sanitizer.js
2. backend/config/sanitizer/sanitize-rules.js
3. backend/config/sanitizer/sanitize-regex.js

Integraciones actuales:

1. backend/src/session/sessionRoutes.js
2. backend/src/dispatcher/dispatcherRoutes.js

Guia completa:

1. docs/sanitizer-design.md
