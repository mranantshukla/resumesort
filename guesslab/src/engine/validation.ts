import type { Variable } from "./types";
import { isDimensionless } from "./units";
import { formatValue } from "./format";

export interface AssumptionCheck {
  varId: string;
  level: "ok" | "warn" | "error";
  message: string;
}

/** Validate each assumption against its plausible range and basic logic (shares must be between 0 and 100%). */
export function validateAssumptions(variables: Variable[], values: Record<string, number>): AssumptionCheck[] {
  return variables.map((v) => {
    const x = values[v.id] ?? v.value;
    if (!isFinite(x)) return { varId: v.id, level: "error", message: "Enter a number." };
    if (x < 0) return { varId: v.id, level: "error", message: "This can't be negative." };
    if (v.unit === "%" && x > 1) return { varId: v.id, level: "error", message: "A share can't be above 100%." };
    if (isDimensionless(v.unit) && v.unit === "%" && x === 0) return { varId: v.id, level: "warn", message: "0% removes this whole branch. Is that intended?" };
    const [lo, hi] = v.plausible;
    if (x < lo || x > hi) {
      const dir = x < lo ? "low" : "high";
      return {
        varId: v.id,
        level: "warn",
        message: `${formatValue(x, v.unit)} looks ${dir}. A defensible range is ${formatValue(lo, v.unit)}–${formatValue(hi, v.unit)}.${v.hint ? " " + v.hint : ""}`,
      };
    }
    return { varId: v.id, level: "ok", message: "Within a defensible range." };
  });
}

export interface ConstraintCheck {
  vars: string[];
  ok: boolean;
  total: number;
  message: string;
}

/** Shares that partition a group must add to 100%: above means double counting, below means a gap. */
export function validateConstraints(
  constraints: { vars: string[]; sum: number; message: string }[] | undefined,
  variables: Variable[],
  values: Record<string, number>,
): ConstraintCheck[] {
  return (constraints ?? []).map((c) => {
    const total = c.vars.reduce((a, id) => a + (values[id] ?? variables.find((v) => v.id === id)?.value ?? 0), 0);
    const ok = Math.abs(total - c.sum) < 0.005;
    const label = c.vars.map((id) => variables.find((v) => v.id === id)?.label ?? id).join(" + ");
    return {
      vars: c.vars,
      ok,
      total,
      message: ok
        ? `${label} adds up to ${Math.round(c.sum * 100)}%.`
        : `${label} = ${Math.round(total * 100)}%, not ${Math.round(c.sum * 100)}%. ${total > c.sum ? "Some people are counted twice." : "Some people are left out."} ${c.message}`,
    };
  });
}
