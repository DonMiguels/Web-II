# Guia de Entornos - Web-II

Este directorio centraliza toda la configuracion externa del proyecto para backend, frontend y docker.

## Objetivo

El sistema de entornos busca cuatro resultados: evitar secretos hardcodeados, separar responsabilidades por dominio, simplificar onboarding y permitir ejecuciones por entorno sin tocar codigo fuente.

## Convenciones oficiales

1. Formato: UPPER_SNAKE_CASE.
1. Backend: APP_ENV define el perfil activo (development por defecto).
1. Frontend: variables publicas con prefijo FRONT_.
1. Seguridad: nunca subir secretos reales al repositorio.
1. Configuracion global base: env/.env.

## Estructura de archivos

1. .env: capa global de app (APP_ENV, APP_NAME, APP_LOG_LEVEL).
1. development/server.env
1. development/db.env
1. development/auth.env
1. development/session.env
1. development/services.env
1. development/frontend.env
1. development/docker.env
1. test/server.env
1. test/db.env
1. test/auth.env
1. test/session.env
1. test/services.env
1. test/frontend.env
1. test/docker.env
1. production/server.env
1. production/db.env
1. production/auth.env
1. production/session.env
1. production/services.env
1. production/frontend.env
1. production/docker.env

## Carga de variables en backend

Implementado en backend/main.js.

### Modo por capas (default)

Orden de lectura efectivo:

1. env/.env
1. env/{APP_ENV}/server.env
1. env/{APP_ENV}/db.env
1. env/{APP_ENV}/auth.env
1. env/{APP_ENV}/session.env
1. env/{APP_ENV}/services.env
1. env/{APP_ENV}/frontend.env

Nota: docker.env es exclusivo de Docker Compose.

APP_ENV por defecto es development.

### Regla de precedencia

El backend usa dotenv con override=true. Si una variable aparece en mas de un archivo, prevalece el valor del ultimo archivo cargado.

## Carga de variables en frontend

Implementado en frontend/vite.config.js con envDir="../env".

Vite toma variables de esta carpeta y solo expone al navegador variables con prefijo FRONT\_ (y VITE\_ solo por compatibilidad temporal).

## Carga de variables en docker

db/docker-compose.yml y db-win/docker-compose.yml usan env_file por perfil, por ejemplo: ../env/development/docker.env.

## Flujo recomendado del equipo

1. Declarar variable base en env/.env o en su dominio de perfil.
1. Ubicarla en el archivo de dominio correcto dentro de development/test/production.
1. Consumirlas en codigo o compose.
1. Documentarlas en el catalogo y recetas operativas.
1. Verificar que no existan secretos reales en cambios versionados.

## Navegacion de documentacion

1. env/docs/01-division-de-archivos.md: arquitectura y responsabilidades.
2. env/docs/02-catalogo-de-variables.md: contrato vigente de variables.
3. env/docs/03-operacion-y-recetas.md: comandos y flujos de ejecucion.
4. env/docs/04-troubleshooting.md: diagnostico de errores comunes.
5. env/docs/05-seguridad-y-gobernanza.md: politicas y controles de seguridad.
6. env/docs/06-contrato-final-de-variables-fase1.md: documento historico (referencial).
7. env/docs/07-runbook-fase3.md: plantilla de ejecucion de Fase 3.

Regla de lectura:

1. Para operacion diaria, usar 01-05.
2. 06 se conserva como historial de decisiones.
3. 07 se usa como runbook de implementacion y cierre de Fase 3.
