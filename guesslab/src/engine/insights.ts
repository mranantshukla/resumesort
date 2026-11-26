import type { AttemptRecord, SkillId } from "./types";
import { SKILL_LABELS } from "./types";
import { MISTAKE_LABELS } from "./evaluation";
import { PRACTICE, type PracticeProblem } from "@/content/practice";
import { GUESSTIMATES } from "@/content/guesstimates";

export const SKILLS: SkillId[] = ["clarifying", "structuring", "assumptions", "math", "intuition", "communication"];

export function skillAverages(attempts: AttemptRecord[], lastN = 10): Record<SkillId, number | null> {
  const recent = [...attempts].sort((a, b) => b.at - a.at).slice(0, lastN);
  return Object.fromEntries(
    SKILLS.map((k) => {
      const vals = recent.map((a) => a.scores[k]).filter((x): x is number => typeof x === "number");
      return [k, vals.length ? Math.round(vals.reduce((s, x) => s + x, 0) / vals.length) : null];
    }),
  ) as Record<SkillId, number | null>;
}

export function weakestSkills(attempts: AttemptRecord[], n = 2): { skill: SkillId; label: string; score: number }[] {
  const avg = skillAverages(attempts);
  return SKILLS.filter((k) => avg[k] !== null)
    .map((k) => ({ skill: k, label: SKILL_LABELS[k], score: avg[k] as number }))
    .sort((a, b) => a.score - b.score)
    .slice(0, n);
}

export function mistakeCounts(attempts: AttemptRecord[]): { id: string; label: string; count: number }[] {
  const c: Record<string, number> = {};
  attempts.forEach((a) => a.mistakes.forEach((m) => (c[m] = (c[m] ?? 0) + 1)));
  return Object.entries(c)
    .map(([id, count]) => ({ id, label: MISTAKE_LABELS[id] ?? id, count }))
    .sort((a, b) => b.count - a.count);
}

const SKILL_TIPS: Record<SkillId, { tip: string; href: string; label: string }> = {
  clarifying: { tip: "Before any numbers, write the unit, geography and time window.", href: "/learn/chai-cups-india", label: "Redo the clarifying stage on the chai problem" },
  structuring: { tip: "Segment the thing being counted, not the people.", href: "/school/guesstimates", label: "Review MECE structures" },
  assumptions: { tip: "Anchor every number on something you know, then adjust.", href: "/knowledge#assumptions", label: "Study common assumptions" },
  math: { tip: "Write crore as 10^7 and lakh as 10^5 before multiplying.", href: "/knowledge#cheatsheets", label: "Review the number cheat sheet" },
  intuition: { tip: "Always find the biggest driver and cross-check with a second method.", href: "/learn/movie-tickets-online", label: "Practise triangulation (movie tickets)" },
  communication: { tip: "Close with number, range, structure, top assumptions, cross-check and biggest driver.", href: "/knowledge#frameworks", label: "Review the 60-second answer" },
};

export function recommendations(attempts: AttemptRecord[], completedGuided: string[]): { title: string; reason: string; href: string }[] {
  const out: { title: string; reason: string; href: string }[] = [];
  const nextGuided = GUESSTIMATES.find((g) => !completedGuided.includes(g.id));
  if (nextGuided) out.push({ title: nextGuided.title, reason: "Next on your learning path.", href: `/learn/${nextGuided.id}` });
  weakestSkills(attempts, 2).forEach((w) => {
    const t = SKILL_TIPS[w.skill];
    out.push({ title: t.label, reason: `${w.label} averages ${w.score}/100. ${t.tip}`, href: t.href });
  });
  const attempted = new Set(attempts.map((a) => a.problemId));
  const fresh = PRACTICE.find((p) => !p.guidedId && !attempted.has(p.id));
  if (fresh) out.push({ title: fresh.title, reason: "A new problem for independent practice.", href: `/practice/${fresh.id}` });
  return out.slice(0, 4);
}

/** Same problem for everyone on a given date. */
export function dailyProblem(date: Date = new Date()): PracticeProblem {
  const key = date.toISOString().slice(0, 10);
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PRACTICE[h % PRACTICE.length];
}
