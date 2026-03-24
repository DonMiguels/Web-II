# Guia detallada: registrar un servidor en pgAdmin (manual)

Este documento explica de forma minuciosa como registrar el servidor PostgreSQL dentro de pgAdmin para poder visualizar y administrar la base de datos manualmente.

## 1. Objetivo

- Acceder a pgAdmin en navegador.
- Crear una conexion de servidor PostgreSQL dentro de pgAdmin.
- Confirmar que se puede explorar esquemas, tablas y ejecutar SQL.

## 2. Contexto de este proyecto

En este repositorio, el stack DB se levanta con Docker Compose y tiene estos componentes:

- Servicio PostgreSQL: uni_postgres
- Servicio pgAdmin: uni_pgadmin
- Servicio de inicializacion: uni_db_init
- Servicio de backups: uni_pg_backups

El archivo de compose usa variables desde:

- ../env/${APP_ENV:-development}/docker.env

Por defecto, si APP_ENV no esta definido, se usa development.

## 3. Prerrequisitos

1. Docker Desktop en ejecucion.
2. Stack levantado correctamente con compose.
3. Variables de entorno validas en env/development/docker.env.

## 4. Levantar y verificar el stack

Desde la raiz del repo, ejecutar en PowerShell:

  $env:APP_ENV="development"
  docker compose -f db/docker-compose.yml up -d
  docker compose -f db/docker-compose.yml ps

Estados esperados:

- uni_postgres: Up (healthy)
- uni_pgadmin: Up
- uni_pg_backups: Up (healthy)
- uni_db_init: Exited (esperado, porque es job de inicializacion)

## 5. Datos de acceso que debes confirmar

Revisa estos valores en env/development/docker.env:

- PGADMIN_DEFAULT_EMAIL
- PGADMIN_DEFAULT_PASSWORD
- POSTGRES_USER
- POSTGRES_PASSWORD
- POSTGRES_DB
- POSTGRES_MULTIPLE_DATABASES
- PGADMIN_BIND_PORT

Con la configuracion mostrada en este proyecto, normalmente son:

- URL pgAdmin: http://127.0.0.1:5050
- Usuario pgAdmin: admin@local.dev
- Password pgAdmin: 210811
- Usuario PostgreSQL: admin_uni
- Password PostgreSQL: 210811
- DB administrativa: postgres
- DB de trabajo: webii

## 6. Ingresar a pgAdmin

1. Abre navegador en http://127.0.0.1:5050
2. Inicia sesion con PGADMIN_DEFAULT_EMAIL y PGADMIN_DEFAULT_PASSWORD.
3. Si ves el dashboard de pgAdmin, el servicio esta accesible.

## 7. Registrar servidor (metodo recomendado en este stack)

Este metodo aplica cuando pgAdmin corre en el mismo compose que PostgreSQL.

1. En el panel izquierdo, clic derecho en Servers.
2. Selecciona Create > Server....
3. Pestana General:
   - Name: PostgreSQL Local Docker
4. Pestana Connection:
   - Host name/address: postgres
   - Port: 5432
   - Maintenance database: postgres
   - Username: admin_uni
   - Password: 210811
   - Save password: activado
5. Pestana SSL (si aparece):
   - SSL mode: Prefer o Disable para entorno local
6. Pulsa Save.

Resultado esperado:

- Aparece el servidor en el arbol.
- Se puede desplegar Databases.
- Se visualiza al menos postgres y webii (si el init creo webii).

## 8. Registrar servidor alterno (conexion por puerto publicado del host)

Solo usar este metodo si necesitas probar conectividad por host publicado.

1. Repite Create > Server....
2. Pestana General:
   - Name: PostgreSQL Host 5431
3. Pestana Connection:
   - Host name/address: host.docker.internal
   - Port: 5431
   - Maintenance database: postgres
   - Username: admin_uni
   - Password: 210811
4. Pulsa Save.

Nota:

- En Windows suele funcionar host.docker.internal.
- Si no responde, usa el metodo recomendado del punto 7 (host postgres, puerto 5432).

## 9. Verificar acceso funcional en pgAdmin

### 9.1 Verificar estructura

1. Servers > PostgreSQL Local Docker > Databases > webii > Schemas > public > Tables.
2. Confirma que existan tablas creadas por schema.sql.

### 9.2 Verificar lectura SQL

1. Clic derecho sobre webii > Query Tool.
2. Ejecuta:

  SELECT current_database();
  SELECT current_user;
  SELECT now();

3. Debes obtener resultados sin error.

### 9.3 Verificar datos seed

Ejecuta en Query Tool:

  SELECT * FROM movement_type;
  SELECT * FROM profile;

Debes ver filas base (loan/return/reserve y perfiles admin/operator/viewer) si initial_data.sql se aplico.

## 10. Diagnostico de errores comunes

### Error A: Could not connect to server / timeout

Posibles causas:

- Contenedor postgres no healthy.
- Host o puerto incorrectos en pgAdmin.

Acciones:

1. Ejecuta docker compose -f db/docker-compose.yml ps.
2. Si usas metodo recomendado, valida host postgres y puerto 5432.
3. Si usas host publicado, valida host.docker.internal y puerto 5431.

### Error B: password authentication failed

Posibles causas:

- Usuario/password de PostgreSQL incorrectos.
- Cambio en env/development/docker.env no aplicado.

Acciones:

1. Confirmar POSTGRES_USER y POSTGRES_PASSWORD en docker.env.
2. Re-crear conexion en pgAdmin con los datos correctos.
3. Si cambiaste credenciales sobre un volumen existente, puede requerir recrear datos.

### Error C: no pg_hba.conf entry

Posibles causas:

- Regla de acceso de red no permite el origen.

Acciones:

1. Revisar logs de postgres.
2. Confirmar reglas en pg_hba.conf del volumen de datos.
3. En este proyecto ya se documento una regla para red bridge Docker cuando aplica.

### Error D: servidor desaparece en pgAdmin tras reinicio

Posibles causas:

- Volumen de pgAdmin no persistente.

Acciones:

1. Verifica que compose monte ./pgadmin:/var/lib/pgadmin.
2. No borres la carpeta db/pgadmin si quieres conservar conexiones guardadas.

## 11. Buenas practicas operativas

1. No usar usuario superadmin para tareas rutinarias en ambientes compartidos.
2. Evitar exponer pgAdmin mas alla de localhost en entorno local.
3. Mantener contrasenas fuera de documentacion publica en entornos reales.
4. Si cambias APP_ENV, confirma que existe env/{APP_ENV}/docker.env.
5. Mantener backups activos y revisar salud de uni_pg_backups periodicamente.

## 12. Checklist rapido

- Stack levantado y healthy.
- Acceso web a pgAdmin en 127.0.0.1:5050.
- Servidor registrado con host postgres y puerto 5432.
- Conexion guardada sin errores.
- DB webii visible.
- Query Tool funcional.

Con esto queda habilitado el manejo manual de la DB desde la interfaz de pgAdmin.
