import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import archiver from "archiver";
import { Readable } from "stream";
import ConsentimientosService from "../application/consentimientosService.js";

// ===== Tipos mínimos que usamos del SELECT =====
type ConsentRow = {
  id?: string;
  consentimiento_id?: string;
  path_consentimiento?: string | null;
  created?: string | Date | null;
  correo?: string | null;
  nombre_titular?: string | null;
  nombreConsumidor?: string | null;
  idioma?: string | null;
  consentimiento?: Buffer | Uint8Array | string | null;       // BLOB
  consentimiento_base64?: string | null;                      // base64
};

function yyyymmdd(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}
function hhmm(date: Date = new Date()): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}-${m}`;
}
function slugify(s: string): string {
  return (s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 100);
}

/**
 * Carpeta escribible en cPanel:
 * - Si defines UPLOADS_ROOT → se usa esa
 * - Si no, cae a ~/nodeapp_uploads/zips
 */
export async function ensureUploadFolders(): Promise<{ ZIP_DIR: string }> {
  const HOME = process.env.HOME || `/home/${process.env.SSH_USER || process.env.USER || "cpanel"}`;
  const ROOT = (process.env.UPLOADS_ROOT?.trim()) || path.join(HOME, "nodeapp_uploads");
  const ZIP_DIR = path.join(ROOT, "zips");
  await fsp.mkdir(ZIP_DIR, { recursive: true });
  console.log("[ZIP-BOOT] UPLOADS_ROOT:", ROOT);
  console.log("[ZIP-BOOT] ZIP_DIR:", ZIP_DIR);
  return { ZIP_DIR };
}

// ---- extrae Buffer a partir de la fila (ruta → blob → base64)
async function extractPdfBuffer(row: ConsentRow): Promise<Buffer | null> {
  // 1) archivo en disco
  const filePath = row.path_consentimiento ?? undefined;
  if (filePath) {
    try {
      const stat = await fsp.stat(filePath);
      if (stat.isFile() && stat.size > 0) {
        return await fsp.readFile(filePath);
      }
    } catch { /* ignora, continua con blob/base64 */ }
  }
  // 2) blob
  if (row.consentimiento) {
    const val = row.consentimiento as unknown;
    const buf = Buffer.isBuffer(val) ? val as Buffer : Buffer.from(val as Uint8Array);
    if (buf.length > 0) return buf;
  }
  // 3) base64 precalculado
  if (row.consentimiento_base64) {
    try {
      const buf = Buffer.from(String(row.consentimiento_base64), "base64");
      if (buf.length > 0) return buf;
    } catch { /* continuar */ }
  }
  return null;
}

// ---- decide tipo (consentimiento/atestamiento)
function detectTipo(row: ConsentRow): "consentimiento" | "atestamiento" {
  if (row?.nombre_titular) return "consentimiento";
  if (row?.nombreConsumidor) return "atestamiento";
  return "consentimiento"; // fallback
}

// ---- genera un nombre de archivo individual y evita colisiones
async function nextAvailablePath(dir: string, baseNameNoExt: string): Promise<string> {
  let candidate = path.join(dir, `${baseNameNoExt}.pdf`);
  let i = 2;
  while (true) {
    try {
      await fsp.access(candidate, fs.constants.F_OK);
      candidate = path.join(dir, `${baseNameNoExt}_(${i}).pdf`);
      i++;
    } catch {
      return candidate;
    }
  }
}

// ---- escribe un PDF suelto en ZIP_DIR
async function writeSinglePdf(ZIP_DIR: string, row: ConsentRow): Promise<string | null> {
  const tipo = detectTipo(row);
  const nombre = row.nombre_titular || row.nombreConsumidor || "sin_nombre";
  const baseName = `${slugify(String(nombre))}_${tipo}`; // p.ej. "Juan_Perez_consentimiento"
  const targetPath = await nextAvailablePath(ZIP_DIR, baseName);

  const buf = await extractPdfBuffer(row);
  if (!buf) return null;

  await fsp.writeFile(targetPath, buf);
  return targetPath;
}

export async function runZipOnBoot(): Promise<void> {
  const { ZIP_DIR } = await ensureUploadFolders();

  // Evita doble ejecución simultánea
  const lockPath = path.join(ZIP_DIR, ".zip.lock");
  const releaseLock = async () => { try { await fsp.rm(lockPath, { force: true }); } catch {} };

  try {
    await fsp.writeFile(lockPath, String(Date.now()), { flag: "wx" }); // falla si ya existe
  } catch {
    console.warn("[ZIP-BOOT] Ya hay un proceso en curso. Abortando.");
    return;
  }

  const now = new Date();
  const niceDate = yyyymmdd(now);
  const niceTime = hhmm(now);

  const baseName = process.env.ZIP_PREFIX?.trim() || "consentimientos";
  const zipName = `${baseName}_${niceDate}_${niceTime}.zip`;
  const zipPath = path.join(ZIP_DIR, zipName);

  const aliasName = `latest_${baseName}.zip`;
  const aliasPath = path.join(ZIP_DIR, aliasName);

  const service = new ConsentimientosService();

  console.log(`[ZIP-BOOT] Creando ZIP: ${zipPath}`);
  const out = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  const done = new Promise<void>((resolve, reject) => {
    out.on("close", () => resolve());
    out.on("error", (e) => reject(e));
    archive.on("error", (e) => reject(e));
  });

  archive.on("warning", (e) => console.warn("[ZIP-BOOT warn]", (e as Error)?.message || e));
  archive.pipe(out);

  let appended = 0;
  let savedSingles = 0;
  let perItemErrors = 0;

  try {
    const resp = await service.ObtenerTodosLosConsentimientos() as { data?: ConsentRow[] } | ConsentRow[];
    const data: ConsentRow[] = Array.isArray(resp) ? resp : (resp?.data ?? []);

    console.log(`[ZIP-BOOT] Registros: ${data.length}`);

    let idx = 0;
    const MAX_VERBOSE = 30;

    for (const row of data) {
      idx++;

      const id = row.consentimiento_id || row.id || "sinid";
      const nombre = row.nombre_titular || row.nombreConsumidor || "sin_nombre";
      const email = row.correo || "sinemail";
      const idioma = (row.idioma || "").toString().toUpperCase() || "ES";
      const created = row.created ? new Date(row.created as string) : now;
      const fecha = yyyymmdd(created);
      const filenameInZip = `${slugify(String(nombre))}_${fecha}_${idioma}_${slugify(String(email))}_${id}.pdf`;

      try {
        // 1) PDF individual
        const singlePath = await writeSinglePdf(ZIP_DIR, row);
        if (singlePath) {
          savedSingles++;
          if (idx <= MAX_VERBOSE) console.log(`[ZIP-BOOT][${idx}] Individual: ${singlePath}`);
        } else if (idx <= MAX_VERBOSE) {
          console.warn(`[ZIP-BOOT][${idx}] Sin fuente (no se creó individual).`);
        }

        // 2) ZIP: si se creó el individual, úsalo; si no, usa fallback buf
        if (singlePath) {
          const stat = await fsp.stat(singlePath);
          if (stat.isFile() && stat.size > 0) {
            archive.file(singlePath, { name: filenameInZip });
            appended++;
            continue;
          }
        }
        const fallbackBuf = await extractPdfBuffer(row);
        if (fallbackBuf && fallbackBuf.length > 0) {
          archive.append(Readable.from(fallbackBuf), { name: filenameInZip });
          appended++;
        } else if (idx <= MAX_VERBOSE) {
          console.warn(`[ZIP-BOOT][${idx}] Sin fuente para ZIP (omitido).`);
        }
      } catch (e: any) {
        perItemErrors++;
        if (idx <= MAX_VERBOSE) {
          console.warn(`[ZIP-BOOT][${idx}] Error por fila id=${id}:`, e?.message || e);
        }
      }
    }

    console.log(`[ZIP-BOOT] Resumen: individuales=${savedSingles}, zipAppended=${appended}, erroresFila=${perItemErrors}`);

    if (appended === 0) {
      archive.destroy();
      try { await fsp.rm(zipPath, { force: true }); } catch {}
      console.warn("[ZIP-BOOT] ZIP vacío. No se generó archivo ZIP.");
      await releaseLock();
      return;
    }

    archive.finalize();
    await done;

    // Alias → “último”
    try {
      await fsp.rm(aliasPath, { force: true });
      await fsp.copyFile(zipPath, aliasPath);
      console.log(`[ZIP-BOOT] ZIP listo (${appended} archivos): ${zipPath}`);
      console.log(`[ZIP-BOOT] Alias actualizado: ${aliasPath}`);
    } catch (aliasErr: any) {
      console.warn("[ZIP-BOOT] No se pudo actualizar alias:", aliasErr?.message || aliasErr);
    }
  } catch (err: any) {
    console.error("[ZIP-BOOT] Error generando ZIP:", err?.message || err);
    try { await fsp.rm(zipPath, { force: true }); } catch {}
  } finally {
    await releaseLock();
  }
}
