#!/usr/bin/env bash
# Use Supabase migration history; never replay the entire historical schema.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f .env ] && [ -z "${SUPABASE_DB_URL:-}" ]; then
  SUPABASE_DB_URL=$(sed -n 's/^SUPABASE_DB_URL=//p' .env | head -1 | tr -d '"')
fi
: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL before applying migrations}"
if [ "${1:-}" = "--seed" ]; then
  echo "Seeding is separate from migrations and may overwrite catalogue content. Use an isolated test database for fixtures." >&2
  exit 1
fi
# A history mismatch is intentional fail-closed behaviour. Reconcile an old
# manually managed database before pushing; do not use --include-all blindly.
if [ "${1:-}" = "--dry-run" ]; then
  exec npx --no-install supabase db push --skip-vault --db-url "$SUPABASE_DB_URL" --dry-run
fi
exec npx --no-install supabase db push --skip-vault --db-url "$SUPABASE_DB_URL"
