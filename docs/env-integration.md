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
2. `.env`
3. `server.env`
4. `db.env`
5. `auth.env`
6. `session.env`
7. `services.env`
8. `frontend.env`
9. `docker.env`

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

## 6) Variables legacy

Se mantiene compatibilidad temporal con variables antiguas (`PORT`, `DB_HOST`, `SECRET`, etc.).
A mediano plazo, migrar completamente a los nombres normalizados definidos en `env/.env.example`.
