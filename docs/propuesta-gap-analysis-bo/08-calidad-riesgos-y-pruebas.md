# Calidad, Riesgos y Pruebas

## 1. Objetivo

Definir controles de calidad y gestion de riesgos para asegurar que la propuesta se implemente sin degradar seguridad, consistencia ni trazabilidad.

## 2. Riesgos principales

| Riesgo | Probabilidad | Impacto | Mitigacion |
| --- | --- | --- | --- |
| Sobreasignacion de inventario por concurrencia | Media | Alto | Bloqueo FOR UPDATE + pruebas concurrentes |
| Regresion en flujo de prestamos existente | Media | Alto | Feature flags y pruebas de contrato |
| Reportes inconsistentes por datos historicos | Media | Medio | Vistas SQL validadas y reconciliacion |
| Exceso de notificaciones duplicadas | Alta | Medio | Llave de deduplicacion por usuario/tipo/ventana |
| Falta de trazabilidad por hard delete | Media | Alto | Politica global soft delete + auditoria |

## 3. Estrategia de pruebas

### 3.1 Pruebas unitarias

1. Validacion de reglas de solvencia.
2. Reglas de transicion de estado de item.
3. Reglas de calculo de mora y compensacion.

### 3.2 Pruebas de integracion

1. createLoanWithDetails con inventario real.
2. registerReturn con actualizacion de stock.
3. settleCompensation con recalculo de solvencia.
4. reportes por periodo con fixtures.

### 3.3 Pruebas E2E

1. Ciclo completo: apartado -> prestamo -> devolucion.
2. Ciclo de mora: prestamo vencido -> alerta -> compensacion -> solvencia.
3. Seguridad: permisos por perfil para procesos compuestos.

### 3.4 Pruebas no funcionales

1. Concurrencia en prestamos simultaneos del mismo item.
2. Rendimiento de reportes con volumen historico.
3. Robustez del scheduler en ejecuciones repetidas.

## 4. Observabilidad

## 4.1 Logs estructurados minimos

1. process_name.
2. transaction_id.
3. user_id.
4. domain_event.
5. status_code.
6. duration_ms.

## 4.2 Metricas sugeridas

1. Prestamos creados por dia.
2. Prestamos vencidos activos.
3. Tiempo medio de devolucion.
4. Compensacion pendiente total.
5. Tasa de errores por metodo BO.

## 5. Criterios de aceptacion global

1. Cobertura funcional validada para todos los procesos explicitos.
2. Requerimientos implicitos criticos cubiertos.
3. Trazabilidad completa de eventos de negocio.
4. Reportes consistentes y verificables.
5. No regresion en seguridad ni en contratos actuales de dispatcher.
