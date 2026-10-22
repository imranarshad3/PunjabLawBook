#!/usr/bin/env bash
# Applies supabase/migrations/*.sql (and optionally supabase/seed.sql) to the
# database named by SUPABASE_DB_URL in .env. Every file is idempotent.
#
#   bash scripts/db-apply.sh            # migrations only
#   bash scripts/db-apply.sh --seed     # migrations + catalogue seed
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  SUPABASE_DB_URL=$(grep -E '^SUPABASE_DB_URL=' .env | head -1 | cut -d= -f2- | tr -d '"')
fi
: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL in .env (Supabase → Project Settings → Database → Connection string → URI)}"

for file in supabase/migrations/*.sql; do
  echo "→ $file"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q -f "$file"
done

if [ "${1:-}" = "--seed" ]; then
  echo "→ supabase/seed.sql"
  node scripts/generate-seed.cjs
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q -f supabase/seed.sql
fi

echo "done"
