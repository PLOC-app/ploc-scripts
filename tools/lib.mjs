// Shared helpers for validate.mjs and build-site.mjs (no dependency).
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SCRIPTS_DIR = join(ROOT, "scripts");
export const CATEGORIES = ["export", "backup", "inventory", "tasting", "organization", "stats", "sync", "maintenance", "misc"];
export const PERMISSIONS = ["read", "write"];
export const MAX_SIZE = 64 * 1024;
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const VERSION_RE = /^\d+\.\d+\.\d+$/;

/** Parses the leading `/** ... *\/` block into `{ name: value }`. Returns null when there is no header. */
export function parseHeader(code) {
    const m = code.match(/^\s*\/\*\*([\s\S]*?)\*\//);
    if (!m) return null;
    const fields = {};
    let current = null;
    for (const raw of m[1].split("\n")) {
        const line = raw.replace(/^\s*\*? ?/, "").trimEnd();
        const tag = line.match(/^@(\w+)\s*(.*)$/);
        if (tag) {
            current = tag[1];
            fields[current] = tag[2].trim();
        } else if (current && line.trim()) {
            fields[current] += " " + line.trim();
        }
    }
    return fields;
}

/** Lists `scripts/<slug>/` folders (sorted). */
export function listSlugs() {
    if (!existsSync(SCRIPTS_DIR)) return [];
    return readdirSync(SCRIPTS_DIR)
        .filter(n => statSync(join(SCRIPTS_DIR, n)).isDirectory())
        .sort();
}

export function readScript(slug) {
    const file = join(SCRIPTS_DIR, slug, "script.js");
    if (!existsSync(file)) return null;
    const code = readFileSync(file, "utf8");
    return { file, code, size: Buffer.byteLength(code), header: parseHeader(code) };
}
