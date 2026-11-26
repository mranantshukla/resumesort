import { describe, expect, it } from "vitest";
import { chai } from "@/content/guesstimates/chai";
import { GUESSTIMATES } from "@/content/guesstimates";
import { createSession, expectedNodeValue, isCalcCorrect, stageBlockers } from "@/engine/session";
import { evaluateSession } from "@/engine/evaluation";
import { generateFinalAnswer, communicationChecks } from "@/engine/finalAnswer";
import { coachReply, contextualAlerts } from "@/engine/coach";
import { extractNumbers, interviewerTurn, scoreInterview, startInterview } from "@/engine/interviewer";
import { evaluatePractice } from "@/engine/practiceEval";
import { getPractice, PRACTICE } from "@/content/practice";
import { compareResults } from "@/content/sql";
import { dailyProblem, recommendations } from "@/engine/insights";
import type { SessionState } from "@/engine/types";

/** Simulate a strong learner completing a guided problem. */
function strongRun(problemId = chai.id): SessionState {
  const p = GUESSTIMATES.find((g) => g.id === problemId)!;
  const s = createSession(p, 0);
  p.stages.understanding.checks.forEach((q) => (s.understanding.answers[q.id] = q.options.find((o) => o.correct)!.id));
  p.stages.understanding.scope.forEach((f) => (s.understanding.scope[f.id] = f.options.find((o) => o.correct)!.id));
  s.clarifying.picked = p.stages.clarifying.questions.filter((q) => q.quality === "strong").map((q) => q.id);
  s.clarifying.asked = true;
  const atoms = p.stages.structuring.picker.universe.map((u) => p.stages.structuring.picker.options.find((o) => o.covers.length === 1 && o.covers[0] === u.id)!.id);
  s.structuring.picked = atoms;
  s.structuring.checks = 1;
  s.structuring.passedOnCheck = 1;
  s.structuring.comparedApproaches = true;
  s.assumptions.confirmed = p.variables.map((v) => v.id);
  p.stages.calculation.steps.forEach((c) => {
    s.calculation.entries[c.nodeId] = expectedNodeValue(p, s, c.nodeId)!;
    s.calculation.attempts[c.nodeId] = 1;
    s.calculation.correct.push(c.nodeId);
  });
  return s;
}

describe("guided session flow", () => {
  it("blocks stages until requirements are met", () => {
    const s = createSession(chai, 0);
    expect(stageBlockers(chai, s, "understanding").length).toBeGreaterThan(0);
    expect(stageBlockers(chai, s, "clarifying")).toContain("Pick at least one question to ask.");
    const done = strongRun();
    expect(stageBlockers(chai, done, "structuring")).toEqual([]);
    expect(stageBlockers(chai, done, "assumptions")).toEqual([]);
    expect(stageBlockers(chai, done, "calculation")).toEqual([]);
  });

  it("checks calculations against the learner's OWN assumptions", () => {
    const s = createSession(chai, 0);
    s.values.teaShare = 0.5;
    const exp = expectedNodeValue(chai, s, "drinkers")!;
    expect(exp).toBeCloseTo(1.42e9 * 0.5);
    expect(isCalcCorrect(exp, 7.2e8)).toBe(true);
    expect(isCalcCorrect(exp, 7.1e9)).toBe(false); // a power-of-ten slip
  });

  it("generates a final answer from the learner's choices that passes communication checks", () => {
    const s = strongRun();
    const sens = "teaShare"; // will be replaced by real ranking in evaluation
    s.sensitivity = { answer: sens, correct: true };
    const text = generateFinalAnswer(chai, s);
    expect(text).toMatch(/crore/);
    expect(text).toMatch(/range/);
    const passed = communicationChecks(chai, text).filter((c) => c.passed).length;
    expect(passed).toBeGreaterThanOrEqual(6);
  });

  it.each(GUESSTIMATES.map((g) => g.id))("a strong run on %s scores highly", (id) => {
    const p = GUESSTIMATES.find((g) => g.id === id)!;
    const s = strongRun(id);
    s.sensitivity = { answer: "x", correct: true };
    s.final.text = generateFinalAnswer(p, s);
    const ev = evaluateSession(p, s, 15 * 60000);
    expect(ev.overall).toBeGreaterThanOrEqual(80);
    expect(ev.withinReference).toBe("inside");
  });

  it("a careless run scores lower and records specific mistakes", () => {
    const s = createSession(chai, 0);
    s.understanding.answers = { unit: "kg", risk: "tourists" };
    s.understanding.scope = { coverage: "all", geo: "urban", time: "typical" };
    s.clarifying = { picked: ["q-pop", "q-brand"], asked: true };
    s.structuring = { picked: ["o-home", "o-out"], checks: 3, passedOnCheck: 3, approach: "demand", comparedApproaches: false };
    s.values.homeCups = 6;
    s.calculation.revealed = ["drinkers", "total"];
    s.sensitivity = { answer: "population", correct: false };
    s.final.text = "2 billion";
    const ev = evaluateSession(chai, s, 10 * 60000);
    const good = evaluateSession(chai, Object.assign(strongRun(), { sensitivity: { answer: "x", correct: true }, final: { text: generateFinalAnswer(chai, strongRun()), generated: false } }), 10 * 60000);
    expect(ev.overall).toBeLessThan(good.overall - 25);
    expect(ev.mistakes).toEqual(expect.arrayContaining(["double-counting", "weak-clarifying-question", "implausible-assumption", "calculation-error", "missed-key-driver"]));
    expect(ev.feedback.some((f) => f.type === "factual")).toBe(true);
    expect(ev.feedback.some((f) => f.type === "methodology")).toBe(true);
  });

  it("treats a defensible alternative scope as a methodology difference, not an error", () => {
    const s = strongRun();
    s.understanding.scope.coverage = "sold";
    const ev = evaluateSession(chai, s);
    expect(ev.feedback.find((f) => f.text.includes("defensible reading"))?.type).toBe("methodology");
  });
});

describe("coach", () => {
  it("never gives away the solution when asked", () => {
    const s = createSession(chai, 0);
    const r = coachReply({ problem: chai, session: s, stage: "calculation" }, "tutor", "just give me the answer");
    expect(r.text).toMatch(/won't hand you the full solution/);
  });
  it("Socratic mode responds with questions", () => {
    const s = createSession(chai, 0);
    const r = coachReply({ problem: chai, session: s, stage: "structuring" }, "socratic", "how do I split this?");
    expect(r.text.trim().endsWith("?")).toBe(true);
  });
  it("raises double-counting alerts from state", () => {
    const s = createSession(chai, 0);
    s.structuring.picked = ["o-home", "o-office-workers"];
    s.structuring.checks = 1;
    const alerts = contextualAlerts({ problem: chai, session: s, stage: "structuring" });
    expect(alerts.some((a) => a.text.startsWith("Double counting"))).toBe(true);
  });
  it("interviewer mode challenges the most important assumption", () => {
    const s = createSession(chai, 0);
    const r = coachReply({ problem: chai, session: s, stage: "assumptions" }, "interviewer");
    expect(r.kind).toBe("challenge");
  });
});

describe("interviewer", () => {
  const p = getPractice("bengaluru-food-orders")!;
  it("extracts numbers with Indian magnitudes", () => {
    const n = extractNumbers("About 1.4 crore people, 60% online, maybe 4.5 lakh orders, 2 kg");
    expect(n.map((x) => x.value)).toEqual([1.4e7, 0.6, 4.5e5, 2]);
  });
  it("nudges for clarification and then scores a full conversation", () => {
    let st = startInterview(p, 0);
    st = interviewerTurn(st, p, "I'd multiply population by 40%.");
    expect(st.turns.at(-1)!.text).toMatch(/clarify/);
    st = interviewerTurn(st, p, "Is this across all apps, and a typical day?");
    expect(st.phase).toBe("structure");
    st = interviewerTurn(st, p, "I'll split it: population × share online via smartphone × share who order × frequency per month, divided by 30.");
    st = interviewerTurn(st, p, "Population 1.4 crore because it's a big metro, 60% online, 40% order, 4 orders per month on average.");
    expect(st.phase).toBe("calculate");
    st = interviewerTurn(st, p, "That gives about 4.5 lakh orders per day.");
    expect(st.phase).toBe("sanity");
    st = interviewerTurn(st, p, "Supply side check: 25,000 restaurants × 18 orders = 4.5 lakh, so it matches.");
    st = interviewerTurn(st, p, "Final answer: about 4.5 lakh orders a day, in a range between 3 and 7 lakh, based on a user funnel and confirmed with a supply-side check.");
    expect(st.phase).toBe("done");
    const sc = scoreInterview(st, p, 20 * 60000);
    expect(sc.overall).toBeGreaterThanOrEqual(70);
    expect(sc.feedback.some((f) => f.type === "strength")).toBe(true);
  });
  it("flags factual errors", () => {
    let st = startInterview(getPractice("chai-cups-india")!, 0);
    st = interviewerTurn(st, getPractice("chai-cups-india")!, "What counts as chai?");
    st = interviewerTurn(st, getPractice("chai-cups-india")!, "Population of India × share who drink × cups per drinker, home and outside.");
    st = interviewerTurn(st, getPractice("chai-cups-india")!, "India's population is 50 crore, 120% drink tea");
    expect(st.flags.factualErrors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("practice arena evaluation", () => {
  const p = getPractice("bengaluru-food-orders")!;
  it("rewards a correct, unit-consistent structure", () => {
    const ev = evaluatePractice(p, {
      problemId: p.id,
      clarifications: ["All apps or one? Typical day?"],
      segments: [{ label: "Online orderers", factors: [{ label: "Population", value: 1.4e7, unit: "person" }, { label: "Smartphone and online", value: 60, unit: "%" }, { label: "Order in a month", value: 40, unit: "%" }, { label: "Orders per month frequency", value: 4.4, unit: "order/person/month" }, { label: "Per day", value: 1 / 30, unit: "month/day" }] }],
      combine: "sum",
      finalAnswer: 4.9e5,
      statement: "About 4.9 lakh orders a day, range 3 to 7 lakh. I used a user funnel because frequency matters most; sanity check with a supply-side estimate gives a similar number.",
      minutes: 10,
    });
    expect(ev.computed).toBeCloseTo(492800, -3);
    expect(ev.position).toBe("inside");
    expect(ev.feedback.filter((f) => f.type === "factual")).toEqual([]);
    expect(ev.overall).toBeGreaterThanOrEqual(75);
  });
  it("catches unit errors, double counting and mismatched answers", () => {
    const ev = evaluatePractice(p, {
      problemId: p.id,
      clarifications: [],
      segments: [
        { label: "Working professionals", factors: [{ label: "People", value: 3e6, unit: "person" }, { label: "Orders", value: 4, unit: "order/person/month" }] },
        { label: "Weekend orders", factors: [{ label: "Orders", value: 1e5, unit: "order/day" }] },
      ],
      combine: "sum",
      finalAnswer: 9e7,
      statement: "90 million",
      minutes: 5,
    });
    expect(ev.mistakes).toEqual(expect.arrayContaining(["unit-error", "double-counting", "calculation-error", "no-clarification"]));
  });
});

describe("sql checking, daily problem, recommendations", () => {
  it("compares result sets with and without order", () => {
    expect(compareResults([["a", 1], ["b", 2]], [["b", 2], ["a", 1]], false).ok).toBe(true);
    expect(compareResults([["a", 1], ["b", 2]], [["b", 2], ["a", 1]], true).reason).toMatch(/ORDER BY/);
    expect(compareResults([["a", 1.004]], [["a", 1]], false).ok).toBe(true);
    expect(compareResults([["a"]], [["a", 1]], false).ok).toBe(false);
  });
  it("gives a stable daily problem", () => {
    const d = new Date("2026-11-26T10:00:00Z");
    expect(dailyProblem(d).id).toBe(dailyProblem(d).id);
    expect(PRACTICE.map((x) => x.id)).toContain(dailyProblem(d).id);
  });
  it("recommends the next guided problem first", () => {
    const rec = recommendations([], []);
    expect(rec[0].href).toBe(`/learn/${GUESSTIMATES[0].id}`);
  });
});
