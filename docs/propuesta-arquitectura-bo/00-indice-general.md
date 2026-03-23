# Propuesta Integral de Arquitectura y Evolucion

## Indice

1. [Objetivo del paquete](#objetivo-del-paquete)
2. [Alcance](#alcance)
3. [Como leer esta propuesta](#como-leer-esta-propuesta)
4. [Mapa de documentos](#mapa-de-documentos)
5. [Resumen ejecutivo](#resumen-ejecutivo)
6. [Flujo de lectura recomendado](#flujo-de-lectura-recomendado)
7. [Referencias base del repositorio](#referencias-base-del-repositorio)

## Objetivo del paquete

Este paquete registra, de forma consolidada y detallada, el resultado del analisis arquitectonico realizado sobre el sistema de control de laboratorio, incluyendo:

1. Lectura rapida del estado actual (documentacion, codigo y esquema SQL).
2. Analisis exhaustivo de procesos minimos requeridos por negocio.
3. Propuesta de arquitectura objetivo con enfoque clean architecture y clean code.
4. Definicion de subsistemas, clases, metodos, responsabilidades y estados internos.
5. Roadmap de corto plazo para optimizacion progresiva sin ruptura funcional.
6. Gobierno de riesgos, observabilidad, pruebas y trazabilidad.

## Alcance

Se cubren los dominios operativos definidos por negocio:

1. Mantenimiento de equipos y componentes.
2. Prestamos, apartados y devoluciones.
3. Control de estado de items.
4. Compensaciones por dano o perdida.
5. Notificaciones operativas.
6. Inventario y ubicaciones.
7. Reporteria de solvencia, morosidad y estadisticas.
8. Auditoria.
9. Seguridad y perfiles.
10. Gestion de periodo academico.

## Como leer esta propuesta

La documentacion se organiza por capas de detalle:

1. Contexto y lectura rapida.
2. Trazabilidad proceso-tabla.
3. Arquitectura objetivo.
4. Estructura tecnica detallada.
5. Estados internos y politicas de encapsulamiento.
6. Plan de ejecucion.
7. Riesgos, pruebas y metricas.
8. Anexos visuales.

## Mapa de documentos

1. [01-contexto-y-lectura-rapida.md](./01-contexto-y-lectura-rapida.md)
   Estado vigente del sistema y hallazgos de lectura rapida.

2. [02-mapa-procesos-minimos-y-bd.md](./02-mapa-procesos-minimos-y-bd.md)
   Matriz detallada de procesos minimos contra tablas, reglas e invariantes.

3. [03-arquitectura-objetivo-clean.md](./03-arquitectura-objetivo-clean.md)
   Arquitectura objetivo, capas, puertos/adaptadores, contratos y patrones.

4. [04-subsistemas-clases-metodos.md](./04-subsistemas-clases-metodos.md)
   Catalogo exhaustivo de subsistemas, clases, metodos publicos/privados y responsabilidades.

5. [05-estados-internos-y-privacidad.md](./05-estados-internos-y-privacidad.md)
   Maquinas de estado internas, reglas de transicion y datos no expuestos.

6. [06-roadmap-corto-plazo.md](./06-roadmap-corto-plazo.md)
   Plan de ejecucion incremental, dependencias, entregables y criterios de salida.

7. [07-gobernanza-riesgos-pruebas-metricas.md](./07-gobernanza-riesgos-pruebas-metricas.md)
   Gobierno tecnico, riesgos, controles de calidad y observabilidad.

8. [08-anexos-diagramas-secuencia-y-despliegue.md](./08-anexos-diagramas-secuencia-y-despliegue.md)
   Diagramas de secuencia, componentes y despliegue logico.

## Resumen ejecutivo

1. El esquema SQL actual ya contiene los elementos nucleares para soportar los procesos minimos del negocio.
2. El runtime actual ya implementa un despacho dinamico transaccional, pero con acoplamientos que deben separarse.
3. La evolucion recomendada es bo-first, con estructura canonica subsystem -> class -> method.
4. La principal oportunidad esta en separar seguridad, orquestacion, estados de dominio y observabilidad.
5. La propuesta prioriza continuidad operativa, trazabilidad y bajo riesgo de regresion.

## Flujo de lectura recomendado

1. [01-contexto-y-lectura-rapida.md](./01-contexto-y-lectura-rapida.md)
2. [02-mapa-procesos-minimos-y-bd.md](./02-mapa-procesos-minimos-y-bd.md)
3. [03-arquitectura-objetivo-clean.md](./03-arquitectura-objetivo-clean.md)
4. [04-subsistemas-clases-metodos.md](./04-subsistemas-clases-metodos.md)
5. [05-estados-internos-y-privacidad.md](./05-estados-internos-y-privacidad.md)
6. [06-roadmap-corto-plazo.md](./06-roadmap-corto-plazo.md)
7. [07-gobernanza-riesgos-pruebas-metricas.md](./07-gobernanza-riesgos-pruebas-metricas.md)
8. [08-anexos-diagramas-secuencia-y-despliegue.md](./08-anexos-diagramas-secuencia-y-despliegue.md)

## Referencias base del repositorio

1. [docs/database-refactor.md](../database-refactor.md)
2. [docs/env-integration.md](../env-integration.md)
3. [docs/logger-design.md](../logger-design.md)
4. [docs/sanitizer-design.md](../sanitizer-design.md)
5. [docs/permissions-mapas/00-indice-general.md](../permissions-mapas/00-indice-general.md)
6. [docs/permissions-mapas/01-flujo-dispatcher-security.md](../permissions-mapas/01-flujo-dispatcher-security.md)
7. [docs/permissions-mapas/02-mapas-perfiles-metodos-opciones.md](../permissions-mapas/02-mapas-perfiles-metodos-opciones.md)
8. [docs/permissions-mapas/03-analisis-clean-architecture.md](../permissions-mapas/03-analisis-clean-architecture.md)
9. [docs/permissions-mapas/04-plan-migracion-business-a-bo.md](../permissions-mapas/04-plan-migracion-business-a-bo.md)
10. [db-win/schema.sql](../../db-win/schema.sql)
11. [db-win/initial_data.sql](../../db-win/initial_data.sql)
12. [ai/processes.txt](../../ai/processes.txt)
