# Matriz y Plan Final Candidato (Post-Decisiones 26-03-2026)

## 1. Estado de aprobaciones

Aprobadas: Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8.

## 2. Matriz final candidata de implementacion

| Prioridad | Requerimiento                          | Subsistema       | Clase                       | Metodo/Componente                              | Resultado esperado                                                |
| --------- | -------------------------------------- | ---------------- | --------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| P0        | DomainError obligatorio en 100% BO     | CrossCutting     | DomainErrorPolicy           | enforcement + refactor de throws legacy        | Contrato uniforme 422/404/409/500 en toda la capa BO              |
| P0        | Actor obligatorio en jobs batch        | Notifications    | NotificationScheduler       | sendReturnReminderBatch, sendOverdueAlertBatch | processed_by_user_id obligatorio y validado                       |
| P0        | Auditoria obligatoria de scheduler     | Notifications    | NotificationScheduler       | sendReturnReminderBatch, sendOverdueAlertBatch | Registro auditable por ejecucion con metricas de lote             |
| P0        | Ownership reportes en middleware       | Security         | SecurityBridge + Dispatcher | authorizeProcessAction + tests contrato        | No validacion duplicada en BO de reportes y seguridad consistente |
| P0        | Users canonico, Security replica       | Users + Security | User/SecurityUser           | sync policy + pruebas                          | Cero divergencia funcional de identidad y perfiles                |
| P1        | FSM formal de estados de item          | Inventory        | ItemStatusFlow              | transitionItemStatus + policy map              | Transiciones validas y bloqueos de transiciones invalidas         |
| P1        | Politica de multiples periodos activos | Academic         | AcademicPeriod              | createAcademicPeriod/updateAcademicPeriod      | Validacion alineada a multiples activos sin romper integridad     |
| P1        | Gobernanza rutas legacy Loan/Return    | Loans + Returns  | Loan/Return                 | create/update/delete legacy + consultas        | Transicion de 30 dias y bloqueo final en favor de Process-first   |
| P2        | Cobertura de pruebas de hardening      | Testing          | tests/bo + tests/dispatcher | suites nuevas/extendidas                       | Evidencia automatizada de cumplimiento de decisiones              |

## 3. Plan de implementacion candidato

## 3.1 Fase A - Hardening transversal (P0)

1. Normalizar DomainError en CompensationProcess y rutas scheduler.
2. Exigir processed_by_user_id en NotificationScheduler.
3. Registrar auditoria obligatoria en ambos jobs de notificaciones.
4. Blindar contrato de ownership de reportes en pruebas middleware->dispatcher->BO.

## 3.2 Fase B - Modelo canonico y estados (P1)

1. Definir y codificar flujo Users canonico -> Security replica.
2. Implementar FSM ItemStatusFlow con transiciones aprobadas.
3. Ajustar AcademicPeriod para permitir multiples activos.

## 3.3 Fase C - Gobernanza de rutas legacy (P1)

1. Mantener rutas legacy de Loans/Loan y Returns/Return por ventana formal de 30 dias.
2. Ajustar permission.csv y pruebas para plan de retiro controlado.
3. Bloquear rutas legacy al cierre de la ventana y consolidar Process-first.

## 3.4 Fase D - Cierre de calidad (P2)

1. Extender pruebas para scheduler con actor/auditoria.
2. Extender pruebas de contrato Users->Security replica.
3. Ejecutar baseline completo: governance + test:bo + session sanitizer.

## 4. Criterios de salida finales

1. 100% de metodos BO alineados a domainError.
2. 100% de jobs batch con actor y auditoria obligatoria.
3. Ownership de reportes validado solo en middleware con pruebas de contrato.
4. Politica Q4 aplicada en todas las rutas legacy de Loan/Return.
5. Baseline de pruebas en verde y matriz de trazabilidad actualizada.

## 5. Dependencias de cierre

1. Ejecucion disciplinada de la ventana de transicion de 30 dias de Q4.
2. Provision operativa del actor tecnico batch inyectado por scheduler externo.
