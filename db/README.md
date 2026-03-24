# db-win: solución de compatibilidad en Windows

Este documento resume los cambios aplicados en este chat para resolver el fallo de respaldo al levantar los contenedores con Docker Compose en Windows.

## Problema observado

Al ejecutar `docker-compose up --build`, el contenedor `uni_pg_backups` no podía conectarse a PostgreSQL y fallaba `pg_dumpall`.

Se presentaron dos causas:

1. Desajuste de puertos entre host/contenedor y variables de backup.
2. Regla faltante en `pg_hba.conf` para conexiones desde la red bridge de Docker.

## Cambios realizados

### 1) Ajuste de puertos en Compose

Archivo: `docker-compose.yml`

- Se corrigió el mapeo de puertos de PostgreSQL:
  - de `127.0.0.1:5431:5431`
  - a `127.0.0.1:5431:5432`
- Se corrigió el puerto interno usado por backups:
  - de `POSTGRES_PORT: 5431`
  - a `POSTGRES_PORT: 5432`

### 2) Orden de arranque del servicio de backup

Archivo: `docker-compose.yml`

- Se cambió `depends_on` para que `backups` espere a que `postgres` esté `healthy`.

### 3) Permitir acceso desde la red de Docker

Archivo: `pgdata/pg_hba.conf`

- Se agregó la regla:

`host    all    all    172.16.0.0/12    scram-sha-256`

Esto permite que contenedores de la red bridge (por ejemplo, IPs `172.18.x.x`) se autentiquen con usuario/contraseña.

## Resultado esperado

- `uni_postgres` inicia correctamente.
- `uni_pg_backups` logra ejecutar `pg_dumpall` sin error de `no pg_hba.conf entry`.

## Nota importante de versionado

Los datos de Postgres y los backups generados por Docker Compose no deben versionarse. Por eso se agregaron archivos `.gitignore` en `db` y `db-win` para ignorar contenido generado en tiempo de ejecución.
