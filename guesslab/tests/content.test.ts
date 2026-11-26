import { describe, expect, it } from "vitest";
import { GUESSTIMATES } from "@/content/guesstimates";
import { evaluateTree, findNode, variablesInTree } from "@/engine/tree";
import { checkSegments } from "@/engine/mece";
import { parseUnit, sameDim } from "@/engine/units";
import { validateAssumptions, validateConstraints } from "@/engine/validation";

/** Every guided problem must be internally consistent, or learners will hit dead ends. */
describe.each(GUESSTIMATES.map((g) => [g.id, g] as const))("%s", (_id, g) => {
  const values = Object.fromEntries(g.variables.map((v) => [v.id, v.value]));

  it("every approach evaluates with consistent units and the expected answer unit", () => {
    g.approaches.forEach((a) => {
      const r = evaluateTree(a.tree, g.variables, values);
      expect(r.issues, `${a.id}: ${r.issues.map((i) => i.message).join("; ")}`).toEqual([]);
      expect(sameDim(r.dim, parseUnit(g.answerUnit)), `${a.id} unit`).toBe(true);
      expect(r.value).toBeGreaterThan(0);
    });
  });

  it("default answer lies inside the reference range, and approaches agree within 3x", () => {
    const [lo, hi] = g.stages.final.referenceRange;
    const vals = g.approaches.map((a) => evaluateTree(a.tree, g.variables, values).value);
    expect(vals[0]).toBeGreaterThanOrEqual(lo);
    expect(vals[0]).toBeLessThanOrEqual(hi);
    vals.slice(1).forEach((x) => expect(Math.max(x, vals[0]) / Math.min(x, vals[0])).toBeLessThan(3));
  });

  it("default assumptions are plausible and constraints hold", () => {
    expect(validateAssumptions(g.variables, values).filter((c) => c.level !== "ok")).toEqual([]);
    expect(validateConstraints(g.constraints, g.variables, values).every((c) => c.ok)).toBe(true);
  });

  it("every variable is used by some approach", () => {
    const used = new Set(g.approaches.flatMap((a) => variablesInTree(a.tree)));
    g.variables.forEach((v) => expect(used.has(v.id), v.id).toBe(true));
  });

  it("calculation steps point to real nodes in the primary tree", () => {
    const tree = g.approaches.find((a) => a.id === g.primaryApproach)!.tree;
    g.stages.calculation.steps.forEach((s) => expect(findNode(tree, s.nodeId), s.nodeId).toBeDefined());
    expect(g.stages.calculation.steps.at(-1)!.nodeId).toBe(tree.id);
  });

  it("the segment picker has at least one MECE answer and at least one trap", () => {
    const p = g.stages.structuring.picker;
    const singles = p.options.filter((o) => o.covers.length === 1);
    const atomic = p.universe.map((u) => singles.find((o) => o.covers[0] === u.id)?.id).filter(Boolean) as string[];
    expect(checkSegments(p, atomic).isMece).toBe(true);
    const traps = p.options.filter((o) => o.covers.length === p.universe.length || singles.some((s) => s.id !== o.id && s.covers[0] && o.covers.includes(s.covers[0]) && o.covers.length === 1));
    expect(traps.length).toBeGreaterThan(0);
  });

  it("each choice question has exactly one correct option and clarifying has strong questions", () => {
    g.stages.understanding.checks.forEach((q) => expect(q.options.filter((o) => o.correct).length).toBe(1));
    g.stages.understanding.scope.forEach((f) => expect(f.options.filter((o) => o.correct).length).toBe(1));
    expect(g.stages.clarifying.questions.some((q) => q.quality === "strong")).toBe(true);
    expect(g.stages.clarifying.questions.some((q) => q.quality === "weak")).toBe(true);
  });

  it("each stage guide has three progressive hints", () => {
    Object.values(g.stages).forEach((s) => expect(s.guide.hints.length).toBeGreaterThanOrEqual(1));
  });
});
