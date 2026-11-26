"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import type { StageGuide as Guide } from "@/engine/types";
import { cn, Callout } from "@/components/ui";

export function StageGuide({ guide, completed }: { guide: Guide; completed: boolean }) {
  const [open, setOpen] = useState(false);
  const rows: [string, React.ReactNode][] = [
    ["Questions to ask yourself", <ul key="a" className="list-disc pl-5">{guide.ask.map((a) => <li key={a}>{a}</li>)}</ul>],
    ["Information you need", <ul key="i" className="list-disc pl-5">{guide.info.map((a) => <li key={a}>{a}</li>)}</ul>],
    ["How to derive it", guide.derive],
    ...(guide.formula ? ([["Formula", <code key="f" className="font-mono text-[13px]">{guide.formula}</code>]] as [string, React.ReactNode][]) : []),
    ["Common mistakes", <ul key="m" className="list-disc pl-5">{guide.mistakes.map((a) => <li key={a}>{a}</li>)}</ul>],
  ];
  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <p className="prose-read">{guide.task}</p>
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">Why it matters: </span>
          {guide.why}
        </p>
      </div>
      <button onClick={() => setOpen((o) => !o)} className="flex w-fit items-center gap-1 text-sm font-medium text-accent" aria-expanded={open}>
        <ChevronDown size={15} className={cn("transition-transform", open && "rotate-180")} /> {open ? "Hide" : "Show"} the full stage guide
      </button>
      {open && (
        <dl className="grid gap-3 rounded-lg border border-line bg-surface-2/60 p-4 text-sm animate-rise">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-0.5 sm:grid-cols-[180px_1fr] sm:gap-4">
              <dt className="font-semibold">{k}</dt>
              <dd className="text-ink/90">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {completed && (
        <Callout tone="good" title="Reasoning explained">
          <span className="inline-flex gap-1.5">
            <Lightbulb size={15} className="mt-0.5 shrink-0" />
            {guide.explanation}
          </span>
        </Callout>
      )}
    </div>
  );
}
