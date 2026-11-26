"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, CircleAlert, Eye, Lock, MessageCircleQuestion, RotateCcw, Sparkles, X } from "lucide-react";
import type { ChoiceOption, Guesstimate, SessionState, TreeNode } from "@/engine/types";
import { SKILL_LABELS, type SkillId } from "@/engine/types";
import { checkSegments } from "@/engine/mece";
import { childrenOf, evaluateTree, findNode, formulaTex } from "@/engine/tree";
import { currentAnswer, expectedNodeValue, isCalcCorrect, overridesOf, primaryTree } from "@/engine/session";
import { validateAssumptions, validateConstraints } from "@/engine/validation";
import { sensitivity, answerRange } from "@/engine/sensitivity";
import { both, foldDifference, formatValue, indian, parseNumberInput, pct, roundSig } from "@/engine/format";
import { communicationChecks, generateFinalAnswer } from "@/engine/finalAnswer";
import { evaluateSession, MISTAKE_LABELS } from "@/engine/evaluation";
import { variablesInTree } from "@/engine/tree";
import { Badge, Button, Callout, Card, Formula, ProgressBar, ReliabilityBadge, cn } from "@/components/ui";
import { SkillRadar, Tornado } from "@/components/charts";
import { TreeView } from "./TreeView";
import { actions } from "@/lib/store";
import { GUESSTIMATES } from "@/content/guesstimates";

export interface StageProps {
  problem: Guesstimate;
  s: SessionState;
  set: (fn: (d: SessionState) => void) => void;
  onHint: (stage: keyof Guesstimate["stages"], text?: string) => void;
}

/* ---------- shared bits ---------- */

function OptionButton({ o, chosen, locked, onPick }: { o: ChoiceOption; chosen: boolean; locked: boolean; onPick: () => void }) {
  const state = chosen ? (o.correct ? "right" : o.alternative ? "alt" : "wrong") : "idle";
  return (
    <button
      onClick={onPick}
      disabled={locked && !chosen}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors",
        state === "idle" && "border-line bg-surface hover:border-accent/50 disabled:opacity-60 disabled:hover:border-line",
        state === "right" && "border-good bg-good-soft",
        state === "alt" && "border-hint bg-hint-soft",
        state === "wrong" && "border-bad bg-bad-soft",
      )}
      aria-pressed={chosen}
    >
      <span className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border", chosen ? "border-transparent" : "border-line")}>
        {state === "right" && <Check size={13} className="text-good" />}
        {state === "wrong" && <X size={13} className="text-bad" />}
        {state === "alt" && <CircleAlert size={13} className="text-hint" />}
      </span>
      <span className="grid gap-1">
        <span className="font-medium">{o.text}</span>
        {chosen && <span className="text-ink/80">{o.feedback}</span>}
      </span>
    </button>
  );
}

/* ---------- 1. Understanding ---------- */

export function UnderstandingStage({ problem, s, set }: StageProps) {
  const st = problem.stages.understanding;
  return (
    <div className="grid gap-6">
      {st.checks.map((q) => (
        <fieldset key={q.id} className="grid gap-2">
          <legend className="mb-2 font-semibold">{q.prompt}</legend>
          {q.options.map((o) => (
            <OptionButton
              key={o.id}
              o={o}
              chosen={s.understanding.answers[q.id] === o.id}
              locked={!!s.understanding.answers[q.id]}
              onPick={() => !s.understanding.answers[q.id] && set((d) => void (d.understanding.answers[q.id] = o.id))}
            />
          ))}
        </fieldset>
      ))}
      <div className="grid gap-4">
        <div>
          <h3 className="font-semibold">Define the scope</h3>
          <p className="text-sm text-muted">Your first choice is locked in, as it would be in an interview. Choose deliberately.</p>
        </div>
        {st.scope.map((f) => (
          <fieldset key={f.id} className="grid gap-2">
            <legend className="mb-1.5 text-sm font-semibold text-muted">{f.label}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {f.options.map((o) => (
                <OptionButton key={o.id} o={o} chosen={s.understanding.scope[f.id] === o.id} locked={!!s.understanding.scope[f.id]} onPick={() => !s.understanding.scope[f.id] && set((d) => void (d.understanding.scope[f.id] = o.id))} />
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}

/* ---------- 2. Clarifying ---------- */

const QUALITY_TONE = { strong: "good", okay: "accent", weak: "bad" } as const;

export function ClarifyingStage({ problem, s, set }: StageProps) {
  const st = problem.stages.clarifying;
  const picked = s.clarifying.picked;
  const asked = s.clarifying.asked;
  const toggle = (id: string) =>
    set((d) => {
      if (d.clarifying.asked) return;
      d.clarifying.picked = d.clarifying.picked.includes(id) ? d.clarifying.picked.filter((x) => x !== id) : d.clarifying.picked.length < st.maxPicks ? [...d.clarifying.picked, id] : d.clarifying.picked;
    });
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          Choose up to <strong className="text-ink">{st.maxPicks}</strong> questions. Selected: {picked.length}/{st.maxPicks}
        </p>
        {!asked && (
          <Button variant="primary" disabled={!picked.length} onClick={() => set((d) => void (d.clarifying.asked = true))}>
            <MessageCircleQuestion size={15} /> Ask the interviewer
          </Button>
        )}
      </div>
      <div className="grid gap-2">
        {st.questions.map((q) => {
          const on = picked.includes(q.id);
          return (
            <div key={q.id} className={cn("rounded-lg border px-3.5 py-2.5 transition-colors", on ? "border-accent bg-accent-soft/60" : "border-line bg-surface", asked && !on && "opacity-80")}>
              <button className="flex w-full items-start gap-2.5 text-left text-sm disabled:cursor-default" onClick={() => toggle(q.id)} disabled={asked} aria-pressed={on}>
                <span className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border", on ? "border-accent bg-accent text-accent-ink" : "border-line")}>{on && <Check size={12} />}</span>
                <span className="font-medium">{q.text}</span>
              </button>
              {asked && (
                <div className="mt-2 grid gap-1.5 pl-6 text-sm animate-rise">
                  {on && (
                    <p>
                      <span className="font-semibold">Interviewer: </span>“{q.answer}”
                    </p>
                  )}
                  <p className="flex flex-wrap items-center gap-2 text-ink/80">
                    <Badge tone={QUALITY_TONE[q.quality]}>{q.quality === "strong" ? "Strong question" : q.quality === "okay" ? "Useful" : "Weak question"}</Badge>
                    {on ? q.why : q.quality === "strong" ? `You didn't ask this. ${q.why}` : q.why}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- 3. Structuring ---------- */

export function StructuringStage({ problem, s, set }: StageProps) {
  const picker = problem.stages.structuring.picker;
  const res = checkSegments(picker, s.structuring.picked);
  const checked = s.structuring.checks > 0;
  const passed = s.structuring.passedOnCheck !== null;
  const universeLabel = (id: string) => picker.universe.find((u) => u.id === id)?.label.toLowerCase() ?? id;
  const tree = primaryTree(problem);

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <p className="font-semibold">{picker.prompt}</p>
        <div className="flex flex-wrap gap-1.5 text-xs text-muted">
          Everything to cover:
          {picker.universe.map((u) => (
            <Badge key={u.id} tone={res.chosen.some((c) => c.covers.includes(u.id)) ? "accent" : "neutral"}>
              {u.label}
            </Badge>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {picker.options.map((o) => {
            const on = s.structuring.picked.includes(o.id);
            const overlap = checked && res.overlaps.some((x) => x.a.id === o.id || x.b.id === o.id);
            return (
              <button
                key={o.id}
                aria-pressed={on}
                onClick={() => set((d) => void (d.structuring.picked = on ? d.structuring.picked.filter((x) => x !== o.id) : [...d.structuring.picked, o.id]))}
                className={cn("flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm", on ? "border-accent bg-accent-soft/60" : "border-line bg-surface hover:border-accent/40", overlap && on && "border-bad bg-bad-soft")}
              >
                <span className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border", on ? "border-accent bg-accent text-accent-ink" : "border-line")}>{on && <Check size={12} />}</span>
                <span className="font-medium">{o.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            disabled={!s.structuring.picked.length}
            onClick={() =>
              set((d) => {
                d.structuring.checks += 1;
                if (checkSegments(picker, d.structuring.picked).isMece && d.structuring.passedOnCheck === null) d.structuring.passedOnCheck = d.structuring.checks;
              })
            }
          >
            Check my structure
          </Button>
          <span className="text-xs text-muted">Checks used: {s.structuring.checks}. Fewer checks score higher.</span>
        </div>
        {checked && (
          <div className="grid gap-2 animate-rise">
            {res.isMece ? (
              <Callout tone="good" title="MECE: every unit lands in exactly one segment.">
                {res.chosen.map((c) => c.feedback).join(" ")}
              </Callout>
            ) : (
              <>
                {res.overlaps.map((o) => (
                  <Callout key={o.a.id + o.b.id} tone="bad" title={`Double counting: “${o.a.label}” and “${o.b.label}”`}>
                    Both include {o.shared.map(universeLabel).join(", ")}. {o.b.covers.length > o.a.covers.length ? o.b.feedback : o.a.feedback}
                  </Callout>
                ))}
                {res.missing.length > 0 && (
                  <Callout tone="hint" title="Gap">
                    Nothing covers {res.missing.map(universeLabel).join(", ")}.
                  </Callout>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {passed && (
        <div className="grid gap-3 animate-rise">
          <div>
            <h3 className="font-semibold">Your estimation tree</h3>
            <p className="text-sm text-muted">GuessLab turns the structure into a tree. Numbers come in the next stages. You can switch a segment off or add your own segment to any “+” box; unit checks run automatically.</p>
          </div>
          <TreeView
            problem={problem}
            tree={tree}
            values={s.values}
            overrides={overridesOf(s)}
            revealed={new Set()}
            showValues={false}
            editable
            onToggleExclude={(id) => set((d) => void (d.tree.excluded = d.tree.excluded.includes(id) ? d.tree.excluded.filter((x) => x !== id) : [...d.tree.excluded, id]))}
            onAddSegment={(pid, node) => set((d) => void (d.tree.custom[pid] = [...(d.tree.custom[pid] ?? []), node]))}
            onRemoveCustom={(pid, id) => set((d) => void (d.tree.custom[pid] = (d.tree.custom[pid] ?? []).filter((n) => n.id !== id)))}
          />
          <div className="grid gap-2">
            <h3 className="font-semibold">Two ways to estimate this</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {problem.approaches.map((a) => (
                <Card key={a.id} className="grid gap-1.5 p-3.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold">{a.name}</span>
                    <Badge tone={a.id === problem.primaryApproach ? "accent" : "neutral"}>{a.id === problem.primaryApproach ? "Main estimate" : "Cross-check"}</Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {a.direction}, {a.side} side
                  </p>
                  <p className="text-sm">{a.summary}</p>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted">You'll run the cross-check in the final-answer stage, once you have your own estimate.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 4. Assumptions ---------- */

function VariableCard({ problem, s, set, varId }: StageProps & { varId: string }) {
  const v = problem.variables.find((x) => x.id === varId)!;
  const value = s.values[v.id] ?? v.value;
  const check = validateAssumptions([v], s.values)[0];
  const confirmed = s.assumptions.confirmed.includes(v.id);
  const viewed = s.assumptions.derivationsViewed.includes(v.id);
  const [text, setText] = useState(v.unit === "%" ? String(roundSig(value * 100, 3)) : String(value));
  useEffect(() => setText(v.unit === "%" ? String(roundSig(value * 100, 3)) : String(value)), [value, v.unit]);
  const fixed = v.min === v.max;
  const setValue = (x: number) =>
    set((d) => {
      d.values[v.id] = x;
      d.assumptions.confirmed = d.assumptions.confirmed.filter((id) => id !== v.id);
    });

  return (
    <Card className={cn("grid gap-2.5 p-3.5", check.level === "warn" && "border-hint/60", check.level === "error" && "border-bad")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="grid gap-0.5">
          <span className="font-semibold leading-snug">{v.label}</span>
          <span className="tabular font-mono text-sm text-accent">
            {formatValue(value, v.unit)} {v.displayUnit ?? (v.unit === "%" ? "" : v.unit)}
          </span>
        </div>
        <ReliabilityBadge value={v.reliability} />
      </div>
      {!fixed && (
        <div className="grid grid-cols-[1fr_96px] items-center gap-2">
          <input
            type="range"
            aria-label={`${v.label} slider`}
            min={v.min}
            max={v.max}
            step={v.step}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
          <input
            id={`var-${v.id}`}
            aria-label={`${v.label} value`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => {
              const n = parseNumberInput(text);
              if (n !== null) setValue(v.unit === "%" ? n / 100 : n);
            }}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="h-8 rounded-md border border-line bg-surface px-2 text-right font-mono text-sm"
          />
        </div>
      )}
      {check.level !== "ok" && <p className={cn("text-sm", check.level === "error" ? "text-bad" : "text-warn")}>{check.message}</p>}
      {v.source && (
        <p className="text-xs text-muted">
          Source: {v.source.name} · {v.source.geography} · {v.source.date} · {v.source.unit}
          {v.source.note ? `. ${v.source.note}` : ""}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {!viewed ? (
          <Button size="sm" variant="ghost" onClick={() => set((d) => void d.assumptions.derivationsViewed.push(v.id))}>
            <Eye size={14} /> How to derive this
          </Button>
        ) : (
          <p className="w-full rounded-md bg-surface-2 px-2.5 py-2 text-sm">{v.derive}</p>
        )}
        <Button
          size="sm"
          variant={confirmed ? "secondary" : "primary"}
          disabled={check.level === "error"}
          onClick={() => set((d) => void (d.assumptions.confirmed = confirmed ? d.assumptions.confirmed.filter((x) => x !== v.id) : [...d.assumptions.confirmed, v.id]))}
          className="ml-auto"
        >
          {confirmed ? (
            <>
              <Check size={14} /> Confirmed
            </>
          ) : (
            "Confirm"
          )}
        </Button>
      </div>
    </Card>
  );
}

export function AssumptionsStage(props: StageProps) {
  const { problem, s, set } = props;
  const tree = primaryTree(problem);
  const main = new Set(variablesInTree(tree, overridesOf(s)));
  const mainVars = problem.variables.filter((v) => main.has(v.id));
  const crossVars = problem.variables.filter((v) => !main.has(v.id));
  const constraints = validateConstraints(problem.constraints, problem.variables, s.values);
  return (
    <div className="grid gap-5">
      {constraints.length > 0 && (
        <div className="grid gap-2">
          {constraints.map((c) => (
            <Callout key={c.vars.join()} tone={c.ok ? "good" : "bad"} title={c.ok ? "Shares add up" : "Shares don't add up"}>
              {c.message}
            </Callout>
          ))}
        </div>
      )}
      <div className="grid gap-2">
        <h3 className="font-semibold">Main estimate</h3>
        <div className="grid gap-3 md:grid-cols-2">{mainVars.map((v) => <VariableCard key={v.id} {...props} varId={v.id} />)}</div>
      </div>
      {crossVars.length > 0 && (
        <div className="grid gap-2">
          <h3 className="font-semibold">Cross-check inputs</h3>
          <p className="text-sm text-muted">Used only by the second method you'll compare against in the final stage.</p>
          <div className="grid gap-3 md:grid-cols-2">{crossVars.map((v) => <VariableCard key={v.id} {...props} varId={v.id} />)}</div>
        </div>
      )}
      <div className="grid gap-2">
        <h3 className="font-semibold">Tree with your assumptions</h3>
        <TreeView
          problem={problem}
          tree={tree}
          values={s.values}
          overrides={overridesOf(s)}
          revealed={new Set()}
          showValues
          editable
          onToggleExclude={(id) => set((d) => void (d.tree.excluded = d.tree.excluded.includes(id) ? d.tree.excluded.filter((x) => x !== id) : [...d.tree.excluded, id]))}
          onAddSegment={(pid, node) => set((d) => void (d.tree.custom[pid] = [...(d.tree.custom[pid] ?? []), node]))}
          onRemoveCustom={(pid, id) => set((d) => void (d.tree.custom[pid] = (d.tree.custom[pid] ?? []).filter((n) => n.id !== id)))}
          height={340}
        />
      </div>
    </div>
  );
}

/* ---------- 5. Calculation ---------- */

function childSummary(problem: Guesstimate, s: SessionState, node: TreeNode, revealed: Set<string>): string[] {
  const ev = evaluateTree(primaryTree(problem), problem.variables, s.values, overridesOf(s));
  return childrenOf(node, overridesOf(s))
    .filter((c) => !s.tree.excluded.includes(c.id))
    .map((c) => {
      const v = c.varId ? problem.variables.find((x) => x.id === c.varId) : undefined;
      const r = ev.results[c.id];
      const known = !!v || !!c.literal || revealed.has(c.id);
      return `${c.label} = ${known && r ? (v ? formatValue(r.value, v.unit) : indian(r.value)) : "?"}`;
    });
}

export function CalculationStage({ problem, s, set, onHint }: StageProps) {
  const steps = problem.stages.calculation.steps;
  const tree = primaryTree(problem);
  const done = new Set([...s.calculation.correct, ...s.calculation.revealed]);
  const firstOpen = steps.findIndex((c) => !done.has(c.nodeId));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});

  const check = (nodeId: string) => {
    const entered = parseNumberInput(drafts[nodeId] ?? "");
    const expected = expectedNodeValue(problem, s, nodeId);
    if (entered === null || expected === null) {
      setMsg((m) => ({ ...m, [nodeId]: "Enter a number, e.g. 92 crore, 4.5 lakh or 0.525." }));
      return;
    }
    const ok = isCalcCorrect(expected, entered);
    set((d) => {
      d.calculation.attempts[nodeId] = (d.calculation.attempts[nodeId] ?? 0) + 1;
      d.calculation.entries[nodeId] = entered;
      if (ok && !d.calculation.correct.includes(nodeId)) d.calculation.correct.push(nodeId);
    });
    if (ok) setMsg((m) => ({ ...m, [nodeId]: "" }));
    else {
      const ratio = entered / expected;
      const pow = Math.log10(Math.abs(ratio));
      const slip = Math.abs(pow - Math.round(pow)) < 0.05 && Math.round(pow) !== 0;
      setMsg((m) => ({ ...m, [nodeId]: slip ? `Close, but off by a factor of 10^${Math.round(pow)}. Check your zeros (crore = 10^7, lakh = 10^5).` : `Not quite: that's ${ratio > 1 ? "too high" : "too low"}. Re-check the inputs listed above.` }));
    }
  };

  return (
    <div className="grid gap-4">
      <ol className="grid gap-3">
        {steps.map((c, i) => {
          const node = findNode(tree, c.nodeId, overridesOf(s))!;
          const isDone = done.has(c.nodeId);
          const locked = firstOpen !== -1 && i > firstOpen;
          const attempts = s.calculation.attempts[c.nodeId] ?? 0;
          const wasRevealed = s.calculation.revealed.includes(c.nodeId);
          const exp = expectedNodeValue(problem, s, c.nodeId) ?? 0;
          return (
            <li key={c.nodeId}>
              <Card className={cn("grid gap-2.5 p-3.5", isDone && "border-good/50", locked && "opacity-60")}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">
                    Step {i + 1}. {c.prompt}
                  </span>
                  {isDone ? <Badge tone={wasRevealed ? "warn" : "good"}>{wasRevealed ? "Revealed" : "Correct"}</Badge> : locked ? <Badge><Lock size={11} /> Locked</Badge> : null}
                </div>
                {!locked && (
                  <>
                    <Formula tex={formulaTex(node, overridesOf(s))} className="text-[13px]" />
                    <p className="text-xs text-muted">Inputs: {childSummary(problem, s, node, done).join(" · ")}</p>
                    {isDone ? (
                      <p className="tabular font-mono text-sm">
                        = {both(exp)} {node.unit ? <span className="text-muted">({node.unit})</span> : null}
                      </p>
                    ) : (
                      <form
                        className="flex flex-wrap items-center gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          check(c.nodeId);
                        }}
                      >
                        <input
                          id={`calc-${c.nodeId}`}
                          aria-label={`Your answer for step ${i + 1}`}
                          value={drafts[c.nodeId] ?? ""}
                          onChange={(e) => setDrafts((d) => ({ ...d, [c.nodeId]: e.target.value }))}
                          placeholder="e.g. 92 crore"
                          className="h-9 w-48 rounded-md border border-line bg-surface px-2.5 font-mono text-sm"
                        />
                        <Button type="submit" variant="primary">
                          Check
                        </Button>
                        <Button type="button" variant="hint" size="sm" onClick={() => onHint("calculation", c.hint)}>
                          Hint
                        </Button>
                        {attempts >= 2 && (
                          <Button type="button" size="sm" variant="ghost" onClick={() => set((d) => void (!d.calculation.revealed.includes(c.nodeId) && d.calculation.revealed.push(c.nodeId)))}>
                            Reveal this step
                          </Button>
                        )}
                      </form>
                    )}
                    {msg[c.nodeId] && <p className="text-sm text-bad">{msg[c.nodeId]}</p>}
                  </>
                )}
              </Card>
            </li>
          );
        })}
      </ol>
      <div className="grid gap-2">
        <h3 className="font-semibold">Tree</h3>
        <TreeView problem={problem} tree={tree} values={s.values} overrides={overridesOf(s)} revealed={done} showValues editable={false} height={320} />
      </div>
    </div>
  );
}

/* ---------- 6. Sensitivity ---------- */

export function SensitivityStage({ problem, s, set }: StageProps) {
  const tree = primaryTree(problem);
  const rows = useMemo(() => sensitivity(tree, problem.variables, s.values, overridesOf(s)), [tree, problem.variables, s.values, s.tree]);
  const base = currentAnswer(problem, s);
  const [whatIf, setWhatIf] = useState<Record<string, number>>({});
  const wiValues = { ...s.values, ...whatIf };
  const wiAnswer = evaluateTree(tree, problem.variables, wiValues, overridesOf(s)).value;
  const answered = s.sensitivity.answer !== null;
  const top3 = rows.slice(0, 3);

  return (
    <div className="grid gap-5">
      <Card className="grid gap-1 p-4">
        <span className="eyebrow">Your estimate</span>
        <span className="tabular font-serif text-3xl font-semibold">{both(base)}</span>
        <span className="text-sm text-muted">{problem.answerUnitLabel}</span>
      </Card>

      {!answered ? (
        <div className="grid gap-2">
          <p className="font-semibold">{problem.stages.sensitivity.prompt}</p>
          <p className="text-sm text-muted">Decide before looking at the chart. Think about which input you're least sure of, relative to how much it multiplies.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {rows.map((r) => (
              <Button key={r.varId} className="h-auto justify-start py-2 text-left" onClick={() => set((d) => void (d.sensitivity = { answer: r.varId, correct: r.varId === rows[0].varId }))}>
                {r.label}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <Callout tone={s.sensitivity.correct ? "good" : "hint"} title={s.sensitivity.correct ? "Right: that's the biggest driver." : `The biggest driver is ${rows[0].label.toLowerCase()}.`}>
          Across its plausible range ({formatValue(rows[0].low, problem.variables.find((v) => v.id === rows[0].varId)!.unit)} to {formatValue(rows[0].high, problem.variables.find((v) => v.id === rows[0].varId)!.unit)}), the answer moves between {both(Math.min(rows[0].outLow, rows[0].outHigh))} and {both(Math.max(rows[0].outLow, rows[0].outHigh))}.
        </Callout>
      )}

      {answered && (
        <>
          <div className="grid gap-2 animate-rise">
            <h3 className="font-semibold">Tornado chart: answer range as each assumption moves across its plausible range</h3>
            <Tornado rows={rows} base={base} highlight={rows[0]?.varId} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr>
                    <th className="py-1.5 font-medium">Assumption</th>
                    <th className="font-medium">Plausible range</th>
                    <th className="font-medium">Answer moves</th>
                    <th className="font-medium">+10% input →</th>
                  </tr>
                </thead>
                <tbody className="tabular">
                  {rows.map((r) => {
                    const v = problem.variables.find((x) => x.id === r.varId)!;
                    return (
                      <tr key={r.varId} className="border-t border-line">
                        <td className="py-1.5 pr-2">{r.label}</td>
                        <td className="pr-2 font-mono text-xs">
                          {formatValue(r.low, v.unit)}–{formatValue(r.high, v.unit)}
                        </td>
                        <td className="pr-2 font-mono text-xs">
                          {indian(Math.min(r.outLow, r.outHigh))}–{indian(Math.max(r.outLow, r.outHigh))}
                        </td>
                        <td className="font-mono text-xs">{r.plus10 >= 0 ? "+" : ""}{r.plus10.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid gap-3">
            <h3 className="font-semibold">What-if analysis</h3>
            <p className="text-sm text-muted">Try the top three drivers. This doesn't change your saved assumptions.</p>
            {top3.map((r) => {
              const v = problem.variables.find((x) => x.id === r.varId)!;
              const val = wiValues[v.id] ?? v.value;
              return (
                <div key={v.id} className="grid gap-1">
                  <label htmlFor={`wi-${v.id}`} className="flex justify-between text-sm">
                    <span>{v.label}</span>
                    <span className="font-mono text-accent">{formatValue(val, v.unit)}</span>
                  </label>
                  <input id={`wi-${v.id}`} type="range" min={v.min} max={v.max} step={v.step} value={val} onChange={(e) => setWhatIf((w) => ({ ...w, [v.id]: Number(e.target.value) }))} />
                </div>
              );
            })}
            <div className="flex flex-wrap items-center gap-3">
              <Card className="px-4 py-3">
                <span className="eyebrow">What-if estimate</span>
                <div className="tabular font-serif text-2xl font-semibold">{both(wiAnswer)}</div>
                <span className={cn("text-sm", wiAnswer >= base ? "text-good" : "text-bad")}>{base ? `${wiAnswer >= base ? "+" : ""}${(((wiAnswer - base) / base) * 100).toFixed(0)}% vs your estimate` : ""}</span>
              </Card>
              <Button size="sm" variant="ghost" onClick={() => setWhatIf({})}>
                <RotateCcw size={14} /> Reset
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- 7. Final answer ---------- */

export function FinalStage({ problem, s, set }: StageProps) {
  const tree = primaryTree(problem);
  const base = currentAnswer(problem, s);
  const rows = sensitivity(tree, problem.variables, s.values, overridesOf(s));
  const [lo, hi] = answerRange(rows, base);
  const others = problem.approaches.filter((a) => a.id !== problem.primaryApproach);
  const checks = communicationChecks(problem, s.final.text);
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="grid gap-1 p-4">
          <span className="eyebrow">Your estimate</span>
          <span className="tabular font-serif text-3xl font-semibold">{both(roundSig(base, 2))}</span>
          <span className="text-sm text-muted">
            {problem.answerUnitLabel}. Defensible range ≈ {both(roundSig(lo, 2))} to {both(roundSig(hi, 2))}
          </span>
        </Card>
        <Card className="grid gap-2 p-4">
          <span className="eyebrow">Cross-check with a second method</span>
          {s.structuring.comparedApproaches ? (
            others.map((a) => {
              const v = evaluateTree(a.tree, problem.variables, s.values).value;
              const f = foldDifference(v, base);
              return (
                <div key={a.id} className="grid gap-0.5">
                  <span className="text-sm font-medium">{a.name}</span>
                  <span className="tabular font-mono">{both(v)}</span>
                  <Badge tone={f < 1.5 ? "good" : f < 3 ? "warn" : "bad"}>{f < 1.5 ? "Agrees closely" : f < 3 ? `Within ${f.toFixed(1)}×` : `${f.toFixed(1)}× apart: revisit an assumption`}</Badge>
                </div>
              );
            })
          ) : (
            <Button onClick={() => set((d) => void (d.structuring.comparedApproaches = true))}>Run the cross-check</Button>
          )}
        </Card>
      </div>

      <div className="grid gap-2">
        <h3 className="font-semibold">Sanity checks</h3>
        <ul className="grid gap-1.5 text-sm">
          {problem.stages.final.sanity.map((c) => (
            <li key={c.label} className="rounded-md bg-surface-2 px-3 py-2">
              <span className="font-medium">{c.label}: </span>
              {c.explain}
              {c.source && (
                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  <ReliabilityBadge value={c.source.reliability} /> {c.source.name}, {c.source.date}
                </span>
              )}
            </li>
          ))}
          <li className="rounded-md bg-surface-2 px-3 py-2">
            <span className="font-medium">Per-unit check: </span>
            Does {both(base)} {problem.answerUnitLabel} feel right when you picture it? Divide it by a base you know (population, households, outlets).
          </li>
        </ul>
      </div>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Your interview answer</h3>
          <Button size="sm" variant="secondary" onClick={() => set((d) => void ((d.final.text = generateFinalAnswer(problem, d)), (d.final.generated = true)))}>
            <Sparkles size={14} /> Draft it from my work
          </Button>
        </div>
        <p className="text-sm text-muted">The draft is built only from your own scope, structure, assumptions and sensitivity. Edit it into your own words.</p>
        <textarea
          id="final-answer"
          aria-label="Final answer"
          value={s.final.text}
          onChange={(e) => set((d) => void (d.final.text = e.target.value))}
          rows={8}
          placeholder="Start with the number and range, then scope, structure, key assumptions, cross-check and the biggest driver."
          className="prose-read w-full rounded-lg border border-line bg-surface p-3 text-[1rem]"
        />
        <div className="grid gap-1.5 sm:grid-cols-2">
          {checks.map((c) => (
            <span key={c.id} className={cn("flex items-center gap-2 text-sm", c.passed ? "text-good" : "text-muted")}>
              {c.passed ? <Check size={14} /> : <span className="h-3.5 w-3.5 rounded-full border border-line" />} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- 8. Evaluation ---------- */

const FEEDBACK_GROUPS = [
  { type: "strength", title: "What you did well", tone: "good" },
  { type: "factual", title: "Factual errors", tone: "bad" },
  { type: "alternative", title: "Reasonable alternative assumptions", tone: "hint" },
  { type: "methodology", title: "Differences in method", tone: "accent" },
] as const;

export function EvaluationStage({ problem, s, set }: StageProps) {
  useEffect(() => {
    if (!s.evaluation) {
      const ev = evaluateSession(problem, s);
      set((d) => {
        d.evaluation = ev;
        if (!d.completed.includes("evaluation")) d.completed.push("evaluation");
      });
      actions.recordAttempt({ id: `${problem.id}-${s.startedAt}`, kind: "guided", problemId: problem.id, title: problem.title, at: Date.now(), minutes: ev.minutes, scores: ev.scores, overall: ev.overall, mistakes: ev.mistakes });
    }
  }, [s.evaluation]); // eslint-disable-line react-hooks/exhaustive-deps

  const ev = s.evaluation;
  if (!ev) return <p className="text-muted">Scoring your session…</p>;
  const next = GUESSTIMATES[(GUESSTIMATES.findIndex((g) => g.id === problem.id) + 1) % GUESSTIMATES.length];

  return (
    <div className="grid gap-6">
      <div className="grid items-center gap-4 md:grid-cols-[220px_1fr]">
        <Card className="grid gap-1 p-4 text-center">
          <span className="eyebrow">Overall</span>
          <span className="tabular font-serif text-5xl font-semibold">{ev.overall}</span>
          <span className="text-sm text-muted">out of 100 · {ev.minutes} min</span>
          <Badge tone={ev.withinReference === "inside" ? "good" : ev.withinReference === "near" ? "warn" : "bad"} className="mx-auto mt-1">
            {ev.withinReference === "inside" ? "Answer in a sensible range" : ev.withinReference === "near" ? "Answer near the range" : "Answer far from the range"}
          </Badge>
        </Card>
        <SkillRadar scores={ev.scores} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(ev.scores) as SkillId[]).map((k) => (
          <div key={k} className="grid gap-1">
            <div className="flex justify-between text-sm">
              <span>{SKILL_LABELS[k]}</span>
              <span className="tabular font-mono">{ev.scores[k]}</span>
            </div>
            <ProgressBar value={ev.scores[k]} tone={ev.scores[k] >= 75 ? "good" : "accent"} />
          </div>
        ))}
      </div>
      <div className="grid gap-4">
        {FEEDBACK_GROUPS.map((g) => {
          const items = ev.feedback.filter((f) => f.type === g.type);
          if (!items.length) return null;
          return (
            <div key={g.type} className="grid gap-1.5">
              <h3 className="flex items-center gap-2 font-semibold">
                <Badge tone={g.tone}>{items.length}</Badge> {g.title}
              </h3>
              <ul className="grid gap-1.5 text-sm">
                {items.map((f, i) => (
                  <li key={i} className="rounded-md bg-surface-2 px-3 py-2">
                    <span className="text-xs font-semibold text-muted">{SKILL_LABELS[f.skill]} · </span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {ev.mistakes.length > 0 && (
        <div className="grid gap-1.5">
          <h3 className="font-semibold">Mistakes logged for revision</h3>
          <div className="flex flex-wrap gap-1.5">
            {ev.mistakes.map((m) => (
              <Badge key={m} tone="warn">
                {MISTAKE_LABELS[m] ?? m}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Link href={`/learn/${next.id}`}>
          <Button variant="primary">Next: {next.title}</Button>
        </Link>
        <Button
          variant="secondary"
          onClick={() => {
            actions.resetSession(problem.id);
            window.location.reload();
          }}
        >
          <RotateCcw size={14} /> Try this problem again
        </Button>
        <Link href="/performance">
          <Button variant="ghost">See my performance</Button>
        </Link>
      </div>
    </div>
  );
}

export { pct };
