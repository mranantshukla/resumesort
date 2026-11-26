"use client";

import { useEffect, useRef, useState } from "react";
import type { Database } from "sql.js";
import { Check, Play, Table2 } from "lucide-react";
import { SQL_SEED, compareResults, type SqlExercise, type SqlRow } from "@/content/sql";
import { actions, useAppData } from "@/lib/store";
import { Badge, Button, Callout, Card, cn } from "@/components/ui";

let dbPromise: Promise<Database> | null = null;
/** Load SQLite (WASM) once and seed the food-delivery dataset. */
function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = import("sql.js").then(async (mod) => {
      const SQL = await mod.default({ locateFile: () => "/sql-wasm.wasm" });
      const db = new SQL.Database();
      db.exec(SQL_SEED);
      return db;
    });
  }
  return dbPromise;
}

function ResultTable({ columns, rows }: { columns: string[]; rows: SqlRow[] }) {
  return (
    <div className="max-h-64 overflow-auto rounded-md border border-line">
      <table className="w-full text-left text-[12.5px]">
        <thead className="sticky top-0 bg-surface-2 text-muted">
          <tr>{columns.map((c) => <th key={c} className="px-2.5 py-1.5 font-semibold">{c}</th>)}</tr>
        </thead>
        <tbody className="tabular font-mono">
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              {r.map((v, j) => <td key={j} className="px-2.5 py-1">{v === null ? <span className="text-muted">NULL</span> : String(v)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SqlRunner({ ex, exerciseId }: { ex: SqlExercise; exerciseId: string }) {
  const [data] = useAppData();
  const [sql, setSql] = useState(data.sqlDrafts[ex.id] ?? "SELECT * FROM orders LIMIT 5;");
  const [out, setOut] = useState<{ columns: string[]; rows: SqlRow[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<{ ok: boolean; reason: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const done = !!data.school[exerciseId];
  const mounted = useRef(true);
  useEffect(() => () => void (mounted.current = false), []);

  const run = async (check: boolean) => {
    setLoading(true);
    setErr(null);
    setVerdict(null);
    actions.saveSql(ex.id, sql);
    try {
      const db = await getDb();
      const res = db.exec(sql);
      const last = res[res.length - 1];
      const result = last ? { columns: last.columns, rows: last.values as SqlRow[] } : { columns: [], rows: [] };
      if (!mounted.current) return;
      setOut(result);
      if (check) {
        const ref = db.exec(ex.reference)[0];
        const v = compareResults(result.rows, ref.values as SqlRow[], ex.ordered);
        setVerdict(v);
        if (v.ok) actions.markSchool(exerciseId, true);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setOut(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="grid gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Table2 size={15} className="text-accent" />
        <span className="font-semibold">{ex.title}</span>
        <Badge>{ex.concept}</Badge>
        {done && (
          <Badge tone="good">
            <Check size={11} /> Solved
          </Badge>
        )}
      </div>
      <p className="text-sm">{ex.prompt}</p>
      <details className="text-xs text-muted">
        <summary className="cursor-pointer">Tables</summary>
        <pre className="mt-1 overflow-x-auto rounded bg-surface-2 p-2 font-mono">users(user_id, city, signup_date, channel){"\n"}restaurants(restaurant_id, name, city, cuisine){"\n"}orders(order_id, user_id, restaurant_id, order_date, amount, status)</pre>
      </details>
      <textarea
        id={`sql-${ex.id}`}
        aria-label="SQL query"
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void run(false);
        }}
        rows={6}
        spellCheck={false}
        className="w-full rounded-md border border-line bg-surface-2/60 p-3 font-mono text-[13px]"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => void run(false)} disabled={loading}>
          <Play size={13} /> Run
        </Button>
        <Button size="sm" variant="primary" onClick={() => void run(true)} disabled={loading}>
          <Check size={13} /> Check answer
        </Button>
        <Button size="sm" variant="hint" onClick={() => setShowHint(true)}>
          Hint
        </Button>
        {loading && <span className="self-center text-xs text-muted">Running…</span>}
      </div>
      {showHint && <Callout tone="hint">{ex.hint}</Callout>}
      {err && <p className={cn("rounded-md bg-bad-soft px-3 py-2 font-mono text-xs text-bad")}>{err}</p>}
      {verdict && (
        <Callout tone={verdict.ok ? "good" : "bad"} title={verdict.ok ? "Correct" : "Not yet"}>
          {verdict.reason}
        </Callout>
      )}
      {out && out.columns.length > 0 && <ResultTable columns={out.columns} rows={out.rows} />}
      {out && out.columns.length === 0 && !err && <p className="text-xs text-muted">Query ran; no rows returned.</p>}
    </Card>
  );
}
