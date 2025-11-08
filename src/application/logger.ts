import fs from "fs";
import path from "path";

function ensureDir(dir: string): void {
  try { fs.mkdirSync(dir, { recursive: true }); } catch { /* ignore */ }
}

function isoStamp(): string {
  return new Date().toISOString();
}

/**
 * Redirige console.log/warn/error a archivo + consola.
 * Crea un archivo por día: zip-boot_YYYY-MM-DD.log
 */
export function attachFileLogger(logDirAbs: string): void {
  try {
    ensureDir(logDirAbs);

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const logfile = path.join(logDirAbs, `zip-boot_${yyyy}-${mm}-${dd}.log`);

    const stream = fs.createWriteStream(logfile, { flags: "a" });
    const orig = { log: console.log, warn: console.warn, error: console.error };

    const toLine = (...args: unknown[]) =>
      `[${isoStamp()}] ${args.map(a => {
        if (a instanceof Error) return `${a.message}\n${a.stack ?? ""}`;
        if (typeof a === "string") return a;
        try { return JSON.stringify(a); } catch { return String(a); }
      }).join(" ")}\n`;

    const wrap = (fn: (...a: unknown[]) => void) =>
      (...args: unknown[]) => {
        try { stream.write(toLine(...args)); } catch { /* ignore */ }
        fn(...args);
      };

    console.log = wrap(orig.log);
    console.warn = wrap(orig.warn);
    console.error = wrap(orig.error);

    console.log(`[LOGGER] Writing logs to ${logfile}`);
  } catch {
    // si falla, seguimos con consola
  }
}
