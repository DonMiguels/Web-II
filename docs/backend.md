# Backend — Cómo funciona

Guía del framework backend del proyecto Web II: autenticación, seguridad por transacciones, Business Objects y acceso a datos.

---

## 1. Visión general

El backend es una API Express que separa dos caminos:

1. **Sesión / identidad** (`/user/*`) — login, logout, recuperación de contraseña, registro.
2. **Dispatcher de negocio** (`POST /`) — ejecuta operaciones autorizadas mediante un `transaction_id`.

La lógica de negocio no vive en controladores grandes: se organiza como **Business Objects (BO)** descubiertos dinámicamente (`subsystem → class → method`) y sincronizados con la base de datos desde `config/permission.csv`.

```
Cliente (frontend)
        │
        ├─ /user/*  ──► Session ──► DBMS ──► PostgreSQL
        │
        └─ POST /   ──► Dispatcher ──► Security ──► BO ──► DBMS ──► PostgreSQL
```

---

## 2. Arranque

Punto de entrada: `main.js` → `src/server/server.js`.

Al iniciar, el servidor:

1. Carga configuración (`config/config.js`: mensajes, queries, validaciones).
2. Sincroniza permisos desde `permission.csv` hacia la DB.
3. Carga el mapa de transacciones (`transaction_id` → subsystem/class/method).
4. Sincroniza perfiles de usuario en memoria.
5. Escucha en `PORT` (por defecto `3000`).

Variables típicas (`.env`):

| Variable | Uso |
|----------|-----|
| `PORT` | Puerto HTTP |
| `SECRET` | Firma de la cookie de sesión |
| `JWT_SECRET` | Tokens de recuperación de clave |
| `DB_*` / connection | PostgreSQL (`config/db.js`) |

---

## 3. Estructura de carpetas

```
backend/
├── main.js
├── config/
│   ├── config.js           # Config central (singleton)
│   ├── db.js               # Pool PostgreSQL
│   ├── permission.csv      # Matriz de transacciones autorizables
│   ├── queries.yaml        # Consultas nombradas
│   ├── validations.json    # Reglas de validación de campos
│   └── messages/           # i18n (es / en)
├── utils/                  # Utilidades fuera de src
│   ├── utils.js
│   ├── validator.js        # Validación de sesión/registro
│   ├── schemaValidator.js  # Validación Zod de params de queries
│   ├── formatter.js
│   ├── debugger.js
│   └── tokenizer.js        # JWT
└── src/
    ├── server/             # Express + CORS + session cookie
    ├── session/            # Auth HTTP (/user)
    ├── dispatcher/         # Entrada única de negocio (POST /)
    ├── security/           # Permisos, perfiles, execute()
    ├── dbms/               # Named queries + transacciones SQL
    ├── mailer/             # Envío de correo (recuperación)
    └── bo/
        ├── method_registry.js   # Descubre métodos disponibles
        ├── method_resolver.js   # Resuelve instancia ejecutable
        ├── sub_system/          # Inventory, Loans, Support, Security
        ├── class/               # Fachadas (Item, Loan, Person, …)
        └── method/              # Implementaciones (createLoan, …)
```

---

## 4. Autenticación y sesión (`/user`)

Rutas en `src/session/sessionRoutes.js`:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/user/register` | Registro (username, password, person_id) |
| `POST` | `/user/login` | Login → cookie de sesión |
| `POST` | `/user/logout` | Cierra sesión |
| `GET`  | `/user/me` | Usuario de la sesión actual |
| `POST` | `/user/forgot-password` | Envía enlace con JWT |
| `POST` | `/user/reset-password` | Cambia clave con token |

La sesión usa `express-session` (cookie HTTP-only). El dispatcher **exige sesión autenticada** antes de ejecutar cualquier transacción.

---

## 5. Dispatcher — ejecución de negocio

Ruta: **`POST /`**

### Body esperado

```json
{
  "transaction_id": 28,
  "profile": "admin",
  "data": {
    "borrower_user_id": 1,
    "due_at": "2026-08-01T18:00:00Z",
    "items": [{ "stock_id": 3, "quantity": 1 }]
  },
  "lang": "es"
}
```

| Campo | Rol |
|-------|-----|
| `transaction_id` | ID de la operación (viene de `permission.csv` / tabla `transaction`) |
| `profile` | Perfil con el que se autoriza (debe estar asignado al usuario) |
| `data` | Parámetros que recibe el método BO |
| `lang` | Idioma de mensajes (`es` / `en`) |

### Flujo interno

```
1. ¿Hay sesión?            → sessionWrapper.authenticate
2. ¿Viene transaction_id?  → obligatorio
3. ¿Viene profile?         → obligatorio
4. ¿El usuario tiene ese perfil? → security.hasUserProfile
5. Resolver TX             → security.resolveTransaction(txId)
                              → { sub_system, class, method }
6. ¿El perfil puede ejecutar esa ruta? → security.hasPermission
7. Ejecutar                → security.execute → BO method(data)
```

Si algo falla, se responde con mensaje/código según `config/messages`.

---

## 6. Security — el corazón del framework

`src/security/security.js` mantiene en memoria:

- **permissions**: matriz `subsystem::class::method::profile`
- **transactions**: mapa `transaction_id → { sub_system, class, method }`
- **userProfiles**: perfiles por `user_id`

### Sincronización al arrancar

1. Lee `config/permission.csv`.
2. Compara con lo ya persistido en DB.
3. Inserta lo faltante vía query `insertPermission` (crea/enlaza subsystem, class, method, profile y `transaction`).
4. Recarga rutas y perfiles.

### `permission.csv`

Formato:

```text
id;sub_system;class;method;profile
28;Loans;Loan;createLoan;admin
```

- `id` → `transaction_id` que usa el cliente.
- `sub_system` / `class` / `method` → deben existir en el código BO.
- `profile` → quién puede ejecutarlo (ej. `admin`).

> El ID `37` (`Security.Person.getPersons`) y el `1` (`createPerson`) se mantienen estables porque el frontend ya los usa.

---

## 7. Business Objects (BO)

### Jerarquía

```
sub_system/Inventory.js
    └── class Item / Stock / Location
            └── method createItem, getAllStock, …

sub_system/Loans.js
    └── class Loan
            └── method createLoan, returnLoan, …

sub_system/Support.js
    └── class Kit / Maintenance / Compensation

sub_system/Security.js
    └── class Person / User / Profile
```

### Cómo se resuelve un método

1. `method_registry` escanea `bo/sub_system/*.js` y arma un mapa de métodos existentes.
2. `method_resolver` importa el subsystem, instancia la clase y devuelve la instancia con el método.
3. `security.execute` hace `Reflect.apply(instance[method], instance, [data])`.

### Convención para agregar una operación nueva

1. Crear `src/bo/method/miOperacion.js` exportando `export const miOperacion = async function (params) { … }`.
2. Registrar el método en la clase (`src/bo/class/…`).
3. Asegurar que el subsystem exponga esa clase.
4. Agregar la query en `config/queries.yaml` (si aplica).
5. Agregar la fila en `config/permission.csv` con un `id` nuevo.
6. Reiniciar el servidor para sincronizar la TX en DB.

---

## 8. DBMS y queries nombradas

`src/dbms/dbms.js` ejecuta SQL a través de **consultas nombradas** definidas en `config/queries.yaml`:

```yaml
getItemById:
  query: SELECT … WHERE i.id = $1 …
  structure_params:
    id: int
  orderArray:
    - id
```

Uso típico desde un BO:

```js
const res = await dbms.executeNamedQuery({
  nameQuery: "getItemById",
  params: { id },
});
return res?.rows?.[0] ?? null;
```

El DBMS:

- ordena parámetros según `orderArray`,
- valida tipos con `schemaValidator` (vía `formatter`),
- soporta transacciones (`beginTransaction` / `commit` / `rollback`) para flujos compuestos.

Operaciones complejas de préstamos (`createLoan`, `returnLoan`, `cancelLoan`) usan SQL transaccional directo sobre el `client` para descontar/restaurar stock de forma atómica.

---

## 9. Dominios de negocio (BO actuales)

### Security

| TX (ej.) | Método | Descripción |
|----------|--------|-------------|
| 1 | `createPerson` | Alta de persona |
| 37 | `getPersons` | Listado de personas |
| 2–4 | Profile | Crear / asignar / buscar perfil |
| 5 | `createUser` | Alta de usuario |

### Inventory

- **Item**: CRUD + listados + catálogos (`getItemCategories`, `getItemConditions`, `getItemStatuses`)
- **Stock**: cantidad por ítem/ubicación
- **Location**: ubicaciones físicas (soft delete)

### Loans

| Método | Qué hace |
|--------|----------|
| `createLoan` | Crea préstamo + ítems; descuenta stock; marca ítem Ocupado/Asignado |
| `returnLoan` | Devolución parcial/total; restaura stock; cierra si no queda pendiente |
| `renewLoan` | Nueva fecha `due_at` |
| `cancelLoan` | Cancela y devuelve stock pendiente |
| `getLoanById` / `getAllLoans` / `getActiveLoans` / `getLoansByUser` | Consultas |

Body ejemplo `createLoan`:

```json
{
  "borrower_user_id": 2,
  "processed_by_user_id": 1,
  "due_at": "2026-08-01T18:00:00Z",
  "status": "active",
  "observations": "Práctica de lab",
  "items": [
    { "stock_id": 10, "quantity": 1 },
    { "stock_id": 14, "quantity": 5 }
  ]
}
```

Body ejemplo `returnLoan`:

```json
{
  "loan_id": 5,
  "items": [
    {
      "loan_item_id": 12,
      "returned_quantity": 1,
      "return_condition_id": 2,
      "fine": 0
    }
  ]
}
```

### Support

- **Kit** / **Kit items**: paquetes de préstamo rápido
- **Maintenance**: historial de mantenimiento
- **Compensation**: pagos/reposiciones ligados a `loan_item`

---

## 10. Modelo de datos (resumen)

### Seguridad (framework — no alterar a la ligera)

`person`, `user`, `profile`, `user_profile`, `option*`, `menu`, `subsystem`, `class`, `method`, `transaction`, `audit*`, `notification*`

### Negocio

| Concepto | Tablas |
|----------|--------|
| Catálogo | `item_category`, `item_condition`, `item_status`, `item` |
| Inventario | `location`, `stock` |
| Préstamos | `loan_status`, `loan`, `loan_item` |
| Apoyo | `kit`, `kit_item`, `maintenance`, `payment_method`, `compensation` |

Scripts SQL: `db/schema.sql` + `db/initial_data.sql`.

---

## 11. Utilidades (`backend/utils`)

| Módulo | Rol |
|--------|-----|
| `utils.js` | Errores estructurados, lectura CSV, helpers |
| `validator.js` | Validación de formularios de sesión |
| `schemaValidator.js` | Validación Zod de params de named queries |
| `formatter.js` | Objeto → arreglo ordenado de params SQL |
| `tokenizer.js` | JWT de recuperación de contraseña |
| `debugger.js` | Logs coloreados |

---

## 12. Cómo probar una transacción

1. Levantar PostgreSQL (`db/docker-compose.yml`) e importar schema + seeds.
2. `cd backend && npm install && npm run dev` (o `npm start`).
3. Login:

```bash
curl -c cookies.txt -X POST http://localhost:3000/user/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"super_admin","password":"Admin123!@#"}'
```

4. Ejecutar TX (ej. listar personas = 37):

```bash
curl -b cookies.txt -X POST http://localhost:3000/ \
  -H 'Content-Type: application/json' \
  -d '{"transaction_id":37,"profile":"admin","data":{}}'
```

---

## 13. Principios del diseño

1. **Una puerta de negocio** (`POST /`) + autorización por TX y perfil.
2. **BO declarativos**: el CSV define qué se puede llamar; el código define cómo.
3. **SQL nombrado** para CRUD; **transacciones explícitas** para flujos multi-tabla.
4. **Seguridad estable** (person/user/profile/transaction); negocio extensible sin tocar el dispatcher.
5. **Utils fuera de `src`**: helpers transversales separados del núcleo runtime.

Con eso, agregar un módulo nuevo es principalmente: método BO + query + fila en `permission.csv`.
