# Actions Reference

## Action matrix

- keep: mantiene el valor original.
- delete: elimina el campo del payload final.
- redact: reemplaza el valor completo por un texto fijo.
- obfuscate: deja visibles extremos del valor y enmascara el centro.
- sanitize: ejecuta reemplazos regex configurables para remover partes sensibles.
- nullify: reemplaza por null.
- empty: reemplaza por cadena vacia.
- truncate: recorta longitud maxima y agrega sufijo opcional.

## Parametros por action

### redact

- replacement: string
- default: [REDACTED]

### obfuscate

- visibleStart: number >= 0
- visibleEnd: number >= 0
- maskChar: string (se usa el primer caracter)
- minMasked: number >= 1

### sanitize

- replacementRules: array de objetos
- normalizeSpaces: boolean
- trim: boolean

Formato replacementRules:

[
{
pattern: string,
flags: string,
replacement: string
}
]

### truncate

- maxLength: number >= 0
- suffix: string

## Ejemplos por campo

password: {
denyPatternKeys: ['control_chars'],
actions: {
onSensitiveDetection: 'redact'
}
}

email: {
actions: {
onSensitiveDetection: {
name: 'obfuscate',
params: {
visibleStart: 2,
visibleEnd: 10,
maskChar: '\*',
minMasked: 5
}
}
}
}

notes: {
actions: {
onDenyPattern: {
name: 'sanitize',
params: {
replacementRules: [
{
pattern: '([A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+)',
flags: 'g',
replacement: ''
},
{
pattern: '\\b\\d{13,19}\\b',
flags: 'g',
replacement: '[CARD_REMOVED]'
}
],
normalizeSpaces: true,
trim: true
}
}
}
}

## Ejemplo completo de route

'session.response': {
forceIncludePaths: [],
actions: {
onDenyPattern: {
name: 'sanitize',
params: {
replacementRules: [
{
pattern: '(?:Bearer\\s+[A-Za-z0-9._~+\\/-]+=\*)',
flags: 'gi',
replacement: ''
}
],
normalizeSpaces: true,
trim: true
}
},
onSensitiveDetection: {
name: 'redact',
params: {
replacement: '[REDACTED]'
}
}
},
fields: {
email: {
actions: {
onSensitiveDetection: {
name: 'obfuscate',
params: {
visibleStart: 2,
visibleEnd: 10,
minMasked: 5
}
}
}
}
}
}

## Output del motor

sanitizePayload(...) ahora incluye:

- cleanedPayload
- changedFields
- deniedMatches
- rejected
- forcedIncluded
- sanitizedAfterForce
- actionsApplied: acciones ejecutadas por campo
- response
