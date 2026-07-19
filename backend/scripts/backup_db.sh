#!/bin/bash
# Simple local backup for the Postgres database — run manually or via cron.
# Losing quote-request data (real customer leads) would actually cost PBS money,
# so this is cheap insurance even before the site has real traffic.
#
# Usage: ./scripts/backup_db.sh
# Cron example (daily at 2am): 0 2 * * * /path/to/backup_db.sh

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

pg_dump "$DATABASE_URL" > "$BACKUP_DIR/pbs_projects_$TIMESTAMP.sql"
echo "Backup saved to $BACKUP_DIR/pbs_projects_$TIMESTAMP.sql"

# Keep only the last 14 backups
ls -t "$BACKUP_DIR"/*.sql | tail -n +15 | xargs -r rm
