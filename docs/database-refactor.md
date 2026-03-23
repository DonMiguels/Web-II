# Refactor de Base de Datos - Web II (PostgreSQL)

## 1. Objetivo y alcance

Este documento describe el estado vigente del refactor de base de datos en el entorno `db-win`, alineado a:

1. `db-win/schema.sql` (estructura + constraints + comentarios + indices + triggers).
2. `db-win/initial_data.sql` (catalogos base idempotentes).

La estrategia actual mantiene una simulacion de migraciones versionadas (estilo Flyway), pero aun no separadas en archivos por version dentro de `db-win/migrations`.

## 2. Estado real de versionado

### 2.1 Ubicacion de cada version

1. `V1__Initial_Schema.sql` esta dentro de `db-win/schema.sql`.
2. `V2__Audit_Indexes.sql` esta dentro de `db-win/schema.sql`.
3. `V3__Insert_Base_Catalogs.sql` esta en `db-win/initial_data.sql`.

### 2.2 Orden correcto de ejecucion

1. Ejecutar `db-win/schema.sql` completo (incluye V1 y V2).
2. Ejecutar `db-win/initial_data.sql` (V3).

Si se invierte el orden, los `INSERT` de V3 pueden fallar por ausencia de tablas catalogo.

## 3. Cambios estructurales vigentes

### 3.1 Convenciones de nombres reservados

Se mantienen con comillas dobles por ser palabras reservadas o de alto riesgo semantico:

1. `"user"`
2. `"class"`
3. `"transaction"`
4. `"option"`
5. `"method"`

### 3.2 Normalizacion de claves de tipo

Se estandarizo `type_id` en tablas de negocio que dependen de catalogos de tipo:

1. `category.type_id`
2. `location.type_id`
3. `period.type_id`
4. `movement.type_id`
5. `return_status.type_id`
6. `audit.type_id`
7. `notification.type_id`

### 3.3 Cambios heredados del refactor

1. Tabla `user_group` eliminada.
2. Columna `person_group.user_group_id` eliminada.
3. `app_method` reemplazada por `"method"`.
4. Relaciones actualizadas a `method_id` en `class_method`, `method_profile` y `"transaction"`.
5. `category.id_type` reemplazado por `category.type_id`.

### 3.4 Cambios estructurales recientes (trazabilidad funcional)

1. Se incorporo `group_type` y `person_group.group_id` para que la agrupacion de personas sea relacional y no ambigua.
2. Se incorporo `condition_status_type` y `item.condition_status_id` (NOT NULL, sin default) para estado operativo del item.
3. Se incorporo `payment_method_type` para normalizar metodos de compensacion.
4. Se incorporo `maintenance_log` para historial de mantenimiento independiente del flujo de prestamos.
5. Se incorporo `compensation` para registrar pagos/reposiciones por dano o perdida.
6. Se incorporaron `kit` y `kit_detail` para agrupacion de prestamos rapidos.
7. Se agregaron `created_at` y `updated_at` a `"transaction"` para compatibilidad con trigger temporal.

## 4. Dominios y validaciones de datos

En V1 se definieron dominios reutilizables para integridad semantica:

1. `email_address`: validacion de formato de correo.
2. `document_identifier`: alfanumerico con guion, longitud 5-30.
3. `phone_number`: formato telefonico flexible internacional.

Adicionalmente, el esquema usa:

1. `CHECK` para no permitir blancos en campos clave (`btrim(name) <> ''`, etc.).
2. `CHECK` de rangos y no negativos (costos, montos, multas).
3. `CHECK` de coherencia temporal (`end_date >= start_date`, devoluciones >= reservas).

## 5. Modelo de datos por dominios funcionales

### 5.1 Inventario y catalogos

Tablas principales:

1. `category_type`, `category`, `feature`, `item`, `item_feature`.
2. `location_type`, `location`, `inventory`.
3. `condition_status_type`.

Reglas relevantes:

1. Predomina `ON DELETE RESTRICT` para proteger trazabilidad historica.
2. En jerarquia de `location.parent_id` se usa `ON DELETE SET NULL`.
3. `item.condition_status_id` referencia catalogo de estado operativo (`condition_status_type`).
4. Se incorporo `is_consumable` tanto en `category` como en `item` (item puede sobrescribir criterio de categoria).

### 5.2 Periodos y movimientos

Tablas principales:

1. `period_type`, `period`.
2. `movement_type`, `movement`, `movement_detail`.
3. `return_status_type`, `return_status`.

Reglas relevantes:

1. Integridad temporal en `period` y `movement`.
2. Cantidad positiva y multa no negativa en `movement_detail`.
3. `movement.booking_date` y `movement.reservation_expires_at` son obligatorios.
4. `movement` valida ventana de reserva con `reservation_expires_at >= booking_date`.
5. `movement_detail` ahora tiene `created_at` y `updated_at` para trazabilidad fina.

### 5.3 Mantenimiento y compensaciones

Tablas principales:

1. `maintenance_log`.
2. `payment_method_type`, `compensation`.

Reglas relevantes:

1. `maintenance_log` relaciona item obligatorio y inventario opcional.
2. `maintenance_log` registra tecnico (`processed_by_user_id`), ventana temporal y costo.
3. `compensation` enlaza detalle de movimiento, prestatario, procesador y metodo de pago.
4. `compensation.amount_paid` usa control no negativo (`>= 0`).

### 5.4 Kits y prestamo rapido

Tablas principales:

1. `kit`, `kit_detail`.

Reglas relevantes:

1. `kit_detail.amount > 0`.
2. Unicidad por par (`kit_id`, `item_id`) para evitar duplicados funcionales.

### 5.5 Personas, usuarios y seguridad funcional

Tablas principales:

1. `person`, `person_group`, `"user"`.
2. `profile`, `user_profile`.
3. `"option"`, `option_profile`, `menu`, `option_menu`.
4. `subsystem`, `"class"`, `"method"`, `subsystem_class`, `class_method`, `method_profile`, `"transaction"`.

## 6. Soft delete, unicidad e identidad logica

### 6.1 Soft delete activo

`deleted_at` esta vigente en:

1. `item`
2. `person`
3. `"user"`
4. `category`
5. `location`
6. `maintenance_log`
7. `compensation`
8. `kit`

### 6.2 Indices de unicidad vigentes

1. `uq_item_code_active` sobre `item(code)` filtrado por `deleted_at IS NULL`.
2. `uq_person_document_id_lower_active` sobre `person(document_id)` filtrado por `deleted_at IS NULL`.
3. `uq_user_email_lower_active` sobre `"user"(email)` filtrado por `deleted_at IS NULL`.
4. `uq_user_name_lower_active` sobre `"user"(LOWER(name))` filtrado por `deleted_at IS NULL`.
5. `uq_profile_name_lower_active` sobre `profile(name)` (sin `deleted_at`).

Nota: por nombre, algunos indices sugieren normalizacion case-insensitive que no siempre aplica explicitamente (ejemplo: `document_id`, `email`, `profile.name` no usan `LOWER(...)` en el SQL actual).

## 7. Indices de rendimiento y trazabilidad

### 7.1 Indices FK

V2 crea indices para las FK de tablas operativas y de seguridad para mejorar joins y filtros por relacion.

Adicionalmente, se incorporaron indices FK y de soporte para:

1. `person_group.group_id`.
2. `item.condition_status_id`.
3. `maintenance_log` (`item_id`, `inventory_id`, `processed_by_user_id`).
4. `compensation` (`movement_detail_id`, `processed_by_user_id`, `borrower_user_id`, `payment_method_type_id`).
5. `kit_detail` (`kit_id`, `item_id`).

### 7.2 Indice por fecha operativo

El indice vigente en script es:

1. `ix_movement_created_at` sobre `movement(created_at)`.

No existe actualmente `ix_movement_created_date` ni indice por expresion `created_at::DATE`.

## 8. Triggers de auditoria temporal (updated_at)

Se mantiene funcion comun:

1. `set_updated_at()` en PL/pgSQL.

Y se aplican triggers dinamicamente (drop/create) en:

1. `category_type`
2. `item`
3. `inventory`
4. `group_type`
5. `person`
6. `user`
7. `movement`
8. `movement_detail`
9. `return_status`
10. `maintenance_log`
11. `compensation`
12. `kit`
13. `kit_detail`
14. `transaction`

Nota tecnica: el bloque dinamico construye el nombre del trigger como texto para evitar errores de SQL dinamico con identificadores reservados (caso `user`).

## 9. Diccionario de datos embebido

V1 incluye documentacion extensa en SQL con:

1. `COMMENT ON TABLE` para las tablas del bloque inicial.
2. `COMMENT ON COLUMN` para cada columna de esas tablas.
3. Ejemplos de caso real para facilitar entendimiento funcional.

## 10. Catalogos base (V3 en initial_data.sql)

`db-win/initial_data.sql` inserta seeds minimos con estrategia idempotente (`ON CONFLICT`) para:

1. `movement_type`
2. `period_type`
3. `audit_type`
4. `notification_type`
5. `return_status_type`
6. `condition_status_type`
7. `payment_method_type`
8. `profile`

Valores base esperados:

1. Movimientos: `loan`, `return`, `reserve`.
2. Periodos: `semester`, `trimester`, `annual`.
3. Auditoria: `security`, `business`, `system`.
4. Notificaciones: `info`, `warning`, `critical`.
5. Devoluciones: `returned_ok`, `returned_late`, `damaged`, `lost`.
6. Estados de condicion: `OPERATIONAL`, `IN_MAINTENANCE`, `DAMAGED`, `LOST`.
7. Metodos de compensacion: `cash`, `transfer`, `physical_replacement`.
8. Perfiles: `admin`, `operator`, `viewer`.

## 11. Checklist de alineacion actual

Verificado contra `db-win/schema.sql` y `db-win/initial_data.sql`:

1. `type_id` normalizado en tablas objetivo: OK.
2. Eliminacion de `user_group` y `user_group_id`: OK.
3. Uso de `"method"` en lugar de `app_method`: OK.
4. Indices FK alineados a nombres actuales: OK.
5. `person_group` con `group_id` y unicidad por par (`person_id`, `group_id`): OK.
6. `"transaction"` con `created_at` y `updated_at` (compatible con trigger): OK.
7. Trazabilidad de reservas (`booking_date` y `reservation_expires_at` obligatorios + check temporal): OK.
8. Metadatos agregados en tablas objetivo (`inventory.created_at`, `movement_detail.created_at/updated_at`, soft delete adicional): OK.
9. Entidades nuevas (`condition_status_type`, `maintenance_log`, `payment_method_type`, `compensation`, `kit`, `kit_detail`): OK.
10. Seeds nuevos en V3 para estados de condicion y metodos de compensacion: OK.
11. Triggers `updated_at` alineados a tablas con columna `updated_at`: OK.
12. Diccionario `COMMENT ON` en V1: OK.
13. V3 esta en archivo separado (`initial_data.sql`): OK.

## 12. Riesgos y observaciones tecnicas

1. Existen nombres de indices que sugieren lowercase sin aplicar `LOWER(...)` en todas las columnas (`email`, `document_id`, `profile.name`).
2. El comentario de V2 menciona "indices funcionales sobre fecha (created_at::DATE)", pero la implementacion vigente es indice simple sobre `created_at`.
3. El modelo conserva convencion "versionada" dentro de scripts manuales; aun no hay carpeta de migraciones versionadas ejecutadas por herramienta.
4. `item.condition_status_id` es NOT NULL sin default: cualquier carga directa de items requiere estado explicito.
5. `movement.booking_date` y `reservation_expires_at` son NOT NULL: procesos legacy que insertaban reservas incompletas deben ajustarse.

## 13. Recomendaciones de evolucion

1. Separar V1, V2 y V3 en archivos fisicos por version (Flyway/Liquibase), con prefijos de orden.
2. Agregar pipeline CI que valide:
   1. despliegue en base vacia,
   2. re-ejecucion idempotente,
   3. aplicacion incremental de versiones.
3. Alinear nombres de indices "lower" con su expresion real (`LOWER(...)`) o renombrarlos para evitar ambiguedad.
4. Mantener versionado del bloque de `COMMENT ON` cada vez que se agreguen o modifiquen columnas.
