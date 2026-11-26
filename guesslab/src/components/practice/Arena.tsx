"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Clock, Plus, RotateCcw, Timer, Trash2 } from "lucide-react";
import type { PracticeProblem } from "@/content/practice";
import { computeSegments, evaluatePractice, type PracticeAttempt, type PracticeEvaluation } from "@/engine/practiceEval";
import { suspectOverlaps } from "@/engine/mece";
import { sameDim, formatDim, parseUnit } from "@/engine/units";
import { both, parseNumberInput } from "@/engine/format";
import { SKILL_LABELS, type SkillId } from "@/engine/types";
import { actions, useAppData } from "@/lib/store";
import { Badge, Button, Callout, Card, DIFFICULTY_TONE, ProgressBar, Segmented, Skeleton, cn } from "@/components/ui";
import { SkillRadar } from "@/components/charts";

const UNITS = ["person", "household", "%", "cup/person/day", "order/person/month", "order/day", "day/month", "INR/order", "plate/hour", "hour/day", "rider", "order/rider/hour", "screen", "show/screen/day", "ticket/show"];

const blank = (problemId: string): PracticeAttempt => ({
  problemId,
  clarifications: [""],
  segments: [{ label: "", factors: [{ label: "", value: NaN, unit: "" }] }],
  combine: "sum",
  finalAnswer: null,
  statement: "",
  minutes: 0,
});

function NumberCell({ value, onChange, id, label }: { value: number; onChange: (n: number) => void; id: string; label: string }) {
  const [t, setT] = useState(Number.isFinite(value) ? String(value) : "");
  return (
    <input
      id={id}
      aria-label={label}
      value={t}
      onChange={(e) => {
        setT(e.target.value);
        const n = parseNumberInput(e.target.value);
        onChange(n === null ? NaN : n);
      }}
      placeholder="e.g. 1.4 crore"
      className={cn("h-9 w-full rounded-md border bg-surface px-2 font-mono text-sm", t && parseNumberInput(t) === null ? "border-bad" : "border-line")}
    />
  );
}

export function Arena({ problem }: { problem: PracticeProblem }) {
  const [data, ready] = useAppData();
  const [draft, setDraft] = useState<PracticeAttempt | null>(null);
  const [mode, setMode] = useState<"untimed" | "timed">("untimed");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<PracticeEvaluation | null>(null);
  const limit = problem.difficulty === "advanced" ? 25 : problem.difficulty === "intermediate" ? 20 : 15;
  const submitted = useRef(false);

  useEffect(() => {
    if (ready && !draft) setDraft(data.practiceDrafts[problem.id] ?? blank(problem.id));
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  const elapsed = startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  const remaining = limit * 60 - elapsed;

  const update = (fn: (d: PracticeAttempt) => void) =>
    setDraft((d) => {
      if (!d) return d;
      const n = structuredClone(d);
      fn(n);
      actions.saveDraft(problem.id, n);
      return n;
    });

  const submit = () => {
    if (!draft || submitted.current) return;
    submitted.current = true;
    const attempt = { ...draft, minutes: Math.max(1, Math.round(elapsed / 60)) };
    const ev = evaluatePractice(problem, attempt);
    setResult(ev);
    actions.recordAttempt({ id: `practice-${problem.id}-${Date.now()}`, kind: "practice", problemId: problem.id, title: problem.title, at: Date.now(), minutes: attempt.minutes, scores: ev.scores, overall: ev.overall, mistakes: ev.mistakes });
    actions.clearDraft(problem.id);
  };

  useEffect(() => {
    if (mode === "timed" && startedAt && remaining <= 0) submit();
  }, [remaining]); // eslint-disable-line react-hooks/exhaustive-deps

  const segs = useMemo(() => (draft ? computeSegments(draft.segments.filter((s) => s.factors.some((f) => Number.isFinite(f.value)))) : []), [draft]);
  const total = segs.length ? (draft?.combine === "sum" ? segs.reduce((a, s) => a + s.value, 0) : Math.min(...segs.map((s) => s.value))) : 0;
  const overlaps = draft && draft.combine === "sum" ? suspectOverlaps(draft.segments.map((s) => s.label).filter(Boolean)) : [];
  const unitClash = segs.length > 1 && segs.some((s) => !sameDim(s.dim, segs[0].dim));

  if (!ready || !draft) return <div className="grid gap-4 p-6"><Skeleton className="h-10 w-72" /><Skeleton className="h-72" /></div>;

  const header = (
    <div className="mb-5 grid gap-2">
      <Link href="/practice" className="flex w-fit items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} /> Practice arena
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={DIFFICULTY_TONE[problem.difficulty]}>{problem.difficulty}</Badge>
        {problem.guidedId && <Badge tone="accent">Guided version available</Badge>}
      </div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">{problem.title}</h1>
      <p className="prose-read max-w-[70ch] border-l-2 border-accent pl-3">“{problem.prompt}”</p>
    </div>
  );

  if (result) {
    const groups = [
      { type: "strength", title: "Strengths", tone: "good" },
      { type: "factual", title: "Factual errors", tone: "bad" },
      { type: "alternative", title: "Reasonable alternatives", tone: "hint" },
      { type: "methodology", title: "Method differences", tone: "accent" },
    ] as const;
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
        {header}
        <div className="grid gap-6">
          <div className="grid items-center gap-4 md:grid-cols-[240px_1fr]">
            <Card className="grid gap-1 p-4 text-center">
              <span className="eyebrow">Overall</span>
              <span className="tabular font-serif text-5xl font-semibold">{result.overall}</span>
              <span className="text-sm text-muted">Your answer: {both(draft.finalAnswer ?? result.computed)} {problem.answerUnitLabel}</span>
            </Card>
            <SkillRadar scores={result.scores} />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(result.scores) as SkillId[]).map((k) => (
              <div key={k} className="grid gap-1">
                <div className="flex justify-between text-sm">
                  <span>{SKILL_LABELS[k]}</span>
                  <span className="font-mono">{result.scores[k]}</span>
                </div>
                <ProgressBar value={result.scores[k]} />
              </div>
            ))}
          </div>
          <Callout tone="accent" title="Reference range (shown only after you submit)">
            {both(problem.reference[0])} to {both(problem.reference[1])} {problem.answerUnitLabel}. {problem.referenceNote} This is an illustrative range from GuessLab's own model, not a verified statistic.
          </Callout>
          {groups.map((g) => {
            const items = result.feedback.filter((f) => f.type === g.type);
            return items.length ? (
              <div key={g.type} className="grid gap-1.5">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Badge tone={g.tone}>{items.length}</Badge> {g.title}
                </h3>
                <ul className="grid gap-1.5 text-sm">
                  {items.map((f, i) => (
                    <li key={i} className="rounded-md bg-surface-2 px-3 py-2">
                      <span className="text-xs font-semibold text-muted">{SKILL_LABELS[f.skill]} · </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null;
          })}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={() => {
                submitted.current = false;
                setResult(null);
                setStartedAt(null);
                setDraft(blank(problem.id));
              }}
            >
              <RotateCcw size={14} /> Try again
            </Button>
            {problem.guidedId && (
              <Link href={`/learn/${problem.guidedId}`}>
                <Button>Learn it step by step</Button>
              </Link>
            )}
            <Link href={`/interview?problem=${problem.id}`}>
              <Button variant="ghost">Defend it in an interview</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!startedAt) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6">
        {header}
        <Card className="grid gap-4 p-5">
          <p>Work on your own: no hints, no reference answer until you submit. Your draft saves automatically.</p>
          <div className="grid gap-2">
            <span className="text-sm font-semibold">Mode</span>
            <Segmented
              value={mode}
              onChange={setMode}
              label="Timing mode"
              options={[
                { id: "untimed", label: "Untimed" },
                { id: "timed", label: `Timed (${limit} min)` },
              ]}
            />
          </div>
          <div>
            <Button variant="primary" onClick={() => (setStartedAt(Date.now()), setNow(Date.now()))}>
              <Timer size={15} /> Start
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const mm = (n: number) => `${Math.floor(Math.abs(n) / 60)}:${String(Math.abs(n) % 60).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
      {header}
      <div className="sticky top-14 z-20 mb-4 flex items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-2 lg:top-2">
        <span className="flex items-center gap-1.5 text-sm">
          <Clock size={14} /> {mode === "timed" ? `${mm(remaining)} left` : `${mm(elapsed)} elapsed`}
        </span>
        <Button variant="primary" size="sm" onClick={submit}>
          Submit for evaluation
        </Button>
      </div>

      <div className="grid gap-6">
        <section className="grid gap-2">
          <h2 className="font-serif text-xl font-semibold">1. Clarifications and scope</h2>
          <p className="text-sm text-muted">Write the questions you'd ask and the answer you'll assume.</p>
          {draft.clarifications.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                id={`clar-${i}`}
                aria-label={`Clarification ${i + 1}`}
                value={c}
                onChange={(e) => update((d) => void (d.clarifications[i] = e.target.value))}
                placeholder="e.g. Typical day, all apps? I'll assume yes."
                className="h-9 min-w-0 flex-1 rounded-md border border-line bg-surface px-2.5 text-sm"
              />
              <Button variant="ghost" size="sm" aria-label="Remove clarification" onClick={() => update((d) => void d.clarifications.splice(i, 1))}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
          <Button size="sm" className="w-fit" onClick={() => update((d) => void d.clarifications.push(""))}>
            <Plus size={14} /> Add clarification
          </Button>
        </section>

        <section className="grid gap-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-serif text-xl font-semibold">2. Structure and assumptions</h2>
              <p className="text-sm text-muted">Each segment multiplies its factors. Give every factor a unit; enter shares as % (65 = 65%).</p>
            </div>
            <Segmented
              size="sm"
              value={draft.combine}
              onChange={(v) => update((d) => void (d.combine = v))}
              label="Combine segments"
              options={[
                { id: "sum", label: "Add segments" },
                { id: "min", label: "Smallest (capacity)" },
              ]}
            />
          </div>
          <datalist id="unit-list">
            {UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
          {draft.segments.map((s, si) => {
            const r = computeSegments([s])[0];
            const valid = s.factors.length && s.factors.every((f) => Number.isFinite(f.value));
            return (
              <Card key={si} className="grid gap-2.5 p-3.5">
                <div className="flex gap-2">
                  <input id={`seg-${si}`} aria-label={`Segment ${si + 1} name`} value={s.label} onChange={(e) => update((d) => void (d.segments[si].label = e.target.value))} placeholder={`Segment ${si + 1} name, e.g. Cups at home`} className="h-9 min-w-0 flex-1 rounded-md border border-line bg-surface px-2.5 text-sm font-medium" />
                  <Button variant="ghost" size="sm" aria-label="Remove segment" onClick={() => update((d) => void d.segments.splice(si, 1))}>
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="grid gap-1.5">
                  {s.factors.map((f, fi) => (
                    <div key={fi} className="grid grid-cols-[1fr_110px_120px_auto] items-center gap-1.5 sm:grid-cols-[1fr_150px_170px_auto]">
                      <input id={`f-${si}-${fi}-l`} aria-label="Factor name" value={f.label} onChange={(e) => update((d) => void (d.segments[si].factors[fi].label = e.target.value))} placeholder="Factor, e.g. Population" className="h-9 min-w-0 rounded-md border border-line bg-surface px-2 text-sm" />
                      <NumberCell id={`f-${si}-${fi}-v`} label="Factor value" value={f.value} onChange={(n) => update((d) => void (d.segments[si].factors[fi].value = n))} />
                      <input id={`f-${si}-${fi}-u`} aria-label="Factor unit" list="unit-list" value={f.unit} onChange={(e) => update((d) => void (d.segments[si].factors[fi].unit = e.target.value))} placeholder="unit" className="h-9 min-w-0 rounded-md border border-line bg-surface px-2 font-mono text-sm" />
                      <Button variant="ghost" size="sm" aria-label="Remove factor" onClick={() => update((d) => void d.segments[si].factors.splice(fi, 1))}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button size="sm" variant="ghost" onClick={() => update((d) => void d.segments[si].factors.push({ label: "", value: NaN, unit: "" }))}>
                    <Plus size={13} /> Add factor (×)
                  </Button>
                  <span className="tabular font-mono text-sm">
                    = {valid ? both(r.value) : "?"} <span className="text-muted">{valid ? r.unitLabel : ""}</span>
                  </span>
                </div>
              </Card>
            );
          })}
          <Button size="sm" className="w-fit" onClick={() => update((d) => void d.segments.push({ label: "", factors: [{ label: "", value: NaN, unit: "" }] }))}>
            <Plus size={14} /> Add segment ({draft.combine === "sum" ? "+" : "min"})
          </Button>
          {overlaps.map((o) => (
            <Callout key={o.a + o.b} tone="hint" title="Possible double counting">
              “{o.a}” and “{o.b}”: {o.reason}
            </Callout>
          ))}
          {unitClash && (
            <Callout tone="bad" title="Unit check">
              Your segments are in different units ({segs.map((s) => s.unitLabel).join(" vs ")}). You can't {draft.combine === "sum" ? "add" : "compare"} them.
            </Callout>
          )}
          {segs.length > 0 && (
            <Card className="flex flex-wrap items-center justify-between gap-2 p-3.5">
              <span className="text-sm text-muted">Your structure gives</span>
              <span className="tabular font-serif text-2xl font-semibold">
                {both(total)} <span className="font-sans text-sm text-muted">{formatDim(segs[0].dim)}</span>
              </span>
              {!sameDim(segs[0].dim, parseUnit(problem.answerUnit)) && <span className="w-full text-xs text-warn">The question asks for {problem.answerUnitLabel}. Check whether a conversion is missing.</span>}
            </Card>
          )}
        </section>

        <section className="grid gap-2">
          <h2 className="font-serif text-xl font-semibold">3. Final answer</h2>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="final-number" className="text-sm font-medium">
              Your number ({problem.answerUnitLabel})
            </label>
            <NumberCell id="final-number" label="Final number" value={draft.finalAnswer ?? NaN} onChange={(n) => update((d) => void (d.finalAnswer = Number.isFinite(n) ? n : null))} />
            {segs.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => update((d) => void (d.finalAnswer = total))}>
                Use my structure's result
              </Button>
            )}
          </div>
          <textarea id="statement" aria-label="Your interview answer" value={draft.statement} onChange={(e) => update((d) => void (d.statement = e.target.value))} rows={6} placeholder="Say it as you would to the interviewer: the number and a range, how you structured it, your key assumptions and why, and a sanity check." className="prose-read w-full rounded-lg border border-line bg-surface p-3" />
        </section>

        <div>
          <Button variant="primary" onClick={submit}>
            Submit for evaluation
          </Button>
        </div>
      </div>
    </div>
  );
}
