# Troubleshooting de Entornos

## Error: JWT_SECRET is required

Causa:

1. Backend arranca sin `JWT_SECRET` disponible.

Validacion:

1. Revisar `env/auth.env`.
1. Si se usa modo exclusivo, revisar que `.env.test` tenga `JWT_SECRET`.

Solucion:

1. Definir valor en archivo activo de entorno.

## Error de conexion a DB (ECONNREFUSED o auth failed)

Causa tipica:

1. Credenciales, host o puerto incorrectos en `db.env` o archivo exclusivo.

Validacion:

1. Confirmar `DB_POSTGRES_HOST`, `DB_POSTGRES_PORT`, `DB_POSTGRES_USER`, `DB_POSTGRES_PASSWORD`, `DB_POSTGRES_NAME`.
1. Verificar si postgres esta arriba con Docker.

Solucion:

1. Corregir variables y reiniciar backend.

## Frontend no toma VITE_API_URL

Causa tipica:

1. Variable sin prefijo `VITE_` o modo de Vite incorrecto.

Validacion:

1. Confirmar variable en `frontend.env` o `.env.test`.
1. Ejecutar frontend con `--mode test` cuando corresponda.

Solucion:

1. Renombrar variable con prefijo `VITE_` y reiniciar Vite.

## CORS bloqueado en navegador

Causa tipica:

1. `SERVER_CORS_ALLOWED_ORIGINS` no incluye el origen del frontend.

Validacion:

1. Revisar valor en `server.env` o archivo exclusivo activo.
1. Si hay multiples origenes, confirmar separacion por coma.

Solucion:

1. Agregar origen faltante y reiniciar backend.

## Docker no ve variables esperadas

Causa tipica:

1. `docker.env` incompleto o compose ejecutado desde ruta no esperada.

Validacion:

1. Confirmar existencia de `env/docker.env`.
1. Revisar comando compose y archivo `-f` usado.

Solucion:

1. Usar `--env-file ./env/docker.env` explicitamente.

## El backend sigue leyendo archivos extra y no solo test

Causa tipica:

1. No se activaron flags de modo exclusivo.

Validacion:

1. Revisar variables de terminal.
1. Confirmar `ENV_ONLY_FILE=.env.test` o `ENV_ONLY_MODE=true` con `NODE_ENV=test`.

Solucion:

1. Exportar variables en la misma terminal antes de correr backend.

## Diagnostico rapido recomendado

1. Verificar archivo objetivo y modo de carga.
2. Verificar nombres exactos de variables.
3. Reiniciar proceso que consume dotenv.
4. Revisar logs de arranque backend/docker.
5. Confirmar que no haya typo en nombres canonicos.
