#!/bin/bash
# Dump de la base de datos desde Supabase cloud
#
# Uso:
#   DB_PASSWORD="tu-password" ./scripts/dump-database.sh
#
# El password lo encuentras en: Dashboard > Settings > Database > Connection string > Password
#
# Guarda el dump en: supabase/backup/dump.sql

set -euo pipefail

if [ -z "${DB_PASSWORD:-}" ]; then
  echo "❌ DB_PASSWORD no configurado."
  echo ""
  echo "Encuentra tu password en:"
  echo "  1. Ve a https://supabase.com/dashboard"
  echo "  2. Selecciona tu proyecto"
  echo "  3. Settings > Database"
  echo "  4. Connection string > URI > copia el password"
  echo ""
  echo "Ejecuta: DB_PASSWORD=\"tu-password\" ./scripts/dump-database.sh"
  exit 1
fi

# Extraer el project ref de la URL (si esta configurada)
if [ -n "${SUPABASE_URL:-}" ]; then
  # Extraer el project ref de URLs como https://xxx.supabase.co
  PROJECT_REF=$(echo "$SUPABASE_URL" | sed -n 's|https://\([^.]*\)\.supabase\.co|\1|p')
else
  echo "⚠️  SUPABASE_URL no configurado, intentando extraer del project_ref..."
  PROJECT_REF="${PROJECT_REF:-}"
fi

if [ -z "$PROJECT_REF" ]; then
  echo "❌ PROJECT_REF no se pudo determinar."
  echo "  Configura SUPABASE_URL o PROJECT_REF."
  exit 1
fi

BACKUP_DIR="$(dirname "$0")/../supabase/backup"
mkdir -p "$BACKUP_DIR"

echo "🔄 Haciendo dump de la base de datos..."
echo "   Proyecto: $PROJECT_REF"
echo ""

# Usar pg_dump con la connection string de Supabase
# Puerto 6543 es el pooler, 5432 es directo
CONNECTION_STRING="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

echo "📡 Conectando a Supabase cloud..."
pg_dump "$CONNECTION_STRING" \
  --no-owner \
  --no-privileges \
  --no-publications \
  --no-subscriptions \
  --verbose \
  -f "$BACKUP_DIR/dump.sql" 2>&1

echo ""
echo "✅ Dump completado: $BACKUP_DIR/dump.sql"
echo ""
echo "Para restaurar en local:"
echo "  1. Arranca Supabase local: supabase start"
echo "  2. Restaura: psql -h localhost -p 54322 -U postgres -d postgres < $BACKUP_DIR/dump.sql"
echo "  3. Sube el storage: ./scripts/restore-local.sh"
