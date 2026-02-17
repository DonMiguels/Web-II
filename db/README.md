# Scripts de Backup y Restore para PostgreSQL en Docker

## Uso

### Backup
```bash
# Backup completo (default)
./backup.sh

# Backup diferencial
./backup.sh differential

# Backup de transacciones
./backup.sh log
```

### Restore
```bash
# Restore completo
./restore.sh ./backups/webii_full_20240215_143022.sql full

# Restore diferencial
./restore.sh ./backups/webii_diff_20240215_150000.sql differential

# Restore de transacciones
./restore.sh ./backups/webii_log_20240215_160000.backup log
```

## Tipos de Backup

1. **Full**: Backup completo de schema y datos
2. **Differential**: Solo datos (sin schema)
3. **Log**: Formato custom para restauración granular

## Automatización

Los backups se guardan en `./backups` y se eliminan automáticamente después de 7 días.

## Inicialización

Al iniciar el contenedor con `docker-compose up -d`, se ejecutan automáticamente:
1. `schema.sql` - Estructura de tablas
2. `initial_data.sql` - Datos iniciales de ejemplo

## Volumen Persistente

Los datos de PostgreSQL persisten en el volumen `postgres_data` para evitar pérdida de datos al reiniciar el contenedor.
