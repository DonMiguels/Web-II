# Matriz de Desarrollo (Propuesta)

## 1. Convenciones de la matriz

1. Estado Nuevo: componente inexistente en BO actual.
2. Estado Modificacion: componente existente que requiere ampliar logica.
3. Metodos sugeridos mantienen estilo actual de BO.

## 2. Matriz principal

| Requerimiento | Subsistema | Clase | Metodo | Descripcion de la logica | Estado |
| --- | --- | --- | --- | --- | --- |
| Mantenimiento de equipos | Inventory | Equipment | createEquipment, updateEquipment, deleteEquipment | Reforzar validaciones de estado, categoria y unicidad por code | Modificacion |
| Mantenimiento de componentes | Components | Component | createComponent, updateComponent, deleteComponent | Reforzar reglas de categoria consumible/no consumible y stock | Modificacion |
| Prestamos | Loans | LoanProcess | createLoanWithDetails(params) | Crear movement loan + movement_detail + decremento inventory en una transaccion | Nuevo |
| Prestamos | Loans | LoanProcess | renewLoan(params) | Renovacion con reglas de mora, limite de renovaciones y periodo activo | Nuevo |
| Apartado de items | Reservations | Reservation | createReservation(params) | Crear movement reserve, bloquear disponibilidad temporal y registrar expiracion | Nuevo |
| Apartado de items | Reservations | Reservation | convertReservationToLoan(params) | Convertir reserve a loan validando vigencia y disponibilidad | Nuevo |
| Apartado de items | Reservations | Reservation | expireReservationJob(params) | Scheduler para liberar reservas vencidas | Nuevo |
| Devolucion de prestamos | Returns | ReturnProcess | registerReturn(params) | Cerrar prestamo origen, insertar detalle de retorno, reponer stock y actualizar estado | Modificacion |
| Control de estado de items | Inventory | ItemStatusFlow | transitionItemStatus(params) | Maquina de estados: available, reserved, loaned, damaged, maintenance | Nuevo |
| Compensacion por danos | Compensations | CompensationProcess | createCompensationFromDamage(params) | Calcular y registrar compensacion asociada a movement_detail y dano | Modificacion |
| Compensacion por danos | Compensations | CompensationProcess | settleCompensation(params) | Registrar pago, actualizar solvencia y trazabilidad | Nuevo |
| Recordatorio de devolucion | Notifications | NotificationScheduler | sendReturnReminderBatch(params) | Notificar prestamos proximos a vencer por ventana de tiempo | Nuevo |
| Alerta por retraso | Notifications | NotificationScheduler | sendOverdueAlertBatch(params) | Notificar prestamos vencidos sin fecha real de devolucion | Nuevo |
| Inventario de componentes | Inventory | Inventory | adjustInventory(params) | Ajuste de stock por operacion con motivo y auditoria | Modificacion |
| Inventario de equipos | Inventory | Inventory | getEquipmentInventorySnapshot(filters) | Vista consolidada de equipos por ubicacion y estado | Nuevo |
| Ubicacion de equipos | Inventory | Location | createLocation, updateLocation, deleteLocation | Validar jerarquia, evitar ciclos y aplicar baja logica | Modificacion |
| Ubicacion de componentes | Inventory | Location | moveItemBetweenLocations(params) | Transferencia controlada de stock entre ubicaciones | Nuevo |
| Reporte de solvencia | Reports | SolvencyReport | getSolvencyReport(filters) | Consolidar estado de deuda, mora y compensacion por usuario | Nuevo |
| Listado de morosos | Reports | DelinquencyReport | getDelinquentUsers(filters) | Usuarios con prestamos vencidos y/o pagos pendientes | Nuevo |
| Estadistica de prestamos | Reports | LoanStatsReport | getLoanStatistics(filters) | KPI por periodo, item, categoria, devolucion y mora | Nuevo |
| Auditoria | Audit | Audit | createAudit, getAuditByUser, getAllAudits | Mantener append-only y deshabilitar delete logico/fisico publico | Modificacion |
| Mantenimiento de seguridad | Security | SecurityBridge | authorizeProcessAction(params) | Permiso por transaccion de proceso, no solo por metodo CRUD aislado | Nuevo |
| Mantenimiento de periodo academico | Academic | AcademicPeriod | createAcademicPeriod, updateAcademicPeriod | Validar solapamiento de periodos activos y coherencia de fechas | Modificacion |

## 3. Metodos de soporte transversales

| Subsistema | Clase | Metodo | Objetivo |
| --- | --- | --- | --- |
| CrossCutting | SoftDeletePolicy | softDeleteEntity(params) | Estandarizar deleted_at en entidades maestras |
| CrossCutting | TemporalPolicy | touchUpdatedAt(params) | Garantizar updated_at coherente en modificaciones |
| CrossCutting | DomainErrorMapper | mapDomainError(err) | Estandarizar errores 400/404/409/422/500 |
| CrossCutting | AuditHook | recordDomainEvent(params) | Registrar auditoria de eventos de negocio |

## 4. Priorizacion sugerida

1. Flujo prestamo-reserva-devolucion (critico).
2. Solvencia-compensacion-reportes (critico).
3. Scheduler de notificaciones (alto).
4. Uniformidad soft delete + auditoria temporal (alto).
5. Refinamientos de seguridad y observabilidad (medio).
