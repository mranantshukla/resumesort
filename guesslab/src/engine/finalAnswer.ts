import type { Guesstimate, SessionState } from "./types";
import { evaluateTree } from "./tree";
import { both, foldDifference, formatValue, roundSig } from "./format";
import { answerRange, sensitivity } from "./sensitivity";
import { currentAnswer, overridesOf, primaryTree } from "./session";
import { checkSegments } from "./mece";

/**
 * Build a structured interview answer from the learner's OWN choices: their scope, segments,
 * assumptions, result and sensitivity. Nothing here comes from a stored model answer.
 */
export function generateFinalAnswer(problem: Guesstimate, s: SessionState): string {
  const answer = currentAnswer(problem, s);
  const tree = primaryTree(problem);
  const rows = sensitivity(tree, problem.variables, s.values, overridesOf(s));
  const [lo, hi] = answerRange(rows, answer);
  const top = rows[0];

  const scopeBits = problem.stages.understanding.scope
    .map((f) => f.options.find((o) => o.id === s.understanding.scope[f.id])?.text)
    .filter(Boolean)
    .join("; ");

  const asked = problem.stages.clarifying.questions.filter((q) => s.clarifying.picked.includes(q.id) && q.quality !== "weak");
  const seg = checkSegments(problem.stages.structuring.picker, s.structuring.picked);
  const segText = seg.chosen.length ? seg.chosen.map((c) => c.label.toLowerCase()).join(" and ") : "";

  const keyVars = rows.slice(0, 3).map((r) => {
    const v = problem.variables.find((x) => x.id === r.varId)!;
    return `${v.label.toLowerCase()} of ${formatValue(s.values[v.id] ?? v.value, v.unit)}${v.displayUnit ? " " + v.displayUnit : ""}`;
  });

  const others = problem.approaches.filter((a) => a.id !== problem.primaryApproach);
  const cross = others.map((a) => {
    const v = evaluateTree(a.tree, problem.variables, s.values).value;
    const f = foldDifference(v, answer);
    return `A ${a.direction}, ${a.side}-side check (${a.name.toLowerCase()}) gives about ${both(v)}, ${f < 1.5 ? "very close to" : f < 2.5 ? "within about " + f.toFixed(1) + "× of" : f.toFixed(1) + "× away from"} my main estimate.`;
  });

  const lines = [
    `I estimated ${problem.metric}. Scope: ${scopeBits || "as clarified"}.`,
    asked.length ? `I first clarified ${asked.length === 1 ? "one point" : asked.length + " points"}: ${asked.map((q) => q.text.replace(/\?$/, "").toLowerCase()).join("; ")}.` : "",
    `I structured it ${problem.stages.final.segmentationPhrase}${segText ? ` (${segText})` : ""}, so nothing is counted twice.`,
    `My key assumptions are ${keyVars.join(", ")}.`,
    `That gives roughly ${both(roundSig(answer, 2))} ${problem.answerUnitLabel}, with a defensible range of about ${both(roundSig(lo, 2))} to ${both(roundSig(hi, 2))}.`,
    ...cross,
    top ? `The answer is most sensitive to ${top.label.toLowerCase()}: across its plausible range the estimate moves between ${both(roundSig(Math.min(top.outLow, top.outHigh), 2))} and ${both(roundSig(Math.max(top.outLow, top.outHigh), 2))}, so that's the first number I'd validate with real data.` : "",
  ];
  return lines.filter(Boolean).join(" ");
}

export interface CommunicationCheck {
  id: string;
  label: string;
  passed: boolean;
}

/** Detect whether a written final answer covers the elements interviewers listen for. */
export function communicationChecks(problem: Guesstimate, text: string): CommunicationCheck[] {
  const t = text.toLowerCase();
  const hasNumber = /\d/.test(t) && /(crore|lakh|million|billion|thousand|\d{4,})/.test(t);
  const unitWords = problem.answerUnitLabel.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  return [
    { id: "scope", label: "States the scope (what, where, when)", passed: /(scope|typical|india|per day|a day|weekend|peak|assum)/.test(t) },
    { id: "structure", label: "Explains the structure or segments", passed: /(split|segment|structur|broke|divide|bucket|home|supply|demand)/.test(t) },
    { id: "assumptions", label: "Names key assumptions", passed: /(assum|i took|i used|key)/.test(t) },
    { id: "number", label: "Gives a number with a unit", passed: hasNumber && unitWords.some((w) => t.includes(w)) },
    { id: "range", label: "Gives a range, not just a point", passed: /(range|between|to about|–|-\s*\d|plus or minus|±)/.test(t) },
    { id: "sanity", label: "Cross-checks with a second method", passed: /(check|cross|sanity|triangulat|supply-side|demand-side|second method|compare)/.test(t) },
    { id: "driver", label: "Names the biggest driver or limitation", passed: /(sensitiv|driver|biggest|most important|limitation|validate|depends)/.test(t) },
  ];
}
