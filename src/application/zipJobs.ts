import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import archiver from "archiver";
import { v4 as uuidv4 } from "uuid";

const UPLOADS_DIR = process.env.UPLOADS_FOLDER ?? path.resolve("./uploads");
const ZIP_DIR = path.join(UPLOADS_DIR, "zip");

export type ZipJobStatus = "queued" | "running" | "done" | "error";

export interface ZipJob {
  status: ZipJobStatus;
  error?: string;
  zipPath?: string;
  createdAt: string;
  files: string[];
}

const jobs = new Map<string, ZipJob>(); // jobId -> job info

async function ensureDirs(): Promise<void> {
  await fsp.mkdir(UPLOADS_DIR, { recursive: true });
  await fsp.mkdir(ZIP_DIR, { recursive: true });
}

function safeJoin(base: string, p: string): string {
  const resolved = path.resolve(base, p);
  if (!resolved.startsWith(path.resolve(base)))
    throw new Error("Ruta inválida fuera de uploads/");
  return resolved;
}

function listImages(dir: string): string[] {
  const exts = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp"]);
  return fs.readdirSync(dir).filter((f) => exts.has(path.extname(f).toLowerCase()));
}

async function generateZip(jobId: string, files: string[]): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = "running";

  const zipPath = path.join(ZIP_DIR, `${jobId}.zip`);
  job.zipPath = zipPath;

  const out = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  const done = new Promise<void>((resolve, reject) => {
    out.on("close", resolve);
    out.on("error", reject);
    archive.on("error", reject);
  });

  archive.pipe(out);

  for (const rel of files) {
    const abs = safeJoin(UPLOADS_DIR, rel);
    archive.file(abs, { name: rel });
  }

  archive.finalize();

  try {
    await done;
    job.status = "done";
  } catch (err: any) {
    job.status = "error";
    job.error = err?.message ?? String(err);
    try {
      await fsp.rm(zipPath, { force: true });
    } catch {}
  }
}

export async function startZipJob(files?: string[]): Promise<{ jobId: string; status: ZipJobStatus }> {
  await ensureDirs();

  const fileList =
    files && files.length > 0 ? files : listImages(UPLOADS_DIR);

  const jobId = uuidv4();
  const job: ZipJob = {
    status: "queued",
    createdAt: new Date().toISOString(),
    files: fileList,
  };
  jobs.set(jobId, job);

  setImmediate(() => generateZip(jobId, fileList).catch(() => {}));

  return { jobId, status: job.status };
}

export function getJob(jobId: string): ZipJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;

  if ((job.status === "queued" || job.status === "running") && job.zipPath && fs.existsSync(job.zipPath)) {
    job.status = "done";
  }

  return job;
}

export function getZipPath(jobId: string): string | null {
  const job = jobs.get(jobId);
  if (!job || job.status !== "done" || !job.zipPath) return null;
  return job.zipPath;
}
