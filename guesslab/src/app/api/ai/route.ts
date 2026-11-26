import { NextResponse } from "next/server";

// Server-side proxy to OpenAI. The key stays on the server. Returns 501 when not configured,
// and the client falls back to GuessLab's built-in coach and interviewer.

const SYSTEM: Record<string, string> = {
  tutor: "You are GuessLab's tutor for guesstimates and product analytics. Explain concepts clearly and give progressive hints. Never reveal the full solution or the final number. Keep replies under 90 words.",
  socratic: "You are a Socratic coach. Respond only with one or two guiding questions that help the learner reason. Never give answers or numbers. Keep it under 50 words.",
  interviewer: "You are a realistic product analyst interviewer at an Indian consumer-internet company. Ask one follow-up at a time, challenge weak assumptions, ask for justification of numbers and calculations. Never give the answer, the reference range, or hints. Under 60 words.",
  evaluator: "You evaluate a learner's guesstimate work. Score reasoning, not just the number. Label each point as 'factual error', 'reasonable alternative assumption' or 'difference in method'. Under 120 words.",
  revision: "You help a learner revisit concepts they struggled with before. Briefly re-teach the concept and give one quick check question. Under 90 words.",
};

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "not-configured" }, { status: 501 });
  let body: { mode?: string; context?: unknown; messages?: { role: "user" | "assistant"; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  const mode = body.mode && SYSTEM[body.mode] ? body.mode : "tutor";
  const messages = [
    { role: "system", content: `${SYSTEM[mode]}\nContext (JSON): ${JSON.stringify(body.context ?? {}).slice(0, 6000)}` },
    ...(body.messages ?? []).slice(-10).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 2000) })),
  ];
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", messages, temperature: 0.4, max_tokens: 300 }),
    });
    if (!res.ok) return NextResponse.json({ error: "upstream", status: res.status }, { status: 502 });
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) return NextResponse.json({ error: "empty" }, { status: 502 });
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
