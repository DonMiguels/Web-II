# Implementación de Business Objects - Web II Backend

## 1. Objetivo y alcance

Este documento describe la implementación de Business Objects (BO) en el backend de Web II, extendiendo el sistema existente con nuevas entidades de dominio de negocio.

## 2. Arquitectura de Business Objects

### 2.1 Estructura de directorios

```
backend/src/bo/
├── Security/
│   ├── Security.js
│   ├── Person/Person.js
│   └── Profile/Profile.js
├── Inventory/
│   ├── Inventory.js
│   ├── Equipment/Equipment.js
│   ├── Location/Location.js
│   └── EquipmentStatus/EquipmentStatus.js
├── Loans/
│   ├── Loans.js
│   └── Loan/Loan.js
├── ... (Academic, Audit, Components, Compensations, Notifications, Returns, Users)
├── method_registry.js
└── method_resolver.js
```

### 2.2 Patrón de implementación

Cada Business Object sigue el patrón establecido:

1. **Subsystem**: Punto de entrada por dominio (`<Subsystem>/<Subsystem>.js`)
2. **Class**: Entidad principal por agregado (`<Subsystem>/<Class>/<Class>.js`)
3. **Methods**: Funciones exportadas en `<Subsystem>/<Class>/methods/*.js` que usan `DBMS.executeNamedQuery()`
3. **Named Queries**: Consultas SQL en `config/queries.yaml` con validación
4. **Resolver**: Resolución dinámica vía `method_registry.js` y `method_resolver.js`

## 3. Business Objects Implementados

### 3.1 Equipment (Inventory)

**Propósito**: Gestión de equipos del inventario

**Queries implementadas**:
- `insertEquipment`: Crear nuevo equipo
- `getEquipmentById`: Obtener equipo por ID
- `getEquipmentByCode`: Obtener equipo por código
- `getAllEquipment`: Listar todos los equipos
- `updateEquipment`: Actualizar equipo existente
- `deleteEquipment`: Eliminar equipo

**Estructura de datos**:
```javascript
{
  codigo: string,           // Código único del equipo
  nombre: string,           // Nombre descriptivo
  marca: string,            // Marca del equipo
  modelo: string,           // Modelo del equipo
  serie: string,            // Número de serie
  descripcion: string,      // Descripción detallada
  ubicacion_id: int,       // FK a ubicación
  estado_id: int,          // FK a estado del equipo
  fecha_adquisicion: string, // Fecha de adquisición
  costo: float             // Costo del equipo
}
```

**Relaciones**:
- `ubicacion_id` → `ubicacion.id`
- `estado_id` → `estado_equipo.id`

### 3.2 Location (Inventory)

**Propósito**: Gestión de ubicaciones físicas

**Queries implementadas**:
- `insertLocation`: Crear nueva ubicación
- `getLocationById`: Obtener ubicación por ID
- `getLocationByName`: Obtener ubicación por nombre
- `getAllLocations`: Listar todas las ubicaciones
- `updateLocation`: Actualizar ubicación existente
- `deleteLocation`: Eliminar ubicación

**Estructura de datos**:
```javascript
{
  nombre: string,      // Nombre de la ubicación
  descripcion: string, // Descripción detallada
  edificio: string,    // Edificio o planta
  piso: string,        // Piso o nivel
  sala: string         // Sala o área específica
}
```

### 3.3 EquipmentStatus (Inventory)

**Propósito**: Catálogo de estados operativos de equipos

**Queries implementadas**:
- `insertEquipmentStatus`: Crear nuevo estado
- `getEquipmentStatusById`: Obtener estado por ID
- `getEquipmentStatusByName`: Obtener estado por nombre
- `getAllEquipmentStatuses`: Listar todos los estados
- `updateEquipmentStatus`: Actualizar estado existente
- `deleteEquipmentStatus`: Eliminar estado

**Estructura de datos**:
```javascript
{
  nombre: string,      // Nombre del estado (ej: OPERATIONAL, DAMAGED)
  descripcion: string  // Descripción del estado
}
```

### 3.4 Loan (Loans)

**Propósito**: Gestión de préstamos de equipos

**Queries implementadas**:
- `insertLoan`: Crear nuevo préstamo
- `getLoanById`: Obtener préstamo por ID
- `getLoansByUser`: Préstamos por usuario
- `getLoansByEquipment`: Préstamos por equipo
- `getAllLoans`: Listar todos los préstamos
- `getActiveLoans`: Préstamos actualmente activos
- `updateLoan`: Actualizar préstamo (devolución)
- `deleteLoan`: Eliminar préstamo

**Estructura de datos**:
```javascript
{
  usuario_id: int,                    // FK a person
  equipo_id: int,                     // FK a equipo
  fecha_prestamo: string,             // Fecha de préstamo
  fecha_devolucion_esperada: string,    // Fecha esperada de devolución
  fecha_devolucion_real: string,        // Fecha real de devolución
  observaciones: string                 // Observaciones del préstamo
}
```

**Relaciones**:
- `usuario_id` → `person.id`
- `equipo_id` → `equipo.id`

## 4. Integración con Sistema Existente

### 4.1 Registro de Subsistemas

Los subsistemas se registran automáticamente en `method_registry.js`:

```javascript
// src/bo/Inventory/Inventory.js
export class Inventory {
    constructor() {
    this.Equipment = Equipment;
    this.Location = Location;
    this.EquipmentStatus = EquipmentStatus;
    }
}

// src/bo/Loans/Loans.js
export class Loans {
    constructor() {
    this.Loan = Loan;
    }
}
```

### 4.2 Convenciones de Nombres

**Entidades/Clases**: PascalCase en inglés (Equipment, Location, EquipmentStatus, Loan)
**Métodos**: Inglés (createEquipment, getEquipmentById, updateEquipment)
**Queries**: CamelCase en YAML (insertEquipment, getEquipmentById)
**Parámetros**: snake_case en SQL (usuario_id, equipo_id, fecha_prestamo)

### 4.3 Validación de Parámetros

Todas las queries usan el sistema de validación del proyecto:

```yaml
insertEquipo:
  query: 'INSERT INTO public.equipo (...) VALUES ($1, $2, ...)'
  structure_params: {
    codigo: 'string',
    nombre: 'string',
    marca: 'string',
    modelo: 'string',
    serie: 'string',
    descripcion: 'string',
    ubicacion_id: 'int',
    estado_id: 'int',
    fecha_adquisicion: 'string',
    costo: 'float'
  }
  orderArray: ['codigo', 'nombre', 'marca', 'modelo', 'serie', 'descripcion', 'ubicacion_id', 'estado_id', 'fecha_adquisicion', 'costo']
```

## 5. Queries SQL Implementadas

### 5.1 Queries de Equipo

```sql
-- Crear equipo
INSERT INTO public.equipo (codigo, nombre, marca, modelo, serie, descripcion, ubicacion_id, estado_id, fecha_adquisicion, costo) 
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
RETURNING id AS equipo_id;

-- Obtener equipo con relaciones
SELECT e.id AS equipo_id, e.codigo, e.nombre, e.marca, e.modelo, e.serie, e.descripcion, 
       e.fecha_adquisicion, e.costo, u.nombre AS ubicacion, es.nombre AS estado 
FROM public.equipo e 
LEFT JOIN public.ubicacion u ON e.ubicacion_id = u.id 
LEFT JOIN public.estado_equipo es ON e.estado_id = es.id 
WHERE e.id = $1;
```

### 5.2 Queries de Ubicación

```sql
-- Crear ubicación
INSERT INTO public.ubicacion (nombre, descripcion, edificio, piso, sala) 
VALUES ($1, $2, $3, $4, $5) 
RETURNING id AS ubicacion_id;

-- Listar ubicaciones
SELECT id AS ubicacion_id, nombre, descripcion, edificio, piso, sala 
FROM public.ubicacion 
ORDER BY nombre;
```

### 5.3 Queries de Préstamo

```sql
-- Crear préstamo
INSERT INTO public.prestamo (usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, observaciones) 
VALUES ($1, $2, $3, $4, $5) 
RETURNING id AS prestamo_id;

-- Préstamos activos (sin devolución)
SELECT p.id AS prestamo_id, p.usuario_id, p.equipo_id, p.fecha_prestamo, 
       p.fecha_devolucion_esperada, p.fecha_devolucion_real, p.observaciones, 
       u.first_name || ' ' || u.last_name AS usuario_nombre, 
       e.nombre AS equipo_nombre, e.codigo AS equipo_codigo 
FROM public.prestamo p 
LEFT JOIN public.person u ON p.usuario_id = u.id 
LEFT JOIN public.equipo e ON p.equipo_id = e.id 
WHERE p.fecha_devolucion_real IS NULL 
ORDER BY p.fecha_prestamo DESC;
```

## 6. Manejo de Errores y Validación

### 6.1 Validación en Métodos

Todos los métodos incluyen validación básica:

```javascript
export const createEquipo = async function({codigo, nombre, marca, modelo, serie, descripcion, ubicacion_id, estado_id, fecha_adquisicion, costo}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertEquipo',
            params: {
                codigo,
                nombre,
                marca,
                modelo,
                serie: serie || '',        // Default valores vacíos
                descripcion: descripcion || '',
                ubicacion_id: ubicacion_id || null,
                estado_id: estado_id || null,
                fecha_adquisicion: fecha_adquisicion || null,
                costo: costo || 0
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
```

### 6.2 Manejo de Nulos

Los métodos proporcionan valores por defecto para campos opcionales:
- Strings vacíos: `''`
- IDs opcionales: `null`
- Valores numéricos: `0`

## 7. Próximos Pasos - Objetos Pendientes

### 7.1 Business Objects Faltantes

1. **Componente** - Componentes de equipos
2. **Devolucion** - Gestión de devoluciones
3. **Apartado** - Sistema de reservas
4. **Inventario** - Control de stock
5. **Danio/Incidencia** - Registro de daños
6. **Compensacion** - Gestión de compensaciones
7. **Notificacion** - Sistema de notificaciones
8. **Auditoria** - Logs de auditoría
9. **PeriodoAcademico** - Gestión de períodos
10. **Solvencia** - Control de solvencia de usuarios

### 7.2 Relaciones por Implementar

- **Prestamo → Devolucion**: Devolución asociada a préstamo
- **Equipo → Componente**: Componentes de un equipo
- **Prestamo (late) → Solvencia**: Impacto en solvencia
- **Danio → Compensacion**: Compensación por daños
- **System → Notificacion**: Notificaciones del sistema
- **All actions → Auditoria**: Auditoría de todas las acciones

## 8. Consideraciones Técnicas

### 8.1 Compatibilidad con Sistema Existente

- Se mantiene compatibilidad con `DBMS.executeNamedQuery()`
- Se respetan las convenciones de `structure_params` y `orderArray`
- Se utiliza el mismo manejo de errores del sistema

### 8.2 Rendimiento

- Las queries incluyen `LEFT JOIN` para obtener datos relacionados
- Se usan índices implícitos en claves primarias y foráneas
- Los listados incluyen `ORDER BY` para consistencia

### 8.3 Seguridad

- Las queries usan parámetros posicionales ($1, $2, ...) para prevenir SQL Injection
- No se exponen directamente los objetos de base de datos
- Se mantiene la validación de parámetros del sistema

## 9. Testing y Validación

### 9.1 Pruebas Unitarias Sugeridas

```javascript
// Test de creación de equipo
const equipo = await createEquipo({
  codigo: 'EQ001',
  nombre: 'Laptop Dell',
  marca: 'Dell',
  modelo: 'Latitude 5420',
  serie: 'DL123456',
  descripcion: 'Laptop para desarrollo',
  ubicacion_id: 1,
  estado_id: 1,
  fecha_adquisicion: '2024-01-15',
  costo: 1200.00
});

// Test de préstamos activos
const activos = await getPrestamosActivos();
console.log('Préstamos activos:', activos);
```

### 9.2 Validación de Integración

1. Verificar que los subsistemas se registren correctamente
2. Probar las queries con diferentes parámetros
3. Validar las relaciones entre tablas
4. Comprobar el manejo de errores

## 10. Conclusiones

La implementación de Business Objects sigue las mejores prácticas del proyecto:

✅ **Consistencia**: Se mantienen las convenciones existentes
✅ **Extensibilidad**: El sistema permite agregar nuevos BOs fácilmente
✅ **Mantenibilidad**: Código modular y bien documentado
✅ **Integridad**: Validación de parámetros y manejo de errores
✅ **Performance**: Queries optimizadas con joins apropiados

Los nuevos Business Objects están listos para ser utilizados a través del dispatcher del sistema, manteniendo la arquitectura limpia y escalable del proyecto.
