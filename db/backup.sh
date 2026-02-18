#!/bin/bash

# Backup script for PostgreSQL database
# Usage: ./backup.sh [full|differential|log]

BACKUP_TYPE=${1:-full}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="webii"
DB_USER="webii_user"
DB_CONTAINER="webii_db"
BACKUP_DIR="./backups"

echo "Iniciando backup $BACKUP_TYPE en $TIMESTAMP"

case $BACKUP_TYPE in
    "full")
        echo "Creando backup completo..."
        docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/webii_full_$TIMESTAMP.sql"
        echo "Backup completo guardado en: webii_full_$TIMESTAMP.sql"
        ;;
    "differential")
        echo "Creando backup diferencial..."
        # Para PostgreSQL, creamos un backup de datos solo (sin schema)
        docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME --data-only > "$BACKUP_DIR/webii_diff_$TIMESTAMP.sql"
        echo "Backup diferencial guardado en: webii_diff_$TIMESTAMP.sql"
        ;;
    "log")
        echo "Creando backup de transacciones..."
        # PostgreSQL no tiene backup de log como SQL Server, pero podemos exportar WAL
        docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME --format=custom > "$BACKUP_DIR/webii_log_$TIMESTAMP.backup"
        echo "Backup de transacciones guardado en: webii_log_$TIMESTAMP.backup"
        ;;
    *)
        echo "Tipo de backup no válido. Use: full, differential, o log"
        exit 1
        ;;
esac

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "webii_*.sql" -mtime +7 -delete 2>/dev/null
find $BACKUP_DIR -name "webii_*.backup" -mtime +7 -delete 2>/dev/null

echo "Backup completado exitosamente"