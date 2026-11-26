"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mic, RotateCcw, Send, UserRound } from "lucide-react";
import { PRACTICE, getPractice } from "@/content/practice";
import { interviewerTurn, scoreInterview, startInterview, type InterviewState } from "@/engine/interviewer";
import { dailyProblem } from "@/engine/insights";
import { SKILL_LABELS, type SkillId } from "@/engine/types";
import { actions, useAppData } from "@/lib/store";
import { askAI, AI_PROVIDER } from "@/lib/ai";
import { Page } from "@/components/layout/AppShell";
import { Badge, Button, Callout, Card, ProgressBar, SectionTitle, Skeleton, cn } from "@/components/ui";
import { SkillRadar } from "@/components/charts";

const PHASES = ["clarify", "structure", "assumptions", "calculate", "sanity", "final", "done"] as const;
const PHASE_LABEL: Record<(typeof PHASES)[number], string> = { clarify: "Clarify", structure: "Structure", assumptions: "Assumptions", calculate: "Calculate", sanity: "Sanity check", final: "Final answer", done: "Scorecard" };

export function Interviewer() {
  const params = useSearchParams();
  const [data, ready] = useAppData();
  const [pick, setPick] = useState<string>(params.get("problem") ?? dailyProblem().id);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const st = data.interview;
  const problem = getPractice(st?.problemId ?? pick) ?? PRACTICE[0];

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [st?.turns.length]);

  const score = useMemo(() => (st && st.phase === "done" ? scoreInterview(st, problem) : null), [st, problem]);

  useEffect(() => {
    if (st && st.phase === "done" && score) {
      actions.recordAttempt({ id: `interview-${st.problemId}-${st.startedAt}`, kind: "interview", problemId: st.problemId, title: problem.title, at: Date.now(), minutes: score.minutes, scores: score.scores, overall: score.overall, mistakes: score.mistakes });
    }
  }, [st?.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {
    if (!st || !input.trim() || busy) return;
    const text = input.trim();
    setInput("");
    setBusy(true);
    let next: InterviewState = interviewerTurn(st, problem, text);
    // With OpenAI configured, the model phrases the follow-up; the state machine still decides the phase and scoring.
    const remote = await askAI({
      mode: "interviewer",
      context: {
        problem: problem.prompt,
        phase: next.phase,
        plannedFollowUp: next.turns[next.turns.length - 1].text,
        drivers: problem.drivers.map((d) => d.label),
        rule: "Act as a realistic product analyst interviewer. Never give the answer or the reference range. Ask one follow-up at a time. Keep the intent of plannedFollowUp.",
      },
      messages: next.turns.slice(-8).map((t) => ({ role: t.role === "candidate" ? "user" : "assistant", content: t.text })),
    });
    if (remote) next = { ...next, turns: [...next.turns.slice(0, -1), { role: "interviewer", text: remote }] };
    actions.saveInterview(next);
    setBusy(false);
  };

  if (!ready) return <Page><Skeleton className="h-72" /></Page>;

  if (!st) {
    return (
      <Page>
        <SectionTitle eyebrow="AI interviewer" title="Defend your estimate under questioning">
          The interviewer presents a problem, waits for your approach, asks follow-ups, challenges weak assumptions and scores you at the end. It won't give you the answer.
        </SectionTitle>
        <Card className="grid max-w-2xl gap-4 p-5">
          <label htmlFor="problem-pick" className="grid gap-1.5 text-sm font-medium">
            Problem
            <select id="problem-pick" value={pick} onChange={(e) => setPick(e.target.value)} className="h-10 rounded-md border border-line bg-surface px-2">
              {PRACTICE.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </select>
          </label>
          <ul className="grid gap-1 text-sm text-muted">
            <li>• Think out loud in full sentences, as you would in a real interview.</li>
            <li>• Ask clarifying questions first. Then structure, assume, calculate, sanity-check and summarise.</li>
            <li>• Mode: {AI_PROVIDER === "openai" ? "OpenAI phrases the questions; GuessLab's rubric scores you." : "Built-in interviewer (no API key needed)."}</li>
          </ul>
          <div>
            <Button variant="primary" onClick={() => actions.saveInterview(startInterview(getPractice(pick)!))}>
              <Mic size={15} /> Start interview
            </Button>
          </div>
        </Card>
      </Page>
    );
  }

  const phaseIdx = PHASES.indexOf(st.phase);

  return (
    <Page>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="eyebrow">AI interviewer</span>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">{problem.title}</h1>
        </div>
        <Button size="sm" variant="ghost" onClick={() => actions.saveInterview(null)}>
          <RotateCcw size={14} /> New interview
        </Button>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {PHASES.map((p, i) => (
          <Badge key={p} tone={i < phaseIdx ? "good" : i === phaseIdx ? "accent" : "neutral"}>
            {PHASE_LABEL[p]}
          </Badge>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="flex min-h-[60vh] flex-col p-4">
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
            {st.turns.map((t, i) => (
              <div key={i} className={cn("flex gap-2.5", t.role === "candidate" && "flex-row-reverse")}>
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", t.role === "interviewer" ? "bg-accent-soft text-accent" : "bg-surface-2")}>{t.role === "interviewer" ? <Mic size={15} /> : <UserRound size={15} />}</span>
                <p className={cn("max-w-[80%] rounded-xl px-3.5 py-2.5 text-[14.5px] leading-relaxed", t.role === "interviewer" ? "prose-read bg-surface-2" : "bg-accent text-accent-ink")}>{t.text}</p>
              </div>
            ))}
            {busy && <p className="text-sm text-muted">Interviewer is thinking…</p>}
          </div>
          {st.phase !== "done" && (
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <textarea
                id="candidate-input"
                aria-label="Your answer"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                placeholder="Think out loud… (Enter to send, Shift+Enter for a new line)"
                className="min-w-0 flex-1 resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm"
              />
              <Button type="submit" variant="primary" disabled={!input.trim() || busy} aria-label="Send">
                <Send size={15} />
              </Button>
            </form>
          )}
        </Card>

        <aside className="grid content-start gap-4">
          {score ? (
            <Card className="grid gap-3 p-4">
              <div className="text-center">
                <span className="eyebrow">Interview score</span>
                <div className="tabular font-serif text-5xl font-semibold">{score.overall}</div>
              </div>
              <SkillRadar scores={score.scores} height={220} />
              {(Object.keys(score.scores) as SkillId[]).map((k) => (
                <div key={k} className="grid gap-1">
                  <div className="flex justify-between text-xs">
                    <span>{SKILL_LABELS[k]}</span>
                    <span className="font-mono">{score.scores[k]}</span>
                  </div>
                  <ProgressBar value={score.scores[k]} />
                </div>
              ))}
            </Card>
          ) : (
            <Callout tone="neutral" title="How you're scored">
              Clarifying first, covering the key drivers, justified numbers, a sensible final number, a sanity check and a clear summary with a range. Factual errors (like a share above 100%) cost the most.
            </Callout>
          )}
          {score && (
            <div className="grid gap-1.5">
              <h2 className="font-semibold">Feedback</h2>
              {score.feedback.map((f, i) => (
                <p key={i} className="rounded-md bg-surface-2 px-3 py-2 text-sm">
                  <Badge tone={f.type === "strength" ? "good" : f.type === "factual" ? "bad" : f.type === "alternative" ? "hint" : "accent"} className="mr-1.5">
                    {f.type === "strength" ? "Strength" : f.type === "factual" ? "Factual error" : f.type === "alternative" ? "Alternative" : "Method"}
                  </Badge>
                  {f.text}
                </p>
              ))}
              <Callout tone="accent" title="Reference range">
                {problem.referenceNote}
              </Callout>
              {problem.guidedId && (
                <Link href={`/learn/${problem.guidedId}`} className="text-sm font-medium text-accent hover:underline">
                  Learn this problem step by step →
                </Link>
              )}
            </div>
          )}
        </aside>
      </div>
    </Page>
  );
}
