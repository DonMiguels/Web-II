# Roadmap de Implementacion y Hitos

## 1. Estrategia general

Implementacion incremental en 4 fases, priorizando continuidad operativa y reduccion de riesgo funcional.

## 2. Fase 1 - Procesos transaccionales core

### Objetivo fase 1

Cubrir flujo completo de prestamo, apartado y devolucion con integridad ACID.

### Entregables fase 1

1. Loans/LoanProcess con createLoanWithDetails y renewLoan.
2. Reservations/Reservation + ReservationJob.
3. Returns/ReturnProcess con cierre de prestamo y reposicion de stock.
4. Pruebas de integracion E2E de ciclo completo.

### Criterios de salida fase 1

1. No existe sobreprestamo bajo concurrencia.
2. Todo prestamo tiene detail asociado.
3. Toda devolucion cierra un prestamo valido.

## 3. Fase 2 - Solvencia, compensacion y reportes

### Objetivo fase 2

Consolidar control financiero-operativo y reporteria.

### Entregables fase 2

1. Compensations/CompensationProcess.
2. Reports/SolvencyReport, Reports/DelinquencyReport, Reports/LoanStatsReport.
3. Vistas SQL y consultas agregadas por periodo.

### Criterios de salida fase 2

1. Solvencia recalculada de forma consistente.
2. Reportes reproducibles con filtros de periodo y estado.

## 4. Fase 3 - Notificaciones y automatizacion

### Objetivo fase 3

Automatizar recordatorios y alertas de mora.

### Entregables fase 3

1. Notifications/NotificationScheduler con jobs batch.
2. Plantillas de mensaje por tipo de evento.
3. Politica de no duplicacion de notificaciones.

### Criterios de salida fase 3

1. Recordatorios previos al vencimiento enviados en ventana configurable.
2. Alertas por retraso emitidas de forma periodica.

## 5. Fase 4 - Estandarizacion de datos y gobierno tecnico

### Objetivo fase 4

Unificar reglas transversales y endurecer calidad.

### Entregables fase 4

1. Politica uniforme de soft delete.
2. Reglas de metacampos temporales en entidades maestras.
3. Catalogo de errores de dominio y observabilidad por proceso.

### Criterios de salida fase 4

1. Eliminacion fisica reducida a catalogos estrictamente permitidos.
2. Trazabilidad temporal homogena en entidades maestras.

## 6. Matriz de dependencias

| Fase   | Depende de                                         | Riesgo principal                                 |
| ------ | -------------------------------------------------- | ------------------------------------------------ |
| Fase 1 | Runtime BO actual, queries base movement/inventory | Regresion en prestamos vigentes                  |
| Fase 2 | Fase 1 completada                                  | Inconsistencia de solvencia por datos historicos |
| Fase 3 | Fase 1 y 2 completadas                             | Saturacion de notificaciones sin deduplicacion   |
| Fase 4 | Todas las fases previas                            | Cambios masivos de queries y filtros             |

## 7. Plan de pruebas por fase

1. Fase 1: pruebas transaccionales y de concurrencia.
2. Fase 2: pruebas de consistencia de reportes y recalculo.
3. Fase 3: pruebas de scheduler, ventanas y deduplicacion.
4. Fase 4: pruebas de regresion completa y contratos API.
