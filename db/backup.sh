#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
docker exec webii_db pg_dump -U webii_user webii > ./backups/backup_$TIMESTAMP.sql
echo "Backup guardado en ./backups/backup_$TIMESTAMP.sql"