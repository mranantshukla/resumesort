"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Lightbulb, Send, ShieldAlert } from "lucide-react";
import type { AttemptRecord, Guesstimate, SessionState, StageId } from "@/engine/types";
import { STAGE_LABELS } from "@/engine/types";
import { COACH_MODES, coachReply, contextualAlerts, type CoachMessage, type CoachMode } from "@/engine/coach";
import { askAI, AI_PROVIDER } from "@/lib/ai";
import { Badge, Button, cn } from "@/components/ui";

const TAG_LABEL = { factual: "Factual error", alternative: "Reasonable alternative", methodology: "Method difference" } as const;
const TAG_TONE = { factual: "bad", alternative: "hint", methodology: "accent" } as const;

export function CoachPanel({
  problem,
  session,
  stage,
  history,
  hintRequest,
  onUseHint,
}: {
  problem: Guesstimate;
  session: SessionState;
  stage: StageId;
  history: AttemptRecord[];
  /** A hint pushed from elsewhere (e.g., a calculation step), shown as a coach message. */
  hintRequest: { text: string; n: number } | null;
  onUseHint: () => void;
}) {
  const [mode, setMode] = useState<CoachMode>("tutor");
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const turn = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const ctx = { problem, session, stage, history, turn: turn.current };
  const alerts = useMemo(() => contextualAlerts({ problem, session, stage }), [problem, session, stage]);
  const guide = problem.stages[stage].guide;
  const hintsUsed = session.hintsUsed[stage] ?? 0;

  useEffect(() => {
    setMessages([{ role: "coach", kind: "explain", text: `You're on ${STAGE_LABELS[stage].toLowerCase()}. ${guide.task}` }]);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hintRequest) setMessages((m) => [...m, { role: "coach", kind: "hint", text: hintRequest.text }]);
  }, [hintRequest]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const push = (m: CoachMessage) => setMessages((ms) => [...ms, m]);

  const send = async (text: string, m: CoachMode = mode) => {
    if (text) push({ role: "learner", text });
    turn.current += 1;
    setBusy(true);
    const local = coachReply({ ...ctx, turn: turn.current }, m, text);
    const remote = await askAI({
      mode: m,
      context: {
        problem: problem.prompt,
        stage: STAGE_LABELS[stage],
        stageTask: guide.task,
        hintsAvailable: guide.hints,
        socraticQuestions: guide.socratic,
        learnerValues: session.values,
        liveChecks: alerts.map((a) => a.text),
        rule: "Never reveal the full solution or final number. Distinguish factual errors, reasonable alternative assumptions and method differences.",
      },
      messages: [...messages, ...(text ? [{ role: "learner" as const, text }] : [])].slice(-10).map((x) => ({ role: x.role === "learner" ? ("user" as const) : ("assistant" as const), content: x.text })),
    });
    push(remote ? { role: "coach", kind: local.kind, text: remote } : local);
    setBusy(false);
  };

  const hint = () => {
    const h = guide.hints[Math.min(hintsUsed, guide.hints.length - 1)];
    onUseHint();
    push({ role: "coach", kind: "hint", text: `Hint ${Math.min(hintsUsed + 1, guide.hints.length)} of ${guide.hints.length}: ${h}` });
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-semibold">
          <Bot size={16} className="text-accent" /> Learning assistant
        </span>
        <Badge tone={AI_PROVIDER === "openai" ? "accent" : "neutral"}>{AI_PROVIDER === "openai" ? "OpenAI" : "Built-in coach"}</Badge>
      </div>
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Assistant mode">
        {COACH_MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            title={m.blurb}
            onClick={() => {
              setMode(m.id);
              void send("", m.id);
            }}
            className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", mode === m.id ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-ink")}
          >
            {m.label}
          </button>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="grid gap-1.5">
          <span className="eyebrow flex items-center gap-1">
            <ShieldAlert size={12} /> Live checks
          </span>
          {alerts.map((a, i) => (
            <div key={i} className="rounded-md border border-line bg-surface px-2.5 py-2 text-[13px]">
              {a.tag && (
                <Badge tone={TAG_TONE[a.tag]} className="mb-1">
                  {TAG_LABEL[a.tag]}
                </Badge>
              )}
              <p>{a.text}</p>
            </div>
          ))}
        </div>
      )}

      <div ref={listRef} className="min-h-[160px] flex-1 space-y-2 overflow-y-auto pr-1" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={cn("max-w-[95%] rounded-lg px-3 py-2 text-[13.5px] leading-relaxed", m.role === "learner" ? "ml-auto bg-accent text-accent-ink" : m.kind === "hint" ? "bg-hint-soft" : m.kind === "challenge" ? "border border-accent/30 bg-accent-soft" : "bg-surface-2")}>
            {m.kind === "hint" && <Lightbulb size={13} className="mb-0.5 mr-1 inline text-hint" />}
            {m.text}
          </div>
        ))}
        {busy && <div className="w-16 animate-pulse rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">…</div>}
      </div>

      <div className="grid gap-2">
        <Button variant="hint" size="sm" onClick={hint} disabled={hintsUsed >= guide.hints.length}>
          <Lightbulb size={14} /> {hintsUsed >= guide.hints.length ? "No more hints for this stage" : `Get a hint (${hintsUsed}/${guide.hints.length} used)`}
        </Button>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim() || busy) return;
            const t = input.trim();
            setInput("");
            void send(t);
          }}
        >
          <input
            id="coach-input"
            aria-label="Ask the assistant"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "socratic" ? "Ask anything; I'll answer with a question" : "Ask: why? what is NOV? what's the formula?"}
            className="h-9 min-w-0 flex-1 rounded-md border border-line bg-surface px-2.5 text-sm"
          />
          <Button type="submit" variant="primary" disabled={!input.trim() || busy} aria-label="Send">
            <Send size={14} />
          </Button>
        </form>
      </div>
    </div>
  );
}
