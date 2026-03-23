# Integracion de entorno centralizado

Este proyecto usa una carpeta unica de configuracion en `env/`.

## 1) Inicializar plantillas locales

Desde la raiz del repositorio:

```bash
node setup-env.js
```

Se crean (si no existen):

- `env/.env.development`
- `env/.env.test`

## 2) Backend (Node + dotenv)

El backend carga automaticamente archivos desde `env/` en este orden:

1. `.env.{NODE_ENV}`
2. `server.env`
3. `db.env`
4. `auth.env`
5. `session.env`
6. `services.env`
7. `frontend.env`
8. `docker.env`

Archivo responsable: `backend/main.js`.

## 3) Frontend (Vite)

Vite ahora usa `envDir: "../env"`, por lo que las variables para frontend deben vivir en `env/` y tener prefijo `VITE_`.

Archivo responsable: `frontend/vite.config.js`.

## 4) Docker Compose

Los stacks `db/` y `db-win/` usan:

- `env_file: ../env/docker.env`

Archivos responsables:

- `db/docker-compose.yml`
- `db-win/docker-compose.yml`

## 5) Seguridad Git

`.gitignore` protege todos los `.env.*` dentro de `env/` excepto la plantilla:

```gitignore
/env/.env.*
!/env/.env.example
```

## 6) Variables canonicas

El codigo operativo consume unicamente variables canonicas definidas en `env/.env.example`.
