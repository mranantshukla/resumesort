// Dimensional analysis for estimation trees. A unit like "cup/person/day" becomes
// { cup: 1, person: -1, day: -1 }. Multiplying adds exponents; dividing subtracts them.
// Adding two quantities requires identical dimensions, which is how GuessLab catches
// mistakes like adding "cups per day" to "people".

export type Dim = Record<string, number>;

const DIMENSIONLESS = new Set(["", "%", "share", "fraction", "ratio", "x", "pct", "percent", "1"]);

const ALIASES: Record<string, string> = {
  cups: "cup",
  people: "person",
  persons: "person",
  adults: "person",
  users: "person",
  user: "person",
  days: "day",
  orders: "order",
  plates: "plate",
  hours: "hour",
  hr: "hour",
  hrs: "hour",
  h: "hour",
  mins: "min",
  minute: "min",
  minutes: "min",
  weeks: "week",
  months: "month",
  years: "year",
  yr: "year",
  yrs: "year",
  households: "household",
  tickets: "ticket",
  screens: "screen",
  shows: "show",
  riders: "rider",
  pickers: "picker",
  visits: "visit",
  rupees: "INR",
  rupee: "INR",
  rs: "INR",
  inr: "INR",
  "₹": "INR",
  kgs: "kg",
  grams: "g",
  gram: "g",
  weekends: "weekend",
  seats: "seat",
  restaurants: "restaurant",
  stores: "store",
  items: "item",
  vehicles: "vehicle",
};

export function canonicalToken(token: string): string {
  const t = token.trim();
  if (!t) return "";
  const lower = t.toLowerCase();
  if (ALIASES[lower]) return ALIASES[lower];
  if (lower === "inr" || t === "₹") return "INR";
  // Simple plural folding for learner-typed units ("pizzas" -> "pizza"), keeping short words intact.
  if (lower.length > 3 && lower.endsWith("s") && !lower.endsWith("ss")) return lower.slice(0, -1);
  return lower;
}

function addInto(dim: Dim, token: string, power: number) {
  const key = canonicalToken(token);
  if (!key || DIMENSIONLESS.has(key)) return;
  dim[key] = (dim[key] ?? 0) + power;
  if (dim[key] === 0) delete dim[key];
}

/** Parse "cup/person/day", "INR/plate", "kg·g/day", "%" into a dimension map. */
export function parseUnit(unit: string | undefined): Dim {
  const dim: Dim = {};
  if (!unit) return dim;
  const trimmed = unit.trim();
  if (DIMENSIONLESS.has(trimmed.toLowerCase())) return dim;
  const parts = trimmed.split("/");
  parts.forEach((part, i) => {
    const power = i === 0 ? 1 : -1;
    part
      .split(/[·*×\s]+/)
      .filter(Boolean)
      .forEach((tok) => addInto(dim, tok, power));
  });
  return dim;
}

export function multiplyDims(a: Dim, b: Dim): Dim {
  const out: Dim = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = (out[k] ?? 0) + v;
    if (out[k] === 0) delete out[k];
  }
  return out;
}

export function divideDims(a: Dim, b: Dim): Dim {
  const inv: Dim = {};
  for (const [k, v] of Object.entries(b)) inv[k] = -v;
  return multiplyDims(a, inv);
}

export function sameDim(a: Dim, b: Dim): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) if ((a[k] ?? 0) !== (b[k] ?? 0)) return false;
  return true;
}

function power(k: string, v: number): string {
  return Math.abs(v) === 1 ? k : `${k}^${Math.abs(v)}`;
}

/** Render a dimension map back into a readable unit string. */
export function formatDim(dim: Dim): string {
  const entries = Object.entries(dim).filter(([, v]) => v !== 0).sort(([a], [b]) => a.localeCompare(b));
  const num = entries.filter(([, v]) => v > 0).map(([k, v]) => power(k, v));
  const den = entries.filter(([, v]) => v < 0).map(([k, v]) => power(k, v));
  if (!num.length && !den.length) return "no unit";
  return `${num.length ? num.join("·") : "1"}${den.length ? "/" + den.join("/") : ""}`;
}

export function isDimensionless(unit: string | undefined): boolean {
  return Object.keys(parseUnit(unit)).length === 0;
}
