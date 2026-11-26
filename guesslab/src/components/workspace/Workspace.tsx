"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock, Lock, NotebookPen } from "lucide-react";
import type { Guesstimate, SessionState, StageId } from "@/engine/types";
import { STAGE_LABELS, STAGE_ORDER } from "@/engine/types";
import { createSession, isUnlocked, nextStage, progressPct, stageBlockers } from "@/engine/session";
import { actions, useAppData } from "@/lib/store";
import { Badge, Button, Card, DIFFICULTY_TONE, ProgressBar, Segmented, Skeleton, cn } from "@/components/ui";
import { StageGuide } from "./StageGuide";
import { CoachPanel } from "./CoachPanel";
import { AssumptionsStage, CalculationStage, ClarifyingStage, EvaluationStage, FinalStage, SensitivityStage, StructuringStage, UnderstandingStage, type StageProps } from "./Stages";

const STAGE_COMPONENTS: Record<StageId, (p: StageProps) => React.ReactNode> = {
  understanding: UnderstandingStage,
  clarifying: ClarifyingStage,
  structuring: StructuringStage,
  assumptions: AssumptionsStage,
  calculation: CalculationStage,
  sensitivity: SensitivityStage,
  final: FinalStage,
  evaluation: EvaluationStage,
};

function StageList({ s, view, onPick }: { s: SessionState; view: StageId; onPick: (st: StageId) => void }) {
  return (
    <ol className="grid gap-0.5">
      {STAGE_ORDER.map((st, i) => {
        const done = s.completed.includes(st);
        const unlocked = isUnlocked(s, st);
        return (
          <li key={st}>
            <button
              disabled={!unlocked}
              onClick={() => onPick(st)}
              className={cn("flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm", view === st ? "bg-accent-soft font-medium text-accent" : unlocked ? "hover:bg-surface-2" : "text-muted/70")}
              aria-current={view === st ? "step" : undefined}
            >
              <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] tabular", done ? "border-good bg-good text-white" : view === st ? "border-accent text-accent" : "border-line text-muted")}>
                {done ? <Check size={12} /> : unlocked ? i + 1 : <Lock size={10} />}
              </span>
              {STAGE_LABELS[st]}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function ProblemPanel({ problem, s, view, onPick }: { problem: Guesstimate; s: SessionState; view: StageId; onPick: (st: StageId) => void }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={DIFFICULTY_TONE[problem.difficulty]}>{problem.difficulty}</Badge>
          <Badge>
            <Clock size={11} /> ~{problem.minutes} min
          </Badge>
        </div>
        <h1 className="font-serif text-2xl font-semibold leading-tight tracking-tight">{problem.title}</h1>
        <p className="prose-read rounded-lg border-l-2 border-accent bg-accent-soft/50 px-3 py-2">“{problem.prompt}”</p>
        <p className="text-sm text-muted">{problem.context}</p>
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="eyebrow">Progress</span>
          <span className="tabular">{progressPct(s)}%</span>
        </div>
        <ProgressBar value={progressPct(s)} />
        <StageList s={s} view={view} onPick={onPick} />
      </div>
      <div className="grid gap-1.5">
        <span className="eyebrow">Learning objectives</span>
        <ul className="grid gap-1 text-sm">
          {problem.objectives.map((o) => (
            <li key={o} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              {o}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-1.5">
        <span className="eyebrow">Prerequisites</span>
        <div className="flex flex-wrap gap-1.5">
          {problem.prerequisites.map((p) => (
            <Badge key={p}>{p}</Badge>
          ))}
        </div>
      </div>
      {problem.attribution && <p className="text-xs text-muted">{problem.attribution}</p>}
    </div>
  );
}

export function Workspace({ problem }: { problem: Guesstimate }) {
  const [data, ready] = useAppData();
  const saved = data.sessions[problem.id];
  const [view, setView] = useState<StageId | null>(null);
  const [mobileTab, setMobileTab] = useState<"problem" | "work" | "coach">("work");
  const [hintRequest, setHintRequest] = useState<{ text: string; n: number } | null>(null);

  const s: SessionState = saved ?? createSession(problem);
  const current = view ?? s.stage;

  const set = useCallback(
    (fn: (d: SessionState) => void) => {
      const base = data.sessions[problem.id] ?? createSession(problem);
      const draft = structuredClone(base);
      fn(draft);
      actions.saveSession(draft);
    },
    [data.sessions, problem],
  );

  const onHint = (stage: keyof Guesstimate["stages"], text?: string) => {
    set((d) => void (d.hintsUsed[stage] = (d.hintsUsed[stage] ?? 0) + 1));
    if (text) {
      setHintRequest({ text, n: Date.now() });
      setMobileTab("coach");
    }
  };

  if (!ready) {
    return (
      <div className="grid gap-4 p-6">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const blockers = stageBlockers(problem, s, current);
  const done = s.completed.includes(current);
  const Stage = STAGE_COMPONENTS[current];
  const nxt = nextStage(current);

  const complete = () => {
    set((d) => {
      if (!d.completed.includes(current)) d.completed.push(current);
      const n = nextStage(current);
      if (n) d.stage = n;
    });
    if (nxt) setView(nxt);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const centre = (
    <div className="grid min-w-0 gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-0.5">
          <span className="eyebrow">
            Stage {STAGE_ORDER.indexOf(current) + 1} of 8
          </span>
          <h2 className="font-serif text-2xl font-semibold tracking-tight">{STAGE_LABELS[current]}</h2>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" disabled={STAGE_ORDER.indexOf(current) === 0} onClick={() => setView(STAGE_ORDER[STAGE_ORDER.indexOf(current) - 1])}>
            <ArrowLeft size={14} /> Back
          </Button>
          {done && nxt && isUnlocked(s, nxt) && (
            <Button size="sm" variant="ghost" onClick={() => setView(nxt)}>
              Forward <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>
      <Card className="p-4 sm:p-5">
        <StageGuide guide={problem.stages[current].guide} completed={done} />
      </Card>
      <div className="min-w-0">
        <Stage problem={problem} s={s} set={set} onHint={onHint} />
      </div>
      {current !== "evaluation" && (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="text-sm">
            {done ? (
              <span className="flex items-center gap-1.5 text-good">
                <Check size={15} /> Stage complete. You can revise your work; scores use your latest state.
              </span>
            ) : blockers.length ? (
              <span className="text-muted">{blockers.join(" ")}</span>
            ) : (
              <span className="text-good">Ready to complete this stage.</span>
            )}
          </div>
          {!done && (
            <Button variant="primary" disabled={blockers.length > 0} onClick={complete}>
              Complete stage <ArrowRight size={14} />
            </Button>
          )}
        </Card>
      )}
      <details className="rounded-xl border border-line bg-surface p-4">
        <summary className="flex cursor-pointer items-center gap-2 font-medium">
          <NotebookPen size={15} /> Notes and scratchpad
        </summary>
        <textarea
          id="scratchpad"
          aria-label="Notes"
          value={s.notes}
          onChange={(e) => set((d) => void (d.notes = e.target.value))}
          rows={5}
          placeholder="Rough working, ideas, numbers you want to remember. Saved automatically."
          className="mt-3 w-full rounded-lg border border-line bg-surface-2/50 p-3 font-mono text-sm"
        />
      </details>
    </div>
  );

  const coach = <CoachPanel problem={problem} session={s} stage={current} history={data.attempts} hintRequest={hintRequest} onUseHint={() => onHint(current)} />;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link href="/library" className="flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} /> Library
        </Link>
        <div className="xl:hidden">
          <Segmented
            size="sm"
            label="Panel"
            value={mobileTab}
            onChange={setMobileTab}
            options={[
              { id: "problem", label: "Problem" },
              { id: "work", label: "Workspace" },
              { id: "coach", label: "Assistant" },
            ]}
          />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <aside className={cn("xl:sticky xl:top-5 xl:block xl:max-h-[calc(100vh-40px)] xl:overflow-y-auto", mobileTab === "problem" ? "block" : "hidden")}>
          <ProblemPanel problem={problem} s={s} view={current} onPick={(st) => (setView(st), setMobileTab("work"))} />
        </aside>
        <section className={cn("xl:block", mobileTab === "work" ? "block" : "hidden")}>{centre}</section>
        <aside className={cn("rounded-xl border border-line bg-surface p-4 xl:sticky xl:top-5 xl:flex xl:h-[calc(100vh-40px)]", mobileTab === "coach" ? "flex h-[75vh]" : "hidden")}>{coach}</aside>
      </div>
    </div>
  );
}
