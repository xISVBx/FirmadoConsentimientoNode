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
exports.startZipJob = startZipJob;
exports.getJob = getJob;
exports.getZipPath = getZipPath;
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const archiver_1 = __importDefault(require("archiver"));
const uuid_1 = require("uuid");
const UPLOADS_DIR = (_a = process.env.UPLOADS_FOLDER) !== null && _a !== void 0 ? _a : path_1.default.resolve("./uploads");
const ZIP_DIR = path_1.default.join(UPLOADS_DIR, "zip");
const jobs = new Map(); // jobId -> job info
function ensureDirs() {
    return __awaiter(this, void 0, void 0, function* () {
        yield promises_1.default.mkdir(UPLOADS_DIR, { recursive: true });
        yield promises_1.default.mkdir(ZIP_DIR, { recursive: true });
    });
}
function safeJoin(base, p) {
    const resolved = path_1.default.resolve(base, p);
    if (!resolved.startsWith(path_1.default.resolve(base)))
        throw new Error("Ruta inválida fuera de uploads/");
    return resolved;
}
function listImages(dir) {
    const exts = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp"]);
    return fs_1.default.readdirSync(dir).filter((f) => exts.has(path_1.default.extname(f).toLowerCase()));
}
function generateZip(jobId, files) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const job = jobs.get(jobId);
        if (!job)
            return;
        job.status = "running";
        const zipPath = path_1.default.join(ZIP_DIR, `${jobId}.zip`);
        job.zipPath = zipPath;
        const out = fs_1.default.createWriteStream(zipPath);
        const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
        const done = new Promise((resolve, reject) => {
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
            yield done;
            job.status = "done";
        }
        catch (err) {
            job.status = "error";
            job.error = (_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : String(err);
            try {
                yield promises_1.default.rm(zipPath, { force: true });
            }
            catch (_b) { }
        }
    });
}
function startZipJob(files) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ensureDirs();
        const fileList = files && files.length > 0 ? files : listImages(UPLOADS_DIR);
        const jobId = (0, uuid_1.v4)();
        const job = {
            status: "queued",
            createdAt: new Date().toISOString(),
            files: fileList,
        };
        jobs.set(jobId, job);
        setImmediate(() => generateZip(jobId, fileList).catch(() => { }));
        return { jobId, status: job.status };
    });
}
function getJob(jobId) {
    const job = jobs.get(jobId);
    if (!job)
        return null;
    if ((job.status === "queued" || job.status === "running") && job.zipPath && fs_1.default.existsSync(job.zipPath)) {
        job.status = "done";
    }
    return job;
}
function getZipPath(jobId) {
    const job = jobs.get(jobId);
    if (!job || job.status !== "done" || !job.zipPath)
        return null;
    return job.zipPath;
}
