import type { Guesstimate, SessionState, StageId, TreeNode } from "./types";
import { STAGE_ORDER } from "./types";
import { checkSegments } from "./mece";
import { evaluateTree, findNode, TreeOverrides } from "./tree";
import { validateAssumptions, validateConstraints } from "./validation";

export function createSession(problem: Guesstimate, now = Date.now()): SessionState {
  return {
    problemId: problem.id,
    startedAt: now,
    updatedAt: now,
    stage: "understanding",
    completed: [],
    understanding: { answers: {}, scope: {} },
    clarifying: { picked: [], asked: false },
    structuring: { picked: [], checks: 0, passedOnCheck: null, approach: problem.primaryApproach, comparedApproaches: false },
    values: Object.fromEntries(problem.variables.map((v) => [v.id, v.value])),
    tree: { excluded: [], custom: {} },
    assumptions: { confirmed: [], derivationsViewed: [] },
    calculation: { entries: {}, attempts: {}, correct: [], revealed: [] },
    sensitivity: { answer: null, correct: null },
    final: { text: "", generated: false },
    hintsUsed: {},
    notes: "",
    evaluation: null,
  };
}

export function primaryTree(problem: Guesstimate): TreeNode {
  const a = problem.approaches.find((x) => x.id === problem.primaryApproach) ?? problem.approaches[0];
  return a.tree;
}

export function overridesOf(s: SessionState): TreeOverrides {
  return { excluded: s.tree.excluded, custom: s.tree.custom };
}

export function currentAnswer(problem: Guesstimate, s: SessionState): number {
  return evaluateTree(primaryTree(problem), problem.variables, s.values, overridesOf(s)).value;
}

/** Expected value of a node given the learner's own assumptions (we grade reasoning, not a fixed answer). */
export function expectedNodeValue(problem: Guesstimate, s: SessionState, nodeId: string): number | null {
  const ev = evaluateTree(primaryTree(problem), problem.variables, s.values, overridesOf(s));
  return ev.results[nodeId]?.value ?? null;
}

export const CALC_TOLERANCE = 0.05;

export function isCalcCorrect(expected: number, entered: number): boolean {
  if (!isFinite(entered)) return false;
  if (expected === 0) return Math.abs(entered) < 1e-9;
  return Math.abs(entered - expected) / Math.abs(expected) <= CALC_TOLERANCE;
}

/** What still blocks the learner from finishing a stage. Empty list = can advance. */
export function stageBlockers(problem: Guesstimate, s: SessionState, stage: StageId = s.stage): string[] {
  const st = problem.stages;
  switch (stage) {
    case "understanding": {
      const out: string[] = [];
      const unanswered = st.understanding.checks.filter((q) => !s.understanding.answers[q.id]);
      if (unanswered.length) out.push(`Answer ${unanswered.length} more question${unanswered.length > 1 ? "s" : ""}.`);
      const unscoped = st.understanding.scope.filter((f) => !s.understanding.scope[f.id]);
      if (unscoped.length) out.push(`Choose the ${unscoped.map((f) => f.label.toLowerCase()).join(", ")}.`);
      return out;
    }
    case "clarifying":
      if (s.clarifying.picked.length === 0) return ["Pick at least one question to ask."];
      if (!s.clarifying.asked) return ["Ask your questions to hear the interviewer's answers."];
      return [];
    case "structuring": {
      const r = checkSegments(st.structuring.picker, s.structuring.picked);
      if (s.structuring.checks === 0) return ["Choose segments and check your structure."];
      if (!r.isMece) return ["Fix the overlap or gap in your segments, then check again."];
      return [];
    }
    case "assumptions": {
      const used = problem.variables.map((v) => v.id);
      const notConfirmed = used.filter((id) => !s.assumptions.confirmed.includes(id));
      const errors = validateAssumptions(problem.variables, s.values).filter((c) => c.level === "error");
      const out: string[] = [];
      if (errors.length) out.push("Fix the assumptions marked in red.");
      const broken = validateConstraints(problem.constraints, problem.variables, s.values).filter((c) => !c.ok);
      if (broken.length) out.push(broken[0].message);
      if (notConfirmed.length) out.push(`Confirm ${notConfirmed.length} more assumption${notConfirmed.length > 1 ? "s" : ""}.`);
      const ev = evaluateTree(primaryTree(problem), problem.variables, s.values, overridesOf(s));
      if (ev.issues.length) out.push("Resolve the unit problems in your tree.");
      return out;
    }
    case "calculation": {
      const left = st.calculation.steps.filter((c) => !s.calculation.correct.includes(c.nodeId) && !s.calculation.revealed.includes(c.nodeId));
      return left.length ? [`Complete ${left.length} more calculation step${left.length > 1 ? "s" : ""}.`] : [];
    }
    case "sensitivity":
      return s.sensitivity.answer ? [] : ["Pick the assumption that moves the answer most."];
    case "final":
      return s.final.text.trim().length >= 80 ? [] : ["Write or generate your final answer (at least a few sentences)."];
    case "evaluation":
      return [];
  }
}

export function nextStage(stage: StageId): StageId | null {
  const i = STAGE_ORDER.indexOf(stage);
  return i >= 0 && i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1] : null;
}

export function isUnlocked(s: SessionState, stage: StageId): boolean {
  const i = STAGE_ORDER.indexOf(stage);
  if (i === 0) return true;
  return s.completed.includes(STAGE_ORDER[i - 1]);
}

export function progressPct(s: SessionState): number {
  return Math.round((s.completed.length / STAGE_ORDER.length) * 100);
}

export function nodeLabel(problem: Guesstimate, s: SessionState, id: string): string {
  return findNode(primaryTree(problem), id, overridesOf(s))?.label ?? id;
}
