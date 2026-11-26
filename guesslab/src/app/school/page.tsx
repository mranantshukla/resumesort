"use client";

import Link from "next/link";
import { SCHOOL } from "@/content/school";
import { useAppData } from "@/lib/store";
import { Page } from "@/components/layout/AppShell";
import { Card, ProgressBar, SectionTitle } from "@/components/ui";

export default function SchoolPage() {
  const [data] = useAppData();
  return (
    <Page>
      <SectionTitle eyebrow="Product Analyst School" title="A seven-module curriculum">
        Short lessons with practical exercises: business fundamentals, guesstimates, product metrics, product sense, analytical problem solving, SQL you can run in the browser, and interview simulations.
      </SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        {SCHOOL.map((m) => {
          const ex = m.exercises.filter((e) => e.kind !== "link");
          const done = ex.filter((e) => data.school[`${m.id}:${e.id}`]).length;
          const pct = ex.length ? Math.round((done / ex.length) * 100) : 0;
          return (
            <Link key={m.id} href={`/school/${m.id}`}>
              <Card className="grid h-full gap-2 p-4 transition-colors hover:border-accent/50">
                <span className="eyebrow">Module {m.number}</span>
                <h3 className="font-serif text-xl font-semibold">{m.title}</h3>
                <p className="text-sm text-muted">{m.summary}</p>
                <div className="mt-auto grid gap-1 pt-2">
                  <div className="flex justify-between text-xs text-muted">
                    <span>
                      {m.lessons.length} lesson{m.lessons.length > 1 ? "s" : ""} · {ex.length} exercise{ex.length !== 1 ? "s" : ""}
                    </span>
                    <span className="tabular">{ex.length ? `${done}/${ex.length}` : "Practice links"}</span>
                  </div>
                  <ProgressBar value={pct} tone={pct === 100 ? "good" : "accent"} />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </Page>
  );
}
