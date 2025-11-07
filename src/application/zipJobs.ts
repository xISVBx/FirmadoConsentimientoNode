import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import archiver from "archiver";
import { Readable } from "stream";
import ConsentimientosService from "../application/consentimientosService";

function slugify(s: string) {
  return (s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 100);
}

function yyyymmdd(date?: Date | string | null) {
  const d = date ? new Date(date) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/**
 * Genera un ZIP de TODOS los consentimientos/atestamientos
 * y lo deja en:   <UPLOADS_FOLDER || ./uploads>/zip/boot_<yyyyMMdd>_<hhmmss>.zip
 * No bloquea el arranque: usa setImmediate y logs.
 */
export async function runZipOnBoot(): Promise<void> {
  const UPLOADS_DIR = process.env.UPLOADS_FOLDER ?? path.resolve("./uploads");
  const ZIP_DIR = path.join(UPLOADS_DIR, "zip");

  await fsp.mkdir(UPLOADS_DIR, { recursive: true });
  await fsp.mkdir(ZIP_DIR, { recursive: true });

  // nombre con fecha/hora de arranque
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const zipName = `boot_${yyyymmdd(now)}_${hh}${mm}${ss}.zip`;
  const zipPath = path.join(ZIP_DIR, zipName);

  const service = new ConsentimientosService();

  setImmediate(async () => {
    console.log(`[ZIP-BOOT] Iniciando generación: ${zipPath}`);
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
        const idi = (row.idioma || "").toString().toUpperCase() || "ES";
        const fecha = yyyymmdd(row.created || new Date());
        const filename = `${slugify(nombre)}_${fecha}_${idi}_${slugify(email)}_${id}.pdf`;

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
        console.warn("[ZIP-BOOT] No había PDFs para empaquetar (ZIP no generado).");
        return;
      }

      archive.finalize();
      await done;
      console.log(`[ZIP-BOOT] ZIP listo (${appended} archivos): ${zipPath}`);
    } catch (err: any) {
      console.error("[ZIP-BOOT] Error generando ZIP:", err?.message || err);
      try { await fsp.rm(zipPath, { force: true }); } catch {}
    }
  });
}
