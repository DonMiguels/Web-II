# Diseno de Logger Centralizado

## Objetivo

Definir un logger unico para backend que reemplace console.log disperso y respete APP_LOG_LEVEL.

Practicas minimas obligatorias:

1. Definir un unico logger central que lea APP_LOG_LEVEL una sola vez.
2. Sanitizar campos sensibles antes de imprimir.
3. Estandarizar formato: app, env, nivel, timestamp, contexto.
4. Evitar console.log dispersos para mantener control de niveles.

## Variables de entorno requeridas

1. APP_NAME
1. Uso: identificar la aplicacion en cada linea de log.
1. Ejemplo: web-ii

1. APP_ENV
1. Uso: etiquetar entorno actual.
1. Ejemplo: development

1. APP_LOG_LEVEL
1. Uso: nivel minimo de severidad a imprimir.
1. Ejemplo: info

## Niveles de log

1. debug
1. Maxima verbosidad.
1. Incluye diagnostico profundo y trazas de desarrollo.

1. info
1. Operacion normal.
1. Arranque, conexiones, flujos principales, cambios de estado importantes.

1. warn
1. Situaciones anomales no fatales.
1. El sistema sigue operando, pero requiere atencion.

1. error
1. Fallos que afectan una accion o request.
1. Puede devolver respuesta de error, pero proceso sigue vivo.

1. fatal
1. Error critico que impide continuar operacion.
1. Puede disparar cierre controlado del proceso.

## Politica de inclusiones por nivel

La politica oficial se define en backend/config/logger-levels.json.

Resumen esperado:

1. debug imprime: debug, info, warn, error, fatal.
2. info imprime: info, warn, error, fatal.
3. warn imprime: warn, error, fatal.
4. error imprime: error, fatal.
5. fatal imprime: fatal.

## API propuesta del logger

Archivo sugerido de implementacion en Fase 2:

1. backend/src/logger/logger.js

Metodos minimos:

1. debug(message, context = {}, meta = {})
2. info(message, context = {}, meta = {})
3. warn(message, context = {}, meta = {})
4. error(message, context = {}, meta = {})
5. fatal(message, context = {}, meta = {})
6. child(defaultContext = {})

## Parametros de cada metodo

1. message
1. Tipo: string.
1. Descripcion: mensaje humano principal.
1. Recomendacion: no incluir datos sensibles.

1. context
1. Tipo: object.
1. Descripcion: informacion de dominio para trazabilidad.
1. Ejemplos: route, method, userId, subsystem, txId, requestId.

1. meta
1. Tipo: object.
1. Descripcion: informacion tecnica adicional.
1. Ejemplos: errorCode, durationMs, statusCode.

## Estructura estandar de salida

Formato JSON por linea (log estructurado):

1. timestamp: ISO 8601.
2. level: debug|info|warn|error|fatal.
3. app: valor de APP_NAME.
4. env: valor de APP_ENV.
5. message: texto principal.
6. context: objeto sanitizado.
7. meta: objeto sanitizado.

Ejemplo:

```json
{
  "timestamp": "2026-03-22T21:10:33.123Z",
  "level": "info",
  "app": "web-ii",
  "env": "development",
  "message": "Server started",
  "context": {
    "module": "server",
    "url": "http://127.0.0.1:3000"
  },
  "meta": {
    "port": 3000
  }
}
```

## Estructura de llamada recomendada

En lugar de console.log:

```javascript
logger.info('Server started', { module: 'server', url: serverUrl }, { port });
```

Errores:

```javascript
logger.error(
  'DB query failed',
  { module: 'db', queryName },
  {
    errorName: err.name,
    errorCode: err.code,
    message: err.message,
  },
);
```

## Sanitizacion de datos sensibles

Reglas minimas:

1. Redactar/ocultar campos sensibles antes de loguear.
2. Nunca imprimir secretos completos.
3. Reemplazar valores sensibles por mascara o etiqueta.

Campos sensibles a sanitizar:

1. password
2. token
3. authorization
4. cookie
5. secret
6. apiKey
7. dbPassword
8. sessionSecret

Ejemplo de salida sanitizada:

1. token: "\*\*\*"
2. password: "\*\*\*"

## Sanitizacion centralizada con sanitizer

En el estado actual del proyecto, la sanitizacion central no vive en validator.
La implementacion vigente usa un componente dedicado llamado sanitizer.

Componentes principales:

1. backend/src/sanitizer/sanitizer.js
2. backend/config/sanitizer/sanitize-rules.js
3. backend/config/sanitizer/sanitize-regex.js

Documentacion tecnica completa:

1. docs/sanitizer-design.md

### Contrato de uso vigente

1. createSanitizer()
2. sanitizer.sanitizePayload(payload, options)

Salida principal:

1. cleanedPayload
2. changedFields
3. deniedMatches
4. rejected
5. response

### Orden recomendado en pipeline de log

1. Construir context/meta.
2. Sanitizar context/meta con el componente sanitizer.
3. Enviar al logger solo data sanitizada.

## Uso recomendado por capa del proyecto

1. backend/main.js
1. logger.info en arranque y carga de configuracion.

1. backend/src/server/server.js
1. logger.info para bind y rutas activas.
1. logger.warn para origen CORS bloqueado.
1. logger.error para fallos de inicio.

1. backend/config/db.js
1. logger.info en conexion exitosa.
1. logger.error en eventos de pool error.

1. backend/src/session/sessionRoutes.js
1. logger.info para eventos de autenticacion no sensibles.
1. logger.warn para intentos invalidos.
1. logger.error para excepciones.

1. backend/src/tokenizer/tokenizer.js
1. logger.warn para tokens invalidos/expirados.
1. logger.error para errores de firma/verificacion.

## Regla de adopcion progresiva

1. Fase 2: introducir logger y reemplazar puntos criticos de console.
2. Fase 3: completar migracion de logs en todo el backend.
3. Mantener temporalmente console.error solo en rutas de fail-fast previas al logger.

## Criterios de aceptacion

1. APP_LOG_LEVEL se lee una sola vez al inicializar logger.
2. No hay console.log en puntos operativos criticos.
3. Formato de log estandarizado y consistente.
4. Niveles respetan matriz de inclusiones.
5. Datos sensibles no aparecen en texto plano.
