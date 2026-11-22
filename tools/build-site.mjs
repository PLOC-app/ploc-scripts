#!/usr/bin/env node
// Builds the gallery into _site/ (GitHub Pages):
//   _site/catalog.json            list of all scripts
//   _site/index.html              gallery
//   _site/<slug>/script.js        the script (the URL shared with PLOC)
//   _site/<slug>/index.html       page with description, code, QR code and "Open in PLOC" link
// Run `node tools/validate.mjs` first. SITE_URL overrides the public base URL.
import { mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ROOT, listSlugs, readScript } from "./lib.mjs";

const SITE_URL = (process.env.SITE_URL || "https://ploc-app.github.io/ploc-scripts").replace(/\/+$/, "");
const OUT = join(ROOT, "_site");
const RUN_SCHEME = "ploc://automation?s=";   // run the script
const EDIT_SCHEME = "ploc://script?s=";       // open it in the PLOC script editor

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const CSS = `
:root{--bg:#fff;--fg:#1d1d1f;--muted:#6e6e73;--card:#f5f5f7;--accent:#02ABF8;--on-accent:#0b1b24;--border:#d2d2d7}
@media(prefers-color-scheme:dark){:root{--bg:#111;--fg:#f5f5f7;--muted:#a1a1a6;--card:#1c1c1e;--accent:#02ABF8;--on-accent:#0b1b24;--border:#3a3a3c}}
[hidden]{display:none!important}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 -apple-system,system-ui,sans-serif}
main{max-width:760px;margin:0 auto;padding:24px 16px 64px}a{color:var(--accent)}h1{margin:.2em 0}
.top{display:flex;align-items:center;gap:12px}.top img{border-radius:12px;display:block}.top h1{margin:0}
.muted{color:var(--muted)}.badge{display:inline-block;padding:2px 10px;border-radius:99px;background:var(--card);border:1px solid var(--border);font-size:13px;margin-right:6px}
.card{display:block;padding:14px 16px;margin:10px 0;border-radius:12px;background:var(--card);color:inherit;text-decoration:none}
.card strong{display:block}.btn{display:inline-block;padding:10px 18px;border-radius:10px;background:var(--accent);color:var(--on-accent);text-decoration:none;font-weight:600}
input[type=search]{width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--fg);font:inherit;margin:12px 0}
pre{overflow:auto;padding:14px;border-radius:12px;background:var(--card);font:13px/1.45 ui-monospace,Menlo,monospace}
.qrs{display:flex;flex-wrap:wrap;gap:24px}.qrs figure{margin:0}.qrs figcaption{margin-top:6px;font-size:14px}
.qr{background:#fff;padding:12px;border-radius:12px;display:inline-block;line-height:0}.qr img{width:200px;height:200px}.btn.alt{background:var(--card);color:var(--fg);border:1px solid var(--border);margin-left:8px}
.chips button{border:1px solid var(--border);background:var(--bg);color:var(--fg);border-radius:99px;padding:4px 12px;margin:0 6px 6px 0;font:inherit;cursor:pointer}
.chips button[aria-pressed=true]{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
`;

const page = (title, body, extraHead = "", root = "") => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><link rel="icon" href="${root}logo.png"><style>${CSS}</style>${extraHead}</head><body><main>${body}</main></body></html>
`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
copyFileSync(join(ROOT, "site", "qrcode.js"), join(OUT, "qrcode.js"));
copyFileSync(join(ROOT, "site", "logo.png"), join(OUT, "logo.png"));

const catalog = [];
for (const slug of listSlugs()) {
    const s = readScript(slug);
    if (!s || !s.header) continue;
    const h = s.header;
    const url = `${SITE_URL}/${slug}/script.js`;
    const open = RUN_SCHEME + encodeURIComponent(url);
    const edit = EDIT_SCHEME + encodeURIComponent(url);
    catalog.push({
        slug, name: h.name, description: h.description, author: h.author, version: h.version,
        category: h.category, permissions: h.permissions, sdk: h.sdk ? Number(h.sdk) : null,
        url, page: `${SITE_URL}/${slug}/`, open, edit,
    });

    mkdirSync(join(OUT, slug), { recursive: true });
    copyFileSync(s.file, join(OUT, slug, "script.js"));
    writeFileSync(join(OUT, slug, "index.html"), page(`${h.name} - PLOC Scripts`, `
<p><a href="../">&larr; PLOC Scripts</a></p>
<h1>${esc(h.name)}</h1>
<p>${esc(h.description)}</p>
<p><span class="badge">${esc(h.category)}</span><span class="badge">${esc(h.permissions)}</span><span class="badge">v${esc(h.version)}</span>
<span class="muted">by ${esc(h.author)}</span></p>
<p><a class="btn" href="${esc(open)}">Run in PLOC</a><a class="btn alt" href="${esc(edit)}">Edit in PLOC</a></p>
<p class="muted">Or scan with your phone:</p>
<div class="qrs">
<figure><div class="qr" id="qr-run"></div><figcaption>Run</figcaption></figure>
<figure><div class="qr" id="qr-edit"></div><figcaption>Edit in the PLOC editor</figcaption></figure>
</div>
<h2>Code</h2>
<p class="muted">Read it before you run it: a script can read${h.permissions === "write" ? " and change" : ""} your cellar.</p>
<pre><code>${esc(s.code)}</code></pre>
<script src="../qrcode.js"></script>
<script>
(function () {
  function draw(id, text) {
    var qr = qrcode(0, "L");
    qr.addData(text, "Byte");
    qr.make();
    document.getElementById(id).innerHTML = qr.createImgTag(6, 0);
  }
  draw("qr-run", ${JSON.stringify(open)});
  draw("qr-edit", ${JSON.stringify(edit)});
})();
</script>`, "", "../"));
}

writeFileSync(join(OUT, "catalog.json"), JSON.stringify({ generated: new Date().toISOString(), scripts: catalog }, null, 2) + "\n");

const cats = [...new Set(catalog.map(c => c.category))].sort();
writeFileSync(join(OUT, "index.html"), page("PLOC Scripts", `
<header class="top"><a href="https://www.ploc.co"><img src="logo.png" alt="PLOC" width="48" height="48"></a><h1>PLOC Scripts</h1></header>
<p class="muted">Community scripts for <a href="https://www.ploc.co">PLOC</a>. Pick one, scan or open it in PLOC.
<a href="https://github.com/PLOC-app/ploc-scripts">Contribute on GitHub</a>.</p>
<input type="search" id="q" placeholder="Search a script" aria-label="Search a script">
<div class="chips" id="chips">${cats.map(c => `<button type="button" aria-pressed="false" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>
<div id="list">${catalog.map(c => `
<a class="card" href="${esc(c.slug)}/" data-c="${esc(c.category)}" data-t="${esc((c.name + " " + c.description + " " + c.author).toLowerCase())}">
<strong>${esc(c.name)}</strong><span class="muted">${esc(c.description)}</span><br>
<span class="badge">${esc(c.category)}</span><span class="badge">${esc(c.permissions)}</span></a>`).join("")}</div>
<script>
(function () {
  var q = document.getElementById("q"), cat = "";
  function apply() {
    var t = q.value.toLowerCase();
    document.querySelectorAll("#list .card").forEach(function (a) {
      a.hidden = (cat && a.dataset.c !== cat) || a.dataset.t.indexOf(t) < 0;
    });
  }
  q.oninput = apply;
  document.querySelectorAll("#chips button").forEach(function (b) {
    b.onclick = function () {
      cat = cat === b.dataset.c ? "" : b.dataset.c;
      document.querySelectorAll("#chips button").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.c === cat)); });
      apply();
    };
  });
})();
</script>`));

console.log(`Built ${catalog.length} script(s) into _site/ (base URL ${SITE_URL})`);
