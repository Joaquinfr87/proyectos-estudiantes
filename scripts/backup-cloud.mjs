/**
 * Script de backup: Descarga archivos del Supabase Storage cloud
 *
 * Uso:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_KEY=sb_publishable_xxx \
 *   node scripts/backup-cloud.mjs
 *
 * Descarga:
 *   - Todos los archivos del bucket "avatars"
 *   - Todos los archivos del bucket "project-images"
 *
 * Guarda una lista manifiesto JSON para facilitar la restauración.
 */

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile, stat } from "fs/promises";
import { join } from "path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌ Faltan variables de entorno: SUPABASE_URL y SUPABASE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BACKUP_DIR = join(import.meta.dirname, "..", "supabase", "backup");
const BUCKETS = ["avatars", "project-images"];

/**
 * Lista recursivamente todos los archivos de un bucket
 */
async function listAllFiles(bucket, prefix = "") {
  const files = [];
  const PAGE_SIZE = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, {
        limit: PAGE_SIZE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.error(`  ❌ Error listando ${bucket}/${prefix}:`, error.message);
      break;
    }

    if (!data || data.length === 0) break;

    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        // Es una carpeta, buscar recursivamente
        const subFiles = await listAllFiles(bucket, path);
        files.push(...subFiles);
      } else {
        files.push({ name: item.name, path, id: item.id, metadata: item.metadata });
      }
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return files;
}

/**
 * Descarga un archivo del storage
 */
async function downloadFile(bucket, filePath, localPath) {
  const { data, error } = await supabase.storage.from(bucket).download(filePath);

  if (error) {
    console.error(`  ❌ Error descargando ${bucket}/${filePath}:`, error.message);
    return false;
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  await mkdir(join(localPath, ".."), { recursive: true });
  await writeFile(localPath, buffer);
  return true;
}

async function main() {
  console.log("🔄 Iniciando backup del Supabase Storage...\n");
  console.log(`📁 Bucket de destino: ${BACKUP_DIR}\n`);

  const manifest = {};

  for (const bucket of BUCKETS) {
    console.log(`📦 Procesando bucket: ${bucket}`);
    const files = await listAllFiles(bucket);

    if (files.length === 0) {
      console.log(`  ⚠️  Bucket vacío, saltando...\n`);
      continue;
    }

    console.log(`  📄 Encontrados ${files.length} archivos`);
    manifest[bucket] = [];

    let downloaded = 0;
    let failed = 0;

    for (const file of files) {
      const localPath = join(BACKUP_DIR, bucket, file.path);
      const success = await downloadFile(bucket, file.path, localPath);

      if (success) {
        downloaded++;
        manifest[bucket].push({
          path: file.path,
          metadata: file.metadata,
        });
      } else {
        failed++;
      }
    }

    console.log(
      `  ✅ Descargados: ${downloaded} | ❌ Fallidos: ${failed}\n`
    );
  }

  // Guardar manifiesto
  const manifestPath = join(BACKUP_DIR, "manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📋 Manifiesto guardado en: ${manifestPath}`);

  // Resumen
  const totalFiles = Object.values(manifest).reduce(
    (sum, files) => sum + files.length,
    0
  );
  console.log(`\n🎉 Backup completado: ${totalFiles} archivos descargados`);
}

main().catch((err) => {
  console.error("💥 Error fatal:", err);
  process.exit(1);
});
