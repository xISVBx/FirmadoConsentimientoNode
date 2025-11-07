"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const uuid_1 = require("uuid");
const consentimientosService_1 = __importDefault(require("../../application/consentimientosService"));
/* ====================== Helpers ====================== */
function slugify(s) {
    return (s || "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .substring(0, 100);
}
function yyyymmdd(date) {
    const d = date ? new Date(date) : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}${m}${day}`;
}
const UPLOADS_DIR = (_a = process.env.UPLOADS_FOLDER) !== null && _a !== void 0 ? _a : path_1.default.resolve("./uploads");
const ZIP_DIR = path_1.default.join(UPLOADS_DIR, "zip");
function ensureDirs() {
    return __awaiter(this, void 0, void 0, function* () {
        yield promises_1.default.mkdir(UPLOADS_DIR, { recursive: true });
        yield promises_1.default.mkdir(ZIP_DIR, { recursive: true });
    });
}
const zipJobs = new Map();
function ensureDone(jobId) {
    const j = zipJobs.get(jobId);
    if (!j)
        return;
    if ((j.status === "queued" || j.status === "running") &&
        j.zipPath &&
        fs_1.default.existsSync(j.zipPath)) {
        j.status = "done";
    }
}
/* ====================== Router ====================== */
class ZipRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.service = new consentimientosService_1.default();
        this.config();
    }
    config() {
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
        this.router.post("/consentimientos/zips/start", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield ensureDirs();
                const jobId = (0, uuid_1.v4)();
                const job = {
                    status: "queued",
                    createdAt: new Date().toISOString(),
                    ready: 0,
                    total: 0,
                };
                zipJobs.set(jobId, job);
                // Ejecuta en background
                setImmediate(() => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f;
                    const j = zipJobs.get(jobId);
                    if (!j)
                        return;
                    j.status = "running";
                    const zipPath = path_1.default.join(ZIP_DIR, `${jobId}.zip`);
                    j.zipPath = zipPath;
                    const out = fs_1.default.createWriteStream(zipPath);
                    const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
                    const done = new Promise((resolve, reject) => {
                        out.on("close", resolve);
                        out.on("error", reject);
                        archive.on("error", reject);
                    });
                    archive.pipe(out);
                    try {
                        // Misma fuente de datos que tu endpoint actual de ZIP
                        const resp = yield this.service.ObtenerTodosLosConsentimientos();
                        const data = (_b = (_a = resp === null || resp === void 0 ? void 0 : resp.data) !== null && _a !== void 0 ? _a : resp) !== null && _b !== void 0 ? _b : [];
                        j.total = data.length;
                        for (const row of data) {
                            const id = row.consentimiento_id || row.id || "sinid";
                            const nombre = row.nombre_titular || row.nombreConsumidor || "sin_nombre";
                            const email = row.correo || "sinemail";
                            const idi = (row.idioma || "").toString().toUpperCase() || "ES";
                            const fecha = yyyymmdd(row.created || new Date());
                            const filename = `${slugify(nombre)}_${fecha}_${idi}_${slugify(email)}_${id}.pdf`;
                            const filePath = row.path_consentimiento;
                            if (filePath && fs_1.default.existsSync(filePath)) {
                                archive.file(filePath, { name: filename });
                                j.ready = ((_c = j.ready) !== null && _c !== void 0 ? _c : 0) + 1;
                            }
                            else if (row.consentimiento) {
                                const buf = Buffer.isBuffer(row.consentimiento)
                                    ? row.consentimiento
                                    : Buffer.from(row.consentimiento);
                                archive.append(stream_1.Readable.from(buf), { name: filename });
                                j.ready = ((_d = j.ready) !== null && _d !== void 0 ? _d : 0) + 1;
                            }
                        }
                        if (((_e = j.ready) !== null && _e !== void 0 ? _e : 0) === 0) {
                            archive.destroy();
                            // ZIP vacío para marcar la salida como válida (o podrías marcar error)
                            fs_1.default.writeFileSync(zipPath, "");
                        }
                        else {
                            archive.finalize();
                            yield done;
                        }
                        j.status = "done";
                    }
                    catch (err) {
                        j.status = "error";
                        j.error = (_f = err === null || err === void 0 ? void 0 : err.message) !== null && _f !== void 0 ? _f : String(err);
                        try {
                            fs_1.default.rmSync(zipPath, { force: true });
                        }
                        catch (_g) { }
                    }
                }));
                res.status(202).json({ jobId, status: job.status, message: "Generación iniciada" });
            }
            catch (err) {
                next(err);
            }
        }));
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
        this.router.get("/consentimientos/zips/status/:jobId", (req, res) => {
            var _a, _b, _c;
            const job = zipJobs.get(req.params.jobId);
            if (!job)
                return res.status(404).json({ error: "Job no encontrado" });
            ensureDone(req.params.jobId);
            res.json({
                status: job.status,
                error: (_a = job.error) !== null && _a !== void 0 ? _a : null,
                ready: (_b = job.ready) !== null && _b !== void 0 ? _b : 0,
                total: (_c = job.total) !== null && _c !== void 0 ? _c : 0,
                jobId: req.params.jobId,
            });
        });
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
        this.router.get("/consentimientos/zips/download/:jobId", (req, res) => {
            const job = zipJobs.get(req.params.jobId);
            if (!job)
                return res.status(404).json({ error: "Job no encontrado" });
            ensureDone(req.params.jobId);
            if (job.status !== "done" || !job.zipPath || !fs_1.default.existsSync(job.zipPath)) {
                if (job.status === "error")
                    return res.status(409).json({ error: job.error || "Error al generar ZIP" });
                return res.status(409).json({ error: "ZIP aún no está listo", status: job.status });
            }
            const filename = `consentimientos_${yyyymmdd(new Date())}_${req.params.jobId}.zip`;
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
            fs_1.default.createReadStream(job.zipPath).pipe(res);
        });
    }
}
exports.default = new ZipRouter();
