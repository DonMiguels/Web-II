# Inventario de Mapas y Estructuras en Memoria

## Índice

1. [Visión general](#visión-general)
2. [Mapas núcleo de autorización en runtime](#mapas-núcleo-de-autorización-en-runtime)
3. [Mapas/objetos de reflexión dinámica](#mapasobjetos-de-reflexión-dinámica)
4. [Mapas/objetos de sanitización](#mapasobjetos-de-sanitización)
5. [Estructuras de opciones y menús](#estructuras-de-opciones-y-menús)
6. [Relación entre estructuras en memoria y tablas SQL](#relación-entre-estructuras-en-memoria-y-tablas-sql)
7. [Matriz de componentes y responsabilidades](#matriz-de-componentes-y-responsabilidades)
8. [Referencias](#referencias)
9. [Estado actual](#estado-actual)

## Visión general

El runtime actual está consolidado en BO-only:

1. Autorización y ejecución en `Security` usando `Map` en memoria.
2. Resolución dinámica en `method_registry` + `method_resolver`.
3. Persistencia de permisos/rutas/opciones en tablas relacionales.

## Mapas núcleo de autorización en runtime

### 1) `Security.permissions`

Tipo:

- `Map<string, PermissionNormalized>`

Clave:

- `subsystem::class::method::profile` (todo en minúsculas)

Valor:

```ts
{
  subsystem: string,
  class: string,
  method: string,
  profile: string,
  parameter?: unknown
}
```

Origen y carga:

- CSV: `config/permission.csv`.
- DB: query `getPermissions`.
- `syncPermissions()` inserta en DB los faltantes del CSV y luego deja `this.permissions = new Map(dbPermissions)`.

Uso principal:

- `hasPermission(permission)`.

### 2) `Security.userProfiles`

Tipo:

- `Map<string, Set<string>>`

Clave:

- `userId` normalizado a minúsculas.

Valor:

- `Set` de perfiles del usuario en minúsculas.

Origen y carga:

- Query `getUsersProfiles`.
- Construcción en `syncUserProfiles()`.

Uso principal:

- `hasUserProfile(userId, profile)`.

### 3) Resolución de transacción en ejecución

Estado actual:

- Existe cache `transactionRoutes` en `Security`.
- Se sincroniza con query `getTransactionRoutes`.
- `resolveTransaction(transactionId)` devuelve `{ subsystem, class, method }` desde ese cache.

## Mapas/objetos de reflexión dinámica

### 4) `Method_registry.mapFiles`

Tipo:

- Objeto anidado (no `Map`).

Forma:

```txt
{
  [subSystemName: string]: {
    [className: string]: {
      [methodName: string]: true
    }
  }
}
```

Origen:

- Inspección dinámica de subsistemas `src/bo/<Subsystem>/<Subsystem>.js`.
- Instanciación de clases para descubrir métodos registrados en propiedades.

Uso:

- Validar ruta solicitada con `hasMethod` antes de importar/ejecutar.

Observación:

- `hasMethod` usa búsqueda case-insensitive (`findKeyIgnoreCase`).

### 5) `Dispatcher` y construcción de permiso temporal

No es un mapa persistente, pero es objeto clave de autorización:

```ts
permission = {
  ...permissionRouteFromTransaction,
  profile: profileFromRequest,
};
```

Ese objeto enlaza:

- transacción resuelta,
- perfil declarado en request,
- verificación en `permissions`.

## Mapas/objetos de sanitización

### 6) `regexMap` en `createSanitizer`

Tipo:

- `Map<string, { key, pattern, flags, mode, compiled: RegExp, ... }>`

Origen:

- `sanitize-regex.js`.

Uso:

- validación por reglas deny/detect,
- detección de campos sensibles,
- decisiones de rechazo o redacción.

### 7) `routeMaps` y políticas de sanitización

Tipo:

- Objeto de configuración (`sanitize-rules.js`).

Ruta de dispatcher:

- `dispatcher.root` existe con `fields` vacío y `forceIncludePaths` vacío.

Implicación:

- al dispatcher le aplican reglas globales y política general, no una whitelist estricta por campo.

## Estructuras de opciones y menús

El flujo vigente usa persistencia relacional y métodos BO de `Security`; no hay estructura jerárquica ATX activa en runtime.

### 8) Estructura relacional de opciones y menús

Forma:

```txt
option_profile (option_id, profile_id)
option_menu (menu_id, option_id)
option (id, name, tx, ...)
menu (id, name, id_parent, ...)
```

Uso:

- Consultas por joins para resolver opciones por perfil/menú.
- Enlace de `option.tx` con transacción autorizable del dispatcher.

### 9) Estructura de entrada de autorización

Estructura canónica usada por autorización/ejecución:

```txt
{
  subsystem: string,
  class: string,
  method: string,
  profile: string
}
```

Se utiliza para:

- `hasUserProfile(userId, profile)`.
- `hasPermission(permission)`.
- `execute(permission, reqBody)`.

## Relación entre estructuras en memoria y tablas SQL

### Permisos por método

Join principal:

- `method_profile`

Ruta completa de permisos en query `getPermissions`:

- `method_profile -> method -> class_method -> class -> subsystem_class -> subsystem -> profile`

### Perfiles de usuario

Join principal:

- `user_profile`

### Opciones por perfil

Join principal:

- `option_profile`

### Opciones por menú

Join principal:

- `option_menu`

### Transacción a método

Tabla principal:

- `transaction`

En runtime del dispatcher, `transaction_id` se resuelve en ejecución durante el flujo de autorización.

## Matriz de componentes y responsabilidades

| Componente                   | Estructura                                | Rol                                                         |
| ---------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| `src/security/security.js`   | `permissions`, `userProfiles` (`Map`)     | Cache en memoria para autorización runtime                  |
| `src/bo/method_registry.js`  | `mapFiles` (objeto)                       | Catálogo de reflexión para rutas ejecutables                |
| `src/sanitizer/sanitizer.js` | `regexMap` (`Map`) + políticas (`objeto`) | Control de entrada y rechazo de payload                     |
| `src/bo/Security/*/methods`  | funciones stateless por agregado          | Persistencia y mantenimiento de permisos/rutas en modelo BO |

## Referencias

- [00-indice-general.md](./00-indice-general.md)
- [01-flujo-dispatcher-security.md](./01-flujo-dispatcher-security.md)
- [03-analisis-clean-architecture.md](./03-analisis-clean-architecture.md)
- [04-plan-migracion-business-a-bo.md](./04-plan-migracion-business-a-bo.md)

## Estado actual

- `src/_business` fue retirado del runtime y del repositorio activo.
- El modelo vigente para negocio es `src/bo` con estructura `subsystem/class/method` y carpeta de métodos por clase en `src/bo/<Subsystem>/<Class>/methods`.
