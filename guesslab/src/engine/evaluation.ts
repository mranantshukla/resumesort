import type { EvaluationResult, FeedbackItem, Guesstimate, SessionState, SkillId } from "./types";
import { checkSegments } from "./mece";
import { validateAssumptions } from "./validation";
import { communicationChecks } from "./finalAnswer";
import { currentAnswer, overridesOf, primaryTree } from "./session";
import { sensitivity } from "./sensitivity";
import { both, foldDifference } from "./format";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function referencePosition(answer: number, [lo, hi]: [number, number]): "inside" | "near" | "far" {
  if (answer >= lo && answer <= hi) return "inside";
  const edge = answer < lo ? lo : hi;
  return foldDifference(answer, edge) <= 2 ? "near" : "far";
}

/**
 * Score a guided session on six skills. Process counts more than the final number:
 * a learner with good structure and defensible assumptions scores well even if their
 * answer sits outside the reference range.
 */
export function evaluateSession(problem: Guesstimate, s: SessionState, now = Date.now()): EvaluationResult {
  const st = problem.stages;
  const feedback: FeedbackItem[] = [];
  const mistakes: string[] = [];
  const hints = (stage: string) => s.hintsUsed[stage] ?? 0;

  // Problem understanding feeds the clarifying score (both are about defining the problem).
  const checks = st.understanding.checks;
  const correctChecks = checks.filter((q) => {
    const o = q.options.find((x) => x.id === s.understanding.answers[q.id]);
    return o?.correct || o?.alternative;
  }).length;
  st.understanding.scope.forEach((f) => {
    const o = f.options.find((x) => x.id === s.understanding.scope[f.id]);
    if (o?.alternative) feedback.push({ type: "methodology", skill: "clarifying", text: `Scope (${f.label.toLowerCase()}): “${o.text}” is a defensible reading, but different from the interviewer's. ${o.feedback}` });
    else if (o && !o.correct) {
      feedback.push({ type: "factual", skill: "clarifying", text: `Scope (${f.label.toLowerCase()}): ${o.feedback}` });
      mistakes.push("scope-misread");
    }
  });

  // Clarifying
  const qs = st.clarifying.questions;
  const strong = qs.filter((q) => q.quality === "strong");
  const picked = qs.filter((q) => s.clarifying.picked.includes(q.id));
  const strongPicked = picked.filter((q) => q.quality === "strong").length;
  const weakPicked = picked.filter((q) => q.quality === "weak");
  let clarifying = 55 * (strongPicked / Math.max(1, strong.length)) + 25 * (correctChecks / Math.max(1, checks.length)) + 20;
  clarifying -= weakPicked.length * 8 + hints("understanding") * 3 + hints("clarifying") * 3;
  weakPicked.forEach((q) => feedback.push({ type: "methodology", skill: "clarifying", text: `“${q.text}” used up a question. ${q.why}` }));
  if (weakPicked.length) mistakes.push("weak-clarifying-question");
  if (strongPicked === strong.length) feedback.push({ type: "strength", skill: "clarifying", text: "You asked every question that changes the answer." });
  else {
    const missed = strong.filter((q) => !s.clarifying.picked.includes(q.id));
    feedback.push({ type: "methodology", skill: "clarifying", text: `Worth asking next time: “${missed[0].text}” ${missed[0].why}` });
    mistakes.push("missed-key-clarification");
  }

  // Structuring
  const mece = checkSegments(st.structuring.picker, s.structuring.picked);
  const passOn = s.structuring.passedOnCheck;
  let structuring = passOn === 1 ? 95 : passOn === 2 ? 78 : passOn ? 62 : 35;
  if (s.structuring.comparedApproaches) structuring += 5;
  structuring -= hints("structuring") * 4;
  if (passOn && passOn > 1) {
    feedback.push({ type: "factual", skill: "structuring", text: "Your first segmentation double-counted or left a gap. Segment the thing being counted (cups, orders), not the people, so each unit lands in exactly one bucket." });
    mistakes.push("double-counting");
  }
  if (mece.isMece && passOn === 1) feedback.push({ type: "strength", skill: "structuring", text: "Clean MECE structure on the first try." });
  if (s.tree.custom && Object.values(s.tree.custom).some((a) => a.length)) feedback.push({ type: "strength", skill: "structuring", text: "You extended the tree with your own segment, which shows you're reasoning, not copying." });

  // Assumptions
  const checksA = validateAssumptions(problem.variables, s.values);
  const warn = checksA.filter((c) => c.level !== "ok");
  let assumptions = 100 - warn.length * 15 - hints("assumptions") * 4 + Math.min(10, s.assumptions.derivationsViewed.length * 2) - 5;
  warn.forEach((w) => {
    const v = problem.variables.find((x) => x.id === w.varId)!;
    feedback.push({ type: v.reliability === "illustrative" ? "alternative" : "factual", skill: "assumptions", text: `${v.label}: ${w.message}` });
  });
  if (warn.length) mistakes.push("implausible-assumption");
  const changed = problem.variables.filter((v) => (s.values[v.id] ?? v.value) !== v.value);
  if (changed.length && !warn.length) feedback.push({ type: "alternative", skill: "assumptions", text: `You changed ${changed.length} assumption${changed.length > 1 ? "s" : ""} and kept ${changed.length > 1 ? "them" : "it"} defensible. Different reasonable assumptions are fine as long as you can justify them.` });

  // Math
  const steps = st.calculation.steps;
  const firstTry = steps.filter((c) => s.calculation.correct.includes(c.nodeId) && (s.calculation.attempts[c.nodeId] ?? 0) <= 1).length;
  const revealed = s.calculation.revealed.length;
  let math = 100 * (firstTry / Math.max(1, steps.length)) - revealed * 10 - hints("calculation") * 3;
  const retried = steps.filter((c) => (s.calculation.attempts[c.nodeId] ?? 0) > 1).length;
  math += retried * 5; // partial credit for correcting yourself
  if (revealed) {
    feedback.push({ type: "factual", skill: "math", text: `You revealed ${revealed} calculation step${revealed > 1 ? "s" : ""}. Practice keeping track of zeros: write crore = 10^7 and lakh = 10^5 before multiplying.` });
    mistakes.push("calculation-error");
  } else if (retried) {
    feedback.push({ type: "factual", skill: "math", text: "You fixed some calculation errors on a second try. Check powers of ten and units before you commit a number." });
    mistakes.push("calculation-error");
  } else feedback.push({ type: "strength", skill: "math", text: "Every calculation step was right first time." });

  // Business intuition
  const answer = currentAnswer(problem, s);
  const pos = referencePosition(answer, st.final.referenceRange);
  let intuition = (s.sensitivity.correct ? 45 : 15) + (pos === "inside" ? 35 : pos === "near" ? 25 : 10) + (s.structuring.comparedApproaches ? 20 : 5) - hints("sensitivity") * 4;
  if (!s.sensitivity.correct) {
    const top = sensitivity(primaryTree(problem), problem.variables, s.values, overridesOf(s))[0];
    feedback.push({ type: "factual", skill: "intuition", text: `The assumption that moves the answer most is ${top.label.toLowerCase()}. Spend your validation effort there.` });
    mistakes.push("missed-key-driver");
  }
  if (pos === "far") {
    feedback.push({ type: "factual", skill: "intuition", text: `Your answer (${both(answer)}) is far from the reference range (${both(st.final.referenceRange[0])}–${both(st.final.referenceRange[1])}). Revisit the assumption flagged above and run a sanity check.` });
    mistakes.push("answer-far-off");
  } else if (pos === "near") {
    feedback.push({ type: "alternative", skill: "intuition", text: `Your answer is just outside the reference range. That's acceptable if your assumptions are defensible; say so explicitly.` });
  }
  if (!s.structuring.comparedApproaches) mistakes.push("no-cross-check");

  // Communication
  const cc = communicationChecks(problem, s.final.text);
  const passed = cc.filter((c) => c.passed).length;
  let communication = (passed / cc.length) * 100 - (s.final.generated && s.final.text.length < 50 ? 20 : 0);
  if (s.final.generated) communication -= 5; // small nudge to personalise the generated draft
  cc.filter((c) => !c.passed).forEach((c) => feedback.push({ type: "methodology", skill: "communication", text: `Your final answer doesn't ${c.label.charAt(0).toLowerCase() + c.label.slice(1)}.` }));
  if (passed < cc.length - 1) mistakes.push("incomplete-final-answer");

  const scores: Record<SkillId, number> = {
    clarifying: clamp(clarifying),
    structuring: clamp(structuring),
    assumptions: clamp(assumptions),
    math: clamp(math),
    intuition: clamp(intuition),
    communication: clamp(communication),
  };
  const rubric = st.evaluation.rubric;
  const totalW = rubric.reduce((a, r) => a + r.weight, 0) || 1;
  const overall = clamp(rubric.reduce((a, r) => a + scores[r.id] * r.weight, 0) / totalW);

  return {
    scores,
    overall,
    feedback,
    answer,
    withinReference: pos,
    minutes: Math.max(1, Math.round((now - s.startedAt) / 60000)),
    mistakes: Array.from(new Set(mistakes)),
  };
}

export const MISTAKE_LABELS: Record<string, string> = {
  "scope-misread": "Misreading the scope",
  "weak-clarifying-question": "Asking low-value clarifying questions",
  "missed-key-clarification": "Missing a key clarification",
  "double-counting": "Double counting / non-MECE segments",
  "implausible-assumption": "Implausible assumptions",
  "calculation-error": "Calculation errors (powers of ten, units)",
  "missed-key-driver": "Not spotting the key driver",
  "answer-far-off": "Final answer far from a sensible range",
  "no-cross-check": "No sanity check / second method",
  "incomplete-final-answer": "Incomplete final answer",
  "unit-error": "Unit inconsistencies",
  "no-clarification": "Jumping in without clarifying",
  "unjustified-number": "Numbers without justification",
};
