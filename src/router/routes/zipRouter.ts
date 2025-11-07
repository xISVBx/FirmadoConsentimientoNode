import { Router, Request, Response, NextFunction } from "express";
import archiver from "archiver";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { v4 as uuidv4 } from "uuid";
import ConsentimientosService from "../../application/consentimientosService";

/* ====================== Helpers ====================== */

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

/* ========= Infra mínima para “ZIP en segundo plano” ========= */

type ZipJobStatus = "queued" | "running" | "done" | "error";
interface ZipJob {
  status: ZipJobStatus;
  error?: string;
  zipPath?: string;
  createdAt: string;
  total?: number;
  ready?: number;
}

const UPLOADS_DIR = process.env.UPLOADS_FOLDER ?? path.resolve("./uploads");
const ZIP_DIR = path.join(UPLOADS_DIR, "zip");

async function ensureDirs() {
  await fsp.mkdir(UPLOADS_DIR, { recursive: true });
  await fsp.mkdir(ZIP_DIR, { recursive: true });
}

const zipJobs = new Map<string, ZipJob>();

function ensureDone(jobId: string) {
  const j = zipJobs.get(jobId);
  if (!j) return;
  if (
    (j.status === "queued" || j.status === "running") &&
    j.zipPath &&
    fs.existsSync(j.zipPath)
  ) {
    j.status = "done";
  }
}

/* ====================== Router ====================== */

class ZipRouter {
  public router: Router;
  private service: ConsentimientosService;

  constructor() {
    this.router = Router();
    this.service = new ConsentimientosService();
    this.config();
  }

  private config() {
    /**
     * @openapi
     * /api/consentimientos/zips/start:
     *   post:
     *     summary: Inicia la generación de un ZIP con todos los PDFs en segundo plano
     *     tags: [Descargas]
     *     responses:
     *       202:
     *         description: Job aceptado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 jobId: { type: string }
     *                 status: { type: string, enum: [queued, running, done, error] }
     *       500: { description: Error interno }
     */
    this.router.post(
      "/consentimientos/zips/start",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          await ensureDirs();

          const jobId = uuidv4();
          const job: ZipJob = {
            status: "queued",
            createdAt: new Date().toISOString(),
            ready: 0,
            total: 0,
          };
          zipJobs.set(jobId, job);

          // Ejecuta en background
          setImmediate(async () => {
            const j = zipJobs.get(jobId);
            if (!j) return;
            j.status = "running";

            const zipPath = path.join(ZIP_DIR, `${jobId}.zip`);
            j.zipPath = zipPath;

            const out = fs.createWriteStream(zipPath);
            const archive = archiver("zip", { zlib: { level: 9 } });

            const done = new Promise<void>((resolve, reject) => {
              out.on("close", resolve);
              out.on("error", reject);
              archive.on("error", reject);
            });

            archive.pipe(out);

            try {
              // Misma fuente de datos que tu endpoint actual de ZIP
              const resp: any = await this.service.ObtenerTodosLosConsentimientos();
              const data: any[] = resp?.data ?? resp ?? [];

              j.total = data.length;

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
                  j.ready = (j.ready ?? 0) + 1;
                } else if (row.consentimiento) {
                  const buf: Buffer = Buffer.isBuffer(row.consentimiento)
                    ? row.consentimiento
                    : Buffer.from(row.consentimiento);
                  archive.append(Readable.from(buf), { name: filename });
                  j.ready = (j.ready ?? 0) + 1;
                }
              }

              if ((j.ready ?? 0) === 0) {
                archive.destroy();
                // ZIP vacío para marcar la salida como válida (o podrías marcar error)
                fs.writeFileSync(zipPath, "");
              } else {
                archive.finalize();
                await done;
              }

              j.status = "done";
            } catch (err: any) {
              j.status = "error";
              j.error = err?.message ?? String(err);
              try {
                fs.rmSync(zipPath, { force: true });
              } catch {}
            }
          });

          res.status(202).json({ jobId, status: job.status, message: "Generación iniciada" });
        } catch (err) {
          next(err);
        }
      }
    );

    /**
     * @openapi
     * /api/consentimientos/zips/status/{jobId}:
     *   get:
     *     summary: Consulta el estado de la generación de ZIP
     *     tags: [Descargas]
     *     parameters:
     *       - in: path
     *         name: jobId
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200: { description: OK }
     *       404: { description: Job no encontrado }
     */
    this.router.get(
      "/consentimientos/zips/status/:jobId",
      (req: Request, res: Response) => {
        const job = zipJobs.get(req.params.jobId);
        if (!job) return res.status(404).json({ error: "Job no encontrado" });
        ensureDone(req.params.jobId);
        res.json({
          status: job.status,
          error: job.error ?? null,
          ready: job.ready ?? 0,
          total: job.total ?? 0,
          jobId: req.params.jobId,
        });
      }
    );

    /**
     * @openapi
     * /api/consentimientos/zips/download/{jobId}:
     *   get:
     *     summary: Descarga el ZIP generado
     *     tags: [Descargas]
     *     parameters:
     *       - in: path
     *         name: jobId
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: ZIP
     *         content:
     *           application/zip:
     *             schema: { type: string, format: binary }
     *       404: { description: Job no encontrado }
     *       409: { description: ZIP aún no está listo }
     */
    this.router.get(
      "/consentimientos/zips/download/:jobId",
      (req: Request, res: Response) => {
        const job = zipJobs.get(req.params.jobId);
        if (!job) return res.status(404).json({ error: "Job no encontrado" });

        ensureDone(req.params.jobId);

        if (job.status !== "done" || !job.zipPath || !fs.existsSync(job.zipPath)) {
          if (job.status === "error")
            return res.status(409).json({ error: job.error || "Error al generar ZIP" });
          return res.status(409).json({ error: "ZIP aún no está listo", status: job.status });
        }

        const filename = `consentimientos_${yyyymmdd(new Date())}_${req.params.jobId}.zip`;
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

        fs.createReadStream(job.zipPath).pipe(res);
      }
    );
  }
}

export default new ZipRouter();
