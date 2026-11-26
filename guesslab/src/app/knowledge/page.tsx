"use client";

import { useState } from "react";
import { CHEAT_SHEETS, COMMON_ASSUMPTIONS, COMMON_MISTAKES, FORMULAS, FRAMEWORKS, GLOSSARY, INDIA_STATS } from "@/content/knowledge";
import { Page } from "@/components/layout/AppShell";
import { Badge, Card, Formula, ReliabilityBadge, SectionTitle } from "@/components/ui";

const SECTIONS = [
  { id: "formulas", label: "Formulas" },
  { id: "frameworks", label: "Frameworks" },
  { id: "stats", label: "India reference data" },
  { id: "assumptions", label: "Common assumptions" },
  { id: "glossary", label: "Terminology" },
  { id: "cheatsheets", label: "Cheat sheets" },
  { id: "mistakes", label: "Common mistakes" },
];

export default function KnowledgePage() {
  const [q, setQ] = useState("");
  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase());
  return (
    <Page>
      <SectionTitle eyebrow="Knowledge hub" title="Everything you need on one page">
        Formulas, frameworks, reference data and the mistakes to avoid. Every statistic shows its source, geography, date, unit and reliability. Illustrative assumptions are labelled as such.
      </SectionTitle>
      <nav className="mb-6 flex flex-wrap gap-1.5" aria-label="Sections">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-muted hover:text-ink">
            {s.label}
          </a>
        ))}
      </nav>

      <div className="grid gap-12">
        <section id="formulas" className="grid scroll-mt-20 gap-4">
          <h2 className="font-serif text-2xl font-semibold">Formula library</h2>
          {FORMULAS.map((g) => (
            <div key={g.group} className="grid gap-2">
              <h3 className="eyebrow">{g.group}</h3>
              <div className="grid gap-2 md:grid-cols-2">
                {g.items.map((f) => (
                  <Card key={f.name} className="grid gap-1.5 p-3.5">
                    <span className="font-semibold">{f.name}</span>
                    <Formula tex={f.tex} display className="text-[14px]" />
                    <p className="text-sm text-muted">{f.meaning}</p>
                    <p className="text-sm">
                      <span className="font-medium">Example: </span>
                      {f.example}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section id="frameworks" className="grid scroll-mt-20 gap-3">
          <h2 className="font-serif text-2xl font-semibold">Estimation frameworks</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {FRAMEWORKS.map((f) => (
              <Card key={f.name} className="grid gap-2 p-4">
                <span className="font-semibold">{f.name}</span>
                <ol className="grid gap-1 text-sm">
                  {f.steps.map((s, i) => (
                    <li key={s} className="flex gap-2">
                      <span className="tabular grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-muted">Use it: {f.when}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="stats" className="grid scroll-mt-20 gap-3">
          <h2 className="font-serif text-2xl font-semibold">India-specific reference data</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            Reliability:
            <ReliabilityBadge value="verified" />
            <ReliabilityBadge value="official-estimate" />
            <ReliabilityBadge value="secondary" />
            <ReliabilityBadge value="illustrative" />
          </div>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-surface-2 text-xs text-muted">
                <tr>
                  {["Statistic", "Value", "Unit", "Geography", "Date", "Source", "Reliability"].map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INDIA_STATS.map((s) => (
                  <tr key={s.label} className="border-t border-line align-top">
                    <td className="px-3 py-2 font-medium">
                      {s.label}
                      {s.note && <div className="mt-0.5 text-xs font-normal text-muted">{s.note}</div>}
                    </td>
                    <td className="tabular px-3 py-2 font-mono">{s.value}</td>
                    <td className="px-3 py-2 text-muted">{s.unit}</td>
                    <td className="px-3 py-2">{s.geography}</td>
                    <td className="px-3 py-2">{s.date}</td>
                    <td className="px-3 py-2">{s.source}</td>
                    <td className="px-3 py-2">
                      <ReliabilityBadge value={s.reliability} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">Verify secondary figures against the latest official release before quoting them in an interview.</p>
        </section>

        <section id="assumptions" className="grid scroll-mt-20 gap-3">
          <h2 className="font-serif text-2xl font-semibold">Common working assumptions</h2>
          <p className="text-sm text-muted">These are illustrative round numbers for estimation, not verified statistics. State them as assumptions.</p>
          <div className="grid gap-2 md:grid-cols-2">
            {COMMON_ASSUMPTIONS.map((a) => (
              <Card key={a.label} className="flex items-start justify-between gap-3 p-3.5">
                <div className="grid gap-0.5">
                  <span className="font-medium">{a.label}</span>
                  <span className="text-sm text-muted">{a.why}</span>
                </div>
                <div className="grid justify-items-end gap-1">
                  <span className="tabular whitespace-nowrap font-mono">{a.value}</span>
                  <Badge>Illustrative</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="glossary" className="grid scroll-mt-20 gap-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-serif text-2xl font-semibold">Business terminology</h2>
            <input id="glossary-search" aria-label="Search terms" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter terms" className="h-9 rounded-md border border-line bg-surface px-2.5 text-sm" />
          </div>
          <dl className="grid gap-2 md:grid-cols-2">
            {GLOSSARY.filter((g) => match(g.term + g.meaning)).map((g) => (
              <div key={g.term} className="rounded-lg border border-line bg-surface px-3.5 py-2.5">
                <dt className="font-semibold">{g.term}</dt>
                <dd className="text-sm text-muted">{g.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="cheatsheets" className="grid scroll-mt-20 gap-3">
          <h2 className="font-serif text-2xl font-semibold">Interview cheat sheets</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {CHEAT_SHEETS.map((c) => (
              <Card key={c.title} className="grid gap-1.5 p-4">
                <span className="font-semibold">{c.title}</span>
                <ul className="grid gap-1 font-mono text-[13px]">
                  {c.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        <section id="mistakes" className="grid scroll-mt-20 gap-3">
          <h2 className="font-serif text-2xl font-semibold">Common mistakes and how to fix them</h2>
          <div className="grid gap-2">
            {COMMON_MISTAKES.map((m) => (
              <Card key={m.mistake} className="grid gap-1 p-3.5 md:grid-cols-[200px_1fr_1fr] md:gap-4">
                <span className="font-semibold">{m.mistake}</span>
                <span className="text-sm text-muted">{m.why}</span>
                <span className="text-sm">
                  <span className="font-medium text-good">Fix: </span>
                  {m.fix}
                </span>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}
