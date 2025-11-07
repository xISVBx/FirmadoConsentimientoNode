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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadsDir = getUploadsDir;
exports.ensureUploadFolders = ensureUploadFolders;
exports.runZipOnBoot = runZipOnBoot;
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const archiver_1 = __importDefault(require("archiver"));
const stream_1 = require("stream");
const consentimientosService_1 = __importDefault(require("../application/consentimientosService"));
// ---------- helpers ----------
function slugify(s) {
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
function getUploadsDir() {
    // si no existe, se crea más abajo
    return process.env.UPLOADS_FOLDER
        ? path_1.default.resolve(process.env.UPLOADS_FOLDER)
        : path_1.default.resolve("./uploads");
}
function ensureUploadFolders() {
    return __awaiter(this, void 0, void 0, function* () {
        const UPLOADS_DIR = getUploadsDir();
        const ZIP_DIR = path_1.default.join(UPLOADS_DIR, "zip");
        yield promises_1.default.mkdir(UPLOADS_DIR, { recursive: true });
        yield promises_1.default.mkdir(ZIP_DIR, { recursive: true });
        return { UPLOADS_DIR, ZIP_DIR };
    });
}
/**
 * Genera un ZIP de TODOS los consentimientos/atestamientos al arrancar.
 * - Crea ./uploads/ y ./uploads/zip si no existen.
 * - Nombre legible: consentimientos_<YYYY-MM-DD>_<HH-mm>.zip
 * - También crea/actualiza alias: latest_consentimientos.zip
 * - NO bloquea el arranque (usa setImmediate).
 */
function runZipOnBoot() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { ZIP_DIR } = yield ensureUploadFolders();
        const now = new Date();
        const niceDate = yyyymmdd(now); // p.ej. 2025-11-07
        const niceTime = hhmm(now); // p.ej. 10-23
        // Nombre LEGIBLE
        const baseName = ((_a = process.env.ZIP_PREFIX) === null || _a === void 0 ? void 0 : _a.trim()) || "consentimientos";
        const zipName = `${baseName}_${niceDate}_${niceTime}.zip`;
        const zipPath = path_1.default.join(ZIP_DIR, zipName);
        const aliasName = `latest_${baseName}.zip`;
        const aliasPath = path_1.default.join(ZIP_DIR, aliasName);
        const service = new consentimientosService_1.default();
        setImmediate(() => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            console.log(`[ZIP-BOOT] Creando ZIP: ${zipPath}`);
            const out = fs_1.default.createWriteStream(zipPath);
            const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
            const done = new Promise((resolve, reject) => {
                out.on("close", resolve);
                out.on("error", reject);
                archive.on("error", reject);
            });
            archive.on("warning", (e) => console.warn("[ZIP-BOOT warn]", (e === null || e === void 0 ? void 0 : e.message) || e));
            archive.pipe(out);
            let appended = 0;
            try {
                const resp = yield service.ObtenerTodosLosConsentimientos();
                const data = (_b = (_a = resp === null || resp === void 0 ? void 0 : resp.data) !== null && _a !== void 0 ? _a : resp) !== null && _b !== void 0 ? _b : [];
                for (const row of data) {
                    const id = row.consentimiento_id || row.id || "sinid";
                    const nombre = row.nombre_titular || row.nombreConsumidor || "sin_nombre";
                    const email = row.correo || "sinemail";
                    const idioma = (row.idioma || "").toString().toUpperCase() || "ES";
                    const fecha = (row.created ? yyyymmdd(new Date(row.created)) : yyyymmdd(now));
                    const filename = `${slugify(nombre)}_${fecha}_${idioma}_${slugify(email)}_${id}.pdf`;
                    const filePath = row.path_consentimiento;
                    if (filePath && fs_1.default.existsSync(filePath)) {
                        archive.file(filePath, { name: filename });
                        appended++;
                    }
                    else if (row.consentimiento) {
                        const buf = Buffer.isBuffer(row.consentimiento)
                            ? row.consentimiento
                            : Buffer.from(row.consentimiento);
                        archive.append(stream_1.Readable.from(buf), { name: filename });
                        appended++;
                    }
                }
                if (appended === 0) {
                    archive.destroy();
                    try {
                        yield promises_1.default.rm(zipPath, { force: true });
                    }
                    catch (_c) { }
                    console.warn("[ZIP-BOOT] No había PDFs para empaquetar. No se generó ZIP.");
                    return;
                }
                archive.finalize();
                yield done;
                // Alias fijo (siempre apunta al último)
                try {
                    yield promises_1.default.rm(aliasPath, { force: true });
                    yield promises_1.default.copyFile(zipPath, aliasPath);
                    console.log(`[ZIP-BOOT] ZIP listo (${appended} archivos): ${zipPath}`);
                    console.log(`[ZIP-BOOT] Alias actualizado: ${aliasPath}`);
                }
                catch (aliasErr) {
                    console.warn("[ZIP-BOOT] No se pudo actualizar alias:", (aliasErr === null || aliasErr === void 0 ? void 0 : aliasErr.message) || aliasErr);
                }
            }
            catch (err) {
                console.error("[ZIP-BOOT] Error generando ZIP:", (err === null || err === void 0 ? void 0 : err.message) || err);
                try {
                    yield promises_1.default.rm(zipPath, { force: true });
                }
                catch (_d) { }
            }
        }));
    });
}
