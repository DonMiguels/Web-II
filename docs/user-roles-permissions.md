# ANALISIS DE ROLES DE USUARIO Y PERMISOS

## FASE 1: ANALISIS DE TRANSACCIONES

### Todos los IDs de Transacción Extraídos del Sistema:

**MODULO DE SEGURIDAD (4 transacciones)**
- `createPerson` - Crear registro de persona
- `createProfile` - Crear perfil de permisos
- `assignProfileToUser` - Asignar perfil a usuario
- `getProfileByName` - Obtener perfil por nombre

**MODULO DE INVENTARIO (22 transacciones)**
- `createEquipo` - Crear equipo
- `getEquipoById` - Obtener equipo por ID
- `getEquipoByCodigo` - Obtener equipo por código
- `getAllEquipos` - Obtener todos los equipos
- `updateEquipo` - Actualizar equipo
- `deleteEquipo` - Eliminar equipo
- `createUbicacion` - Crear ubicación
- `getUbicacionById` - Obtener ubicación por ID
- `getUbicacionByNombre` - Obtener ubicación por nombre
- `getAllUbicaciones` - Obtener todas las ubicaciones
- `updateUbicacion` - Actualizar ubicación
- `deleteUbicacion` - Eliminar ubicación
- `createEstadoEquipo` - Crear estado de equipo
- `getEstadoEquipoById` - Obtener estado de equipo por ID
- `getEstadoEquipoByNombre` - Obtener estado de equipo por nombre
- `getAllEstadosEquipo` - Obtener todos los estados de equipo
- `updateEstadoEquipo` - Actualizar estado de equipo
- `deleteEstadoEquipo` - Eliminar estado de equipo
- `createInventario` - Crear registro de inventario
- `getInventarioById` - Obtener inventario por ID
- `getInventarioByUbicacion` - Obtener inventario por ubicación
- `getInventarioByItem` - Obtener inventario por ítem
- `getAllInventario` - Obtener todo el inventario
- `updateInventario` - Actualizar inventario
- `deleteInventario` - Eliminar inventario

**MODULO DE PRESTAMOS (8 transacciones)**
- `createPrestamo` - Crear préstamo
- `getPrestamoById` - Obtener préstamo por ID
- `getPrestamosByUsuario` - Obtener préstamos por usuario
- `getPrestamosByEquipo` - Obtener préstamos por equipo
- `getAllPrestamos` - Obtener todos los préstamos
- `getPrestamosActivos` - Obtener préstamos activos
- `updatePrestamo` - Actualizar préstamo
- `deletePrestamo` - Eliminar préstamo

**MODULO DE USUARIOS (6 transacciones)**
- `createUsuario` - Crear usuario
- `getUsuarioById` - Obtener usuario por ID
- `getUsuarioByEmail` - Obtener usuario por email
- `getAllUsuarios` - Obtener todos los usuarios
- `updateUsuario` - Actualizar usuario
- `deleteUsuario` - Eliminar usuario

**MODULO DE COMPONENTES (7 transacciones)**
- `createComponente` - Crear componente
- `getComponenteById` - Obtener componente por ID
- `getComponenteByCodigo` - Obtener componente por código
- `getAllComponentes` - Obtener todos los componentes
- `getComponentesByCategoria` - Obtener componentes por categoría
- `updateComponente` - Actualizar componente
- `deleteComponente` - Eliminar componente

**MODULO DEVOLUCIONES (6 transacciones)**
- `createDevolucion` - Crear devolución
- `getDevolucionById` - Obtener devolución por ID
- `getDevolucionesByUsuario` - Obtener devoluciones por usuario
- `getAllDevoluciones` - Obtener todas las devoluciones
- `updateDevolucion` - Actualizar devolución
- `deleteDevolucion` - Eliminar devolución

**MODULO DE COMPENSACIONES (6 transacciones)**
- `createCompensacion` - Crear compensación
- `getCompensacionById` - Obtener compensación por ID
- `getCompensacionesByUsuario` - Obtener compensaciones por usuario
- `getAllCompensaciones` - Obtener todas las compensaciones
- `updateCompensacion` - Actualizar compensación
- `deleteCompensacion` - Eliminar compensación

**MODULO DE NOTIFICACIONES (8 transacciones)**
- `createNotificacion` - Crear notificación
- `getNotificacionById` - Obtener notificación por ID
- `getNotificacionesByUsuario` - Obtener notificaciones por usuario
- `getAllNotificaciones` - Obtener todas las notificaciones
- `markNotificacionAsRead` - Marcar notificación como leída
- `updateNotificacion` - Actualizar notificación
- `deleteNotificacion` - Eliminar notificación

**MODULO DE AUDITORIA (5 transacciones)**
- `createAuditoria` - Crear registro de auditoría
- `getAuditoriaById` - Obtener auditoría por ID
- `getAuditoriaByUsuario` - Obtener auditorías por usuario
- `getAllAuditorias` - Obtener todas las auditorías
- `deleteAuditoria` - Eliminar auditoría

**MODULO ACADEMICO (6 transacciones)**
- `createPeriodoAcademico` - Crear período académico
- `getPeriodoAcademicoById` - Obtener período académico por ID
- `getAllPeriodosAcademicos` - Obtener todos los períodos académicos
- `getPeriodosAcademicosActivos` - Obtener períodos académicos activos
- `updatePeriodoAcademico` - Actualizar período académico
- `deletePeriodoAcademico` - Eliminar período académico

**TOTAL: 80 transacciones**

## FASE 2: DEFINICION DE ROLES

### super_admin
**Responsabilidades:**
- Administración completa del sistema
- Gestión de usuarios y perfiles
- Configuración del sistema
- Supervisión de auditoría
- Operaciones de emergencia del sistema

**Alcance del Sistema:**
- Acceso completo a todos los módulos y transacciones
- Puede crear y gestionar todos los roles de usuario
- Capacidades de supervisión general del sistema

### admin
**Responsabilidades:**
- Administración diaria del sistema
- Gestión de cuentas de usuario
- Supervisión de inventario
- Gestión de préstamos
- Configuración básica del sistema

**Alcance del Sistema:**
- Acceso a todos los módulos operativos
- No puede gestionar otros usuarios admin
- Configuración limitada del sistema

### inventory_manager
**Responsabilidades:**
- Gestión de equipos y componentes
- Control de ubicaciones e inventario
- Gestión de estados de equipo
- Monitoreo de niveles de stock

**Alcance del Sistema:**
- Acceso completo al módulo de inventario
- Gestión del ciclo de vida de equipos
- Gestión de ubicaciones y almacenes

### loan_officer
**Responsabilidades:**
- Procesamiento y gestión de préstamos
- Procesamiento de devoluciones
- Gestión de compensaciones
- Acceso al historial de préstamos de usuarios

**Alcance del Sistema:**
- Operaciones completas de préstamos
- Procesamiento de devoluciones
- Manejo de compensaciones
- Acceso limitado a información de usuarios

### academic_coordinator
**Responsabilidades:**
- Gestión de períodos académicos
- Coordinación de préstamos estudiantiles
- Reportes académicos
- Programación de períodos

**Alcance del Sistema:**
- Acceso al módulo académico
- Visualización de préstamos para fines académicos
- Capacidades de reporte

### user
**Responsabilidades:**
- Gestión de información personal
- Solicitudes y devoluciones de préstamos propios
- Notificaciones personales
- Operaciones básicas de cuenta

**Alcance del Sistema:**
- Operaciones de autoservicio
- Acceso a datos personales
- Interacción limitada con el sistema

## FASE 3: ASIGNACION DE PERMISOS

### Matriz de Permisos por Rol:

#### super_admin
| Módulo | Transacción | Acción | Permitido |
|--------|-------------|--------|-----------|
| Security | createPerson | Crear Persona | Sí |
| Security | createProfile | Crear Perfil | Sí |
| Security | assignProfileToUser | Asignar Perfil a Usuario | Sí |
| Security | getProfileByName | Obtener Perfil por Nombre | Sí |
| Inventory | createEquipo | Crear Equipo | Sí |
| Inventory | getEquipoById | Obtener Equipo por ID | Sí |
| Inventory | getEquipoByCodigo | Obtener Equipo por Código | Sí |
| Inventory | getAllEquipos | Obtener Todos los Equipos | Sí |
| Inventory | updateEquipo | Actualizar Equipo | Sí |
| Inventory | deleteEquipo | Eliminar Equipo | Sí |
| Inventory | createUbicacion | Crear Ubicación | Sí |
| Inventory | getUbicacionById | Obtener Ubicación por ID | Sí |
| Inventory | getUbicacionByNombre | Obtener Ubicación por Nombre | Sí |
| Inventory | getAllUbicaciones | Obtener Todas las Ubicaciones | Sí |
| Inventory | updateUbicacion | Actualizar Ubicación | Sí |
| Inventory | deleteUbicacion | Eliminar Ubicación | Sí |
| Inventory | createEstadoEquipo | Crear Estado de Equipo | Sí |
| Inventory | getEstadoEquipoById | Obtener Estado de Equipo por ID | Sí |
| Inventory | getEstadoEquipoByNombre | Obtener Estado de Equipo por Nombre | Sí |
| Inventory | getAllEstadosEquipo | Obtener Todos los Estados de Equipo | Sí |
| Inventory | updateEstadoEquipo | Actualizar Estado de Equipo | Sí |
| Inventory | deleteEstadoEquipo | Eliminar Estado de Equipo | Sí |
| Inventory | createInventario | Crear Registro de Inventario | Sí |
| Inventory | getInventarioById | Obtener Inventario por ID | Sí |
| Inventory | getInventarioByUbicacion | Obtener Inventario por Ubicación | Sí |
| Inventory | getInventarioByItem | Obtener Inventario por Ítem | Sí |
| Inventory | getAllInventario | Obtener Todo el Inventario | Sí |
| Inventory | updateInventario | Actualizar Inventario | Sí |
| Inventory | deleteInventario | Eliminar Inventario | Sí |
| Loans | createPrestamo | Crear Préstamo | Sí |
| Loans | getPrestamoById | Obtener Préstamo por ID | Sí |
| Loans | getPrestamosByUsuario | Obtener Préstamos por Usuario | Sí |
| Loans | getPrestamosByEquipo | Obtener Préstamos por Equipo | Sí |
| Loans | getAllPrestamos | Obtener Todos los Préstamos | Sí |
| Loans | getPrestamosActivos | Obtener Préstamos Activos | Sí |
| Loans | updatePrestamo | Actualizar Préstamo | Sí |
| Loans | deletePrestamo | Eliminar Préstamo | Sí |
| Users | createUsuario | Crear Usuario | Sí |
| Users | getUsuarioById | Obtener Usuario por ID | Sí |
| Users | getUsuarioByEmail | Obtener Usuario por Email | Sí |
| Users | getAllUsuarios | Obtener Todos los Usuarios | Sí |
| Users | updateUsuario | Actualizar Usuario | Sí |
| Users | deleteUsuario | Eliminar Usuario | Sí |
| Components | createComponente | Crear Componente | Sí |
| Components | getComponenteById | Obtener Componente por ID | Sí |
| Components | getComponenteByCodigo | Obtener Componente por Código | Sí |
| Components | getAllComponentes | Obtener Todos los Componentes | Sí |
| Components | getComponentesByCategoria | Obtener Componentes por Categoría | Sí |
| Components | updateComponente | Actualizar Componente | Sí |
| Components | deleteComponente | Eliminar Componente | Sí |
| Returns | createDevolucion | Crear Devolución | Sí |
| Returns | getDevolucionById | Obtener Devolución por ID | Sí |
| Returns | getDevolucionesByUsuario | Obtener Devoluciones por Usuario | Sí |
| Returns | getAllDevoluciones | Obtener Todas las Devoluciones | Sí |
| Returns | updateDevolucion | Actualizar Devolución | Sí |
| Returns | deleteDevolucion | Eliminar Devolución | Sí |
| Compensations | createCompensacion | Crear Compensación | Sí |
| Compensations | getCompensacionById | Obtener Compensación por ID | Sí |
| Compensations | getCompensacionesByUsuario | Obtener Compensaciones por Usuario | Sí |
| Compensations | getAllCompensaciones | Obtener Todas las Compensaciones | Sí |
| Compensations | updateCompensacion | Actualizar Compensación | Sí |
| Compensations | deleteCompensacion | Eliminar Compensación | Sí |
| Notifications | createNotificacion | Crear Notificación | Sí |
| Notifications | getNotificacionById | Obtener Notificación por ID | Sí |
| Notifications | getNotificacionesByUsuario | Obtener Notificaciones por Usuario | Sí |
| Notifications | getAllNotificaciones | Obtener Todas las Notificaciones | Sí |
| Notifications | markNotificacionAsRead | Marcar Notificación como Leída | Sí |
| Notifications | updateNotificacion | Actualizar Notificación | Sí |
| Notifications | deleteNotificacion | Eliminar Notificación | Sí |
| Audit | createAuditoria | Crear Registro de Auditoría | Sí |
| Audit | getAuditoriaById | Obtener Auditoría por ID | Sí |
| Audit | getAuditoriaByUsuario | Obtener Auditorías por Usuario | Sí |
| Audit | getAllAuditorias | Obtener Todas las Auditorías | Sí |
| Audit | deleteAuditoria | Eliminar Auditoría | Sí |
| Academic | createPeriodoAcademico | Crear Período Académico | Sí |
| Academic | getPeriodoAcademicoById | Obtener Período Académico por ID | Sí |
| Academic | getAllPeriodosAcademicos | Obtener Todos los Períodos Académicos | Sí |
| Academic | getPeriodosAcademicosActivos | Obtener Períodos Académicos Activos | Sí |
| Academic | updatePeriodoAcademico | Actualizar Período Académico | Sí |
| Academic | deletePeriodoAcademico | Eliminar Período Académico | Sí |

#### admin
| Módulo | Transacción | Acción | Permitido |
|--------|-------------|--------|-----------|
| Security | createPerson | Crear Persona | Sí |
| Security | createProfile | Crear Perfil | No |
| Security | assignProfileToUser | Asignar Perfil a Usuario | Sí |
| Security | getProfileByName | Obtener Perfil por Nombre | Sí |
| Inventory | createEquipo | Crear Equipo | Sí |
| Inventory | getEquipoById | Obtener Equipo por ID | Sí |
| Inventory | getEquipoByCodigo | Obtener Equipo por Código | Sí |
| Inventory | getAllEquipos | Obtener Todos los Equipos | Sí |
| Inventory | updateEquipo | Actualizar Equipo | Sí |
| Inventory | deleteEquipo | Eliminar Equipo | Sí |
| Inventory | createUbicacion | Crear Ubicación | Sí |
| Inventory | getUbicacionById | Obtener Ubicación por ID | Sí |
| Inventory | getUbicacionByNombre | Obtener Ubicación por Nombre | Sí |
| Inventory | getAllUbicaciones | Obtener Todas las Ubicaciones | Sí |
| Inventory | updateUbicacion | Actualizar Ubicación | Sí |
| Inventory | deleteUbicacion | Eliminar Ubicación | Sí |
| Inventory | createEstadoEquipo | Crear Estado de Equipo | Sí |
| Inventory | getEstadoEquipoById | Obtener Estado de Equipo por ID | Sí |
| Inventory | getEstadoEquipoByNombre | Obtener Estado de Equipo por Nombre | Sí |
| Inventory | getAllEstadosEquipo | Obtener Todos los Estados de Equipo | Sí |
| Inventory | updateEstadoEquipo | Actualizar Estado de Equipo | Sí |
| Inventory | deleteEstadoEquipo | Eliminar Estado de Equipo | Sí |
| Inventory | createInventario | Crear Registro de Inventario | Sí |
| Inventory | getInventarioById | Obtener Inventario por ID | Sí |
| Inventory | getInventarioByUbicacion | Obtener Inventario por Ubicación | Sí |
| Inventory | getInventarioByItem | Obtener Inventario por Ítem | Sí |
| Inventory | getAllInventario | Obtener Todo el Inventario | Sí |
| Inventory | updateInventario | Actualizar Inventario | Sí |
| Inventory | deleteInventario | Eliminar Inventario | Sí |
| Loans | createPrestamo | Crear Préstamo | Sí |
| Loans | getPrestamoById | Obtener Préstamo por ID | Sí |
| Loans | getPrestamosByUsuario | Obtener Préstamos por Usuario | Sí |
| Loans | getPrestamosByEquipo | Obtener Préstamos por Equipo | Sí |
| Loans | getAllPrestamos | Obtener Todos los Préstamos | Sí |
| Loans | getPrestamosActivos | Obtener Préstamos Activos | Sí |
| Loans | updatePrestamo | Actualizar Préstamo | Sí |
| Loans | deletePrestamo | Eliminar Préstamo | Sí |
| Users | createUsuario | Crear Usuario | Sí |
| Users | getUsuarioById | Obtener Usuario por ID | Sí |
| Users | getUsuarioByEmail | Obtener Usuario por Email | Sí |
| Users | getAllUsuarios | Obtener Todos los Usuarios | Sí |
| Users | updateUsuario | Actualizar Usuario | Sí |
| Users | deleteUsuario | Eliminar Usuario | No |
| Components | createComponente | Crear Componente | Sí |
| Components | getComponenteById | Obtener Componente por ID | Sí |
| Components | getComponenteByCodigo | Obtener Componente por Código | Sí |
| Components | getAllComponentes | Obtener Todos los Componentes | Sí |
| Components | getComponentesByCategoria | Obtener Componentes por Categoría | Sí |
| Components | updateComponente | Actualizar Componente | Sí |
| Components | deleteComponente | Eliminar Componente | Sí |
| Returns | createDevolucion | Crear Devolución | Sí |
| Returns | getDevolucionById | Obtener Devolución por ID | Sí |
| Returns | getDevolucionesByUsuario | Obtener Devoluciones por Usuario | Sí |
| Returns | getAllDevoluciones | Obtener Todas las Devoluciones | Sí |
| Returns | updateDevolucion | Actualizar Devolución | Sí |
| Returns | deleteDevolucion | Eliminar Devolución | Sí |
| Compensations | createCompensacion | Crear Compensación | Sí |
| Compensations | getCompensacionById | Obtener Compensación por ID | Sí |
| Compensations | getCompensacionesByUsuario | Obtener Compensaciones por Usuario | Sí |
| Compensations | getAllCompensaciones | Obtener Todas las Compensaciones | Sí |
| Compensations | updateCompensacion | Actualizar Compensación | Sí |
| Compensations | deleteCompensacion | Eliminar Compensación | Sí |
| Notifications | createNotificacion | Crear Notificación | Sí |
| Notifications | getNotificacionById | Obtener Notificación por ID | Sí |
| Notifications | getNotificacionesByUsuario | Obtener Notificaciones por Usuario | Sí |
| Notifications | getAllNotificaciones | Obtener Todas las Notificaciones | Sí |
| Notifications | markNotificacionAsRead | Marcar Notificación como Leída | Sí |
| Notifications | updateNotificacion | Actualizar Notificación | Sí |
| Notifications | deleteNotificacion | Eliminar Notificación | Sí |
| Audit | createAuditoria | Crear Registro de Auditoría | Sí |
| Audit | getAuditoriaById | Obtener Auditoría por ID | Sí |
| Audit | getAuditoriaByUsuario | Obtener Auditorías por Usuario | Sí |
| Audit | getAllAuditorias | Obtener Todas las Auditorías | Sí |
| Audit | deleteAuditoria | Eliminar Auditoría | No |
| Academic | createPeriodoAcademico | Crear Período Académico | Sí |
| Academic | getPeriodoAcademicoById | Obtener Período Académico por ID | Sí |
| Academic | getAllPeriodosAcademicos | Obtener Todos los Períodos Académicos | Sí |
| Academic | getPeriodosAcademicosActivos | Obtener Períodos Académicos Activos | Sí |
| Academic | updatePeriodoAcademico | Actualizar Período Académico | Sí |
| Academic | deletePeriodoAcademico | Eliminar Período Académico | Sí |

#### inventory_manager
| Módulo | Transacción | Acción | Permitido |
|--------|-------------|--------|-----------|
| Inventory | createEquipo | Crear Equipo | Sí |
| Inventory | getEquipoById | Obtener Equipo por ID | Sí |
| Inventory | getEquipoByCodigo | Obtener Equipo por Código | Sí |
| Inventory | getAllEquipos | Obtener Todos los Equipos | Sí |
| Inventory | updateEquipo | Actualizar Equipo | Sí |
| Inventory | deleteEquipo | Eliminar Equipo | Sí |
| Inventory | createUbicacion | Crear Ubicación | Sí |
| Inventory | getUbicacionById | Obtener Ubicación por ID | Sí |
| Inventory | getUbicacionByNombre | Obtener Ubicación por Nombre | Sí |
| Inventory | getAllUbicaciones | Obtener Todas las Ubicaciones | Sí |
| Inventory | updateUbicacion | Actualizar Ubicación | Sí |
| Inventory | deleteUbicacion | Eliminar Ubicación | Sí |
| Inventory | createEstadoEquipo | Crear Estado de Equipo | Sí |
| Inventory | getEstadoEquipoById | Obtener Estado de Equipo por ID | Sí |
| Inventory | getEstadoEquipoByNombre | Obtener Estado de Equipo por Nombre | Sí |
| Inventory | getAllEstadosEquipo | Obtener Todos los Estados de Equipo | Sí |
| Inventory | updateEstadoEquipo | Actualizar Estado de Equipo | Sí |
| Inventory | deleteEstadoEquipo | Eliminar Estado de Equipo | Sí |
| Inventory | createInventario | Crear Registro de Inventario | Sí |
| Inventory | getInventarioById | Obtener Inventario por ID | Sí |
| Inventory | getInventarioByUbicacion | Obtener Inventario por Ubicación | Sí |
| Inventory | getInventarioByItem | Obtener Inventario por Ítem | Sí |
| Inventory | getAllInventario | Obtener Todo el Inventario | Sí |
| Inventory | updateInventario | Actualizar Inventario | Sí |
| Inventory | deleteInventario | Eliminar Inventario | Sí |
| Inventory | getPrestamosByEquipo | Obtener Préstamos por Equipo | Sí |
| Components | createComponente | Crear Componente | Sí |
| Components | getComponenteById | Obtener Componente por ID | Sí |
| Components | getComponenteByCodigo | Obtener Componente por Código | Sí |
| Components | getAllComponentes | Obtener Todos los Componentes | Sí |
| Components | getComponentesByCategoria | Obtener Componentes por Categoría | Sí |
| Components | updateComponente | Actualizar Componente | Sí |
| Components | deleteComponente | Eliminar Componente | Sí |

#### loan_officer
| Módulo | Transacción | Acción | Permitido |
|--------|-------------|--------|-----------|
| Inventory | getEquipoById | Obtener Equipo por ID | Sí |
| Inventory | getEquipoByCodigo | Obtener Equipo por Código | Sí |
| Inventory | getAllEquipos | Obtener Todos los Equipos | Sí |
| Inventory | getEstadoEquipoById | Obtener Estado de Equipo por ID | Sí |
| Inventory | getEstadoEquipoByNombre | Obtener Estado de Equipo por Nombre | Sí |
| Inventory | getAllEstadosEquipo | Obtener Todos los Estados de Equipo | Sí |
| Inventory | getInventarioByItem | Obtener Inventario por Ítem | Sí |
| Loans | createPrestamo | Crear Préstamo | Sí |
| Loans | getPrestamoById | Obtener Préstamo por ID | Sí |
| Loans | getPrestamosByUsuario | Obtener Préstamos por Usuario | Sí |
| Loans | getPrestamosByEquipo | Obtener Préstamos por Equipo | Sí |
| Loans | getAllPrestamos | Obtener Todos los Préstamos | Sí |
| Loans | getPrestamosActivos | Obtener Préstamos Activos | Sí |
| Loans | updatePrestamo | Actualizar Préstamo | Sí |
| Users | getUsuarioById | Obtener Usuario por ID | Sí |
| Users | getUsuarioByEmail | Obtener Usuario por Email | Sí |
| Returns | createDevolucion | Crear Devolución | Sí |
| Returns | getDevolucionById | Obtener Devolución por ID | Sí |
| Returns | getDevolucionesByUsuario | Obtener Devoluciones por Usuario | Sí |
| Returns | getAllDevoluciones | Obtener Todas las Devoluciones | Sí |
| Returns | updateDevolucion | Actualizar Devolución | Sí |
| Compensations | createCompensacion | Crear Compensación | Sí |
| Compensations | getCompensacionById | Obtener Compensación por ID | Sí |
| Compensations | getCompensacionesByUsuario | Obtener Compensaciones por Usuario | Sí |
| Compensations | getAllCompensaciones | Obtener Todas las Compensaciones | Sí |
| Compensations | updateCompensacion | Actualizar Compensación | Sí |
| Notifications | createNotificacion | Crear Notificación | Sí |
| Notifications | getNotificacionById | Obtener Notificación por ID | Sí |
| Notifications | getNotificacionesByUsuario | Obtener Notificaciones por Usuario | Sí |
| Notifications | markNotificacionAsRead | Marcar Notificación como Leída | Sí |
| Notifications | updateNotificacion | Actualizar Notificación | Sí |

#### academic_coordinator
| Módulo | Transacción | Acción | Permitido |
|--------|-------------|--------|-----------|
| Loans | getAllPrestamos | Obtener Todos los Préstamos | Sí |
| Loans | getPrestamosActivos | Obtener Préstamos Activos | Sí |
| Returns | getAllDevoluciones | Obtener Todas las Devoluciones | Sí |
| Notifications | createNotificacion | Crear Notificación | Sí |
| Notifications | getNotificacionById | Obtener Notificación por ID | Sí |
| Notifications | getNotificacionesByUsuario | Obtener Notificaciones por Usuario | Sí |
| Notifications | markNotificacionAsRead | Marcar Notificación como Leída | Sí |
| Notifications | updateNotificacion | Actualizar Notificación | Sí |
| Academic | createPeriodoAcademico | Crear Período Académico | Sí |
| Academic | getPeriodoAcademicoById | Obtener Período Académico por ID | Sí |
| Academic | getAllPeriodosAcademicos | Obtener Todos los Períodos Académicos | Sí |
| Academic | getPeriodosAcademicosActivos | Obtener Períodos Académicos Activos | Sí |
| Academic | updatePeriodoAcademico | Actualizar Período Académico | Sí |

#### user
| Módulo | Transacción | Acción | Permitido |
|--------|-------------|--------|-----------|
| Loans | getPrestamosByUsuario | Obtener Préstamos por Usuario | Sí |
| Users | updateUsuario | Actualizar Usuario | Sí |
| Returns | getDevolucionesByUsuario | Obtener Devoluciones por Usuario | Sí |
| Compensations | getCompensacionesByUsuario | Obtener Compensaciones por Usuario | Sí |
| Notifications | getNotificacionesByUsuario | Obtener Notificaciones por Usuario | Sí |
| Notifications | markNotificacionAsRead | Marcar Notificación como Leída | Sí |
| Academic | getPeriodosAcademicosActivos | Obtener Períodos Académicos Activos | Sí |

## FASE 4: OBSERVACIONES DE SEGURIDAD

### Riesgos de Sobre-permisos:

1. **Sobre-permisos del Rol Admin:**
   - Admin puede crear usuarios pero no eliminarlos (inconsistente)
   - Admin no puede crear perfiles pero sí asignarlos (brecha lógica)
   - Admin tiene acceso completo a todos los módulos incluyendo restricción de eliminación de auditoría

2. **Riesgo del Sistema Actual:**
   - Solo existe el perfil "admin" en permission.csv
   - No hay granularidad de roles implementada
   - Todas las transacciones actualmente mapeadas a un único perfil admin

### Restricciones Faltantes:

1. **Operaciones Críticas sin Protección:**
   - No hay separación entre operaciones de lectura y escritura
   - No hay validación de propiedad de datos
   - No hay restricciones temporales (ej: modificación de préstamo después de aprobación)

2. **Acceso Entre Módulos:**
   - Los oficiales de préstamos pueden acceder a información de usuarios para procesamiento de préstamos
   - No hay validación de contexto de usuario en operaciones de préstamo

### Vulnerabilidades Críticas:

1. **Sistema de Perfil Único:**
   - El sistema actual solo tiene el perfil "admin"
   - No hay jerarquía de roles implementada
   - Todos los usuarios con perfil admin tienen permisos idénticos

2. **Falta de Contexto de Autorización:**
   - No hay validación de acceso a datos con alcance de usuario
   - Los usuarios pueden potencialmente acceder a datos fuera de su alcance
   - No hay registro de auditoría para cambios de permisos

3. **Brechas de Validación de Transacciones:**
   - No hay validación de contexto de usuario en la ejecución de transacciones
   - Faltan verificaciones de propiedad en operaciones de datos
   - No hay aplicación de segregación de deberes

### Recomendaciones:

1. **Implementar Control de Acceso Basado en Roles (RBAC):**
   - Crear perfiles separados para cada rol definido
   - Mapear transacciones a roles apropiados
   - Implementar jerarquía de roles

2. **Agregar Seguridad a Nivel de Datos:**
   - Implementar acceso a datos con alcance de usuario
   - Agregar validación de propiedad para operaciones sensibles
   - Implementar controles de acceso temporales

3. **Mejorar Capacidades de Auditoría:**
   - Restringir eliminación de auditoría solo a super_admin
   - Agregar registro de auditoría obligatorio para operaciones críticas
   - Implementar registro de auditoría para cambios de permisos

4. **Implementar Principio de Menor Privilegio:**
   - Revisar y minimizar permisos para cada rol
   - Separar permisos de lectura y escritura
   - Agregar autorización consciente del contexto

**Nivel de Seguridad Actual: ALTO RIESGO**
**Acción Inmediata Requerida: Implementar control de acceso basado en roles adecuado**
