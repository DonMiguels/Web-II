# Roadmap de Corto Plazo para Ajuste y Optimizacion

## Indice
1. [Objetivo](#objetivo)
2. [Estrategia de implementacion](#estrategia-de-implementacion)
3. [Fases propuestas](#fases-propuestas)
4. [Backlog detallado de corto plazo](#backlog-detallado-de-corto-plazo)
5. [Dependencias y orden sugerido](#dependencias-y-orden-sugerido)
6. [Entregables por fase](#entregables-por-fase)
7. [Criterios de salida](#criterios-de-salida)
8. [Referencias](#referencias)

## Objetivo
Traducir la propuesta de arquitectura en un plan ejecutable, incremental y verificable, minimizando riesgo de regresion.

## Estrategia de implementacion
1. Consolidacion BO-only con contratos canonicos estables.
2. Migracion por vertical funcional, no por capa aislada.
3. Pruebas de contrato y regresion en cada lote.
4. Telemetria obligatoria antes de cortes mayores.

## Fases propuestas
### Fase 1: Endurecimiento de nucleo de seguridad y dispatch
1. Separar autorizacion de ejecucion en servicios dedicados.
2. Tipar errores de dominio/autorizacion/infraestructura.
3. Unificar mensaje semantico de denegacion.
4. Asegurar trazabilidad por transaction_id y request_id.

### Fase 2: Prestamos, devoluciones y compensacion
1. Implementar maquinas de estado de movimiento/devolucion.
2. Introducir idempotencia en operaciones criticas.
3. Aplicar lock de inventario por item/location.
4. Vincular settlement de compensacion con solvencia.

### Fase 3: Inventario, mantenimiento y ubicaciones
1. Consolidar servicios de item/inventory/location.
2. Implementar reglas de jerarquia sin ciclos.
3. Integrar mantenimiento preventivo y correctivo.
4. Auditar cambios de condicion de item.

### Fase 4: Notificaciones, reportes y periodos
1. Scheduler para recordatorios y alertas.
2. Reportes de solvencia, morosidad y estadistica.
3. Politicas por periodo academico activo.
4. Exportaciones con enmascaramiento de datos sensibles.

### Fase 5: Cierre post-migracion y limpieza operativa
1. Verificacion final de ausencia de dependencias legacy.
2. Limpieza de rutas/controladores duplicados.
3. Actualizacion de documentacion y onboarding tecnico.

## Backlog detallado de corto plazo
| ID | Item | Prioridad | Tipo | Resultado esperado |
|---|---|---|---|---|
| R-01 | SecurityCacheService separado | Alta | Refactor | Menor acoplamiento en Security |
| R-02 | ExecutionGateway tipado | Alta | Refactor | Errores controlados en resolver |
| R-03 | Catalogo de errores de dominio | Alta | Foundation | Respuestas consistentes |
| R-04 | Idempotencia en createLoan/createReturn | Alta | Robustez | Sin duplicados operativos |
| R-05 | Lock inventario en prestamos | Alta | Integridad | Sin sobreasignacion de stock |
| R-06 | Maquina de estado de devolucion | Alta | Dominio | Transiciones validadas |
| R-07 | Auditor de consistencia permisos/opciones | Media | Seguridad | Integridad de autorizacion |
| R-08 | Scheduler de notificaciones | Media | Operacion | Recordatorios automaticos |
| R-09 | Reporte de morosos por periodo | Media | Analitica | Visibilidad operativa |
| R-10 | Reconciliacion nocturna stock-movimientos | Media | Operacion | Deteccion temprana de desbalance |
| R-11 | Politica de solvencia versionada | Media | Dominio | Regla explicita por periodo |
| R-12 | Limpieza final de superficie HTTP | Media | Arquitectura | Menor confusion de entrypoints |

## Dependencias y orden sugerido
```mermaid
flowchart LR
  A[R-01 SecurityCacheService] --> B[R-02 ExecutionGateway]
  B --> C[R-03 Catalogo de errores]
  C --> D[R-04 Idempotencia]
  D --> E[R-05 Lock inventario]
  E --> F[R-06 Maquina devolucion]
  F --> G[R-07 Auditor permisos]
  G --> H[R-08 Scheduler notificaciones]
  H --> I[R-09 Reporte morosos]
  I --> J[R-10 Reconciliacion]
  J --> K[R-11 Solvencia versionada]
  K --> L[R-12 Limpieza final HTTP]
```

## Entregables por fase
1. Documentacion de contratos (input/output/error) por caso de uso.
2. Suite de pruebas de regresion actualizada.
3. Checklist de despliegue y rollback por lote.
4. Reporte de metricas de estabilidad y latencia.

## Criterios de salida
1. Sin regresiones en flujo de autorizacion y dispatch.
2. Cobertura de procesos minimos validada por pruebas funcionales.
3. Trazabilidad de auditoria activa en operaciones sensibles.
4. Consistencia de permisos verificada automaticamente.
5. Reduccion de acoplamiento medible en componentes criticos.

## Referencias
1. [03-arquitectura-objetivo-clean.md](./03-arquitectura-objetivo-clean.md)
2. [04-subsistemas-clases-metodos.md](./04-subsistemas-clases-metodos.md)
3. [07-gobernanza-riesgos-pruebas-metricas.md](./07-gobernanza-riesgos-pruebas-metricas.md)
4. [docs/permissions-mapas/04-plan-migracion-business-a-bo.md](../permissions-mapas/04-plan-migracion-business-a-bo.md)
