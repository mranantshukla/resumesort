// Turns the Vite build (dist-spa/index.html) into a page body for hosts that supply their own
// <!doctype>/<html>/<head>/<body> wrapper, and lists the files to upload alongside it.
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(process.argv[2] ?? "dist-spa");
const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="(\.\/assets\/[^"]+)"/g)].map((m) => m[1].replace(/^\.\//, ""));
const js = [...html.matchAll(/<script type="module"[^>]*src="(\.\/assets\/[^"]+)"/g)].map((m) => m[1].replace(/^\.\//, ""));
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/)?.[0] ?? "";

const page = [
  "<title>GuessLab</title>",
  fonts,
  ...css.map((h) => `<link rel="stylesheet" href="${h}">`),
  '<div id="root"></div>',
  ...js.map((s) => `<script type="module" src="${s}"></script>`),
  "",
].join("\n");
fs.writeFileSync(path.join(dir, "page.html"), page);

const files = [];
const walk = (d) => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (!["index.html", "page.html"].includes(f)) files.push(path.relative(dir, p));
  }
};
walk(dir);
fs.writeFileSync(path.join(dir, "files.json"), JSON.stringify(files.filter((f) => f !== "files.json"), null, 2));
console.log(`page.html written; ${files.length} supporting files`);
