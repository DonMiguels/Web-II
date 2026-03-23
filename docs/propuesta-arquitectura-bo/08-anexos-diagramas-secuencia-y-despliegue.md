# Anexos Visuales: Diagramas de Secuencia, Componentes y Despliegue

## Indice
1. [Objetivo](#objetivo)
2. [Diagrama E2E de autorizacion y ejecucion](#diagrama-e2e-de-autorizacion-y-ejecucion)
3. [Diagrama de flujo de prestamo-devolucion-compensacion](#diagrama-de-flujo-de-prestamo-devolucion-compensacion)
4. [Diagrama de sincronizacion de permisos](#diagrama-de-sincronizacion-de-permisos)
5. [Diagrama de despliegue logico backend](#diagrama-de-despliegue-logico-backend)
6. [Diagrama de interacciones de procesos minimos](#diagrama-de-interacciones-de-procesos-minimos)
7. [Leyenda de simbolos](#leyenda-de-simbolos)
8. [Referencias](#referencias)

## Objetivo
Aportar vistas visuales que aceleren comprension del flujo de informacion, dependencias de componentes y oportunidades de optimizacion.

## Diagrama E2E de autorizacion y ejecucion
```mermaid
sequenceDiagram
  participant Client
  participant Router as DispatcherRoute
  participant San as Sanitizer
  participant Disp as DispatchOrchestrator
  participant Auth as AuthorizationService
  participant Tx as TransactionRouteService
  participant Exec as ExecutionGateway
  participant BO as BO Class Method

  Client->>Router: POST / {transaction_id, profile, data}
  Router->>San: sanitizePayload
  alt Rejected
    San-->>Router: rejected response
    Router-->>Client: 400
  else Accepted
    Router->>Disp: dispatchTransaction
    Disp->>Auth: validateSessionAndProfile
    Auth-->>Disp: authorized user context
    Disp->>Tx: resolveRoute(transaction_id)
    Tx-->>Disp: subsystem/class/method
    Disp->>Auth: authorizeTransaction(route, profile)
    alt Denied
      Auth-->>Disp: NotAuthorizedError
      Disp-->>Router: 403
      Router-->>Client: 403
    else Allowed
      Disp->>Exec: resolveExecutable(route)
      Exec->>BO: invoke(method, data)
      BO-->>Exec: result
      Exec-->>Disp: success
      Disp-->>Router: 200 result
      Router-->>Client: 200
    end
  end
```

## Diagrama de flujo de prestamo-devolucion-compensacion
```mermaid
flowchart TD
  A[Solicitud Prestamo] --> B{Stock disponible}
  B -- No --> X[Rechazo por disponibilidad]
  B -- Si --> C{Usuario solvente}
  C -- No --> Y[Rechazo por solvencia]
  C -- Si --> D[Crear Movement y MovementDetail]
  D --> E[Estado Active]
  E --> F[Registrar devolucion]
  F --> G{Clasificacion retorno}
  G -- ReturnedOk --> H[Cerrar movimiento]
  G -- ReturnedLate --> I[Calcular multa]
  G -- Damaged/Lost --> J[Crear compensacion]
  I --> K[Actualizar solvencia]
  J --> K
  K --> L[Estado Settled]
```

## Diagrama de sincronizacion de permisos
```mermaid
flowchart LR
  A[permission.csv] --> B[PermissionSyncService]
  C[(DB method_profile/class_method/subsystem_class)] --> B
  B --> D[Merge idempotente]
  D --> E[Actualizar transaction]
  E --> F[Refrescar caches permissions/userProfiles/transactions]
  F --> G[AuthorizationService listo]
```

## Diagrama de despliegue logico backend
```mermaid
flowchart LR
  U[Cliente Web] --> API[Node Backend]
  API --> SAN[Sanitizer]
  API --> AUTH[Security and Dispatcher]
  AUTH --> BO[BO subsystem/class/method]
  BO --> DB[(PostgreSQL)]
  BO --> AUD[Audit Service]
  BO --> NOTI[Notification Queue/Service]
  API --> LOG[Structured Logger]
```

## Diagrama de interacciones de procesos minimos
```mermaid
flowchart TB
  INV[Inventario y Ubicaciones] --> PRE[Prestamos y Apartados]
  PRE --> DEV[Devoluciones]
  DEV --> COM[Compensacion]
  PRE --> NOT[Notificaciones]
  DEV --> NOT
  PRE --> REP[Reportes]
  COM --> REP
  PRE --> AUD[Auditoria]
  DEV --> AUD
  MNT[Mantenimiento] --> INV
  SEC[Seguridad] --> PRE
  SEC --> MNT
  PER[Periodo Academico] --> PRE
  PER --> REP
```

## Leyenda de simbolos
1. Rectangulo: servicio o componente.
2. Rombo: decision de negocio.
3. Cilindro: persistencia.
4. Flecha: flujo de dependencia o datos.

## Referencias
1. [00-indice-general.md](./00-indice-general.md)
2. [03-arquitectura-objetivo-clean.md](./03-arquitectura-objetivo-clean.md)
3. [04-subsistemas-clases-metodos.md](./04-subsistemas-clases-metodos.md)
4. [05-estados-internos-y-privacidad.md](./05-estados-internos-y-privacidad.md)
