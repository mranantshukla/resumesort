// Deploys guesslab/ to Vercel through the REST API (no CLI login needed).
// Usage: VERCEL_TOKEN=... VERCEL_TEAM_ID=team_... node scripts/vercel-deploy.mjs
// In proxied environments that inject the token, VERCEL_TOKEN can be a placeholder;
// run with NODE_USE_ENV_PROXY=1 so Node's fetch uses HTTPS_PROXY.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const API = "https://api.vercel.com";
const token = process.env.VERCEL_TOKEN ?? "placeholder";
const team = process.env.VERCEL_TEAM_ID;
const name = process.env.VERCEL_PROJECT ?? "guesslab";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const q = team ? `teamId=${team}` : "";
const H = { Authorization: `Bearer ${token}` };

const SKIP_DIRS = new Set(["node_modules", ".next", "dist-spa", ".git", ".vercel"]);
const SKIP_FILES = (f) => f.startsWith(".env") && f !== ".env.example" || f.endsWith(".tsbuildinfo");

function collect(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(f)) collect(p, out);
    } else if (!SKIP_FILES(f)) out.push(p);
  }
  return out;
}

async function api(method, url, body, headers = {}) {
  const res = await fetch(`${API}${url}${url.includes("?") ? "&" : "?"}${q}`, {
    method,
    headers: { ...H, ...headers },
    body,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}: ${text.slice(0, 400)}`);
  return json;
}

const files = collect(root).map((p) => {
  const data = fs.readFileSync(p);
  return { file: path.relative(root, p).split(path.sep).join("/"), data, sha: crypto.createHash("sha1").update(data).digest("hex"), size: data.length };
});
console.log(`Uploading ${files.length} files…`);
for (const f of files) {
  await api("POST", "/v2/files", f.data, { "Content-Type": "application/octet-stream", "x-vercel-digest": f.sha, "Content-Length": String(f.size) });
}

const dep = await api(
  "POST",
  "/v13/deployments?skipAutoDetectionConfirmation=1",
  JSON.stringify({
    name,
    target: "production",
    files: files.map(({ file, sha, size }) => ({ file, sha, size })),
    projectSettings: { framework: "nextjs", installCommand: "npm install", buildCommand: "npm run build" },
  }),
  { "Content-Type": "application/json" },
);
console.log(`Deployment ${dep.id} created: https://${dep.url}`);

for (let i = 0; i < 120; i++) {
  const d = await api("GET", `/v13/deployments/${dep.id}`);
  if (d.readyState === "READY") {
    console.log(`READY https://${d.url}`);
    (d.alias ?? []).forEach((a) => console.log(`ALIAS https://${a}`));
    process.exit(0);
  }
  if (["ERROR", "CANCELED"].includes(d.readyState)) {
    console.log(`FAILED ${d.readyState}: ${d.errorMessage ?? ""}`);
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 5000));
}
console.log("Timed out waiting for the build; check the Vercel dashboard.");
process.exit(1);
