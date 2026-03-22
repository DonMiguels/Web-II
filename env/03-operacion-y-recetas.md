# Operacion y Recetas de Uso

Guia operativa para ejecutar el proyecto en local, test y casos especiales.

## 1. Inicializacion de entorno

Desde raiz del repositorio:

```powershell
node setup-env.js
```

Resultado esperado:

1. Si no existe, crea `env/.env.test`.
1. Si no existen, crea archivos por dominio como `server.env`, `db.env`, `auth.env` y otros.

## 2. Ejecutar backend en modo normal por capas

Comando Windows PowerShell:

```powershell
$env:NODE_ENV="development"
npm --prefix backend run dev
```

Comportamiento:

1. Carga `env/.env.development` si existe.
1. Luego aplica archivos por dominio en cascada.

## 3. Ejecutar backend usando solo .env.test

### Opcion A: archivo unico explicito

```powershell
$env:NODE_ENV="test"
$env:ENV_ONLY_FILE=".env.test"
npm --prefix backend run dev
```

### Opcion B: modo estricto por NODE_ENV

```powershell
$env:NODE_ENV="test"
$env:ENV_ONLY_MODE="true"
npm --prefix backend run dev
```

Diferencia:

1. `ENV_ONLY_FILE` permite seleccionar cualquier nombre de archivo.
1. `ENV_ONLY_MODE` usa automaticamente `.env.{NODE_ENV}`.

## 4. Ejecutar frontend con variables de test

```powershell
npm --prefix frontend run dev -- --mode test
```

Requisitos:

1. `frontend/vite.config.js` apunta a `env/` con `envDir`.
1. Las variables consumidas por frontend deben comenzar por `VITE_`.

## 5. Ejecutar Docker DB con env centralizado

### Stack db-win

```powershell
docker compose --env-file ./env/docker.env -f db-win/docker-compose.yml up -d
```

### Stack db

```powershell
docker compose --env-file ./env/docker.env -f db/docker-compose.yml up -d
```

Nota:

1. Los compose ya declaran `env_file: ../env/docker.env`.
1. Pasar `--env-file` puede ayudar en shells o CI con comportamientos distintos.

## 6. Como agregar una nueva variable correctamente

1. Definirla en `env/.env.example` con comentario descriptivo.
2. Decidir el archivo de dominio correcto (`server.env`, `db.env`, etc.).
3. Agregarla en el archivo de dominio con valor local seguro.
4. Consumirla en codigo (backend/frontend/docker).
5. Documentarla en `env/02-catalogo-de-variables.md`.

## 7. Reglas para evitar errores comunes

- No repetir una misma variable en multiples archivos salvo necesidad de fallback.
- No mezclar variables de Docker en `db.env`.
- No exponer secretos al frontend con prefijo `VITE_`.
- No asumir que `NODE_ENV` ya esta seteado en terminal.

## 8. Checklist de PR para cambios de entorno

- Se actualizo `env/.env.example`.
- Se actualizo el archivo de dominio correspondiente.
- Se documento en `env/02-catalogo-de-variables.md`.
- Se valido arranque local backend/frontend.
- No se commitearon secretos reales.
