# Arquitectura Objetivo y Flujos

## 1. Objetivo arquitectonico

Evolucionar la arquitectura BO actual hacia una organizacion por procesos de negocio compuestos, preservando el dispatcher y el estilo subsystem/class/method, pero separando:

1. Capa de entrada y seguridad.
2. Casos de uso transaccionales.
3. Politicas de dominio.
4. Persistencia y adaptadores.

## 2. Diagrama de componentes

```mermaid
flowchart LR
  A[Dispatcher Route] --> B[Security Gate]
  B --> C[Method Resolver]
  C --> D[BO Process Service]
  D --> E[Domain Policy]
  D --> F[Repository Query Adapter]
  D --> G[Audit Hook]
  D --> H[Notification Scheduler/Queue]
  F --> I[(PostgreSQL)]
```

## 3. Flujos criticos

### 3.1 Flujo prestamo completo

```mermaid
sequenceDiagram
  participant U as Usuario
  participant API as Dispatcher
  participant L as LoanProcess
  participant DB as PostgreSQL

  U->>API: createLoanWithDetails
  API->>L: validar permiso + payload
  L->>DB: BEGIN
  L->>DB: verificar solvencia y stock FOR UPDATE
  L->>DB: insertar movement tipo loan
  L->>DB: insertar movement_detail
  L->>DB: descontar inventory
  L->>DB: registrar audit
  L->>DB: COMMIT
  L-->>API: loan_id y resumen
  API-->>U: 200 OK
```

### 3.2 Flujo apartado y expiracion

```mermaid
sequenceDiagram
  participant U as Usuario
  participant R as Reservation
  participant J as ExpireReservationJob
  participant DB as PostgreSQL

  U->>R: createReservation
  R->>DB: crear movement tipo reserve
  R->>DB: bloquear disponibilidad temporal
  J->>DB: buscar reservas vencidas
  J->>DB: liberar bloqueos y marcar expirada
  J->>DB: registrar audit y notificacion
```

### 3.3 Flujo devolucion y compensacion

```mermaid
sequenceDiagram
  participant U as Usuario
  participant RT as ReturnProcess
  participant CP as CompensationProcess
  participant DB as PostgreSQL

  U->>RT: registerReturn
  RT->>DB: BEGIN
  RT->>DB: cerrar movement loan
  RT->>DB: insertar movimiento/estado de devolucion
  RT->>DB: reponer stock inventory
  RT->>DB: evaluar dano o mora
  alt requiere compensacion
    RT->>CP: createCompensationFromDamage
    CP->>DB: insertar compensation
  end
  RT->>DB: recalcular solvencia user
  RT->>DB: COMMIT
```

## 4. Estructura objetivo en BO

```txt
backend/src/bo/
  Loans/
    LoanProcess/
      LoanProcess.js
      methods/
        createLoanWithDetails.js
        renewLoan.js
  Reservations/
    Reservation/
      Reservation.js
      methods/
        createReservation.js
        convertReservationToLoan.js
        cancelReservation.js
    ReservationJob/
      ReservationJob.js
      methods/
        expireReservationJob.js
  Returns/
    ReturnProcess/
      ReturnProcess.js
      methods/
        registerReturn.js
  Reports/
    SolvencyReport/
    DelinquencyReport/
    LoanStatsReport/
```

## 5. Contratos de entrada recomendados

### 5.1 createLoanWithDetails

```json
{
  "user_id": 101,
  "period_id": 20261,
  "booking_date": "2026-04-01T10:00:00Z",
  "estimated_return_date": "2026-04-08T10:00:00Z",
  "observations": "Prestamo de practicas",
  "details": [
    { "inventory_id": 9001, "amount": 1 }
  ]
}
```

### 5.2 registerReturn

```json
{
  "loan_id": 345,
  "user_id": 101,
  "return_date": "2026-04-08T09:40:00Z",
  "details": [
    {
      "movement_detail_id": 780,
      "returned_amount": 1,
      "condition_status_id": 1,
      "observations": "Sin danos"
    }
  ]
}
```

## 6. Regla de compatibilidad

La propuesta mantiene el dispatcher y method resolver actuales. Los nuevos BO se integran por el mismo contrato subsystem/class/method para minimizar riesgos de migracion.
