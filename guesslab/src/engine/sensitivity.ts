import type { TreeNode, Variable } from "./types";
import { evaluateTree, TreeOverrides, Values, variablesInTree } from "./tree";

export interface SensitivityRow {
  varId: string;
  label: string;
  low: number;
  high: number;
  outLow: number;
  outHigh: number;
  /** Absolute spread of the output across the plausible range. */
  swing: number;
  /** % change in output for a +10% change in this input (elasticity × 10). */
  plus10: number;
}

/** One-at-a-time sensitivity over each variable's plausible range (a tornado chart). */
export function sensitivity(root: TreeNode, variables: Variable[], values: Values, overrides: TreeOverrides = {}): SensitivityRow[] {
  const used = new Set(variablesInTree(root, overrides));
  const base = evaluateTree(root, variables, values, overrides).value;
  return variables
    .filter((v) => used.has(v.id))
    .map((v) => {
      const [low, high] = v.plausible;
      const at = (x: number) => evaluateTree(root, variables, { ...values, [v.id]: x }, overrides).value;
      const outLow = at(low);
      const outHigh = at(high);
      const current = values[v.id] ?? v.value;
      const up = at(current * 1.1);
      return {
        varId: v.id,
        label: v.label,
        low,
        high,
        outLow,
        outHigh,
        swing: Math.abs(outHigh - outLow),
        plus10: base ? ((up - base) / base) * 100 : 0,
      };
    })
    .sort((a, b) => b.swing - a.swing);
}

/** Range of the answer if every variable sat at the edges of its plausible range in the same direction. */
export function answerRange(rows: SensitivityRow[], base: number): [number, number] {
  // Combine one-at-a-time effects multiplicatively (log space), damped so the range stays realistic.
  let logLow = 0;
  let logHigh = 0;
  rows.forEach((r) => {
    if (base <= 0) return;
    const lo = Math.min(r.outLow, r.outHigh);
    const hi = Math.max(r.outLow, r.outHigh);
    if (lo > 0) logLow += Math.pow(Math.log(base / lo), 2);
    if (hi > 0) logHigh += Math.pow(Math.log(hi / base), 2);
  });
  // Root-sum-of-squares: assumes errors are independent, not all wrong in the same direction.
  return [base / Math.exp(Math.sqrt(logLow)), base * Math.exp(Math.sqrt(logHigh))];
}
