#!/bin/bash
# Backs up the real database and every uploaded gallery photo/video, run
# manually or on a schedule (cron example at the bottom). This data lives
# nowhere else, it's gitignored on purpose (see .gitignore) so it's never
# in git history either, which makes this script the only thing standing
# between a lost disk and losing every real customer quote, testimonial,
# and uploaded job photo for good.
#
# This used to call pg_dump unconditionally, which only works against a
# Postgres database. The site has run on SQLite this whole time (see
# DATABASE_URL in .env), so this script would have failed outright the
# first time anyone actually tried to run it, and it never touched the
# uploaded photos/videos at all, only the database. Both fixed below.
#
# Usage: ./scripts/backup_db.sh
# Cron example (daily at 2am): 0 2 * * * /full/path/to/backend/scripts/backup_db.sh

set -euo pipefail
cd "$(dirname "$0")/.."   # always run from backend/, regardless of the caller's own directory

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
KEEP=14   # how many backups of each kind to keep before deleting the oldest

mkdir -p "$BACKUP_DIR"

if [ -z "${DATABASE_URL:-}" ] && [ -f .env ]; then
  DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | cut -d '=' -f2-)
fi
DATABASE_URL="${DATABASE_URL:-sqlite:///./pbs_projects.db}"

if [[ "$DATABASE_URL" == sqlite* ]]; then
  # Today's real setup: one SQLite file. sqlite3's own .backup command takes
  # a safe, consistent snapshot even while the server is running and writing
  # to it, a plain file copy taken mid-write could capture a half-written
  # page and produce a backup that looks fine but won't actually open.
  DB_PATH=$(echo "$DATABASE_URL" | sed -E 's#sqlite:///\.?/?##')
  if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/pbs_projects_$TIMESTAMP.db'"
  else
    cp "$DB_PATH" "$BACKUP_DIR/pbs_projects_$TIMESTAMP.db"
  fi
  echo "Database backed up to $BACKUP_DIR/pbs_projects_$TIMESTAMP.db"
else
  # Postgres, if this ever moves off SQLite (see requirements-postgres.txt).
  pg_dump "$DATABASE_URL" > "$BACKUP_DIR/pbs_projects_$TIMESTAMP.sql"
  echo "Database backed up to $BACKUP_DIR/pbs_projects_$TIMESTAMP.sql"
fi

# Every uploaded gallery photo and video, the real job photos themselves,
# not just the database rows that point at them. Losing this folder means
# every before/after and finished-job photo is gone even if the database
# backup above is perfectly fine.
if [ -d static/uploads ] && [ -n "$(ls -A static/uploads 2>/dev/null)" ]; then
  tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C static uploads
  echo "Uploaded photos/videos backed up to $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz"
fi

# Keep only the most recent $KEEP backups of each kind, an unattended daily
# cron job would otherwise fill the disk with backups forever. Only ever
# one of .db/.sql actually exists (SQLite vs Postgres), `ls` finding zero
# matches for whichever one isn't in use is expected, not an error, the
# "|| true" stops that from tripping "set -e" and aborting the script
# before it reaches the final summary line below.
ls -t "$BACKUP_DIR"/pbs_projects_*.db 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm || true
ls -t "$BACKUP_DIR"/pbs_projects_*.sql 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm || true
ls -t "$BACKUP_DIR"/uploads_*.tar.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm || true

echo "Done. $(ls "$BACKUP_DIR" | wc -l | xargs) file(s) currently kept in $BACKUP_DIR."
