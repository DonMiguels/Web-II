#!/bin/bash

# Restore script for PostgreSQL database
# Usage: ./restore.sh <backup_file> [full|differential|log]

BACKUP_FILE=$1
RESTORE_TYPE=${2:-full}
DB_NAME="webii"
DB_USER="webii_user"
DB_CONTAINER="webii_db"

if [ -z "$BACKUP_FILE" ]; then
    echo "Uso: ./restore.sh <archivo_backup> [tipo_restore]"
    echo "Tipos: full, differential, log"
    exit 1
fi

echo "Iniciando restore $RESTORE_TYPE desde: $BACKUP_FILE"

case $RESTORE_TYPE in
    "full")
        echo "Restaurando backup completo..."
        # Detener conexiones activas y recrear base de datos
        docker exec $DB_CONTAINER psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
        docker exec $DB_CONTAINER psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
        
        # Restaurar desde archivo
        docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < "$BACKUP_FILE"
        echo "Restore completo finalizado"
        ;;
    "differential")
        echo "Restaurando backup diferencial (solo datos)..."
        # Los backups diferenciales solo contienen datos, no schema
        docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < "$BACKUP_FILE"
        echo "Restore diferencial finalizado"
        ;;
    "log")
        echo "Restaurando backup de transacciones..."
        # Para formato custom de PostgreSQL
        docker exec $DB_CONTAINER pg_restore -U $DB_USER -d $DB_NAME "$BACKUP_FILE"
        echo "Restore de transacciones finalizado"
        ;;
    *)
        echo "Tipo de restore no válido. Use: full, differential, o log"
        exit 1
        ;;
esac

echo "Restore completado exitosamente"
