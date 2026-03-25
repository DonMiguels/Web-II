# Diseno de Datos y Reglas Transversales

## 1. Objetivo

Establecer lineamientos tecnicos obligatorios para asegurar consistencia de datos, trazabilidad y compatibilidad con PostgreSQL bajo 3NF y transacciones ACID.

## 2. Reglas de modelado

### 2.1 Nomenclatura

1. Entidades core en singular y nombre simple: user, transaction, class, option, item, movement.
2. Metodos de BO en verbo + entidad: createLoan, registerReturn, settleCompensation.
3. Evitar alias ambiguos en contratos publicos.

### 2.2 Auditoria temporal

1. Entidades maestras deben incluir created_at TIMESTAMPTZ NOT NULL DEFAULT NOW().
2. Entidades maestras deben incluir updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW().
3. En cada UPDATE de negocio debe aplicarse updated_at = NOW().

### 2.3 Soft delete

1. Entidades maestras deben incluir deleted_at TIMESTAMPTZ NULL.
2. Eliminar registros maestros solo via UPDATE deleted_at = NOW().
3. Queries de lectura funcional deben filtrar deleted_at IS NULL cuando corresponda.

## 3. Reglas ACID por proceso

| Proceso                  | Tablas minimas afectadas                            | Regla transaccional                                    |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------------ |
| createLoanWithDetails    | movement, movement_detail, inventory, item          | Todo o nada; rollback completo ante stock insuficiente |
| convertReservationToLoan | movement, movement_detail, inventory                | Conversion atomica reserve->loan                       |
| registerReturn           | movement, movement_detail, inventory, return_status | Cierre de ciclo con reposicion atomica                 |
| settleCompensation       | compensation, user, audit                           | Pago + solvencia + auditoria en una transaccion        |

## 4. Indices recomendados

| Tabla        | Indice recomendado                                    | Razon                                       |
| ------------ | ----------------------------------------------------- | ------------------------------------------- |
| movement     | (type_id, user_id, booking_date DESC)                 | Consultas de prestamos por usuario y tiempo |
| movement     | (actual_return_date) WHERE actual_return_date IS NULL | Prestamos activos y alertas de mora         |
| inventory    | (item_id, location_id) UNIQUE                         | Integridad de stock por ubicacion           |
| compensation | (borrower_user_id, payment_date DESC)                 | Reportes por usuario                        |
| notification | (user_id, is_read, sent_at DESC)                      | Bandeja de notificaciones                   |
| user         | (deleted_at) WHERE deleted_at IS NULL                 | Filtro de usuarios activos logicos          |

## 5. Politica de integridad 3NF

1. Catalogos separados por tipo: movement_type, notification_type, payment_method_type, return_status_type.
2. Relaciones N:M resueltas con tablas puente: user_profile, method_profile, option_menu, class_method.
3. No duplicar atributos derivados en cabeceras de movimiento.
4. Mantener informacion historica en tablas de hechos (movement, movement_detail, compensation, audit).

## 6. Cambios DB sugeridos (sin ruptura)

1. Sustituir deletes fisicos por soft delete donde aplique en entidades maestras.
2. Normalizar metacampos temporales en tablas que aun no los tengan y sean maestras.
3. Crear vistas SQL para reportes de solvencia, morosos y KPIs de prestamos.
4. Asegurar foreign keys con ON DELETE RESTRICT en historial operativo.

## 7. Contrato de errores de datos

| Codigo | Caso                     | Ejemplo                                               |
| ------ | ------------------------ | ----------------------------------------------------- |
| 409    | Conflicto de stock       | No hay disponibilidad para el item solicitado         |
| 409    | Duplicado funcional      | Ya existe reserva activa para el mismo item y usuario |
| 422    | Regla temporal invalida  | Fecha de devolucion menor a fecha de prestamo         |
| 422    | Regla academica invalida | Periodo inactivo para registrar movimiento            |
