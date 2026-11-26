"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PRACTICE } from "@/content/practice";
import { GUESSTIMATES } from "@/content/guesstimates";
import type { Category, Difficulty } from "@/engine/types";
import { CATEGORY_LABELS } from "@/content/labels";
import { useAppData } from "@/lib/store";
import { progressPct } from "@/engine/session";
import { Page } from "@/components/layout/AppShell";
import { Badge, Card, DIFFICULTY_TONE, Empty, ProgressBar, SectionTitle, cn } from "@/components/ui";



export default function LibraryPage() {
  const [data] = useAppData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [diff, setDiff] = useState<Difficulty | "all">("all");
  const [mode, setMode] = useState<"all" | "guided" | "practice">("all");

  const items = useMemo(
    () =>
      PRACTICE.filter((p) => (cat === "all" || p.categories.includes(cat)) && (diff === "all" || p.difficulty === diff) && (mode === "all" || (mode === "guided" ? !!p.guidedId : !p.guidedId)) && (p.title + " " + p.prompt).toLowerCase().includes(q.toLowerCase())),
    [q, cat, diff, mode],
  );

  const status = (id: string, guidedId?: string) => {
    if (guidedId) {
      const s = data.sessions[guidedId];
      const done = data.attempts.some((a) => a.kind === "guided" && a.problemId === guidedId);
      return { pct: done ? 100 : s ? progressPct(s) : 0, label: done ? "Completed" : s ? "In progress" : "Not started" };
    }
    const n = data.attempts.filter((a) => a.problemId === id).length;
    const best = Math.max(0, ...data.attempts.filter((a) => a.problemId === id).map((a) => a.overall));
    return { pct: n ? 100 : data.practiceDrafts[id] ? 40 : 0, label: n ? `Best ${best}/100` : data.practiceDrafts[id] ? "Draft saved" : "Not started" };
  };

  return (
    <Page>
      <SectionTitle eyebrow="Guesstimate library" title={`${PRACTICE.length} problems across ten estimation types`}>
        Guided problems teach the method step by step. The rest are for independent practice and interviews. Problem topics were organised with the RCS Guesstimate Book as a reference; every question, number and explanation here is original.
      </SectionTitle>

      <div className="mb-5 grid gap-3">
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input id="library-search" aria-label="Search problems" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search problems" className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm" />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
          {(["all", ...Object.keys(CATEGORY_LABELS)] as (Category | "all")[]).map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", cat === c ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-muted hover:text-ink")}>
              {c === "all" ? "All types" : CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            Difficulty
            <select id="difficulty" value={diff} onChange={(e) => setDiff(e.target.value as Difficulty | "all")} className="h-8 rounded-md border border-line bg-surface px-2">
              <option value="all">All</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            Mode
            <select id="mode" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} className="h-8 rounded-md border border-line bg-surface px-2">
              <option value="all">All</option>
              <option value="guided">Guided (8 stages)</option>
              <option value="practice">Practice only</option>
            </select>
          </label>
          <span className="self-center text-muted">{items.length} shown</span>
        </div>
      </div>

      {items.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => {
            const st = status(p.id, p.guidedId);
            const guided = p.guidedId ? GUESSTIMATES.find((g) => g.id === p.guidedId) : undefined;
            return (
              <Card key={p.id} className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap gap-1.5">
                  {p.guidedId && <Badge tone="accent">Guided</Badge>}
                  <Badge tone={DIFFICULTY_TONE[p.difficulty]}>{p.difficulty}</Badge>
                  {p.categories.slice(0, 2).map((c) => (
                    <Badge key={c}>{CATEGORY_LABELS[c]}</Badge>
                  ))}
                </div>
                <div className="grid gap-1">
                  <h3 className="font-serif text-lg font-semibold leading-snug">{p.title}</h3>
                  <p className="text-sm text-muted">{p.prompt}</p>
                </div>
                <p className="text-xs text-muted">
                  <span className="font-semibold text-ink">Prerequisites: </span>
                  {(guided?.prerequisites ?? p.concepts).join(", ")}
                  {p.rcsTopic ? ` · Topic also in RCS book (${p.rcsTopic})` : ""}
                </p>
                <div className="mt-auto grid gap-2">
                  <div className="flex justify-between text-xs text-muted">
                    <span>{st.label}</span>
                  </div>
                  <ProgressBar value={st.pct} tone={st.pct === 100 ? "good" : "accent"} />
                  <div className="flex flex-wrap gap-2 text-sm">
                    {p.guidedId && (
                      <Link className="font-medium text-accent hover:underline" href={`/learn/${p.guidedId}`}>
                        Learn step by step →
                      </Link>
                    )}
                    <Link className="font-medium text-accent hover:underline" href={`/practice/${p.id}`}>
                      Practise solo →
                    </Link>
                    <Link className="text-muted hover:text-ink hover:underline" href={`/interview?problem=${p.id}`}>
                      Interview
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty title="No problems match">Try clearing the search or choosing “All types”.</Empty>
      )}
    </Page>
  );
}
