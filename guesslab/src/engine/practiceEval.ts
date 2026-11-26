// Evaluates an independent Practice Arena attempt: the learner's own segments, factors,
// units, final number and spoken answer. Rewards reasoning, not just matching a number.

import type { PracticeProblem } from "@/content/practice";
import type { FeedbackItem, SkillId } from "./types";
import { formatDim, multiplyDims, parseUnit, sameDim, Dim } from "./units";
import { suspectOverlaps } from "./mece";
import { referencePosition } from "./evaluation";
import { both, foldDifference } from "./format";

export interface PracticeFactor {
  label: string;
  value: number;
  /** "%" values are entered as percentages (65 = 65%). */
  unit: string;
}

export interface PracticeSegment {
  label: string;
  factors: PracticeFactor[];
}

export interface PracticeAttempt {
  problemId: string;
  clarifications: string[];
  segments: PracticeSegment[];
  combine: "sum" | "min";
  finalAnswer: number | null;
  statement: string;
  minutes: number;
}

export interface SegmentResult {
  label: string;
  value: number;
  dim: Dim;
  unitLabel: string;
}

export interface PracticeEvaluation {
  segments: SegmentResult[];
  computed: number;
  computedUnit: string;
  scores: Record<SkillId, number>;
  overall: number;
  feedback: FeedbackItem[];
  mistakes: string[];
  position: "inside" | "near" | "far";
}

export function factorValue(f: PracticeFactor): number {
  return f.unit.trim() === "%" ? f.value / 100 : f.value;
}

export function computeSegments(segments: PracticeSegment[]): SegmentResult[] {
  return segments.map((s) => {
    let value = 1;
    let dim: Dim = {};
    s.factors.forEach((f) => {
      value *= factorValue(f);
      dim = multiplyDims(dim, parseUnit(f.unit));
    });
    return { label: s.label, value: s.factors.length ? value : 0, dim, unitLabel: formatDim(dim) };
  });
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function evaluatePractice(problem: PracticeProblem, a: PracticeAttempt): PracticeEvaluation {
  const fb: FeedbackItem[] = [];
  const mistakes: string[] = [];
  const segs = computeSegments(a.segments.filter((s) => s.factors.length));
  const computed = segs.length ? (a.combine === "sum" ? segs.reduce((x, s) => x + s.value, 0) : Math.min(...segs.map((s) => s.value))) : 0;
  const dim = segs[0]?.dim ?? {};

  // Clarifying
  const cq = a.clarifications.filter((c) => c.trim().length > 5);
  const scopeHits = cq.filter((c) => /(day|week|month|year|peak|typical|india|city|include|exclude|only|all|definition|count|mean)/i.test(c)).length;
  const clarifying = cq.length ? 40 + Math.min(40, scopeHits * 20) + Math.min(20, cq.length * 7) : 20;
  if (!cq.length) {
    fb.push({ type: "methodology", skill: "clarifying", text: `Note at least one clarification before estimating. For this problem: ${problem.clarifications.join("; ")}.` });
    mistakes.push("no-clarification");
  }

  // Structuring
  const allText = [a.statement, ...a.segments.map((s) => s.label), ...a.segments.flatMap((s) => s.factors.map((f) => f.label))].join(" ").toLowerCase();
  const hit = problem.drivers.filter((d) => d.words.some((w) => allText.includes(w.toLowerCase())));
  const coverage = hit.length / Math.max(1, problem.drivers.length);
  let structuring = 30 + coverage * 55 + (segs.length > 1 ? 10 : 0);
  const overlaps = a.combine === "sum" ? suspectOverlaps(a.segments.map((s) => s.label).filter(Boolean)) : [];
  overlaps.forEach((o) => fb.push({ type: "methodology", skill: "structuring", text: `Possible double counting between “${o.a}” and “${o.b}”: ${o.reason}` }));
  structuring -= overlaps.length * 12;
  if (overlaps.length) mistakes.push("double-counting");
  const missing = problem.drivers.filter((d) => !hit.includes(d));
  if (missing.length) fb.push({ type: "methodology", skill: "structuring", text: `Consider including: ${missing.map((m) => m.label.toLowerCase()).join(", ")}.` });
  else fb.push({ type: "strength", skill: "structuring", text: "Your structure covers every key driver." });

  // Units
  let unitPenalty = 0;
  segs.slice(1).forEach((s) => {
    if (!sameDim(s.dim, dim)) {
      unitPenalty += 15;
      fb.push({ type: "factual", skill: "math", text: `“${s.label}” is in ${s.unitLabel} but “${segs[0].label}” is in ${segs[0].unitLabel}. You can't ${a.combine === "sum" ? "add" : "compare"} them.` });
    }
  });
  const expected = parseUnit(problem.answerUnit);
  const unitsGiven = a.segments.flatMap((s) => s.factors).every((f) => f.unit.trim().length > 0);
  if (segs.length && unitsGiven && !sameDim(dim, expected)) {
    unitPenalty += 10;
    fb.push({ type: "factual", skill: "math", text: `Your factors multiply to ${formatDim(dim)}, but the question asks for ${problem.answerUnitLabel} (${formatDim(expected)}). Check for a missing conversion (e.g., ÷ 30 days) or a unit typo.` });
  }
  if (unitPenalty) mistakes.push("unit-error");
  if (!unitsGiven) fb.push({ type: "methodology", skill: "math", text: "Add a unit to every factor; GuessLab uses them to catch errors automatically." });

  // Assumptions
  let assumptions = 75;
  a.segments.flatMap((s) => s.factors).forEach((f) => {
    if (f.unit.trim() === "%" && (f.value > 100 || f.value < 0)) {
      assumptions -= 20;
      fb.push({ type: "factual", skill: "assumptions", text: `“${f.label}” is ${f.value}%, which isn't a valid share.` });
    }
    if (/popul/i.test(f.label) && /india/i.test(problem.prompt) && !/(city|delhi|mumbai|bengaluru|gurugram|pune|urban)/i.test(f.label + problem.prompt) && (f.value < 1.2e9 || f.value > 1.6e9)) {
      assumptions -= 20;
      fb.push({ type: "factual", skill: "assumptions", text: `India's population is about 140–145 crore; you used ${both(f.value)}.` });
    }
  });
  const justified = /(because|since|based on|assum|roughly|about)/i.test(a.statement);
  assumptions += justified ? 15 : -10;
  if (!justified) fb.push({ type: "methodology", skill: "assumptions", text: "Say why you chose your key numbers in the final statement." });
  if (assumptions < 60) mistakes.push("implausible-assumption");

  // Math accuracy
  let math = 85 - unitPenalty;
  if (a.finalAnswer !== null && computed > 0 && foldDifference(a.finalAnswer, computed) > 1.05) {
    math -= 25;
    fb.push({ type: "factual", skill: "math", text: `Your stated answer (${both(a.finalAnswer)}) doesn't match what your own factors give (${both(computed)}).` });
    mistakes.push("calculation-error");
  }
  const answer = a.finalAnswer ?? computed;
  const position = referencePosition(answer, problem.reference);

  // Intuition
  const sanity = /(sanity|cross|check|per person|per capita|second method|triangulat|supply|demand)/i.test(a.statement);
  let intuition = (sanity ? 45 : 15) + (position === "inside" ? 45 : position === "near" ? 30 : 10);
  if (!sanity) {
    fb.push({ type: "methodology", skill: "intuition", text: "Add a sanity check (per-person check or a second method)." });
    mistakes.push("no-cross-check");
  }
  if (position === "far") {
    fb.push({ type: "factual", skill: "intuition", text: `Your answer (${both(answer)}) is far from GuessLab's illustrative reference range (${both(problem.reference[0])}–${both(problem.reference[1])}). ${problem.referenceNote}` });
    mistakes.push("answer-far-off");
  } else if (position === "near") fb.push({ type: "alternative", skill: "intuition", text: "Slightly outside the reference range. That's acceptable with defensible assumptions." });
  else fb.push({ type: "strength", skill: "intuition", text: "Your answer sits in a sensible range." });
  intuition = Math.min(100, intuition + 10);

  // Communication
  const s = a.statement.toLowerCase();
  const comm = [/\d/.test(s), /(range|between|to about|±)/.test(s), /(assum|key)/.test(s), sanity, /(split|segment|structur|broke)/.test(s)];
  const communication = (comm.filter(Boolean).length / comm.length) * 100;
  if (comm.filter(Boolean).length < 4) mistakes.push("incomplete-final-answer");
  if (!comm[1]) fb.push({ type: "methodology", skill: "communication", text: "Give a range in your final answer." });

  const scores: Record<SkillId, number> = {
    clarifying: clamp(clarifying),
    structuring: clamp(structuring),
    assumptions: clamp(assumptions),
    math: clamp(math),
    intuition: clamp(intuition),
    communication: clamp(communication),
  };
  const overall = clamp(scores.clarifying * 0.15 + scores.structuring * 0.25 + scores.assumptions * 0.2 + scores.math * 0.15 + scores.intuition * 0.1 + scores.communication * 0.15);
  return { segments: segs, computed, computedUnit: formatDim(dim), scores, overall, feedback: fb, mistakes: Array.from(new Set(mistakes)), position };
}
