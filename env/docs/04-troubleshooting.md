# Troubleshooting de Entornos

## Error: AUTH_JWT_SECRET is required

Causa:

1. Backend arranca sin AUTH_JWT_SECRET disponible en el perfil activo.

Validacion:

1. Revisar env/{APP_ENV}/auth.env.
2. Confirmar que APP_ENV tenga el valor esperado (development/test/production).

Solucion:

1. Definir AUTH_JWT_SECRET en auth.env del perfil activo.

## Error de conexion a DB (ECONNREFUSED o auth failed)

Causa tipica:

1. Credenciales, host o puerto incorrectos en env/{APP_ENV}/db.env.

Validacion:

1. Confirmar DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_NAME.
2. Verificar si postgres esta arriba con Docker.

Solucion:

1. Corregir variables y reiniciar backend.

## Frontend no toma FRONT_API_URL

Causa tipica:

1. APP_ENV incorrecto o valor faltante en env/{APP_ENV}/frontend.env.

Validacion:

1. Confirmar FRONT_API_URL en env/{APP_ENV}/frontend.env.
2. Confirmar APP_ENV en la terminal de ejecucion de Vite.

Solucion:

1. Definir APP_ENV correcto y reiniciar Vite.

## CORS bloqueado en navegador

Causa tipica:

1. CORS_ALLOWED_ORIGINS no incluye el origen del frontend.
2. CORS_ALLOWED_METHODS o CORS_ALLOWED_HEADERS contiene valores fuera del catalogo permitido.

Validacion:

1. Revisar env/{APP_ENV}/server.env.
2. Si hay multiples origenes, confirmar separacion por coma.
3. Verificar catalogo en backend/config/env/allowed-values.json.

Solucion:

1. Agregar origen faltante y reiniciar backend.
2. Ajustar metodos/headers a valores permitidos.

## Docker no ve variables esperadas

Causa tipica:

1. APP_ENV no seteado o perfil sin docker.env.

Validacion:

1. Confirmar existencia de env/{APP_ENV}/docker.env.
2. Verificar APP_ENV efectivo en shell.
3. Revisar comando compose y archivo -f usado.

Solucion:

1. Definir APP_ENV antes de ejecutar docker compose.

## El backend esta cargando un perfil inesperado

Causa tipica:

1. APP_ENV no esta definido o tiene otro valor en la terminal actual.

Validacion:

1. Revisar APP_ENV en la terminal.
2. Confirmar existencia de archivos en env/{APP_ENV}/.

Solucion:

1. Exportar APP_ENV en la misma terminal antes de correr backend/frontend/compose.

## Diagnostico rapido recomendado

1. Verificar archivo objetivo y modo de carga.
2. Verificar nombres exactos de variables.
3. Reiniciar proceso que consume dotenv.
4. Revisar logs de arranque backend/docker.
5. Confirmar que no haya typo en nombres canonicos ni en valores enum.
