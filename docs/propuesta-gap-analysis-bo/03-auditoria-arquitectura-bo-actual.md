# Auditoria de Arquitectura BO Actual

## 1. Alcance de auditoria

1. Estructura backend/src/bo.
2. Registro y resolucion dinamica de metodos.
3. Cobertura de queries en backend/config/queries.yaml.
4. Coherencia con db/schema.sql.

## 2. Cobertura funcional detectada por dominio

| Dominio                    | Cobertura actual                        | Evidencia principal                        | Estado                |
| -------------------------- | --------------------------------------- | ------------------------------------------ | --------------------- |
| Inventory/Equipment        | CRUD disponible                         | BO y queries de item/estado                | Parcialmente completo |
| Components/Component       | CRUD disponible                         | BO y queries de item por categoria         | Parcialmente completo |
| Loans/Loan                 | Alta en consulta, media en flujo        | create/get/update/delete loans             | Parcial               |
| Returns/Return             | CRUD de movimiento tipo return          | create/get/update/delete return            | Parcial               |
| Notifications/Notification | CRUD disponible                         | create/get/list/update/mark read/delete    | Parcial               |
| Compensations/Compensation | CRUD disponible                         | insert/get/update/delete compensation      | Parcial               |
| Academic/AcademicPeriod    | CRUD y activos                          | create/get/list/update/delete period       | Parcialmente completo |
| Audit/Audit                | create y consultas                      | create/get/list/delete audit               | Parcial               |
| Security/\*                | Amplia cobertura de entidades y puentes | perfiles, metodos, opciones, transacciones | Parcialmente completo |
| Users/User                 | CRUD de usuario                         | create/get/list/update/delete user         | Parcialmente completo |

## 3. Brechas tecnicas por proceso de negocio

### 3.1 Prestamo

1. Se crea cabecera movement, pero falta proceso transaccional completo con movement_detail e impacto en inventario.
2. Falta control formal de colision concurrente de stock.

### 3.2 Apartado

1. Existen campos reservation_expires_at, pero no hay subsistema dedicado de reserva.
2. Falta expiracion automatica y conversion reserva a prestamo.

### 3.3 Devolucion

1. Existe createReturn, pero no formaliza cierre del prestamo origen.
2. Falta proceso integral de reposicion de stock y ajuste de estado.

### 3.4 Notificaciones

1. Solo hay CRUD de notificaciones.
2. Falta motor automatico para recordatorios y alertas por retraso.

### 3.5 Reportes

1. No hay subsistema Reports con metodos de solvencia/morosos/estadistica.
2. Falta capa de agregacion analitica por periodo.

### 3.6 Estandares de datos

1. Soft delete no es uniforme: hay entidades con delete fisico.
2. Metacampos temporales no son homogeneos en todas las entidades maestras.

## 4. Hallazgo adicional de runtime

El registro dinamico de metodos depende de runtime env inicializado. Esto debe ser considerado en scripts de inspeccion y en cualquier bootstrap alternativo para evitar fallas de inicializacion.

## 5. Conclusiones de auditoria

1. La base BO es reutilizable y robusta para evolucion incremental.
2. El gap principal es de procesos compuestos y gobierno de consistencia.
3. La solucion recomendada es agregar capa de process services sin romper convenciones actuales.
