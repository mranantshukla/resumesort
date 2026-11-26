import type { TreeNode, Variable } from "./types";
import { Dim, divideDims, formatDim, multiplyDims, parseUnit, sameDim } from "./units";

export interface TreeOverrides {
  /** Node ids excluded from their parent sum (learner toggled a segment off). */
  excluded?: string[];
  /** Learner-added children keyed by parent node id. */
  custom?: Record<string, TreeNode[]>;
}

export type IssueKind = "unit-mismatch" | "unexpected-unit" | "missing-variable" | "divide-by-zero" | "empty";

export interface TreeIssue {
  nodeId: string;
  kind: IssueKind;
  message: string;
}

export interface NodeResult {
  value: number;
  dim: Dim;
  unitLabel: string;
  excluded: boolean;
}

export interface TreeEvaluation {
  value: number;
  dim: Dim;
  results: Record<string, NodeResult>;
  issues: TreeIssue[];
}

export type Values = Record<string, number>;

/** Children of a node after applying learner overrides (custom children appended). */
export function childrenOf(node: TreeNode, overrides: TreeOverrides = {}): TreeNode[] {
  const base = node.children ?? [];
  const extra = overrides.custom?.[node.id] ?? [];
  return [...base, ...extra];
}

export function evaluateTree(
  root: TreeNode,
  variables: Variable[],
  values: Values,
  overrides: TreeOverrides = {},
): TreeEvaluation {
  const varMap = new Map(variables.map((v) => [v.id, v]));
  const excluded = new Set(overrides.excluded ?? []);
  const results: Record<string, NodeResult> = {};
  const issues: TreeIssue[] = [];

  const visit = (node: TreeNode, isExcluded: boolean): { value: number; dim: Dim } => {
    let value = 0;
    let dim: Dim = {};
    const kids = childrenOf(node, overrides);

    if (node.literal) {
      value = node.literal.value;
      dim = parseUnit(node.literal.unit);
    } else if (node.kind === "var") {
      const v = node.varId ? varMap.get(node.varId) : undefined;
      if (!v) {
        issues.push({ nodeId: node.id, kind: "missing-variable", message: `“${node.label}” has no assumption attached.` });
      } else {
        value = values[v.id] ?? v.value;
        dim = parseUnit(v.unit);
      }
    } else if (node.kind === "product") {
      value = 1;
      kids.forEach((c) => {
        const r = visit(c, isExcluded);
        value *= r.value;
        dim = multiplyDims(dim, r.dim);
      });
      if (!kids.length) issues.push({ nodeId: node.id, kind: "empty", message: `“${node.label}” has nothing to multiply.` });
    } else if (node.kind === "divide") {
      const [num, ...den] = kids;
      if (!num || !den.length) {
        issues.push({ nodeId: node.id, kind: "empty", message: `“${node.label}” needs a numerator and a denominator.` });
      } else {
        const n = visit(num, isExcluded);
        let d = 1;
        let dDim: Dim = {};
        den.forEach((c) => {
          const r = visit(c, isExcluded);
          d *= r.value;
          dDim = multiplyDims(dDim, r.dim);
        });
        if (d === 0) {
          issues.push({ nodeId: node.id, kind: "divide-by-zero", message: `“${node.label}” divides by zero.` });
          value = 0;
        } else value = n.value / d;
        dim = divideDims(n.dim, dDim);
      }
    } else if (node.kind === "sum" || node.kind === "min") {
      const parts: { value: number; dim: Dim; node: TreeNode }[] = [];
      kids.forEach((c) => {
        const off = excluded.has(c.id);
        const r = visit(c, isExcluded || off);
        if (!off) parts.push({ ...r, node: c });
      });
      if (!parts.length) {
        issues.push({ nodeId: node.id, kind: "empty", message: `Every part of “${node.label}” is switched off.` });
      } else {
        dim = parts[0].dim;
        parts.slice(1).forEach((p) => {
          if (!sameDim(p.dim, dim)) {
            issues.push({
              nodeId: p.node.id,
              kind: "unit-mismatch",
              message: `You can't ${node.kind === "sum" ? "add" : "compare"} “${p.node.label}” (${formatDim(p.dim)}) with “${parts[0].node.label}” (${formatDim(dim)}). Check the units of each factor.`,
            });
          }
        });
        value = node.kind === "sum" ? parts.reduce((s, p) => s + p.value, 0) : Math.min(...parts.map((p) => p.value));
      }
    }

    if (node.unit !== undefined) {
      const expected = parseUnit(node.unit);
      if (!sameDim(expected, dim) && !issues.some((i) => i.nodeId === node.id)) {
        issues.push({
          nodeId: node.id,
          kind: "unexpected-unit",
          message: `“${node.label}” should come out in ${formatDim(expected)}, but the factors give ${formatDim(dim)}.`,
        });
      }
    }

    results[node.id] = { value, dim, unitLabel: formatDim(dim), excluded: isExcluded };
    return { value, dim };
  };

  const r = visit(root, false);
  return { value: r.value, dim: r.dim, results, issues };
}

/** Depth-first list of nodes (including custom children). */
export function flattenTree(root: TreeNode, overrides: TreeOverrides = {}): { node: TreeNode; depth: number; parentId: string | null }[] {
  const out: { node: TreeNode; depth: number; parentId: string | null }[] = [];
  const walk = (n: TreeNode, depth: number, parentId: string | null) => {
    out.push({ node: n, depth, parentId });
    childrenOf(n, overrides).forEach((c) => walk(c, depth + 1, n.id));
  };
  walk(root, 0, null);
  return out;
}

export function findNode(root: TreeNode, id: string, overrides: TreeOverrides = {}): TreeNode | undefined {
  return flattenTree(root, overrides).find((f) => f.node.id === id)?.node;
}

/** Variables actually used by a tree. */
export function variablesInTree(root: TreeNode, overrides: TreeOverrides = {}): string[] {
  return flattenTree(root, overrides)
    .map((f) => f.node.varId)
    .filter((v): v is string => Boolean(v));
}

/** Plain-text formula, e.g. "Home cups = Tea drinkers × Home cups per drinker". */
export function formulaText(node: TreeNode, overrides: TreeOverrides = {}): string {
  const kids = childrenOf(node, overrides).filter((c) => !(overrides.excluded ?? []).includes(c.id));
  const name = (c: TreeNode) => c.label;
  switch (node.kind) {
    case "product":
      return kids.map(name).join(" × ");
    case "sum":
      return kids.map(name).join(" + ");
    case "divide":
      return kids.length > 1 ? `${name(kids[0])} ÷ (${kids.slice(1).map(name).join(" × ")})` : name(kids[0] ?? node);
    case "min":
      return `smallest of (${kids.map(name).join(", ")})`;
    default:
      return node.label;
  }
}

function texEscape(s: string): string {
  return s.replace(/([#%&_{}$])/g, "\\$1").replace(/₹/g, "\\text{Rs}");
}

/** KaTeX formula for one node in terms of its children. */
export function formulaTex(node: TreeNode, overrides: TreeOverrides = {}): string {
  const kids = childrenOf(node, overrides).filter((c) => !(overrides.excluded ?? []).includes(c.id));
  const t = (c: TreeNode) => `\\text{${texEscape(c.label)}}`;
  const lhs = `\\text{${texEscape(node.label)}}`;
  switch (node.kind) {
    case "product":
      return `${lhs} = ${kids.map(t).join(" \\times ")}`;
    case "sum":
      return `${lhs} = ${kids.map(t).join(" + ")}`;
    case "divide":
      return `${lhs} = \\dfrac{${kids[0] ? t(kids[0]) : "?"}}{${kids.slice(1).map(t).join(" \\times ") || "?"}}`;
    case "min":
      return `${lhs} = \\min\\left(${kids.map(t).join(",\\ ")}\\right)`;
    default:
      return lhs;
  }
}
