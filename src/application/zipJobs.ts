import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import archiver from "archiver";
import { Readable } from "stream";
import ConsentimientosService from "../application/consentimientosService";

// ---------- helpers ----------
function slugify(s: string) {
  return (s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 100);
}

function yyyymmdd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // legible: 2025-11-07
}

function hhmm(d = new Date()) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}-${m}`; // legible: 09-48
}

// ---------- paths ----------
export function getUploadsDir(): string {
  // si no existe, se crea más abajo
  return process.env.UPLOADS_FOLDER
    ? path.resolve(process.env.UPLOADS_FOLDER)
    : path.resolve("./uploads");
}

export async function ensureUploadFolders(): Promise<{ UPLOADS_DIR: string; ZIP_DIR: string }> {
  const UPLOADS_DIR = getUploadsDir();
  const ZIP_DIR = path.join(UPLOADS_DIR, "zip");
  await fsp.mkdir(UPLOADS_DIR, { recursive: true });
  await fsp.mkdir(ZIP_DIR, { recursive: true });
  return { UPLOADS_DIR, ZIP_DIR };
}

/**
 * Genera un ZIP de TODOS los consentimientos/atestamientos al arrancar.
 * - Crea ./uploads/ y ./uploads/zip si no existen.
 * - Nombre legible: consentimientos_<YYYY-MM-DD>_<HH-mm>.zip
 * - También crea/actualiza alias: latest_consentimientos.zip
 * - NO bloquea el arranque (usa setImmediate).
 */
export async function runZipOnBoot(): Promise<void> {
  const { ZIP_DIR } = await ensureUploadFolders();

  const now = new Date();
  const niceDate = yyyymmdd(now);    // p.ej. 2025-11-07
  const niceTime = hhmm(now);        // p.ej. 10-23

  // Nombre LEGIBLE
  const baseName = process.env.ZIP_PREFIX?.trim() || "consentimientos";
  const zipName = `${baseName}_${niceDate}_${niceTime}.zip`;
  const zipPath = path.join(ZIP_DIR, zipName);

  const aliasName = `latest_${baseName}.zip`;
  const aliasPath = path.join(ZIP_DIR, aliasName);

  const service = new ConsentimientosService();

  setImmediate(async () => {
    console.log(`[ZIP-BOOT] Creando ZIP: ${zipPath}`);
    const out = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    const done = new Promise<void>((resolve, reject) => {
      out.on("close", resolve);
      out.on("error", reject);
      archive.on("error", reject);
    });

    archive.on("warning", (e) => console.warn("[ZIP-BOOT warn]", e?.message || e));
    archive.pipe(out);

    let appended = 0;

    try {
      const resp: any = await service.ObtenerTodosLosConsentimientos();
      const data: any[] = resp?.data ?? resp ?? [];

      for (const row of data) {
        const id = row.consentimiento_id || row.id || "sinid";
        const nombre = row.nombre_titular || row.nombreConsumidor || "sin_nombre";
        const email = row.correo || "sinemail";
        const idioma = (row.idioma || "").toString().toUpperCase() || "ES";
        const fecha = (row.created ? yyyymmdd(new Date(row.created)) : yyyymmdd(now));
        const filename = `${slugify(nombre)}_${fecha}_${idioma}_${slugify(email)}_${id}.pdf`;

        const filePath = row.path_consentimiento as string | undefined;
        if (filePath && fs.existsSync(filePath)) {
          archive.file(filePath, { name: filename });
          appended++;
        } else if (row.consentimiento) {
          const buf: Buffer = Buffer.isBuffer(row.consentimiento)
            ? row.consentimiento
            : Buffer.from(row.consentimiento);
          archive.append(Readable.from(buf), { name: filename });
          appended++;
        }
      }

      if (appended === 0) {
        archive.destroy();
        try { await fsp.rm(zipPath, { force: true }); } catch {}
        console.warn("[ZIP-BOOT] No había PDFs para empaquetar. No se generó ZIP.");
        return;
      }

      archive.finalize();
      await done;

      // Alias fijo (siempre apunta al último)
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
    }
  });
}
