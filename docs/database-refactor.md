# Refactor de Base de Datos - Web II (PostgreSQL)

## Resumen Ejecutivo

Este documento refleja el estado actual de [db-win/schema.sql](db-win/schema.sql).

El script esta organizado en tres bloques versionados:

1. V1__Initial_Schema.sql
2. V2__Audit_Indexes.sql
3. V3__Insert_Base_Catalogs.sql

Los cambios clave vigentes son:

1. Normalizacion de claves de catalogo a `type_id`.
2. Eliminacion de tabla `user_group` y del campo `user_group_id` en `person_group`.
3. Renombre de `app_method` a tabla `"method"`.
4. Renombre de `category.id_type` a `category.type_id`.
5. Comentarios de diccionario de datos con `COMMENT ON TABLE` y `COMMENT ON COLUMN` para cada tabla/campo de V1.

## Cambios Estructurales Vigentes

### 1) Nombres reservados y consistencia

Se mantienen con comillas dobles:

1. `"user"`
2. `"class"`
3. `"transaction"`
4. `"option"`
5. `"method"`

### 2) Normalizacion de campos de tipo

Se estandarizo `type_id` en tablas de negocio que dependen de catalogos de tipo:

1. `category.type_id`
2. `location.type_id`
3. `period.type_id`
4. `movement.type_id`
5. `return_status.type_id`
6. `audit.type_id`
7. `notification.type_id`

Tambien se actualizaron los indices FK para estos nombres.

### 3) Cambios de tablas/columnas relevantes

1. `user_group` fue eliminada.
2. `person_group` ahora solo conserva `id` y `person_id` (sin `user_group_id`).
3. `app_method` fue reemplazada por `"method"`.
4. Relaciones asociadas usan `method_id` en `class_method`, `method_profile` y `"transaction"`.

### 4) Fechas operativas y triggers

1. La funcion `set_updated_at()` se conserva.
2. Los triggers de `updated_at` se aplican solo a tablas que aun tienen ese campo:
	`category_type`, `item`, `inventory`, `person`, `user`, `movement`, `return_status`, `transaction`.

### 5) Indices funcionales actuales

Actualmente solo se mantiene este indice funcional por fecha:

1. `ix_movement_created_date` sobre `movement((created_at::DATE))`.

### 6) Soft delete y unicidad

Soft delete (`deleted_at`) vigente en:

1. `item`
2. `person`
3. `"user"`

Indices de unicidad case-insensitive actuales:

1. `uq_item_code_active` (filtrado por `deleted_at IS NULL`)
2. `uq_person_document_id_lower_active` (filtrado por `deleted_at IS NULL`)
3. `uq_user_email_lower_active` (filtrado por `deleted_at IS NULL`)
4. `uq_user_name_lower_active` (filtrado por `deleted_at IS NULL`)
5. `uq_profile_name_lower_active` (sin filtro por `deleted_at`)

## Catalogos Base (V3)

Se mantienen seeds idempotentes (`ON CONFLICT`) para:

1. `movement_type`
2. `period_type`
3. `audit_type`
4. `notification_type`
5. `return_status_type`
6. `profile`

## Diccionario de Datos en el Esquema

V1 incluye documentacion embebida con:

1. `COMMENT ON TABLE` para todas las tablas de V1.
2. `COMMENT ON COLUMN` para todos los campos de V1.

Incluye ejemplos de caso real y ejemplos de nombres para tablas de tipo (por ejemplo en `period_type.name`).

## Estado de Alineacion

Checklist actualizado contra [db-win/schema.sql](db-win/schema.sql):

1. `type_id` normalizado en tablas objetivo: OK.
2. `user_group` y `user_group_id` removidos: OK.
3. `"method"` reemplaza `app_method`: OK.
4. Indices FK actualizados a los nuevos nombres: OK.
5. Documentacion por tabla/campo en SQL: OK.

## Recomendaciones de Evolucion

1. Dividir V1, V2 y V3 en archivos fisicos de migracion para Flyway/Liquibase.
2. Agregar pruebas de migracion en CI para validar esquema en limpio y re-ejecucion idempotente.
3. Mantener versionado del bloque de `COMMENT ON` cuando se agreguen nuevas columnas.
