"use client";

import Link from "next/link";
import { PRACTICE } from "@/content/practice";
import { useAppData } from "@/lib/store";
import { Page } from "@/components/layout/AppShell";
import { Badge, Card, DIFFICULTY_TONE, SectionTitle } from "@/components/ui";

const ORDER = { beginner: 0, intermediate: 1, advanced: 2 } as const;

export default function PracticeIndex() {
  const [data] = useAppData();
  const sorted = [...PRACTICE].sort((a, b) => ORDER[a.difficulty] - ORDER[b.difficulty]);
  return (
    <Page>
      <SectionTitle eyebrow="Practice arena" title="Solve on your own">
        No hints and no answers up front. Write your clarifications, build your own structure with units, commit to a number, and get a detailed evaluation. Problems are ordered by difficulty.
      </SectionTitle>
      <div className="grid gap-2">
        {sorted.map((p) => {
          const tries = data.attempts.filter((a) => a.problemId === p.id && a.kind === "practice");
          const best = tries.length ? Math.max(...tries.map((t) => t.overall)) : null;
          return (
            <Link key={p.id} href={`/practice/${p.id}`}>
              <Card className="flex flex-wrap items-center gap-3 p-3.5 transition-colors hover:border-accent/50">
                <Badge tone={DIFFICULTY_TONE[p.difficulty]}>{p.difficulty}</Badge>
                <span className="font-medium">{p.title}</span>
                <span className="ml-auto text-sm text-muted">{best !== null ? `Best ${best}/100 · ${tries.length} attempt${tries.length > 1 ? "s" : ""}` : data.practiceDrafts[p.id] ? "Draft saved" : "Not attempted"}</span>
              </Card>
            </Link>
          );
        })}
      </div>
    </Page>
  );
}
