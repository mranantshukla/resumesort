// Hash routing for the static build. Hosts that only pass a plain "#name" fragment (letters,
// digits, hyphens) need routes like "#learn--chai-cups-india" instead of "/learn/chai-cups-india".

export const KNOWLEDGE_SECTIONS = ["formulas", "frameworks", "stats", "assumptions", "glossary", "cheatsheets", "mistakes"];

/** "/learn/x" -> "#learn--x", "/interview?problem=x" -> "#interview--x", "/knowledge#stats" -> "#stats", "/" -> "#home" */
export function pathToHash(href: string): string {
  if (href.startsWith("#")) return href;
  if (/^https?:/.test(href)) return href;
  const [pathAndQuery, frag] = href.split("#");
  const [path, query] = pathAndQuery.split("?");
  if (frag && KNOWLEDGE_SECTIONS.includes(frag)) return `#${frag}`;
  const parts = path.split("/").filter(Boolean);
  if (!parts.length) return "#home";
  const problem = query ? new URLSearchParams(query).get("problem") : null;
  if (parts[0] === "interview" && problem) return `#interview--${problem}`;
  return `#${parts.join("--")}`;
}

/** Inverse: "#learn--x" -> { path: "/learn/x", query } */
export function hashToPath(hash: string): { path: string; params: URLSearchParams; section: string | null } {
  const h = hash.replace(/^#/, "");
  if (!h || h === "home") return { path: "/", params: new URLSearchParams(), section: null };
  if (KNOWLEDGE_SECTIONS.includes(h)) return { path: "/knowledge", params: new URLSearchParams(), section: h };
  const [head, ...rest] = h.split("--");
  if (head === "interview" && rest.length) return { path: "/interview", params: new URLSearchParams({ problem: rest.join("--") }), section: null };
  return { path: "/" + [head, ...rest].join("/"), params: new URLSearchParams(), section: null };
}
