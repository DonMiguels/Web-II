# Operacion y Recetas de Uso

Guia operativa para ejecutar backend, frontend y docker con arquitectura por perfiles.

## 1. Inicializacion de entorno

Desde raiz del repositorio:

```powershell
node setup-env.js
```

Resultado esperado:

1. Crea env/.env si no existe.
2. Crea perfiles env/development, env/test y env/production con archivos por dominio.

## 2. Ejecutar backend en modo normal por capas

Comando Windows PowerShell:

```powershell
$env:APP_ENV="development"
npm --prefix backend run dev
```

Comportamiento:

1. Carga env/.env.
2. Carga en cascada env/{APP_ENV}/server.env, db.env, auth.env, session.env, services.env y frontend.env.

## 3. Ejecutar backend en perfil test

```powershell
$env:APP_ENV="test"
npm --prefix backend run dev
```

Comportamiento:

1. Carga env/.env.
2. Carga env/test/\*.env por dominio.

## 4. Ejecutar frontend con variables de test

```powershell
$env:APP_ENV="test"
npm --prefix frontend run dev -- --mode test
```

Requisitos:

1. frontend/vite.config.js carga env/.env y env/{APP_ENV}/frontend.env.
2. Las variables publicas del cliente comienzan con FRONT\_.

## 5. Ejecutar Docker DB con env centralizado

### Stack db-win

```powershell
$env:APP_ENV="development"
docker compose -f db-win/docker-compose.yml up -d
```

### Stack db

```powershell
$env:APP_ENV="development"
docker compose -f db/docker-compose.yml up -d
```

Nota:

1. Los compose ya usan env_file: ../env/${APP_ENV:-development}/docker.env.
2. Si APP_ENV no esta definido, toma development por defecto.

## 6. Como agregar una nueva variable correctamente

1. Definir si pertenece a base global (env/.env) o a un dominio de perfil.
2. Agregarla en development/test/production segun el dominio correspondiente.
3. Consumirla en codigo o compose.
4. Si es enum, registrar valores permitidos en backend/config/env/allowed-values.json.
5. Documentarla en env/docs/02-catalogo-de-variables.md.

## 7. Reglas para evitar errores comunes

- No repetir una misma variable en multiples archivos salvo necesidad de fallback.
- No mezclar variables de Docker en `db.env`.
- No exponer secretos al frontend con prefijo FRONT\_.
- No usar variables legacy eliminadas.

## 8. Checklist de PR para cambios de entorno

- Se actualizo env/.env o los archivos por perfil correspondientes.
- Se actualizo el archivo de dominio correspondiente.
- Se documento en env/docs/02-catalogo-de-variables.md.
- Se valido arranque local backend/frontend.
- No se commitearon secretos reales.
