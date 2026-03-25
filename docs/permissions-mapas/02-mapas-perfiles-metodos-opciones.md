# Inventario de Mapas y Estructuras en Memoria

## Índice

1. [Visión general](#visión-general)
2. [Mapas núcleo de autorización en runtime](#mapas-núcleo-de-autorización-en-runtime)
3. [Mapas/objetos de reflexión dinámica](#mapasobjetos-de-reflexión-dinámica)
4. [Mapas/objetos de sanitización](#mapasobjetos-de-sanitización)
5. [Estructuras de opciones y menús en ATX](#estructuras-de-opciones-y-menús-en-atx)
6. [Relación entre estructuras en memoria y tablas SQL](#relación-entre-estructuras-en-memoria-y-tablas-sql)
7. [Matriz de componentes y responsabilidades](#matriz-de-componentes-y-responsabilidades)
8. [Referencias](#referencias)
9. [Estado legacy y destino objetivo](#estado-legacy-y-destino-objetivo)

## Visión general

Actualmente coexisten dos universos de estructuras:

1. Runtime de autorización y ejecución:
   basado en `Map` dentro de `Security` + registro de reflexión.

2. Administración y modelado de menús/opciones/perfiles (ATX):
   basado mayormente en objetos JSON jerárquicos y apoyo de tablas relacionales.

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

- No existe cache `transactions` en `Security`.
- La resolución de `transaction_id` se realiza en ejecución dentro del flujo de autorización.

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

## Estructuras de opciones y menús en ATX

Aunque no son `Map` de JavaScript puro, sí son objetos en memoria usados como mapas semánticos.

### 8) Estructura `menus` en `parseMOP`

Forma:

```txt
menus = {
  [subsystemName]: {
    [menuName]: {
      description,
      id,
      options?: {
        [optionName]: { description, id, tx }
      },
      submenus?: {
        [submenuName]: {
          description,
          id,
          options?: {
            [optionName]: { description, id, tx }
          }
        }
      }
    }
  }
}
```

Objetos de apoyo internos en la construcción:

- `idToNode`: mapa `menu_id -> referencia de nodo` para enlazar jerarquía.
- `menuInfo`: metadata precargada de menú por id.
- `txInfo`: metadata precargada de transacción por tx (en el código actual se precarga, pero no termina de usarse para enriquecer salida final).

### 9) Estructura de entrada soportada por `setMenusOptionsProfiles` y `setMenuOptionProfile`

Se admiten dos formas:

1. Forma jerárquica por subsistema/menú/submenú/opciones (constante).
2. Forma compacta por perfil:

```txt
{ profile: { menu: [option, ...] } }
```

En ambas, se proyecta a joins SQL:

- `option_menu`
- `option_profile`
- con soporte de `tx` en opción para enlazar opción a transacción/método.

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

| Componente                       | Estructura                                          | Rol                                                                 |
| -------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| `src/security/security.js`       | `permissions`, `userProfiles` (`Map`)               | Cache en memoria para autorización runtime                          |
| `src/bo/method_registry.js`      | `mapFiles` (objeto)                                 | Catálogo de reflexión para rutas ejecutables                        |
| `src/sanitizer/sanitizer.js`     | `regexMap` (`Map`) + políticas (`objeto`)           | Control de entrada y rechazo de payload                             |
| `src/_business/atx/parse-mop.js` | `menus`, `idToNode`, `menuInfo`, `txInfo` (objetos) | Construcción jerárquica menú-opción-perfil                          |
| `src/_business/atx/set-*.js`     | objetos de forma constante/compacta                 | Persistencia y mantenimiento de joins de permisos por opción/método |

## Referencias

- [00-indice-general.md](./00-indice-general.md)
- [01-flujo-dispatcher-security.md](./01-flujo-dispatcher-security.md)
- [03-analisis-clean-architecture.md](./03-analisis-clean-architecture.md)
- [04-plan-migracion-business-a-bo.md](./04-plan-migracion-business-a-bo.md)

## Estado legacy y destino objetivo

- Todo lo listado bajo `src/_business` (atx, helpers, ftx, business.js) se clasifica como legado para efectos de evolución.
- El modelo objetivo para nuevos desarrollos y migraciones es `src/bo` con estructura `subsystem/class/method` y carpeta de métodos por clase en `src/bo/<Subsystem>/<Class>/methods`.
