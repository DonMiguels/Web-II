# Sanitizer Config Overview

Este directorio centraliza reglas de sanitizacion para entrada y salida.

## Archivos

- sanitize-rules.js: reglas, politicas y acciones de sanitizacion.
- sanitize-regex.js: catalogo de patrones regex (deny/detect).
- actions-reference.md: referencia completa de actions y ejemplos.

## Flujo de sanitizacion

1. Se cargan reglas por routeKey desde routeMaps.
2. Se aplican transformaciones de string (trim, normalizeSpaces, etc.).
3. Se evalua denyPatternKeysGlobal + denyPatternKeys por campo.
4. Si hay coincidencias deny y actionPolicy esta activo, se ejecuta onDenyPattern.
5. Se evalua sensibilidad por nombre de propiedad y por heuristica de valor.
6. Si el campo es sensible y no esta permitido en allowSensitivePathsByRoute, se ejecuta onSensitiveDetection.
7. Si rejectOnDenyPattern=true y hubo denyMatches, el resultado marca rejected=true.

## Campos principales en sanitize-rules.js

- behavior.rejectOnDenyPattern: si true, cualquier deny match deja rejected=true.
- behavior.executeActions: habilita/inhabilita la ejecucion de actions.
- denyPatternKeysGlobal: reglas deny globales.
- sensitivePropertyPolicy: reglas para detectar campos sensibles.
- actionPolicy: acciones disponibles, defaults y acciones por evento.
- routeMaps: reglas por ruta y override por campo.

## Eventos con action

- onDenyPattern: se dispara cuando una regla deny hace match.
- onSensitiveDetection: se dispara cuando se detecta campo sensible.

## Formato de action

Se puede definir de 2 formas:

1. Como string (usa params por defecto):

{
onSensitiveDetection: 'redact'
}

2. Como objeto (name + params):

{
onDenyPattern: {
name: 'sanitize',
params: {
replacementRules: [
{
pattern: '[0-9]{6,}',
flags: 'g',
replacement: ''
}
],
normalizeSpaces: true,
trim: true
}
}
}

## Prioridad de configuracion

1. field.actions[evento]
2. route.actions[evento]
3. actionPolicy[evento]

## Resolucion de routeKey

La resolucion de reglas usa coincidencia exacta y luego herencia por prefijo.

Ejemplo:

- session.response.login -> session.response -> session

## Ejemplo minimo por ruta

'dispatcher.response': {
forceIncludePaths: [],
actions: {
onDenyPattern: 'sanitize',
onSensitiveDetection: 'redact'
},
fields: {}
}

## Nota de compatibilidad

El sistema mantiene el comportamiento anterior de redaccion por defecto para campos sensibles, pero ahora puede sobrescribirse por ruta/campo mediante actions.
