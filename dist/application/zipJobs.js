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
exports.runZipOnBoot = runZipOnBoot;
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const archiver_1 = __importDefault(require("archiver"));
const stream_1 = require("stream");
const consentimientosService_js_1 = __importDefault(require("../application/consentimientosService.js"));
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
function runZipOnBoot() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { ZIP_DIR } = yield ensureUploadFolders();
        // Aseguramos que el directorio exista
        try {
            yield promises_1.default.mkdir(ZIP_DIR, { recursive: true });
        }
        catch (e) {
            console.error("[ZIP-BOOT] No se pudo crear ZIP_DIR:", ZIP_DIR, e);
        }
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
            var _a, _b, _c;
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
            let total = 0;
            let withPath = 0;
            let withBlob = 0;
            let withB64 = 0;
            let zeroSizeFiles = 0;
            let perItemErrors = 0;
            try {
                const resp = yield service.ObtenerTodosLosConsentimientos();
                const data = (_b = (_a = resp === null || resp === void 0 ? void 0 : resp.data) !== null && _a !== void 0 ? _a : resp) !== null && _b !== void 0 ? _b : [];
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
                    const filePath = row.path_consentimiento;
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
                                const stat = fs_1.default.statSync(filePath);
                                fileExists = stat.isFile();
                                fileSize = stat.size;
                            }
                            catch (_d) {
                                fileExists = false;
                            }
                        }
                        // 2) Intentar por BLOB (campo `consentimiento`)
                        if (!fileExists && row.consentimiento) {
                            const buf = Buffer.isBuffer(row.consentimiento)
                                ? row.consentimiento
                                : Buffer.from(row.consentimiento);
                            blobLen = (_c = buf === null || buf === void 0 ? void 0 : buf.length) !== null && _c !== void 0 ? _c : 0;
                            hasBlob = blobLen > 0;
                        }
                        // 3) Intentar por base64 precalculado (campo `consentimiento_base64`)
                        if (!fileExists && !hasBlob && row.consentimiento_base64) {
                            const b64 = String(row.consentimiento_base64);
                            b64Len = b64.length;
                            hasB64 = b64Len > 0;
                        }
                        // Logs por item (limitados)
                        if (idx <= MAX_VERBOSE) {
                            console.log(`[ZIP-BOOT][${idx}/${data.length}] id=${id} hasPath=${hasPathField} exists=${fileExists} size=${fileSize} hasBlob=${hasBlob ? "yes" : "no"} blobLen=${blobLen} hasB64=${hasB64 ? "yes" : "no"} b64Len=${b64Len} filename="${filename}"`);
                        }
                        // Acumuladores de conteo
                        if (hasPathField)
                            withPath++;
                        if (hasBlob)
                            withBlob++;
                        if (hasB64)
                            withB64++;
                        // Decisión de agregado al ZIP
                        if (fileExists && fileSize > 0) {
                            archive.file(filePath, { name: filename });
                            appended++;
                        }
                        else if (fileExists && fileSize === 0) {
                            zeroSizeFiles++;
                            if (idx <= MAX_VERBOSE) {
                                console.warn(`[ZIP-BOOT][${idx}] Archivo de tamaño 0 omitido: ${filePath}`);
                            }
                        }
                        else if (hasBlob) {
                            const buf = Buffer.isBuffer(row.consentimiento)
                                ? row.consentimiento
                                : Buffer.from(row.consentimiento);
                            if (buf.length > 0) {
                                archive.append(stream_1.Readable.from(buf), { name: filename });
                                appended++;
                            }
                        }
                        else if (hasB64) {
                            try {
                                const buf = Buffer.from(String(row.consentimiento_base64), "base64");
                                if (buf.length > 0) {
                                    archive.append(stream_1.Readable.from(buf), { name: filename });
                                    appended++;
                                }
                                else if (idx <= MAX_VERBOSE) {
                                    console.warn(`[ZIP-BOOT][${idx}] Base64 decodificado con longitud 0 (omitido)`);
                                }
                            }
                            catch (e) {
                                perItemErrors++;
                                if (idx <= MAX_VERBOSE) {
                                    console.warn(`[ZIP-BOOT][${idx}] Error decodificando base64:`, (e === null || e === void 0 ? void 0 : e.message) || e);
                                }
                            }
                        }
                        else {
                            if (idx <= MAX_VERBOSE) {
                                console.warn(`[ZIP-BOOT][${idx}] Sin fuente válida (ni archivo, ni blob, ni base64). Omitido.`);
                            }
                        }
                    }
                    catch (e) {
                        perItemErrors++;
                        if (idx <= MAX_VERBOSE) {
                            console.warn(`[ZIP-BOOT][${idx}] Error manejando fila id=${id}:`, (e === null || e === void 0 ? void 0 : e.message) || e);
                        }
                        // Continuar con el siguiente
                    }
                }
                // Resumen antes de finalizar
                console.log(`[ZIP-BOOT] Resumen: total=${total} withPath=${withPath} withBlob=${withBlob} withB64=${withB64} zeroSizeFiles=${zeroSizeFiles} appended=${appended} perItemErrors=${perItemErrors}`);
                if (appended === 0) {
                    archive.destroy();
                    try {
                        yield promises_1.default.rm(zipPath, { force: true });
                    }
                    catch (_e) { }
                    console.warn("[ZIP-BOOT] No había PDFs para empaquetar. No se generó ZIP.");
                    return;
                }
                archive.finalize();
                yield done;
                // Alias fijo al último ZIP
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
                catch (_f) { }
            }
        }));
    });
}
function ensureUploadFolders() {
    throw new Error("Function not implemented.");
}
