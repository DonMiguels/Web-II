# Matriz Trazable Requerimiento -> Metodo BO -> Query -> Test

Fecha: 26-03-2026
Estado: baseline inicial para cierre de Fase 4

## 1. Objetivo

Relacionar requerimientos (explicitos e implicitos) con evidencia tecnica ejecutable:

1. Metodo BO publico.
2. Query principal.
3. Prueba automatizada asociada.

## 2. Matriz baseline

| Req                                     | Tipo                         | Metodo BO principal                                                 | Query principal                                                 | Prueba/Evidencia                                                   | Estado           |
| --------------------------------------- | ---------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------- |
| Prestamos (02.1, 02.2.1)                | Explicito                    | Loans/LoanProcess/createLoanWithDetails                             | createLoanWithDetails                                           | backend/testing/tests/bo/bo-phase1-core-processes.test.mjs         | Cubierto         |
| Renovacion de prestamos                 | Explicito                    | Loans/LoanProcess/renewLoan                                         | renewLoan                                                       | backend/testing/tests/bo/bo-phase1-core-processes.test.mjs         | Cubierto         |
| Apartado de equipos/componentes         | Explicito                    | Reservations/Reservation/createReservation                          | createReservationWithDetails                                    | backend/testing/tests/bo/bo-phase1-core-processes.test.mjs         | Cubierto         |
| Conversion reserva -> prestamo          | Implicito (cierre operativo) | Reservations/Reservation/convertReservationToLoan                   | convertReservationToLoan                                        | backend/testing/tests/bo/bo-phase1-concurrency-e2e.test.mjs        | Cubierto         |
| Devolucion de prestamos                 | Explicito                    | Returns/ReturnProcess/registerReturn                                | registerReturnMovement                                          | backend/testing/tests/bo/bo-phase1-returnprocess-closure.test.mjs  | Cubierto         |
| Bloqueo concurrente de stock            | Implicito critico            | Loans/LoanProcess/createLoanWithDetails + ReservationProcess        | lockInventoryForLoan, lockInventoryForReservation               | backend/testing/tests/bo/bo-phase1-concurrency-e2e.test.mjs        | Cubierto         |
| Compensacion por danos                  | Explicito                    | Compensations/CompensationProcess/createCompensationFromDamage      | createCompensationFromDamage                                    | backend/testing/tests/bo/bo-phase2-solvency-comp-reports.test.mjs  | Cubierto         |
| Recalculo de solvencia                  | Implicito critico            | Compensations/CompensationProcess/settleCompensation                | settleCompensationAndRecalcSolvency                             | backend/testing/tests/bo/bo-phase2-solvency-comp-reports.test.mjs  | Cubierto         |
| Reporte de solvencia                    | Explicito                    | Reports/SolvencyReport/getSolvencyReport                            | getSolvencyReportByFilters                                      | backend/testing/tests/bo/bo-phase2-solvency-comp-reports.test.mjs  | Cubierto         |
| Reporte de morosos                      | Explicito                    | Reports/DelinquencyReport/getDelinquentUsers                        | getDelinquentUsersByFilters                                     | backend/testing/tests/bo/bo-phase2-solvency-comp-reports.test.mjs  | Cubierto         |
| Estadistica de prestamos                | Explicito                    | Reports/LoanStatsReport/getLoanStatistics                           | getLoanStatsByPeriod                                            | backend/testing/tests/bo/bo-phase2-solvency-comp-reports.test.mjs  | Cubierto         |
| Recordatorios de devolucion             | Explicito                    | Notifications/NotificationScheduler/sendReturnReminderBatch         | getLoansDueSoonForReminder, insertNotificationDedup             | backend/testing/tests/bo/bo-phase3-notification-scheduler.test.mjs | Cubierto         |
| Alertas por retraso                     | Explicito                    | Notifications/NotificationScheduler/sendOverdueAlertBatch           | getOverdueLoansForAlert, insertNotificationDedup                | backend/testing/tests/bo/bo-phase3-notification-scheduler.test.mjs | Cubierto         |
| Politica de no hard-delete historico    | Implicito critico            | deleteLoan/deleteReturn/deleteNotification/deleteAudit (bloqueo BO) | deleteLoan, deleteReturn, deleteNotification, deleteAudit       | backend/testing/tests/bo/bo-phase4-governance.test.mjs             | Cubierto         |
| Soft-delete uniforme en maestras        | Implicito critico            | deleteComponent/deleteInventory/deleteAcademicPeriod                | deleteComponent, deleteInventory, deleteAcademicPeriod          | backend/testing/tests/bo/bo-phase4-governance.test.mjs             | Parcial avanzado |
| Gobierno de DELETE residual en catalogo | Implicito critico            | Enforcements de Fase 4                                              | whitelist en backend/testing/utils/phase4-governance-config.mjs | npm run test:bo:governance                                         | Cubierto tecnico |
| Sanitizacion de credenciales de sesion  | Seguridad implicita          | session.login/register/resetPassword                                | reglas en config/sanitizer/sanitize-rules.js                    | backend/testing/tests/session/test_session_sanitizer.js            | Cubierto         |

## 3. Cobertura legacy al 100% (rutas heredadas)

Se registro el inventario completo de rutas legacy activas de compatibilidad en `backend/config/queries.yaml`.

Total rutas legacy identificadas: 81.

### 3.1 Seguridad relacional legacy (5)

1. delUserProfile, delProfileOption, delMenuOption, delProfileMethod, delClassMethod.

### 3.2 Inventario legacy - Equipo (6)

1. insertEquipo, getEquipoById, getEquipoByCodigo, getAllEquipos, updateEquipo, deleteEquipo.

### 3.3 Inventario legacy - Ubicacion (6)

1. insertUbicacion, getUbicacionById, getUbicacionByNombre, getAllUbicaciones, updateUbicacion, deleteUbicacion.

### 3.4 Inventario legacy - Estado de equipo (6)

1. insertEstadoEquipo, getEstadoEquipoById, getEstadoEquipoByNombre, getAllEstadosEquipo, updateEstadoEquipo, deleteEstadoEquipo.

### 3.5 Prestamos legacy (8)

1. insertPrestamo, getPrestamoById, getPrestamosByUsuario, getPrestamosByEquipo, getAllPrestamos, getPrestamosActivos, updatePrestamo, deletePrestamo.

### 3.6 Usuarios legacy (6)

1. insertUsuario, getUsuarioById, getUsuarioByEmail, getAllUsuarios, updateUsuario, deleteUsuario.

### 3.7 Componentes legacy (7)

1. insertComponente, getComponenteById, getComponenteByCodigo, getAllComponentes, getComponentesByCategoria, updateComponente, deleteComponente.

### 3.8 Devoluciones legacy (6)

1. insertDevolucion, getDevolucionById, getDevolucionesByUsuario, getAllDevoluciones, updateDevolucion, deleteDevolucion.

### 3.9 Inventario legacy - stock (7)

1. insertInventario, getInventarioById, getInventarioByUbicacion, getInventarioByItem, getAllInventario, updateInventario, deleteInventario.

### 3.10 Compensaciones legacy (6)

1. insertCompensacion, getCompensacionById, getCompensacionesByUsuario, getAllCompensaciones, updateCompensacion, deleteCompensacion.

### 3.11 Notificaciones legacy (7)

1. insertNotificacion, getNotificacionById, getNotificacionesByUsuario, getAllNotificaciones, updateNotificacion, markNotificacionAsRead, deleteNotificacion.

### 3.12 Auditoria legacy (5)

1. insertAuditoria, getAuditoriaById, getAuditoriaByUsuario, getAllAuditorias, deleteAuditoria.

### 3.13 Periodo academico legacy (6)

1. insertPeriodoAcademico, getPeriodoAcademicoById, getAllPeriodosAcademicos, getPeriodosAcademicosActivos, updatePeriodoAcademico, deletePeriodoAcademico.

## 4. Estado de cobertura para rutas legacy

1. Inventario completo documentado: 100% de las rutas legacy detectadas en queries.
2. Gobernanza hard-delete/soft-delete sobre rutas legacy criticas: validada por `npm run test:bo:governance`.
3. Cobertura de contratos funcionales: mantenida por `APP_ENV=test npm run test:bo`.

## 5. Brechas residuales

1. Persisten rutas legacy con hard-delete residual en catalogo de compatibilidad (controladas por whitelist tecnica, pendiente validacion institucional).
2. Se requiere continuar migracion funcional legacy -> canonico por dominio para reducir superficie de compatibilidad.
3. Se requiere version institucional aprobada de esta matriz para cierre formal de Fase 4.

## 6. Uso recomendado en PR y release

1. Todo cambio BO debe actualizar esta matriz cuando afecte metodo publico, query o prueba.
2. Ningun cierre de fase debe declararse sin evidencia de prueba enlazada por requerimiento critico.
3. En CI, ejecutar al menos:
   - npm run test:bo:governance
   - APP_ENV=test npm run test:bo
   - npm run test:session-sanitizer
