# Web-II

Proyecto full stack con backend Node.js (Express), frontend React + Vite y base de datos PostgreSQL por Docker Compose.

Este README esta pensado para alguien que quiere levantar el proyecto rapido para probar flujo basico, endpoints y UI sin estudiar toda la arquitectura interna.

## Que incluye este repo

- Backend API: carpeta backend
- Frontend web: carpeta frontend
- Infra DB local (PostgreSQL + pgAdmin + backups): carpetas db y db-win
- Configuracion de entornos por perfil: carpeta env
- Scripts de arranque rapido: start.ps1 y start-mac.sh

## Prerequisitos

- Node.js 20+ y npm
- Docker Desktop (con Docker Compose)
- Git

## Concepto minimo de entornos

El proyecto usa perfiles de entorno:

- development
- test
- production

Variable clave:

- APP_ENV define el perfil activo

Los scripts ya pueden inicializar plantillas de entorno con setup-env.js, por lo que no necesitas crear archivos manualmente para una primera corrida.

## Arranque rapido con ejecutables

Ejecutar siempre desde la raiz del repo.

### Windows (PowerShell)

Arranque normal (instala dependencias, inicializa env y abre backend/frontend en procesos separados):

```powershell
.\start.ps1 -Profile development
```

Prueba sin abrir procesos (validacion de comandos):

```powershell
.\start.ps1 -DryRun -SkipInstall -SkipEnvSetup -Profile development
```

### macOS (bash)

Dar permisos una vez:

```bash
chmod +x ./start-mac.sh
```

Arranque normal:

```bash
./start-mac.sh --profile development
```

Prueba sin abrir procesos:

```bash
./start-mac.sh --dry-run --skip-install --skip-env-setup --profile development
```

## Levantar DB local (opcional pero recomendado)

Para ejecutar el backend con DB local, levantar infraestructura con el perfil elegido.

Windows:

```powershell
docker compose --env-file ./env/development/docker.env -f db-win/docker-compose.yml up -d
```

macOS/Linux:

```bash
docker compose --env-file ./env/development/docker.env -f db/docker-compose.yml up -d
```

## URLs utiles al probar

- Frontend (Vite): <http://localhost:5173>
- Backend API base: <http://localhost:3000>
- pgAdmin (si DB esta arriba): <http://localhost:5050>

## Flujo sugerido para demo rapida

1. Levantar DB (si vas a probar persistencia real).
2. Ejecutar script de arranque segun tu OS.
3. Abrir frontend en navegador.
4. Verificar que backend responde.
5. Probar endpoints con Collection Postman Web II.json.

## Comandos utiles manuales

Backend:

```powershell
npm --prefix backend run dev
```

Frontend:

```powershell
npm --prefix frontend run dev -- --host
```

Inicializar entornos:

```powershell
node setup-env.js
```

## Documentacion adicional

- Guia completa de entornos: env/README.md
- Runbook y docs de entorno: env/docs/
- Documentacion tecnica: docs/

## Troubleshooting rapido

- Si falla por variables faltantes: correr node setup-env.js y revisar APP_ENV.
- Si backend no conecta DB: verificar contenedores y credenciales del perfil en env/{perfil}/docker.env y env/{perfil}/db.env.
- Si frontend no llega al backend: revisar FRONT_API_URL en env/{perfil}/frontend.env.
