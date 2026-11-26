"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import type { Exercise, SchoolModule } from "@/content/school";
import { SCHOOL } from "@/content/school";
import { SQL_EXERCISES } from "@/content/sql";
import { parseNumberInput } from "@/engine/format";
import { actions, useAppData } from "@/lib/store";
import { Badge, Button, Callout, Card, cn } from "@/components/ui";
import { SqlRunner } from "./SqlRunner";

function McqExercise({ ex, id }: { ex: Extract<Exercise, { kind: "mcq" }>; id: string }) {
  const [data] = useAppData();
  const [pick, setPick] = useState<number | null>(null);
  const done = data.school[id];
  return (
    <Card className="grid gap-2.5 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{ex.prompt}</p>
        {done && <Badge tone="good">Solved</Badge>}
      </div>
      <div className="grid gap-1.5">
        {ex.options.map((o, i) => {
          const chosen = pick === i;
          return (
            <button
              key={i}
              disabled={pick !== null}
              onClick={() => {
                setPick(i);
                if (o.correct) actions.markSchool(id, true);
              }}
              className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm", pick === null ? "border-line hover:border-accent/50" : o.correct ? "border-good bg-good-soft" : chosen ? "border-bad bg-bad-soft" : "border-line opacity-70")}
            >
              {pick !== null && (o.correct ? <Check size={14} className="text-good" /> : chosen ? <X size={14} className="text-bad" /> : <span className="w-[14px]" />)}
              {o.text}
            </button>
          );
        })}
      </div>
      {pick !== null && <Callout tone={ex.options[pick].correct ? "good" : "hint"}>{ex.explain}</Callout>}
      {pick !== null && !ex.options[pick].correct && (
        <Button size="sm" variant="ghost" className="w-fit" onClick={() => setPick(null)}>
          Try again
        </Button>
      )}
    </Card>
  );
}

function NumericExercise({ ex, id }: { ex: Extract<Exercise, { kind: "numeric" }>; id: string }) {
  const [data] = useAppData();
  const [val, setVal] = useState("");
  const [res, setRes] = useState<"ok" | "no" | null>(null);
  const done = data.school[id];
  return (
    <Card className="grid gap-2.5 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{ex.prompt}</p>
        {done && <Badge tone="good">Solved</Badge>}
      </div>
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          let n = parseNumberInput(val);
          if (n !== null && ex.unit === "%" && /%/.test(val)) n = n * 100;
          const ok = n !== null && Math.abs(n - ex.answer) <= Math.abs(ex.answer) * ex.tolerance + 1e-9;
          setRes(ok ? "ok" : "no");
          if (ok) actions.markSchool(id, true);
        }}
      >
        <input id={`num-${id}`} aria-label="Your answer" value={val} onChange={(e) => setVal(e.target.value)} placeholder={ex.unit} className="h-9 w-40 rounded-md border border-line bg-surface px-2.5 font-mono text-sm" />
        <span className="text-sm text-muted">{ex.unit}</span>
        <Button type="submit" size="sm" variant="primary">
          Check
        </Button>
      </form>
      {res === "ok" && <Callout tone="good" title="Correct">{ex.explain}</Callout>}
      {res === "no" && <Callout tone="bad" title="Not quite">Check your arithmetic and units, then try again.</Callout>}
    </Card>
  );
}

export function ModuleView({ module: m }: { module: SchoolModule }) {
  const idx = SCHOOL.findIndex((x) => x.id === m.id);
  const next = SCHOOL[idx + 1];
  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6">
      <Link href="/school" className="mb-4 flex w-fit items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} /> Product Analyst School
      </Link>
      <span className="eyebrow">Module {m.number}</span>
      <h1 className="mb-2 font-serif text-3xl font-semibold tracking-tight">{m.title}</h1>
      <p className="mb-8 text-muted">{m.summary}</p>

      <div className="grid gap-8">
        {m.lessons.map((l) => (
          <article key={l.id} className="grid gap-3">
            <h2 className="font-serif text-xl font-semibold">{l.title}</h2>
            {l.body.map((p, i) => (
              <p key={i} className="prose-read max-w-[68ch]">
                {p}
              </p>
            ))}
            <Callout tone="accent" title="Takeaway">
              {l.takeaway}
            </Callout>
          </article>
        ))}

        <section className="grid gap-3">
          <h2 className="font-serif text-xl font-semibold">Exercises</h2>
          {m.exercises.map((ex) => {
            const id = `${m.id}:${ex.id}`;
            if (ex.kind === "mcq") return <McqExercise key={id} ex={ex} id={id} />;
            if (ex.kind === "numeric") return <NumericExercise key={id} ex={ex} id={id} />;
            if (ex.kind === "sql") {
              const s = SQL_EXERCISES.find((x) => x.id === ex.sqlId)!;
              return <SqlRunner key={id} ex={s} exerciseId={id} />;
            }
            return (
              <Card key={id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <p className="text-sm">{ex.prompt}</p>
                <Link href={ex.href}>
                  <Button size="sm" variant="primary">
                    {ex.label} <ArrowRight size={13} />
                  </Button>
                </Link>
              </Card>
            );
          })}
        </section>

        {next && (
          <Link href={`/school/${next.id}`} className="w-fit">
            <Button>
              Next module: {next.title} <ArrowRight size={14} />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
