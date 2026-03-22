# Guia de Entornos - Web-II

Este directorio centraliza toda la configuracion externa del proyecto para backend, frontend y docker.

## Objetivo

El sistema de entornos busca cuatro resultados: evitar secretos hardcodeados, separar responsabilidades por dominio, simplificar onboarding y permitir ejecuciones por entorno sin tocar codigo fuente.

## Convenciones oficiales

1. Formato: UPPER_SNAKE_CASE.
1. Frontend: solo variables con prefijo VITE\_.
1. Seguridad: nunca subir secretos reales al repositorio.
1. Contrato base: toda variable nueva inicia en `.env.example`.

## Estructura de archivos

1. `.env.example`: contrato maestro y plantilla oficial.
1. `.env.test`: entorno consolidado para pruebas.
1. `server.env`: HTTP, host, protocolo, idioma y CORS.
1. `db.env`: conexion DB de la aplicacion.
1. `auth.env`: JWT y expiraciones.
1. `session.env`: sesion y politica de cookies.
1. `services.env`: integraciones externas.
1. `frontend.env`: variables de Vite/React.
1. `docker.env`: variables de compose/postgres/pgadmin/backup.

## Carga de variables en backend

Implementado en `backend/main.js`.

### Modo por capas (default)

Orden de lectura efectivo:

1. `.env.{NODE_ENV}`
1. `.env`
1. `server.env`
1. `db.env`
1. `auth.env`
1. `session.env`
1. `services.env`
1. `frontend.env`
1. `docker.env`

### Modo estricto por entorno

Activacion: `ENV_ONLY_MODE=true`.

Resultado: solo se carga `.env.{NODE_ENV}`.

### Modo archivo unico

Activacion: `ENV_ONLY_FILE=.env.test`.

Resultado: solo se carga el archivo indicado.

### Regla de precedencia

El backend usa dotenv con `override: true`. Si una variable aparece en mas de un archivo, prevalece el valor del ultimo archivo cargado.

## Carga de variables en frontend

Implementado en `frontend/vite.config.js` con `envDir: "../env"`.

Vite toma variables de esta carpeta y solo expone al navegador variables con prefijo `VITE_`.

## Carga de variables en docker

`db/docker-compose.yml` y `db-win/docker-compose.yml` usan `env_file: ../env/docker.env`.

## Flujo recomendado del equipo

1. Declarar variables nuevas en `env/.env.example`.
1. Ubicarlas en el archivo de dominio correcto.
1. Consumirlas en codigo o compose.
1. Documentarlas en el catalogo y recetas operativas.
1. Verificar que no existan secretos reales en cambios versionados.

## Navegacion de documentacion

1. `env/01-division-de-archivos.md`: arquitectura y responsabilidades.
1. `env/02-catalogo-de-variables.md`: definicion variable por variable.
1. `env/03-operacion-y-recetas.md`: comandos y flujos de ejecucion.
1. `env/04-troubleshooting.md`: diagnostico de errores comunes.
1. `env/05-seguridad-y-gobernanza.md`: politicas y controles de seguridad.
