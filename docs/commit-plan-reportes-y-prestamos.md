# Commit Plan Por Bloques

## Bloque 1 - Runtime, reglas y trazabilidad base

### Objetivo del bloque 1

Incorporar los cimientos de negocio para limite de prestamos simultaneos y devolucion parcial trazable.

### Archivos del bloque 1

- backend/config/env/runtime.js
- backend/config/env/validation-schema.base.json
- backend/config/env/validation-schema.overrides.json
- db/schema.sql
- backend/src/bo/Loans/LoanProcess/methods/createLoanWithDetails.js
- backend/src/bo/Returns/ReturnProcess/methods/registerReturn.js

### Criterios de salida del bloque 1

- Existe `MAX_ACTIVE_LOANS_GLOBAL` con default 5.
- Creacion de prestamo bloquea por mora activa y por limite con `409`.
- Devolucion parcial guarda referencia al detail origen.

## Bloque 2 - Reporte pendiente por usuario y wiring BO

### Objetivo del bloque 2

Exponer reporte jerarquico de pendientes con filtros funcionales y calculo de mora/saldo.

### Archivos del bloque 2

- backend/src/bo/Reports/Reports.js
- backend/src/bo/Reports/LoanReport/LoanReport.js
- backend/src/bo/Reports/LoanReport/methods/getPendingLoansByUser.js
- backend/src/bo/Loans/Loans.js
- backend/src/bo/Returns/Returns.js

### Criterios de salida del bloque 2

- Metodo `Reports/LoanReport/getPendingLoansByUser` disponible.
- Salida incluye `summary` + `loans[]` + `details[]` con saldo pendiente.
- Filtros por estado, fecha, tipo de item y texto funcionan.

## Bloque 3 - Seguridad, transaction_id y permisos

### Objetivo del bloque 3

Hacer operable el reporte en dispatcher con permisos por perfil y self-access para `user`.

### Archivos del bloque 3

- backend/config/permission.csv
- backend/src/dispatcher/dispatcher.js
- backend/config/queries.yaml

### Criterios de salida del bloque 3

- Permisos para `admin`, `operator` y `user` en el metodo nuevo.
- Dispatcher inyecta contexto de sesion para enforcement de self-access.
- `transaction_id` real resuelve la ruta del metodo.

## Bloque 4 - Pruebas BO y no regresion

### Objetivo del bloque 4

Cubrir nuevas reglas y mantener estabilidad del arbol BO.

### Archivos del bloque 4

- backend/testing/tests/bo-loan-report-and-limits.test.mjs
- backend/testing/tests/bo-phase1-core-processes.test.mjs
- backend/testing/tests/bo-unit-architecture.test.mjs
- backend/testing/tests/bo-contract-positive.test.mjs
- backend/testing/tests/bo-contract-negative.test.mjs

### Criterios de salida del bloque 4

- Cobertura de limite simultaneo, mora activa, devolucion parcial y reporte.
- Suites de arquitectura y contrato siguen en verde.

## Bloque 5 - HTTP E2E del dispatcher (transaction_id real)

### Objetivo del bloque 5

Validar extremo a extremo login + session + dispatcher para el nuevo reporte.

### Archivos del bloque 5

- backend/test_dispatcher_report_http.js
- backend/package.json

### Criterios de salida del bloque 5

- Test resuelve `transaction_id` real desde BD.
- Caso `admin` exitoso y caso `user` cross-user bloqueado con `403`.
- Variante `operator` exitosa sobre consulta cross-user.

## Orden sugerido de commit

1. `feat(env,loan,return): add global loan limit and partial return traceability`
2. `feat(reports): add pending loans report BO with hierarchical output`
3. `feat(security): wire dispatcher session context and report permissions`
4. `test(bo): add limits/report coverage and keep architecture contracts green`
5. `test(http): add dispatcher E2E for loan report using real transaction id`
