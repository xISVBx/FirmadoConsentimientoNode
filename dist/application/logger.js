"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachFileLogger = attachFileLogger;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function ensureDir(dir) {
    try {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    catch ( /* ignore */_a) { /* ignore */ }
}
function isoStamp() {
    return new Date().toISOString();
}
/**
 * Redirige console.log/warn/error a archivo + consola.
 * Crea un archivo por día: zip-boot_YYYY-MM-DD.log
 */
function attachFileLogger(logDirAbs) {
    try {
        ensureDir(logDirAbs);
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const logfile = path_1.default.join(logDirAbs, `zip-boot_${yyyy}-${mm}-${dd}.log`);
        const stream = fs_1.default.createWriteStream(logfile, { flags: "a" });
        const orig = { log: console.log, warn: console.warn, error: console.error };
        const toLine = (...args) => `[${isoStamp()}] ${args.map(a => {
            var _a;
            if (a instanceof Error)
                return `${a.message}\n${(_a = a.stack) !== null && _a !== void 0 ? _a : ""}`;
            if (typeof a === "string")
                return a;
            try {
                return JSON.stringify(a);
            }
            catch (_b) {
                return String(a);
            }
        }).join(" ")}\n`;
        const wrap = (fn) => (...args) => {
            try {
                stream.write(toLine(...args));
            }
            catch ( /* ignore */_a) { /* ignore */ }
            fn(...args);
        };
        console.log = wrap(orig.log);
        console.warn = wrap(orig.warn);
        console.error = wrap(orig.error);
        console.log(`[LOGGER] Writing logs to ${logfile}`);
    }
    catch (_a) {
        // si falla, seguimos con consola
    }
}
