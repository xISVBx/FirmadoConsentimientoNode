import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import archiver from "archiver";
import { Readable } from "stream";
import ConsentimientosService from "../application/consentimientosService.js";

function yyyymmdd(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}
function hhmm(date = new Date()) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}-${m}`;
}
function slugify(s: string) {
  return (s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 100);
}

export async function runZipOnBoot(): Promise<void> {
  const { ZIP_DIR } = await ensureUploadFolders();

  // Aseguramos que el directorio exista
  try {
    await fsp.mkdir(ZIP_DIR, { recursive: true });
  } catch (e) {
    console.error("[ZIP-BOOT] No se pudo crear ZIP_DIR:", ZIP_DIR, e);
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
    let total = 0;
    let withPath = 0;
    let withBlob = 0;
    let withB64 = 0;
    let zeroSizeFiles = 0;
    let perItemErrors = 0;

    try {
      const resp: any = await service.ObtenerTodosLosConsentimientos();
      const data: any[] = resp?.data ?? resp ?? [];

      console.log(`[ZIP-BOOT] Registros devueltos por servicio: ${data.length}`);

      const MAX_VERBOSE = 30; // no spamear logs
      let idx = 0;

      for (const row of data) {
        total++;
        idx++;

        const id = row.consentimiento_id || row.id || "sinid";
        const nombre = row.nombre_titular || row.nombreConsumidor || "sin_nombre";
        const email = row.correo || "sinemail";
        const idioma = (row.idioma || "").toString().toUpperCase() || "ES";
        const created = row.created ? new Date(row.created) : now;
        const fecha = yyyymmdd(created);
        const filename = `${slugify(nombre)}_${fecha}_${idioma}_${slugify(email)}_${id}.pdf`;

        const filePath: string | undefined = row.path_consentimiento;
        const hasPathField = Boolean(filePath);
        let fileExists = false;
        let fileSize = -1;

        let hasBlob = false;
        let blobLen = -1;

        let hasB64 = false;
        let b64Len = -1;

        try {
          // 1) Intentar por archivo en disco
          if (filePath) {
            try {
              const stat = fs.statSync(filePath);
              fileExists = stat.isFile();
              fileSize = stat.size;
            } catch {
              fileExists = false;
            }
          }

          // 2) Intentar por BLOB (campo `consentimiento`)
          if (!fileExists && row.consentimiento) {
            const buf: Buffer = Buffer.isBuffer(row.consentimiento)
              ? row.consentimiento
              : Buffer.from(row.consentimiento);
            blobLen = buf?.length ?? 0;
            hasBlob = blobLen > 0;
          }

          // 3) Intentar por base64 precalculado (campo `consentimiento_base64`)
          if (!fileExists && !hasBlob && row.consentimiento_base64) {
            const b64: string = String(row.consentimiento_base64);
            b64Len = b64.length;
            hasB64 = b64Len > 0;
          }

          // Logs por item (limitados)
          if (idx <= MAX_VERBOSE) {
            console.log(
              `[ZIP-BOOT][${idx}/${data.length}] id=${id} hasPath=${hasPathField} exists=${fileExists} size=${fileSize} hasBlob=${hasBlob ? "yes" : "no"} blobLen=${blobLen} hasB64=${hasB64 ? "yes" : "no"} b64Len=${b64Len} filename="${filename}"`
            );
          }

          // Acumuladores de conteo
          if (hasPathField) withPath++;
          if (hasBlob) withBlob++;
          if (hasB64) withB64++;

          // Decisión de agregado al ZIP
          if (fileExists && fileSize > 0) {
            archive.file(filePath!, { name: filename });
            appended++;
          } else if (fileExists && fileSize === 0) {
            zeroSizeFiles++;
            if (idx <= MAX_VERBOSE) {
              console.warn(`[ZIP-BOOT][${idx}] Archivo de tamaño 0 omitido: ${filePath}`);
            }
          } else if (hasBlob) {
            const buf: Buffer = Buffer.isBuffer(row.consentimiento)
              ? row.consentimiento
              : Buffer.from(row.consentimiento);
            if (buf.length > 0) {
              archive.append(Readable.from(buf), { name: filename });
              appended++;
            }
          } else if (hasB64) {
            try {
              const buf = Buffer.from(String(row.consentimiento_base64), "base64");
              if (buf.length > 0) {
                archive.append(Readable.from(buf), { name: filename });
                appended++;
              } else if (idx <= MAX_VERBOSE) {
                console.warn(`[ZIP-BOOT][${idx}] Base64 decodificado con longitud 0 (omitido)`);
              }
            } catch (e) {
              perItemErrors++;
              if (idx <= MAX_VERBOSE) {
                console.warn(`[ZIP-BOOT][${idx}] Error decodificando base64:`, (e as any)?.message || e);
              }
            }
          } else {
            if (idx <= MAX_VERBOSE) {
              console.warn(`[ZIP-BOOT][${idx}] Sin fuente válida (ni archivo, ni blob, ni base64). Omitido.`);
            }
          }
        } catch (e) {
          perItemErrors++;
          if (idx <= MAX_VERBOSE) {
            console.warn(`[ZIP-BOOT][${idx}] Error manejando fila id=${id}:`, (e as any)?.message || e);
          }
          // Continuar con el siguiente
        }
      }

      // Resumen antes de finalizar
      console.log(
        `[ZIP-BOOT] Resumen: total=${total} withPath=${withPath} withBlob=${withBlob} withB64=${withB64} zeroSizeFiles=${zeroSizeFiles} appended=${appended} perItemErrors=${perItemErrors}`
      );

      if (appended === 0) {
        archive.destroy();
        try { await fsp.rm(zipPath, { force: true }); } catch {}
        console.warn("[ZIP-BOOT] No había PDFs para empaquetar. No se generó ZIP.");
        return;
      }

      archive.finalize();
      await done;

      // Alias fijo al último ZIP
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
function ensureUploadFolders(): { ZIP_DIR: any; } | PromiseLike<{ ZIP_DIR: any; }> {
    throw new Error("Function not implemented.");
}

