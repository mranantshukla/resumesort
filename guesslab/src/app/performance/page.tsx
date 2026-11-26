"use client";

import Link from "next/link";
import { useState } from "react";
import { GUESSTIMATES } from "@/content/guesstimates";
import { SCHOOL } from "@/content/school";
import { SKILL_LABELS } from "@/engine/types";
import { mistakeCounts, recommendations, skillAverages, SKILLS, weakestSkills } from "@/engine/insights";
import { actions, useAppData } from "@/lib/store";
import { Page } from "@/components/layout/AppShell";
import { Badge, Button, Card, Empty, ProgressBar, SectionTitle, Skeleton, Stat } from "@/components/ui";
import { ScoreLine, SkillRadar } from "@/components/charts";

export default function PerformancePage() {
  const [data, ready] = useAppData();
  const [confirmReset, setConfirmReset] = useState(false);
  if (!ready) return <Page><Skeleton className="h-96" /></Page>;

  const attempts = [...data.attempts].sort((a, b) => a.at - b.at);
  const completedGuided = GUESSTIMATES.filter((g) => attempts.some((a) => a.kind === "guided" && a.problemId === g.id)).map((g) => g.id);
  const avg = skillAverages(attempts);
  const firstHalf = skillAverages(attempts.slice(0, Math.max(1, Math.floor(attempts.length / 2))), 100);
  const weak = weakestSkills(attempts, 3);
  const mistakes = mistakeCounts(attempts);
  const recs = recommendations(attempts, completedGuided);
  const totalMin = attempts.reduce((s, a) => s + a.minutes, 0);
  const schoolTotal = SCHOOL.flatMap((m) => m.exercises.filter((e) => e.kind !== "link").map((e) => `${m.id}:${e.id}`));
  const schoolDone = schoolTotal.filter((id) => data.school[id]).length;
  const started = Object.keys(data.sessions).length;
  const maxMistake = Math.max(1, ...mistakes.map((m) => m.count));

  return (
    <Page>
      <SectionTitle eyebrow="My performance" title="How your reasoning is improving">
        Skill scores average your last ten attempts across guided problems, practice and interviews.
      </SectionTitle>

      {!attempts.length ? (
        <Empty title="No attempts yet" action={<Link href={`/learn/${GUESSTIMATES[0].id}`}><Button variant="primary" size="sm">Start the first guided problem</Button></Link>}>
          Finish a guided problem, a practice problem or an interview and your skill radar, progress chart and mistake log will appear here.
        </Empty>
      ) : (
        <div className="grid gap-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Problems attempted" value={new Set(attempts.map((a) => a.problemId)).size} sub={`${attempts.length} attempts · ${started} guided started`} />
            <Stat label="Guided completed" value={`${completedGuided.length}/${GUESSTIMATES.length}`} />
            <Stat label="Time practised" value={`${totalMin} min`} sub={`avg ${Math.round(totalMin / attempts.length)} min per attempt`} />
            <Stat label="School exercises" value={`${schoolDone}/${schoolTotal.length}`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="grid gap-2 p-4">
              <span className="font-semibold">Skill radar</span>
              <span className="text-xs text-muted">Solid: recent average. Dashed: your earlier attempts.</span>
              <SkillRadar scores={avg} compare={attempts.length >= 4 ? firstHalf : undefined} />
              <div className="grid gap-1.5">
                {SKILLS.map((k) => (
                  <div key={k} className="grid grid-cols-[160px_1fr_36px] items-center gap-2 text-sm">
                    <span>{SKILL_LABELS[k]}</span>
                    <ProgressBar value={avg[k] ?? 0} />
                    <span className="tabular text-right font-mono text-xs">{avg[k] ?? "—"}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="grid content-start gap-2 p-4">
              <span className="font-semibold">Overall score over time</span>
              <ScoreLine points={attempts.map((a, i) => ({ label: `#${i + 1}`, overall: a.overall }))} />
              <span className="mt-2 font-semibold">Frequently repeated mistakes</span>
              {mistakes.length ? (
                <ul className="grid gap-1.5">
                  {mistakes.slice(0, 6).map((m) => (
                    <li key={m.id} className="grid grid-cols-[1fr_120px_28px] items-center gap-2 text-sm">
                      <span>{m.label}</span>
                      <ProgressBar value={(m.count / maxMistake) * 100} />
                      <span className="tabular text-right font-mono text-xs">{m.count}×</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No repeated mistakes logged.</p>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="grid content-start gap-2">
              <h2 className="font-serif text-xl font-semibold">Personalised revision</h2>
              {weak.map((w) => (
                <p key={w.skill} className="text-sm text-muted">
                  <Badge tone="warn" className="mr-1.5">
                    {w.score}
                  </Badge>
                  {w.label}
                </p>
              ))}
              {recs.map((r) => (
                <Link key={r.href + r.title} href={r.href}>
                  <Card className="grid gap-0.5 p-3.5 transition-colors hover:border-accent/50">
                    <span className="font-medium">{r.title}</span>
                    <span className="text-sm text-muted">{r.reason}</span>
                  </Card>
                </Link>
              ))}
            </section>
            <section className="grid content-start gap-2">
              <h2 className="font-serif text-xl font-semibold">All attempts</h2>
              <div className="overflow-x-auto rounded-xl border border-line bg-surface">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="bg-surface-2 text-left text-xs text-muted">
                    <tr>
                      <th className="px-3 py-2">Problem</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Score</th>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="tabular">
                    {[...attempts].reverse().map((a) => (
                      <tr key={a.id} className="border-t border-line">
                        <td className="px-3 py-2">{a.title}</td>
                        <td className="px-3 py-2 capitalize text-muted">{a.kind}</td>
                        <td className="px-3 py-2 font-mono">{a.overall}</td>
                        <td className="px-3 py-2 text-muted">{a.minutes} min</td>
                        <td className="px-3 py-2 text-muted">{new Date(a.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-6">
            {confirmReset ? (
              <>
                <span className="text-sm">Delete all progress saved in this browser? This can't be undone.</span>
                <Button size="sm" variant="danger" onClick={() => (actions.resetAll(), setConfirmReset(false))}>
                  Delete everything
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setConfirmReset(true)}>
                Reset all progress
              </Button>
            )}
          </div>
        </div>
      )}
    </Page>
  );
}
