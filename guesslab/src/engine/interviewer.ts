// Built-in interviewer: a turn-based state machine that waits for the candidate's approach,
// asks follow-ups, challenges weak assumptions and scores the conversation. It never states
// the answer. With an OpenAI key, the page can use the model instead (same contract).

import type { PracticeProblem } from "@/content/practice";
import type { FeedbackItem, SkillId } from "./types";
import { parseNumberInput, both, foldDifference } from "./format";
import { referencePosition } from "./evaluation";

export type InterviewPhase = "clarify" | "structure" | "assumptions" | "calculate" | "sanity" | "final" | "done";

export interface InterviewTurn {
  role: "interviewer" | "candidate";
  text: string;
}

export interface InterviewState {
  problemId: string;
  phase: InterviewPhase;
  turns: InterviewTurn[];
  startedAt: number;
  flags: {
    askedClarifying: boolean;
    nudgedClarify: boolean;
    driversHit: string[];
    numbersGiven: number;
    justified: number;
    factualErrors: string[];
    challenged: number;
    finalNumber: number | null;
    gaveRange: boolean;
    sanity: boolean;
    structureWords: boolean;
    summary: boolean;
  };
}

export interface NumberClaim {
  raw: string;
  value: number;
}

const MAG = "(crores?|cr|lakhs?|lacs?|billions?|bn|millions?|mn|thousands?|k|%)";
const NUM_RE = new RegExp(`(\\d+(?:[.,]\\d+)*)(?:\\s*${MAG}(?![a-z]))?`, "gi");

export function extractNumbers(text: string): NumberClaim[] {
  const out: NumberClaim[] = [];
  for (const m of text.matchAll(NUM_RE)) {
    const raw = m[0].trim();
    const v = parseNumberInput(raw.replace(/\s+/g, " "));
    if (v !== null && isFinite(v)) out.push({ raw, value: v });
  }
  return out;
}

export function startInterview(problem: PracticeProblem, now = Date.now()): InterviewState {
  return {
    problemId: problem.id,
    phase: "clarify",
    startedAt: now,
    turns: [
      {
        role: "interviewer",
        text: `Let's do a guesstimate. ${problem.prompt} Take your time, think out loud, and tell me how you'd approach it.`,
      },
    ],
    flags: { askedClarifying: false, nudgedClarify: false, driversHit: [], numbersGiven: 0, justified: 0, factualErrors: [], challenged: 0, finalNumber: null, gaveRange: false, sanity: false, structureWords: false, summary: false },
  };
}

const STRUCTURE_WORDS = ["split", "segment", "break", "divide", "bucket", "multiply", "×", " x ", "*", "top-down", "bottom-up", "demand", "supply", "funnel", "times"];
const JUSTIFY_WORDS = ["because", "since", "based on", "assuming", "roughly", "about", "i think", "given that", "from"];
const SANITY_WORDS = ["sanity", "cross-check", "cross check", "check", "triangulat", "per capita", "per person", "second method", "compare", "supply side", "demand side"];
const RANGE_WORDS = ["range", "between", "to about", "plus or minus", "±", "somewhere"];

function driversIn(text: string, problem: PracticeProblem): string[] {
  const t = text.toLowerCase();
  return problem.drivers.filter((d) => d.words.some((w) => t.includes(w.toLowerCase()))).map((d) => d.label);
}

function answerClarifying(text: string, problem: PracticeProblem): string {
  const t = text.toLowerCase();
  const bits: string[] = [];
  if (/(typical|average|which day|weekday|weekend|peak|time)/.test(t)) bits.push("Assume a typical period unless the question says otherwise.");
  if (/(india|city|where|geograph|urban|rural|delhi|bengaluru|mumbai|gurugram)/.test(t)) bits.push("Stick to the geography in the question.");
  if (/(include|exclude|count|only|all)/.test(t)) bits.push(`Include everything a reasonable person would count as “${problem.answerUnitLabel}”; state any exclusions.`);
  if (/(how many|what is the|population|data|number of)/.test(t)) bits.push("That's a number I'd like you to assume and justify.");
  if (!bits.length) bits.push("Reasonable question. Make an assumption, state it, and move on.");
  return bits.join(" ");
}

/** Process the candidate's message and produce the interviewer's next line. */
export function interviewerTurn(state: InterviewState, problem: PracticeProblem, candidateText: string): InterviewState {
  const text = candidateText.trim();
  const t = text.toLowerCase();
  const f = { ...state.flags, driversHit: [...state.flags.driversHit], factualErrors: [...state.flags.factualErrors] };
  const turns: InterviewTurn[] = [...state.turns, { role: "candidate", text }];
  const nums = extractNumbers(text);
  const candidateTurns = turns.filter((x) => x.role === "candidate").length;

  driversIn(text, problem).forEach((d) => !f.driversHit.includes(d) && f.driversHit.push(d));
  if (text.includes("?")) f.askedClarifying = true;
  if (STRUCTURE_WORDS.some((w) => t.includes(w))) f.structureWords = true;
  f.numbersGiven += nums.length;
  if (nums.length && JUSTIFY_WORDS.some((w) => t.includes(w))) f.justified += 1;
  if (SANITY_WORDS.some((w) => t.includes(w))) f.sanity = true;
  if (RANGE_WORDS.some((w) => t.includes(w))) f.gaveRange = true;

  // Factual checks on well-known numbers.
  nums.forEach((n) => {
    if (n.raw.includes("%") && n.value > 1) f.factualErrors.push(`A share of ${n.raw} is above 100%.`);
  });
  if (/population/.test(t) && /india/.test(t + problem.prompt.toLowerCase())) {
    const big = nums.filter((n) => n.value >= 1e8);
    big.forEach((n) => {
      if (/india/.test(t) && (n.value < 1.2e9 || n.value > 1.6e9) && /popul/.test(t)) f.factualErrors.push(`India's population is about 140–145 crore, not ${n.raw}.`);
    });
  }

  let phase = state.phase;
  let reply = "";

  const ask = (p: InterviewPhase, line: string) => {
    phase = p;
    reply = line;
  };

  if (candidateTurns >= 9 && phase !== "final" && phase !== "done") {
    ask("final", "We're running short on time. Give me your final answer as you'd say it to a senior stakeholder, in 30 seconds.");
  } else if (phase === "clarify") {
    if (f.askedClarifying) {
      ask("structure", `${answerClarifying(text, problem)} Now, how would you structure the problem?`);
    } else if (!f.nudgedClarify && (nums.length || f.structureWords)) {
      f.nudgedClarify = true;
      reply = "Before you go into numbers: is there anything you'd want to clarify about the question?";
    } else {
      ask("structure", "Okay. Walk me through how you'd break this problem down.");
    }
  } else if (phase === "structure") {
    const missing = problem.drivers.filter((d) => !f.driversHit.includes(d.label));
    if (!f.structureWords && !f.driversHit.length) {
      reply = "I'm not hearing a structure yet. What would you multiply or add together to get to the answer?";
    } else if (missing.length > problem.drivers.length / 2 && f.challenged < 2) {
      f.challenged += 1;
      reply = `How does ${missing[0].label.toLowerCase()} come into your structure?`;
    } else {
      ask("assumptions", "Could anything be counted twice in that structure? And what numbers would you put on each piece?");
    }
  } else if (phase === "assumptions") {
    if (!nums.length) {
      reply = "Put numbers on it. What would you assume for each piece, and why?";
    } else if (f.factualErrors.length && f.challenged < 3) {
      f.challenged += 1;
      reply = `${f.factualErrors[f.factualErrors.length - 1]} Want to revise that?`;
    } else {
      const biggestShare = nums.filter((n) => n.raw.includes("%")).sort((a, b) => b.value - a.value)[0];
      const claim = biggestShare ?? nums[0];
      f.challenged += 1;
      ask("calculate", `You said ${claim.raw}. What's that based on? And then take me through the arithmetic.`);
    }
  } else if (phase === "calculate") {
    const last = nums.length ? nums[nums.length - 1].value : null;
    if (last === null) {
      reply = "What number does your calculation give?";
    } else {
      f.finalNumber = last;
      const pos = referencePosition(last, problem.reference);
      if (pos === "far") {
        const dir = last > problem.reference[1] ? "high" : "low";
        ask("sanity", `So about ${both(last)}. That feels ${dir} to me. How would you sanity-check it?`);
      } else ask("sanity", `So about ${both(last)}. How would you sanity-check that number?`);
    }
  } else if (phase === "sanity") {
    if (!f.sanity && nums.length === 0) {
      reply = "Try a second method or a per-person check. What would that give?";
      f.sanity = true; // one nudge only
    } else {
      if (nums.length) {
        const n = nums[nums.length - 1].value;
        if (f.finalNumber && foldDifference(n, f.finalNumber) > 3) f.factualErrors.push("Your sanity check disagrees with your estimate by more than 3× and wasn't reconciled.");
      }
      ask("final", "Good. Now give me your final answer the way you'd present it, including how confident you are.");
    }
  } else if (phase === "final") {
    f.summary = text.length > 60 && extractNumbers(text).length > 0;
    const n = extractNumbers(text).filter((x) => !x.raw.includes("%"));
    if (n.length) f.finalNumber = n[0].value;
    ask("done", "Thanks, that's the end of the case. Here's how you did.");
  }

  return { ...state, phase, turns: [...turns, { role: "interviewer", text: reply }], flags: f };
}

export interface InterviewScore {
  scores: Record<SkillId, number>;
  overall: number;
  feedback: FeedbackItem[];
  mistakes: string[];
  minutes: number;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function scoreInterview(state: InterviewState, problem: PracticeProblem, now = Date.now()): InterviewScore {
  const f = state.flags;
  const fb: FeedbackItem[] = [];
  const mistakes: string[] = [];
  const coverage = f.driversHit.length / Math.max(1, problem.drivers.length);

  const clarifying = f.askedClarifying ? (f.nudgedClarify ? 65 : 90) : 30;
  if (!f.askedClarifying) {
    fb.push({ type: "methodology", skill: "clarifying", text: `You didn't clarify the question. Useful clarifications here: ${problem.clarifications.join("; ")}.` });
    mistakes.push("no-clarification");
  } else fb.push({ type: "strength", skill: "clarifying", text: "You clarified before calculating." });

  const structuring = 30 + coverage * 60 + (f.structureWords ? 10 : 0);
  const missing = problem.drivers.filter((d) => !f.driversHit.includes(d.label)).map((d) => d.label.toLowerCase());
  if (missing.length) fb.push({ type: "methodology", skill: "structuring", text: `Your structure didn't clearly include: ${missing.join(", ")}.` });
  else fb.push({ type: "strength", skill: "structuring", text: "Your structure covered every key driver." });

  const assumptions = (f.numbersGiven ? 50 : 15) + Math.min(35, f.justified * 15) - f.factualErrors.length * 15 + 15;
  f.factualErrors.forEach((e) => fb.push({ type: "factual", skill: "assumptions", text: e }));
  if (f.numbersGiven && !f.justified) {
    fb.push({ type: "methodology", skill: "assumptions", text: "You gave numbers without saying why. Add a one-line reason for each assumption." });
    mistakes.push("unjustified-number");
  }

  const pos = f.finalNumber !== null ? referencePosition(f.finalNumber, problem.reference) : "far";
  const math = f.finalNumber === null ? 30 : pos === "inside" ? 90 : pos === "near" ? 70 : 45;
  if (f.finalNumber === null) fb.push({ type: "factual", skill: "math", text: "You didn't arrive at a final number." });
  else if (pos === "far") {
    fb.push({ type: "factual", skill: "math", text: `${both(f.finalNumber)} is far from GuessLab's reference range (${both(problem.reference[0])}–${both(problem.reference[1])}). Re-check a key assumption or a power of ten.` });
    mistakes.push("answer-far-off");
  } else if (pos === "near") fb.push({ type: "alternative", skill: "math", text: "Your answer is a bit outside the reference range. Fine if your assumptions are defensible." });

  const intuition = (f.sanity ? 50 : 15) + (f.gaveRange ? 25 : 5) + (pos === "inside" ? 25 : pos === "near" ? 15 : 0);
  if (!f.sanity) {
    fb.push({ type: "methodology", skill: "intuition", text: "Add a sanity check: a per-person check or a second method." });
    mistakes.push("no-cross-check");
  }
  if (!f.gaveRange) fb.push({ type: "methodology", skill: "communication", text: "Give a range, not just a point estimate." });

  const communication = (f.summary ? 60 : 25) + (f.gaveRange ? 20 : 0) + (f.structureWords ? 20 : 0);
  if (!f.summary) mistakes.push("incomplete-final-answer");

  const scores: Record<SkillId, number> = {
    clarifying: clamp(clarifying),
    structuring: clamp(structuring),
    assumptions: clamp(assumptions),
    math: clamp(math),
    intuition: clamp(intuition),
    communication: clamp(communication),
  };
  const overall = clamp(scores.clarifying * 0.15 + scores.structuring * 0.25 + scores.assumptions * 0.2 + scores.math * 0.15 + scores.intuition * 0.1 + scores.communication * 0.15);
  return { scores, overall, feedback: fb, mistakes, minutes: Math.max(1, Math.round((now - state.startedAt) / 60000)) };
}
