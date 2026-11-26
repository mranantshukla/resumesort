"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Flame, Target } from "lucide-react";
import { GUESSTIMATES } from "@/content/guesstimates";
import { useAppData } from "@/lib/store";
import { progressPct } from "@/engine/session";
import { dailyProblem, mistakeCounts, recommendations, weakestSkills } from "@/engine/insights";
import { Page } from "@/components/layout/AppShell";
import { Badge, Button, Card, DIFFICULTY_TONE, Empty, ProgressBar, Skeleton, Stat } from "@/components/ui";

function timeAgo(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 60) return `${Math.max(1, m)} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

export default function Dashboard() {
  const [data, ready] = useAppData();
  const daily = dailyProblem();
  const completedGuided = GUESSTIMATES.filter((g) => data.sessions[g.id]?.completed.includes("evaluation") || data.attempts.some((a) => a.kind === "guided" && a.problemId === g.id)).map((g) => g.id);
  const recent = [...data.attempts].sort((a, b) => b.at - a.at).slice(0, 5);
  const weak = weakestSkills(data.attempts, 3);
  const recs = recommendations(data.attempts, completedGuided);
  const avg = data.attempts.length ? Math.round(data.attempts.reduce((s, a) => s + a.overall, 0) / data.attempts.length) : null;
  const inProgress = GUESSTIMATES.find((g) => data.sessions[g.id] && !completedGuided.includes(g.id));
  const topMistake = mistakeCounts(data.attempts)[0];

  return (
    <Page>
      <header className="mb-8 grid gap-2">
        <span className="eyebrow">Dashboard</span>
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Think. Structure. Estimate. Defend.</h1>
        <p className="max-w-[64ch] text-muted">Work through guesstimates one layer at a time, practise on your own, then defend your reasoning to the interviewer. Your scores reward reasoning, not lucky numbers.</p>
      </header>

      {!ready ? (
        <div className="grid gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="grid gap-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Guided problems done" value={`${completedGuided.length}/${GUESSTIMATES.length}`} />
            <Stat label="Attempts" value={data.attempts.length} sub="guided, practice and interviews" />
            <Stat label="Average score" value={avg ?? "—"} sub={avg === null ? "complete a problem to see it" : "out of 100"} />
            <Stat label="Most frequent mistake" value={<span className="font-sans text-[15px] font-semibold leading-snug">{topMistake?.label ?? "—"}</span>} sub={topMistake ? `${topMistake.count}×` : "none yet"} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="grid content-start gap-3">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <span className="eyebrow">Your learning path</span>
                  <h2 className="font-serif text-xl font-semibold">Five guided guesstimates, easiest first</h2>
                </div>
                {inProgress && (
                  <Link href={`/learn/${inProgress.id}`}>
                    <Button size="sm" variant="primary">
                      Resume <ArrowRight size={14} />
                    </Button>
                  </Link>
                )}
              </div>
              <ol className="grid gap-2">
                {GUESSTIMATES.map((g, i) => {
                  const s = data.sessions[g.id];
                  const pct = completedGuided.includes(g.id) ? 100 : s ? progressPct(s) : 0;
                  return (
                    <li key={g.id}>
                      <Link href={`/learn/${g.id}`} className="block">
                        <Card className="grid gap-2 p-3.5 transition-colors hover:border-accent/50">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="tabular grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-xs font-semibold">{i + 1}</span>
                            <span className="font-medium">{g.title}</span>
                            <Badge tone={DIFFICULTY_TONE[g.difficulty]}>{g.difficulty}</Badge>
                            <span className="ml-auto text-xs text-muted">{pct === 100 ? "Completed" : pct ? `${pct}%` : `~${g.minutes} min`}</span>
                          </div>
                          <ProgressBar value={pct} tone={pct === 100 ? "good" : "accent"} />
                        </Card>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="grid content-start gap-4">
              <Card className="grid gap-2 p-4">
                <span className="eyebrow flex items-center gap-1">
                  <CalendarDays size={12} /> Daily guesstimate
                </span>
                <p className="font-serif text-lg font-semibold leading-snug">{daily.title}</p>
                <p className="text-sm text-muted">{daily.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/practice/${daily.id}`}>
                    <Button size="sm" variant="primary">
                      <Target size={14} /> Solve it
                    </Button>
                  </Link>
                  <Link href={`/interview?problem=${daily.id}`}>
                    <Button size="sm">Do it as an interview</Button>
                  </Link>
                </div>
              </Card>

              <Card className="grid gap-2 p-4">
                <span className="eyebrow flex items-center gap-1">
                  <Flame size={12} /> Focus areas (your lowest skills)
                </span>
                {weak.length ? (
                  weak.map((w) => (
                    <div key={w.skill} className="grid gap-1">
                      <div className="flex justify-between text-sm">
                        <span>{w.label}</span>
                        <span className="tabular font-mono">{w.score}</span>
                      </div>
                      <ProgressBar value={w.score} />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">Complete your first problem and GuessLab will show where to focus.</p>
                )}
              </Card>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="grid content-start gap-3">
              <h2 className="font-serif text-xl font-semibold">Recommended next</h2>
              <div className="grid gap-2">
                {recs.map((r) => (
                  <Link key={r.href + r.title} href={r.href}>
                    <Card className="grid gap-0.5 p-3.5 transition-colors hover:border-accent/50">
                      <span className="font-medium">{r.title}</span>
                      <span className="text-sm text-muted">{r.reason}</span>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
            <section className="grid content-start gap-3">
              <h2 className="font-serif text-xl font-semibold">Recently attempted</h2>
              {recent.length ? (
                <div className="grid gap-2">
                  {recent.map((a) => (
                    <Card key={a.id} className="flex items-center gap-3 p-3.5">
                      <span className="tabular grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-soft font-serif text-lg font-semibold text-accent">{a.overall}</span>
                      <span className="grid min-w-0 gap-0.5">
                        <span className="truncate font-medium">{a.title}</span>
                        <span className="text-xs text-muted">
                          {a.kind === "guided" ? "Guided" : a.kind === "practice" ? "Practice" : a.kind === "interview" ? "Interview" : "School"} · {timeAgo(a.at)} · {a.minutes} min
                        </span>
                      </span>
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty title="Nothing attempted yet" action={<Link href={`/learn/${GUESSTIMATES[0].id}`}><Button variant="primary" size="sm">Start with chai</Button></Link>}>
                  Begin with the chai problem: it teaches the whole 8-stage method in about 15 minutes.
                </Empty>
              )}
            </section>
          </div>
        </div>
      )}
    </Page>
  );
}
