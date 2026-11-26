import { describe, expect, it } from "vitest";
import { formatDim, parseUnit, sameDim, multiplyDims } from "@/engine/units";
import { evaluateTree } from "@/engine/tree";
import type { TreeNode, Variable } from "@/engine/types";
import { checkSegments, suspectOverlaps } from "@/engine/mece";
import { sensitivity, answerRange } from "@/engine/sensitivity";
import { validateAssumptions, validateConstraints } from "@/engine/validation";
import { parseNumberInput, indian, roundSig } from "@/engine/format";
import { chai } from "@/content/guesstimates/chai";

const v = (id: string, unit: string, value: number, plausible: [number, number] = [value / 2, value * 2]): Variable => ({
  id, label: id, unit, value, min: 0, max: value * 10, step: 1, plausible, reliability: "illustrative", derive: "",
});

describe("units", () => {
  it("parses compound units and normalises plurals", () => {
    expect(parseUnit("cups/person/day")).toEqual({ cup: 1, person: -1, day: -1 });
    expect(parseUnit("%")).toEqual({});
    expect(parseUnit("INR/plate")).toEqual({ INR: 1, plate: -1 });
  });
  it("cancels units when multiplying", () => {
    const d = multiplyDims(parseUnit("person"), parseUnit("cup/person/day"));
    expect(sameDim(d, parseUnit("cup/day"))).toBe(true);
    expect(formatDim(d)).toBe("cup/day");
  });
});

describe("tree evaluation", () => {
  const vars = [v("pop", "person", 100), v("cups", "cup/person/day", 2), v("share", "%", 0.5)];
  it("multiplies and sums with unit checks", () => {
    const tree: TreeNode = {
      id: "root", label: "Total", kind: "sum", unit: "cup/day",
      children: [
        { id: "a", label: "A", kind: "product", children: [{ id: "a1", label: "pop", kind: "var", varId: "pop" }, { id: "a2", label: "cups", kind: "var", varId: "cups" }] },
        { id: "b", label: "B", kind: "product", children: [{ id: "b1", label: "pop", kind: "var", varId: "pop" }, { id: "b2", label: "share", kind: "var", varId: "share" }, { id: "b3", label: "cups", kind: "var", varId: "cups" }] },
      ],
    };
    const r = evaluateTree(tree, vars, { pop: 100, cups: 2, share: 0.5 });
    expect(r.value).toBe(300);
    expect(r.issues).toEqual([]);
  });
  it("flags adding quantities with different units", () => {
    const tree: TreeNode = {
      id: "root", label: "Total", kind: "sum",
      children: [{ id: "a", label: "People", kind: "var", varId: "pop" }, { id: "b", label: "Cups", kind: "var", varId: "cups" }],
    };
    const r = evaluateTree(tree, vars, {});
    expect(r.issues.some((i) => i.kind === "unit-mismatch")).toBe(true);
  });
  it("respects excluded segments and learner-added literal segments", () => {
    const tree: TreeNode = { id: "root", label: "Total", kind: "sum", children: [{ id: "a", label: "A", kind: "var", varId: "pop" }] };
    const custom = { root: [{ id: "c1", label: "Extra", kind: "var" as const, custom: true, literal: { value: 50, unit: "person" } }] };
    expect(evaluateTree(tree, vars, {}, { custom }).value).toBe(150);
    expect(evaluateTree(tree, vars, {}, { custom, excluded: ["a"] }).value).toBe(50);
    const bad = { root: [{ id: "c2", label: "Wrong", kind: "var" as const, custom: true, literal: { value: 5, unit: "cup/day" } }] };
    expect(evaluateTree(tree, vars, {}, { custom: bad }).issues[0].kind).toBe("unit-mismatch");
  });
  it("handles divide and min", () => {
    const vs = [v("a", "order/week", 700), v("d", "day/week", 7), v("cap", "order/day", 60)];
    const tree: TreeNode = {
      id: "m", label: "min", kind: "min", unit: "order/day",
      children: [{ id: "x", label: "x", kind: "divide", children: [{ id: "x1", label: "a", kind: "var", varId: "a" }, { id: "x2", label: "d", kind: "var", varId: "d" }] }, { id: "c", label: "cap", kind: "var", varId: "cap" }],
    };
    const r = evaluateTree(tree, vs, {});
    expect(r.results.x.value).toBe(100);
    expect(r.value).toBe(60);
    expect(r.issues).toEqual([]);
  });
});

describe("MECE detection", () => {
  const picker = chai.stages.structuring.picker;
  it("accepts home + outside", () => {
    expect(checkSegments(picker, ["o-home", "o-out"]).isMece).toBe(true);
  });
  it("accepts the fine-grained split", () => {
    expect(checkSegments(picker, ["o-home", "o-stall", "o-work", "o-cafe", "o-travel", "o-inst"]).isMece).toBe(true);
  });
  it("detects double counting from people-based segments", () => {
    const r = checkSegments(picker, ["o-home", "o-office-workers", "o-out"]);
    expect(r.isMece).toBe(false);
    expect(r.overlaps.length).toBeGreaterThan(0);
  });
  it("detects gaps", () => {
    const r = checkSegments(picker, ["o-home", "o-stall"]);
    expect(r.missing).toContain("work");
  });
  it("flags suspicious learner-written segments", () => {
    expect(suspectOverlaps(["College students", "Young students in hostels"]).length).toBe(1);
    expect(suspectOverlaps(["Weekend orders", "Working professionals"]).length).toBe(1);
    expect(suspectOverlaps(["Lunch 12–4 pm", "Dinner 6–9 pm"]).length).toBe(0);
  });
});

describe("sensitivity and validation", () => {
  it("ranks the widest-swing variable first", () => {
    const tree = chai.approaches[0].tree;
    const values = Object.fromEntries(chai.variables.map((x) => [x.id, x.value]));
    const rows = sensitivity(tree, chai.variables, values);
    expect(rows[0].swing).toBeGreaterThanOrEqual(rows[rows.length - 1].swing);
    expect(rows.map((r) => r.varId)).not.toContain("annualKg"); // supply-side vars are not in the primary tree
    const base = evaluateTree(tree, chai.variables, values).value;
    const [lo, hi] = answerRange(rows, base);
    expect(lo).toBeLessThan(base);
    expect(hi).toBeGreaterThan(base);
  });
  it("flags shares above 100% and implausible values", () => {
    const checks = validateAssumptions(chai.variables, { ...Object.fromEntries(chai.variables.map((x) => [x.id, x.value])), teaShare: 1.2, homeCups: 6 });
    expect(checks.find((c) => c.varId === "teaShare")?.level).toBe("error");
    expect(checks.find((c) => c.varId === "homeCups")?.level).toBe("warn");
  });
  it("checks that partition shares add to 100%", () => {
    const vars = [v("h", "%", 0.2), v("l", "%", 0.8)];
    expect(validateConstraints([{ vars: ["h", "l"], sum: 1, message: "" }], vars, { h: 0.2, l: 0.8 })[0].ok).toBe(true);
    const bad = validateConstraints([{ vars: ["h", "l"], sum: 1, message: "" }], vars, { h: 0.3, l: 0.8 })[0];
    expect(bad.ok).toBe(false);
    expect(bad.message).toMatch(/counted twice/);
  });
});

describe("formatting and number input", () => {
  it("parses Indian and international magnitudes", () => {
    expect(parseNumberInput("2.1 crore")).toBeCloseTo(2.1e7);
    expect(parseNumberInput("4.5 lakh")).toBeCloseTo(4.5e5);
    expect(parseNumberInput("1.2 billion")).toBeCloseTo(1.2e9);
    expect(parseNumberInput("65%")).toBeCloseTo(0.65);
    expect(parseNumberInput("12,000")).toBe(12000);
    expect(parseNumberInput("abc")).toBeNull();
  });
  it("formats in lakh and crore", () => {
    expect(indian(2.15e9)).toBe("215 crore");
    expect(indian(450000)).toBe("4.5 lakh");
    expect(roundSig(2146125000, 2)).toBe(2100000000);
  });
});
