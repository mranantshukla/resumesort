// Number formatting in both Indian (lakh/crore) and international (million/billion) styles.

export function roundSig(n: number, sig = 2): number {
  if (!isFinite(n) || n === 0) return n;
  const p = Math.pow(10, sig - Math.ceil(Math.log10(Math.abs(n))));
  return Math.round(n * p) / p;
}

function trim(n: number, digits: number): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: digits });
}

/** 2,150,000,000 -> "215 crore" ; 450000 -> "4.5 lakh" */
export function indian(n: number, digits = 1): string {
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (a >= 1e7) return `${s}${trim(a / 1e7, digits)} crore`;
  if (a >= 1e5) return `${s}${trim(a / 1e5, digits)} lakh`;
  if (a >= 1000) return `${s}${trim(a, 0)}`;
  return `${s}${trim(a, a < 10 ? 2 : 1)}`;
}

/** 2,150,000,000 -> "2.2 billion" */
export function intl(n: number, digits = 1): string {
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (a >= 1e9) return `${s}${(a / 1e9).toFixed(digits).replace(/\.0$/, "")} billion`;
  if (a >= 1e6) return `${s}${(a / 1e6).toFixed(digits).replace(/\.0$/, "")} million`;
  if (a >= 1e3) return `${s}${(a / 1e3).toFixed(digits).replace(/\.0$/, "")} thousand`;
  return `${s}${trim(a, a < 10 ? 2 : 1)}`;
}

export function both(n: number): string {
  const r = roundSig(n, 2);
  const i = indian(r);
  const w = intl(r);
  return i === w ? i : `${i} (${w})`;
}

export function pct(fraction: number, digits = 0): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function formatValue(value: number, unit: string, digits = 1): string {
  if (unit === "%") return pct(value, value < 0.1 ? 1 : 0);
  if (/^INR/.test(unit)) return `₹${indian(value, digits)}`;
  return indian(value, digits);
}

/** Parse learner input like "2.1 crore", "450k", "3.5 lakh", "2,000", "1.2e9", "65%". */
export function parseNumberInput(raw: string): number | null {
  if (raw == null) return null;
  let s = String(raw).trim().toLowerCase().replace(/,/g, "").replace(/₹|rs\.?/g, "").trim();
  if (!s) return null;
  let mult = 1;
  const words: [RegExp, number][] = [
    [/\s*(crores?|cr)$/, 1e7],
    [/\s*(lakhs?|lacs?|l)$/, 1e5],
    [/\s*(billions?|bn|b)$/, 1e9],
    [/\s*(millions?|mn|m)$/, 1e6],
    [/\s*(thousands?|k)$/, 1e3],
    [/\s*%$/, 0.01],
  ];
  for (const [re, m] of words) {
    if (re.test(s)) {
      s = s.replace(re, "");
      mult = m;
      break;
    }
  }
  const n = Number(s);
  if (!isFinite(n)) return null;
  return n * mult;
}

/** Ratio between two positive numbers, always >= 1. */
export function foldDifference(a: number, b: number): number {
  if (a <= 0 || b <= 0) return Infinity;
  return a > b ? a / b : b / a;
}
