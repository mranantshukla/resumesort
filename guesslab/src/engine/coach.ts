// GuessLab's built-in learning assistant. It runs entirely in the browser and works from the
// problem's structured content and the learner's state. When an OpenAI key is configured, the
// same modes are served by the model (see src/app/api/ai/route.ts); this engine is the fallback.

import type { AttemptRecord, Guesstimate, SessionState, StageId } from "./types";
import { STAGE_LABELS } from "./types";
import { checkSegments } from "./mece";
import { evaluateTree } from "./tree";
import { overridesOf, primaryTree, stageBlockers } from "./session";
import { validateAssumptions, validateConstraints } from "./validation";
import { sensitivity } from "./sensitivity";
import { formatValue } from "./format";
import { GLOSSARY, COMMON_MISTAKES } from "@/content/knowledge";
import { MISTAKE_LABELS } from "./evaluation";

export type CoachMode = "tutor" | "socratic" | "interviewer" | "evaluator" | "revision";

export const COACH_MODES: { id: CoachMode; label: string; blurb: string }[] = [
  { id: "tutor", label: "Tutor", blurb: "Explains concepts and gives progressive hints." },
  { id: "socratic", label: "Socratic", blurb: "Asks questions instead of giving answers." },
  { id: "interviewer", label: "Interviewer", blurb: "Challenges your assumptions like a real interviewer." },
  { id: "evaluator", label: "Evaluator", blurb: "Scores your work so far and names weaknesses." },
  { id: "revision", label: "Revision", blurb: "Revisits concepts you've struggled with before." },
];

export type CoachKind = "hint" | "explain" | "question" | "challenge" | "feedback" | "alert" | "praise";

export interface CoachMessage {
  role: "coach" | "learner";
  text: string;
  kind?: CoachKind;
  /** Distinguishes factual errors from reasonable alternatives and method differences (spec section 8). */
  tag?: "factual" | "alternative" | "methodology";
}

export interface CoachContext {
  problem: Guesstimate;
  session: SessionState;
  stage: StageId;
  history?: AttemptRecord[];
  /** Number of coach messages already sent, used to rotate prompts. */
  turn?: number;
}

const has = (text: string, ...words: string[]) => words.some((w) => text.includes(w));

function glossaryMatch(text: string): string | null {
  const t = text.toLowerCase();
  const hit = GLOSSARY.find((g) => t.includes(g.term.toLowerCase().split(" ")[0].replace("/", "").toLowerCase()) && g.term.length > 2);
  return hit ? `${hit.term}: ${hit.meaning}` : null;
}

/** Messages the coach raises on its own, based on the learner's current state. */
export function contextualAlerts(ctx: CoachContext): CoachMessage[] {
  const { problem, session: s, stage } = ctx;
  const out: CoachMessage[] = [];
  if (stage === "structuring" && s.structuring.checks > 0) {
    const r = checkSegments(problem.stages.structuring.picker, s.structuring.picked);
    r.overlaps.slice(0, 2).forEach((o) =>
      out.push({ role: "coach", kind: "alert", tag: "factual", text: `Double counting: “${o.a.label}” and “${o.b.label}” both include ${o.shared.map((id) => problem.stages.structuring.picker.universe.find((u) => u.id === id)?.label.toLowerCase()).join(", ")}. ${o.b.feedback}` }),
    );
    if (r.missing.length) out.push({ role: "coach", kind: "alert", tag: "factual", text: `Gap: nothing in your structure covers ${r.missing.map((id) => problem.stages.structuring.picker.universe.find((u) => u.id === id)?.label.toLowerCase()).join(", ")}.` });
  }
  if (stage === "assumptions" || stage === "structuring") {
    const ev = evaluateTree(primaryTree(problem), problem.variables, s.values, overridesOf(s));
    ev.issues.slice(0, 2).forEach((i) => out.push({ role: "coach", kind: "alert", tag: "factual", text: `Unit check: ${i.message}` }));
  }
  if (stage === "assumptions") {
    validateAssumptions(problem.variables, s.values)
      .filter((c) => c.level !== "ok")
      .slice(0, 2)
      .forEach((c) => {
        const v = problem.variables.find((x) => x.id === c.varId)!;
        out.push({ role: "coach", kind: "alert", tag: c.level === "error" ? "factual" : v.reliability === "illustrative" ? "alternative" : "factual", text: `${v.label}: ${c.message}` });
      });
    validateConstraints(problem.constraints, problem.variables, s.values)
      .filter((c) => !c.ok)
      .forEach((c) => out.push({ role: "coach", kind: "alert", tag: "factual", text: c.message }));
  }
  if (stage === "calculation") {
    const wrong = problem.stages.calculation.steps.filter((c) => (s.calculation.attempts[c.nodeId] ?? 0) > 0 && !s.calculation.correct.includes(c.nodeId) && !s.calculation.revealed.includes(c.nodeId));
    wrong.slice(0, 1).forEach((c) =>
      out.push({ role: "coach", kind: "alert", tag: "factual", text: `Your answer for “${c.prompt}” isn't right yet. ${c.hint} Check powers of ten: 1 crore = 10^7, 1 lakh = 10^5.` }),
    );
  }
  return out;
}

function socraticFor(ctx: CoachContext): string {
  const g = ctx.problem.stages[ctx.stage].guide;
  const qs = g.socratic.length ? g.socratic : g.ask;
  return qs[(ctx.turn ?? 0) % qs.length];
}

function challengeFor(ctx: CoachContext): CoachMessage {
  const { problem, session: s } = ctx;
  const warn = validateAssumptions(problem.variables, s.values).find((c) => c.level !== "ok");
  if (warn) {
    const v = problem.variables.find((x) => x.id === warn.varId)!;
    return { role: "coach", kind: "challenge", tag: "factual", text: `You've assumed ${v.label.toLowerCase()} is ${formatValue(s.values[v.id] ?? v.value, v.unit)}. That's outside what I'd consider defensible. Walk me through how you got there.` };
  }
  const rows = sensitivity(primaryTree(problem), problem.variables, s.values, overridesOf(s));
  const pick = rows[(ctx.turn ?? 0) % Math.max(1, Math.min(3, rows.length))];
  if (pick) {
    const v = problem.variables.find((x) => x.id === pick.varId)!;
    return {
      role: "coach",
      kind: "challenge",
      text: `Your answer leans heavily on ${v.label.toLowerCase()} (${formatValue(s.values[v.id] ?? v.value, v.unit)}). Why that number and not ${formatValue(v.plausible[0], v.unit)} or ${formatValue(v.plausible[1], v.unit)}? What evidence would change your mind?`,
    };
  }
  return { role: "coach", kind: "challenge", text: "Convince me your structure doesn't count anything twice." };
}

function evaluatorFor(ctx: CoachContext): CoachMessage {
  const { problem, session: s, stage } = ctx;
  const blockers = stageBlockers(problem, s, stage);
  const done = s.completed.length;
  const parts = [`You've completed ${done} of 8 stages.`];
  if (stage === "clarifying" && s.clarifying.picked.length) {
    const q = problem.stages.clarifying.questions.filter((x) => s.clarifying.picked.includes(x.id));
    const strong = q.filter((x) => x.quality === "strong").length;
    const weak = q.filter((x) => x.quality === "weak").length;
    parts.push(`Your questions: ${strong} strong, ${weak} weak.`);
  }
  if (stage === "structuring" && s.structuring.checks) {
    parts.push(checkSegments(problem.stages.structuring.picker, s.structuring.picked).isMece ? "Your structure is MECE." : "Your structure still overlaps or has a gap.");
  }
  if (stage === "assumptions") {
    const warns = validateAssumptions(problem.variables, s.values).filter((c) => c.level !== "ok").length;
    parts.push(warns ? `${warns} assumption${warns > 1 ? "s look" : " looks"} outside a defensible range.` : "All assumptions are in a defensible range.");
  }
  if (stage === "calculation") {
    const steps = problem.stages.calculation.steps;
    parts.push(`${s.calculation.correct.length} of ${steps.length} steps correct${s.calculation.revealed.length ? `, ${s.calculation.revealed.length} revealed` : ""}.`);
  }
  parts.push(blockers.length ? `To finish this stage: ${blockers.join(" ")}` : "This stage is ready to complete.");
  return { role: "coach", kind: "feedback", text: parts.join(" ") };
}

function revisionFor(ctx: CoachContext): CoachMessage {
  const counts: Record<string, number> = {};
  (ctx.history ?? []).forEach((a) => a.mistakes.forEach((m) => (counts[m] = (counts[m] ?? 0) + 1)));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) {
    const m = COMMON_MISTAKES[(ctx.turn ?? 0) % COMMON_MISTAKES.length];
    return { role: "coach", kind: "explain", text: `No past attempts to review yet. A common trap to watch for: ${m.mistake}. ${m.why} Fix: ${m.fix}` };
  }
  const label = MISTAKE_LABELS[top[0]] ?? top[0];
  const lesson = COMMON_MISTAKES.find((m) => label.toLowerCase().includes(m.mistake.toLowerCase().split(" ")[0]));
  return {
    role: "coach",
    kind: "explain",
    text: `Across your past attempts, “${label}” came up ${top[1]} time${top[1] > 1 ? "s" : ""}. ${lesson ? `${lesson.why} Fix: ${lesson.fix}` : "Slow down at that step this time and check it explicitly."}`,
  };
}

/** Reply to the learner. In guided mode the coach never reveals the full solution. */
export function coachReply(ctx: CoachContext, mode: CoachMode, input = ""): CoachMessage {
  const t = input.toLowerCase().trim();
  const g = ctx.problem.stages[ctx.stage].guide;
  const stageName = STAGE_LABELS[ctx.stage].toLowerCase();

  if (t && has(t, "answer", "solution", "just tell", "give me the")) {
    return {
      role: "coach",
      kind: "question",
      text:
        mode === "socratic"
          ? `What's the very next thing you'd need to know to finish the ${stageName} stage yourself?`
          : `I won't hand you the full solution, because working it out is what builds the skill. Here's the next step instead: ${g.hints[Math.min(ctx.session.hintsUsed[ctx.stage] ?? 0, g.hints.length - 1)]}`,
    };
  }

  if (mode === "socratic") {
    if (t && t.endsWith("?")) return { role: "coach", kind: "question", text: `Good question. Before I answer: ${socraticFor(ctx)}` };
    return { role: "coach", kind: "question", text: socraticFor(ctx) };
  }
  if (mode === "interviewer") return challengeFor(ctx);
  if (mode === "evaluator") return evaluatorFor(ctx);
  if (mode === "revision") return revisionFor(ctx);

  // Tutor mode
  if (!t) return { role: "coach", kind: "explain", text: `${g.task} ${g.why}` };
  const term = glossaryMatch(t);
  if (has(t, "what is", "what's", "meaning", "define") && term) return { role: "coach", kind: "explain", text: term };
  if (has(t, "hint", "stuck", "help", "clue", "next")) {
    const used = ctx.session.hintsUsed[ctx.stage] ?? 0;
    return { role: "coach", kind: "hint", text: g.hints[Math.min(used, g.hints.length - 1)] };
  }
  if (has(t, "why")) return { role: "coach", kind: "explain", text: g.why };
  if (has(t, "formula", "calculate", "compute", "how do i")) return { role: "coach", kind: "explain", text: g.formula ? `The structure is: ${g.formula}. ${g.derive}` : g.derive };
  if (has(t, "mistake", "wrong", "error", "avoid")) return { role: "coach", kind: "explain", text: `Common mistakes here: ${g.mistakes.join("; ")}.` };
  if (has(t, "information", "need to know", "data")) return { role: "coach", kind: "explain", text: `For this stage you need: ${g.info.join(", ")}.` };
  if (has(t, "assum", "derive", "number")) return { role: "coach", kind: "explain", text: g.derive };
  if (term) return { role: "coach", kind: "explain", text: term };
  return { role: "coach", kind: "explain", text: `In the ${stageName} stage: ${g.task} Ask yourself: ${g.ask[0]}` };
}
