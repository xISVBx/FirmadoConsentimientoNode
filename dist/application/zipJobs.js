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
exports.ensureUploadFolders = ensureUploadFolders;
exports.runZipOnBoot = runZipOnBoot;
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const archiver_1 = __importDefault(require("archiver"));
const stream_1 = require("stream");
const consentimientosService_js_1 = __importDefault(require("../application/consentimientosService.js"));
// ---- helpers fecha/slug
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
function slugify(s) {
    return (s || "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .substring(0, 100);
}
// ---- asegura carpeta de salida (ajústalo si ya tienes este helper en otro archivo)
function ensureUploadFolders() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const ROOT = ((_a = process.env.UPLOADS_ROOT) === null || _a === void 0 ? void 0 : _a.trim()) || path_1.default.join(process.cwd(), "uploads");
        const ZIP_DIR = path_1.default.join(ROOT, "zips");
        yield promises_1.default.mkdir(ZIP_DIR, { recursive: true });
        return { ZIP_DIR };
    });
}
// ---- extrae Buffer a partir de la fila (ruta → blob → base64)
function extractPdfBuffer(row) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1) archivo en disco
        const filePath = row.path_consentimiento;
        if (filePath) {
            try {
                const stat = yield promises_1.default.stat(filePath);
                if (stat.isFile() && stat.size > 0) {
                    return yield promises_1.default.readFile(filePath);
                }
            }
            catch ( /* ignora, continua con blob/base64 */_a) { /* ignora, continua con blob/base64 */ }
        }
        // 2) blob
        if (row.consentimiento) {
            const buf = Buffer.isBuffer(row.consentimiento)
                ? row.consentimiento
                : Buffer.from(row.consentimiento);
            if (buf.length > 0)
                return buf;
        }
        // 3) base64 precalculado
        if (row.consentimiento_base64) {
            try {
                const b64 = String(row.consentimiento_base64);
                const buf = Buffer.from(b64, "base64");
                if (buf.length > 0)
                    return buf;
            }
            catch ( /* continuar */_b) { /* continuar */ }
        }
        return null;
    });
}
// ---- decide tipo (consentimiento/atestamiento)
function detectTipo(row) {
    if (row === null || row === void 0 ? void 0 : row.nombre_titular)
        return "consentimiento";
    if (row === null || row === void 0 ? void 0 : row.nombreConsumidor)
        return "atestamiento";
    // fallback
    return "consentimiento";
}
// ---- genera un nombre de archivo individual y evita colisiones
function nextAvailablePath(dir, baseNameNoExt) {
    return __awaiter(this, void 0, void 0, function* () {
        let candidate = path_1.default.join(dir, `${baseNameNoExt}.pdf`);
        let i = 2;
        while (true) {
            try {
                yield promises_1.default.access(candidate, fs_1.default.constants.F_OK);
                // existe → intenta con sufijo
                candidate = path_1.default.join(dir, `${baseNameNoExt}_(${i}).pdf`);
                i++;
            }
            catch (_a) {
                // no existe → ok
                return candidate;
            }
        }
    });
}
// ---- escribe un PDF suelto en ZIP_DIR
function writeSinglePdf(ZIP_DIR, row) {
    return __awaiter(this, void 0, void 0, function* () {
        const tipo = detectTipo(row);
        const nombre = row.nombre_titular || row.nombreConsumidor || "sin_nombre";
        const baseName = `${slugify(nombre)}_${tipo}`; // p.ej. "Juan_Perez_consentimiento"
        const targetPath = yield nextAvailablePath(ZIP_DIR, baseName);
        const buf = yield extractPdfBuffer(row);
        if (!buf)
            return null;
        yield promises_1.default.writeFile(targetPath, buf);
        return targetPath;
    });
}
// ---- ZIP principal + guardado por item
function runZipOnBoot() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { ZIP_DIR } = yield ensureUploadFolders();
        const now = new Date();
        const niceDate = yyyymmdd(now);
        const niceTime = hhmm(now);
        const baseName = ((_a = process.env.ZIP_PREFIX) === null || _a === void 0 ? void 0 : _a.trim()) || "consentimientos";
        const zipName = `${baseName}_${niceDate}_${niceTime}.zip`;
        const zipPath = path_1.default.join(ZIP_DIR, zipName);
        const aliasName = `latest_${baseName}.zip`;
        const aliasPath = path_1.default.join(ZIP_DIR, aliasName);
        const service = new consentimientosService_js_1.default();
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
            let savedSingles = 0;
            let perItemErrors = 0;
            try {
                const resp = yield service.ObtenerTodosLosConsentimientos();
                const data = (_b = (_a = resp === null || resp === void 0 ? void 0 : resp.data) !== null && _a !== void 0 ? _a : resp) !== null && _b !== void 0 ? _b : [];
                console.log(`[ZIP-BOOT] Registros: ${data.length}`);
                const MAX_VERBOSE = 30;
                let idx = 0;
                for (const row of data) {
                    idx++;
                    const id = row.consentimiento_id || row.id || "sinid";
                    const nombre = row.nombre_titular || row.nombreConsumidor || "sin_nombre";
                    const email = row.correo || "sinemail";
                    const idioma = (row.idioma || "").toString().toUpperCase() || "ES";
                    const created = row.created ? new Date(row.created) : now;
                    const fecha = yyyymmdd(created);
                    const filenameInZip = `${slugify(nombre)}_${fecha}_${idioma}_${slugify(email)}_${id}.pdf`;
                    try {
                        // 1) escribir el PDF suelto
                        const singlePath = yield writeSinglePdf(ZIP_DIR, row);
                        if (singlePath) {
                            savedSingles++;
                            if (idx <= MAX_VERBOSE)
                                console.log(`[ZIP-BOOT][${idx}] Individual: ${singlePath}`);
                        }
                        else {
                            if (idx <= MAX_VERBOSE)
                                console.warn(`[ZIP-BOOT][${idx}] Sin fuente (no se creó individual).`);
                        }
                        // 2) adjuntar al ZIP (reusa buffer del archivo suelto si se creó)
                        if (singlePath) {
                            const stat = yield promises_1.default.stat(singlePath);
                            if (stat.isFile() && stat.size > 0) {
                                archive.file(singlePath, { name: filenameInZip });
                                appended++;
                                continue; // ya listo
                            }
                        }
                        // Si no hubo individual, aún intenta adjuntar por las fuentes disponibles
                        const fallbackBuf = yield extractPdfBuffer(row);
                        if (fallbackBuf && fallbackBuf.length > 0) {
                            archive.append(stream_1.Readable.from(fallbackBuf), { name: filenameInZip });
                            appended++;
                        }
                        else if (idx <= MAX_VERBOSE) {
                            console.warn(`[ZIP-BOOT][${idx}] Sin fuente para ZIP (omitido).`);
                        }
                    }
                    catch (e) {
                        perItemErrors++;
                        if (idx <= MAX_VERBOSE) {
                            console.warn(`[ZIP-BOOT][${idx}] Error por fila id=${id}:`, (e === null || e === void 0 ? void 0 : e.message) || e);
                        }
                    }
                }
                console.log(`[ZIP-BOOT] Resumen: individuales=${savedSingles}, zipAppended=${appended}, erroresFila=${perItemErrors}`);
                if (appended === 0) {
                    archive.destroy();
                    try {
                        yield promises_1.default.rm(zipPath, { force: true });
                    }
                    catch (_c) { }
                    console.warn("[ZIP-BOOT] ZIP vacío. No se generó archivo ZIP.");
                    return;
                }
                archive.finalize();
                yield done;
                // Alias → “último”
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
