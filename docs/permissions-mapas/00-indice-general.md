# Documentación de Mapas de Permisos y Perfiles

## Índice

1. [Objetivo y alcance](#objetivo-y-alcance)
2. [Cómo leer esta documentación](#cómo-leer-esta-documentación)
3. [Mapa de documentos](#mapa-de-documentos)
4. [Ruta corta de lectura recomendada](#ruta-corta-de-lectura-recomendada)
5. [Decisión arquitectónica vigente](#decisión-arquitectónica-vigente)

## Objetivo y alcance

Esta documentación describe de forma detallada el manejo actual de mapas (estructuras en memoria tipo `Map` y objetos) relacionados con:

- perfiles de usuario,
- permisos por método,
- opciones y su relación con métodos/transacciones,
- reflexión y despacho dinámico.

Se cubren dos circuitos reales del repositorio:

- Circuito operativo del request en runtime: `dispatcher -> security -> method_resolver -> BO method`.
- Circuito administrativo de mapeo (ATX): perfiles/metodos/opciones/menus y construcción de estructuras jerárquicas.

## Decisión arquitectónica vigente

- La carpeta `src/_business` se considera legado (legacy).
- La carpeta `src/bo` es el destino oficial de migración y evolución.
- El esquema objetivo en `bo` es: `subsystem -> class -> method`.
- La estrategia de desacople para métodos compartidos y sin estado se documenta en el plan de migración.

## Cómo leer esta documentación

- Si necesitas entender el request end-to-end, empieza por [01-flujo-dispatcher-security.md](./01-flujo-dispatcher-security.md).
- Si necesitas inventario de mapas/objetos y su estructura exacta, ve a [02-mapas-perfiles-metodos-opciones.md](./02-mapas-perfiles-metodos-opciones.md).
- Si necesitas decisiones de mejora (clean architecture/clean code), ve a [03-analisis-clean-architecture.md](./03-analisis-clean-architecture.md).
- Si necesitas ejecutar la migración de `src/_business` a `src/bo`, ve a [04-plan-migracion-business-a-bo.md](./04-plan-migracion-business-a-bo.md).

## Mapa de documentos

1. [01-flujo-dispatcher-security.md](./01-flujo-dispatcher-security.md)
   Flujo detallado desde entrada HTTP hasta respuesta, incluyendo validaciones, sesión, autorización y ejecución por reflexión.

2. [02-mapas-perfiles-metodos-opciones.md](./02-mapas-perfiles-metodos-opciones.md)
   Catálogo de mapas en memoria, claves/valores, origen de datos y operaciones de sincronización.

3. [03-analisis-clean-architecture.md](./03-analisis-clean-architecture.md)
   Hallazgos técnicos, riesgos, deuda de diseño y plan de evolución por fases.

4. [04-plan-migracion-business-a-bo.md](./04-plan-migracion-business-a-bo.md)
   Plan de migración detallado del ecosistema legacy `src/_business` hacia `src/bo` con esquema `subsystem/class/method`.

## Ruta corta de lectura recomendada

1. Flujo runtime: [01-flujo-dispatcher-security.md](./01-flujo-dispatcher-security.md)
2. Estructuras de datos: [02-mapas-perfiles-metodos-opciones.md](./02-mapas-perfiles-metodos-opciones.md)
3. Mejoras propuestas: [03-analisis-clean-architecture.md](./03-analisis-clean-architecture.md)
4. Ejecución de migración: [04-plan-migracion-business-a-bo.md](./04-plan-migracion-business-a-bo.md)
