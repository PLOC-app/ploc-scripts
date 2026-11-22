#!/usr/bin/env node
// Checks every scripts/<slug>/script.js. Errors fail the run (exit 1); warnings never do.
import { listSlugs, readScript, CATEGORIES, PERMISSIONS, MAX_SIZE, SLUG_RE, VERSION_RE } from "./lib.mjs";

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const REQUIRED = ["name", "description", "author", "version", "category", "permissions"];
const slugs = listSlugs();
let errors = 0;
let warnings = 0;

const gha = (level, file, msg) => console.log(process.env.GITHUB_ACTIONS ? `::${level} file=${file}::${msg}` : `  ${level}: ${msg}`);

for (const slug of slugs) {
    const rel = `scripts/${slug}/script.js`;
    console.log(slug);
    const error = msg => { errors++; gha("error", rel, msg); };
    const warn = msg => { warnings++; gha("warning", rel, msg); };

    if (!SLUG_RE.test(slug)) error("folder name must be lowercase words separated by dashes");
    const s = readScript(slug);
    if (!s) { error("missing script.js"); continue; }
    const { code, size, header } = s;

    if (size > MAX_SIZE) error(`script is ${size} bytes (max ${MAX_SIZE})`);

    if (!header) {
        error("missing header comment (see TEMPLATE.js)");
    } else {
        for (const f of REQUIRED) if (!header[f]) error(`header: @${f} is required`);
        if (header.name && header.name.length > 60) error("header: @name is longer than 60 characters");
        if (header.version && !VERSION_RE.test(header.version)) error("header: @version must look like 1.0.0");
        if (header.category && !CATEGORIES.includes(header.category)) error(`header: @category must be one of ${CATEGORIES.join(", ")}`);
        if (header.permissions && !PERMISSIONS.includes(header.permissions)) error("header: @permissions must be read or write");
        if (header.sdk && !/^\d+$/.test(header.sdk)) error("header: @sdk must be an integer (SDK versionCode)");
    }

    // Must compile as the body of an async function (never executed here).
    try { new AsyncFunction("sdk", code); } catch (e) { error("syntax error: " + e.message); }

    // Rules for the runtime environment.
    if (/\b(?:const|let|var|function|class)\s+(?:sdk|auth)\b/.test(code)) error("do not declare `sdk` or `auth`: they are injected");
    if (/^\s*import\s.+from\s|^\s*import\s*\(|\brequire\s*\(/m.test(code)) error("`import` and `require` are not available");
    if (/\beval\s*\(|\bnew\s+Function\s*\(|\bFunction\s*\(/.test(code)) error("`eval` and `Function` are not allowed");

    // Heuristics: warnings only, the human review decides.
    const writes = /\.(?:save|delete|consume)\s*\(|backup\.restore|miniApps\.install|files\.delete/.test(code);
    if (writes && header?.permissions === "read") warn("changes data but declares `@permissions read`");
    if (writes && !/dialog\.confirm/.test(code)) warn("changes data without `sdk.dialog.confirm`");
    if (/sdk\.network\b|network\.(?:request|upload|download)/.test(code)) warn("uses the network: check the destination in the review");
    if (/\bsdk\s*\[|globalThis|window\[/.test(code)) warn("dynamic access to `sdk` or globals: check the intent in the review");
    const lines = code.split("\n");
    if (lines.some(l => l.length > 400)) warn("very long line: is the code minified or obfuscated?");
}

console.log(`\n${slugs.length} script(s), ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
