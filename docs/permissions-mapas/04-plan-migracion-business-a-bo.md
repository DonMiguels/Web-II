# Plan de Migración (Cerrado): src/\_business (legacy) -> src/bo (subsystem/class/method)

## Estado actual

- Migración a BO completada.
- Runtime operativo en modo BO-only.
- Carpeta `src/_business` removida del repositorio activo.
- Permisos y rutas de transacción normalizados a naming canónico BO.

## Índice

1. [Objetivo](#objetivo)
2. [Principios de arquitectura definidos](#principios-de-arquitectura-definidos)
3. [Modelo objetivo en bo](#modelo-objetivo-en-bo)
4. [Reglas para métodos por clase](#reglas-para-métodos-por-clase)
5. [Estrategia de migración sin downtime lógico](#estrategia-de-migración-sin-downtime-lógico)
6. [Mapa de transformación \_business -> bo](#mapa-de-transformación-_business---bo)
7. [Fases detalladas de ejecución](#fases-detalladas-de-ejecución)
8. [Contratos mínimos de compatibilidad](#contratos-mínimos-de-compatibilidad)
9. [Plan de pruebas y validación](#plan-de-pruebas-y-validación)
10. [Riesgos y mitigaciones](#riesgos-y-mitigaciones)
11. [Checklist operativo](#checklist-operativo)
12. [Referencias](#referencias)

## Objetivo

Este plan documentó la migración del ecosistema legacy de `src/_business` al esquema objetivo de `src/bo`, asegurando:

- organización por `subsystem -> class -> method`,
- separación de responsabilidades,
- desacople entre infraestructura y lógica de dominio,
- migración controlada hasta retiro completo del legacy.

## Principios de arquitectura definidos

1. `subsystem` es una clase contenedora de clases de dominio.
2. Cada `class` representa una unidad funcional coherente del dominio.
3. Los métodos deben vivir preferentemente dentro de su clase.
4. Solo los métodos compartidos y stateless van a carpeta `method`.
5. Ningún método de carpeta `method` guarda estado de ejecución.
6. El estado y contexto de proceso los gestiona la clase/entidad que invoca.

## Modelo objetivo en bo

Estructura base esperada:

```txt
src/bo/
   Security/
      Security.js
      Person/Person.js
      Profile/Profile.js
      ...
   Inventory/
      Inventory.js
      Equipment/Equipment.js
      Equipment/methods/*.js
      ...
   Loans/
      Loans.js
      Loan/Loan.js
      Loan/methods/*.js
      ...
  method_registry.js
  method_resolver.js
```

Rol de cada nivel:

- `subsystem`: orquesta y registra clases del subsistema.
- `class`: implementa casos de uso y gobierna estado/contexto de flujo.
- `methods` por clase: funciones operativas del agregado en `src/bo/<Subsystem>/<Class>/methods`.

## Reglas para métodos por clase

Cada método de negocio debe vivir en `src/bo/<Subsystem>/<Class>/methods` y responder al agregado de su clase.

Checklist:

- No almacena estado en propiedades globales o singleton mutable.
- Recibe datos por parámetros.
- Encapsula acceso a query nombrada y manejo de error coherente.

## Estrategia de migración sin downtime lógico

Estrategia aplicada: estrangulamiento progresivo (strangler pattern), con cierre final BO-only.

1. Se ejecutó migración incremental por lotes de rutas críticas.
2. Se consolidó resolución dinámica en BO.
3. Se migró naming legacy de clases/métodos a canónico BO.
4. Se retiraron fallbacks y referencias runtime a legacy.
5. Se removió `src/_business` tras validación de pruebas.

## Mapa de transformación \_business -> bo

### Transformación por carpetas

| Origen legacy           | Destino objetivo                                                  | Acción                                                             |
| ----------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `_business/ftx`         | `bo/<Subsystem>/<Subsystem>.js + bo/<Subsystem>/<Class>`          | Convertir fachada funcional en clases de dominio por subsistema    |
| `_business/atx`         | `bo/<Subsystem>/<Class>/methods`                                  | Reubicar casos de uso por agregado y método                        |
| `_business/helpers`     | `bo/<Subsystem>/<Class>/methods` o utilitarios de infraestructura | Clasificar helper por naturaleza de dominio vs infraestructura     |
| `_business/business.js` | `bo/method_registry.js` y `bo/method_resolver.js`                 | Retirar mapeo por nombres legacy y consolidar registro canónico BO |

### Transformación por comportamiento

1. `get-method.js` y `execute-method.js` legacy:
   migrar a un gateway de ejecución centrado en `bo/method_resolver.js`.

2. Operaciones ATX de permisos/opciones:
   convertir en clases de servicio por agregado (`Profile`, `Option`, `Menu`, `Permission`) dentro de `bo/<Subsystem>/<Class>`.

3. Helpers transaccionales:
   separar entre:
   - infraestructura transaccional,
   - funciones de dominio stateless reutilizables.

## Fases detalladas de ejecución

### Fase 0: Preparación y baseline

1. Congelar contratos actuales de entrada/salida en dispatcher y seguridad.
2. Listar transacciones activas (`transaction_id -> subsystem/class/method`).
3. Crear matriz de equivalencia legacy-nuevo por caso de uso.

Entregables:

- inventario de métodos legacy en uso real,
- matriz de rutas autorizadas y perfiles afectados.

### Fase 1: Infraestructura de convivencia

1. Introducir capa de compatibilidad:
   - resolver primero en `bo`,
   - fallback temporal a legacy solo para casos no migrados.
2. Agregar flags de migración por caso de uso.
3. Instrumentar logs comparativos de resultado legacy vs nuevo en modo shadow.

Entregables:

- adapter de compatibilidad,
- trazas de equivalencia funcional.

### Fase 2: Migración de dominio central de permisos

1. Migrar casos de permisos por método (`method_profile`) a clases `bo/<Subsystem>/<Class>`.
2. Migrar casos de opciones/perfiles (`option_profile`, `option_menu`) a clases `bo/<Subsystem>/<Class>`.
3. Extraer funciones de apoyo al directorio `methods` de cada clase.

Entregables:

- clases de dominio en `bo` con cobertura de pruebas,
- catálogo de métodos compartidos aprobados.

### Fase 3: Corte de ejecución por lotes

1. Activar rutas migradas en producción de forma incremental.
2. Monitorear diferencias de resultados y errores por lote.
3. Corregir desalineaciones antes de ampliar cobertura.

Entregables:

- porcentaje de cobertura migrada por módulo,
- reporte de incidentes y correcciones.

### Fase 4: Retiro de legacy (completada)

1. Fallback a `_business` eliminado.
2. Archivos legacy retirados del runtime y del repositorio activo.
3. Documentación actualizada al estado BO-only.

Entregables:

- `src/_business` removido,
- arquitectura BO como único runtime de negocio.

## Contratos mínimos de compatibilidad

Durante la convivencia (fase histórica), cada caso de uso migrado debía mantener:

1. Mismo contrato de entrada (payload).
2. Mismo contrato de salida (shape y códigos).
3. Mismo comportamiento de autorización por perfil/permiso.
4. Mismo efecto en persistencia (tablas y joins).

## Plan de pruebas y validación

### Pruebas de equivalencia funcional

1. Sesión no autenticada.
2. Perfil no asignado.
3. `transaction_id` inexistente.
4. Permiso denegado por `method_profile`.
5. Permiso autorizado y ejecución exitosa.
6. Casos de opción con `tx` asociado.

### Pruebas de integridad de mapeos

1. Coherencia `transaction -> subsystem/class/method`.
2. Coherencia `method_profile` vs `option_profile` para opciones con `tx`.
3. Coherencia de naming de columnas y joins.

### Pruebas de no regresión

1. Endpoints críticos de dispatcher.
2. Sincronización de caches (`permissions`, `userProfiles`).
3. Resolución dinámica en `method_registry`.

## Riesgos y mitigaciones

1. Riesgo: divergencia funcional entre legacy y bo.
   Mitigación: shadow mode + comparación de salidas + corte gradual.

2. Riesgo: mover métodos con estado a carpeta compartida.
   Mitigación: checklist estricto de stateless + code review específico.

3. Riesgo: ruptura por contratos implícitos legacy.
   Mitigación: contract tests y adaptadores temporales.

4. Riesgo: inconsistencia de nomenclatura SQL.
   Mitigación: estandarizar diccionario de columnas y migraciones controladas.

## Checklist operativo

1. Completado: clasificación y migración de componentes de `_business`.
2. Completado: consolidación del runtime en BO-only.
3. Completado: migración de permisos/métodos de alta frecuencia.
4. Completado: ejecución de pruebas de validación por lotes.
5. Completado: corte de fallback legacy.
6. Completado: retiro de `_business` del runtime activo.

## Referencias

- [00-indice-general.md](./00-indice-general.md)
- [01-flujo-dispatcher-security.md](./01-flujo-dispatcher-security.md)
- [02-mapas-perfiles-metodos-opciones.md](./02-mapas-perfiles-metodos-opciones.md)
- [03-analisis-clean-architecture.md](./03-analisis-clean-architecture.md)
