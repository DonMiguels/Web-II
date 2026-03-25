# Requerimientos Explicitos e Implicitos

## 1. Requerimientos explicitos (fuente negocio)

1. Mantenimiento de equipos.
2. Mantenimiento de componentes.
3. Prestamos.
4. Apartado de componentes o equipos.
5. Devolucion de prestamos.
6. Control del estado de equipos y componentes.
7. Compensacion por danos.
8. Notificaciones: recordatorio de devolucion y alerta por retraso.
9. Inventario de componentes.
10. Inventario de equipos.
11. Mantenimiento de ubicacion de equipos.
12. Mantenimiento de ubicacion de componentes.
13. Reportes: solvencia, listado de morosos, estadistica de prestamos.
14. Auditoria.
15. Mantenimiento de seguridad.
16. Mantenimiento de periodo academico.

## 2. Requerimientos implicitos deducidos

### 2.1 Operacion y negocio

1. Validacion de disponibilidad real antes de prestar o reservar.
2. Bloqueo concurrente de stock para evitar sobreprestamo.
3. Relacion explicita entre prestamo y devolucion para cerrar ciclo.
4. Control de mora por fecha estimada vs fecha real.
5. Recalculo automatico de solvencia cuando existe mora o compensacion pendiente.
6. Restriccion de prestamo a usuarios no solventes o inactivos.

### 2.2 Datos y consistencia

1. Registro de detalle de movimiento por item y cantidad.
2. Transacciones ACID para operaciones multitabla.
3. Estandar temporal: created_at y updated_at en entidades maestras.
4. Soft delete con deleted_at para entidades maestras.
5. Politica de no hard delete en informacion historica operativa.

### 2.3 Seguridad y auditoria

1. Validacion de permisos por transaccion de negocio compuesta.
2. Registro de auditoria para acciones criticas (crear prestamo, devolver, compensar, anular).
3. Trazabilidad de actor (user_id) y momento (TIMESTAMPTZ).

### 2.4 Automatizacion y reportes

1. Scheduler de recordatorios por fecha de devolucion cercana.
2. Scheduler de alertas por prestamos vencidos.
3. Reportes por ventana temporal y filtros operativos.
4. KPI minimos: tasa de mora, tiempo promedio de devolucion, top items prestados.

## 3. Matriz de criticidad

| Requerimiento implicito | Impacto | Riesgo si no se implementa |
| --- | --- | --- |
| Bloqueo concurrente de stock | Alto | Sobreasignacion y inconsistencia de inventario |
| Relacion prestamo-devolucion | Alto | Cierre operativo ambiguo y reportes incorrectos |
| Recalculo de solvencia | Alto | Prestamos indebidos y deuda no controlada |
| Soft delete uniforme | Alto | Perdida de trazabilidad y riesgo de auditoria |
| Scheduler de alertas | Medio | Mora creciente y baja recuperacion de equipos |
| KPI de prestamos | Medio | Gestion sin visibilidad para mejora continua |

## 4. Criterio de completitud

Un requerimiento explicito se considera completamente cubierto cuando:

1. Existe BO publico para el proceso.
2. Existen validaciones de negocio necesarias.
3. Existe consistencia transaccional en DB.
4. Existe trazabilidad de auditoria.
5. Existen pruebas de contrato y flujo.
