"use client";

// Optional OpenAI-backed replies. The browser never sees the API key: it calls our own
// /api/ai route, which returns 501 when no key is configured. Callers fall back to the
// built-in engines when this returns null.

export const AI_PROVIDER: "local" | "openai" = process.env.NEXT_PUBLIC_AI_PROVIDER === "openai" ? "openai" : "local";

export interface AiRequest {
  mode: "tutor" | "socratic" | "interviewer" | "evaluator" | "revision";
  /** Structured context: problem, stage, learner state summary. Never includes solutions in guided mode. */
  context: Record<string, unknown>;
  messages: { role: "user" | "assistant"; content: string }[];
}

export async function askAI(req: AiRequest): Promise<string | null> {
  if (AI_PROVIDER !== "openai") return null;
  try {
    const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) });
    if (!res.ok) return null;
    const json = (await res.json()) as { reply?: string };
    return json.reply ?? null;
  } catch {
    return null;
  }
}
