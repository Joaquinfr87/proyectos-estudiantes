#!/bin/bash
# Script de restauración: Carga el backup en Supabase local
#
# Uso:
#   ./scripts/restore-local.sh
#
# Requisitos:
#   - Supabase local corriendo (supabase start)
#   - Backup generado por backup-cloud.mjs en supabase/backup/
#   - Variables de entorno SUPABASE_URL y SUPABASE_KEY apuntando al local

set -euo pipefail

SUPABASE_URL="${SUPABASE_URL:-http://127.0.0.1:54321}"
SUPABASE_KEY="${SUPABASE_KEY:-}"  # service_role key del local

BACKUP_DIR="$(dirname "$0")/../supabase/backup"
MANIFEST="$BACKUP_DIR/manifest.json"

if [ ! -f "$MANIFEST" ]; then
  echo "❌ No se encontro el manifiesto en $MANIFEST"
  echo "   Ejecuta primero: node scripts/backup-cloud.mjs"
  exit 1
fi

if [ -z "$SUPABASE_KEY" ]; then
  echo "⚠️  SUPABASE_KEY no configurada. Obtenela de supabase start output."
  echo "   Ejecuta: supabase start y copia la service_role key."
  exit 1
fi

echo "🔄 Iniciando restauracion del backup..."
echo "   URL: $SUPABASE_URL"
echo ""

# Upload de archivos del bucket avatars
echo "📦 Restaurando bucket: avatars"
if [ -d "$BACKUP_DIR/avatars" ]; then
  find "$BACKUP_DIR/avatars" -type f | while read -r file; do
    # Calcular el path relativo dentro del bucket
    relative="${file#$BACKUP_DIR/avatars/}"
    echo "  📄 Subiendo: avatars/$relative"

    curl -s -X POST \
      "$SUPABASE_URL/storage/v1/object/avatars/$relative" \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/octet-stream" \
      --data-binary "@$file" \
      -w "HTTP %{http_code}" \
      -o /dev/null
    echo ""
  done
  echo "  ✅ Bucket avatars restaurado"
else
  echo "  ⚠️  No hay archivos para restaurar"
fi

echo ""

# Upload de archivos del bucket project-images
echo "📦 Restaurando bucket: project-images"
if [ -d "$BACKUP_DIR/project-images" ]; then
  find "$BACKUP_DIR/project-images" -type f | while read -r file; do
    relative="${file#$BACKUP_DIR/project-images/}"
    echo "  📄 Subiendo: project-images/$relative"

    curl -s -X POST \
      "$SUPABASE_URL/storage/v1/object/project-images/$relative" \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/octet-stream" \
      --data-binary "@$file" \
      -w "HTTP %{http_code}" \
      -o /dev/null
    echo ""
  done
  echo "  ✅ Bucket project-images restaurado"
else
  echo "  ⚠️  No hay archivos para restaurar"
fi

echo ""
echo "🎉 Restauracion de storage completada!"
echo ""
echo "Para restaurar la base de datos, ejecuta:"
echo "  psql -h localhost -p 54322 -U postgres -d postgres < supabase/backup/dump.sql"
