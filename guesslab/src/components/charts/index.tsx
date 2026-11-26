"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SensitivityRow } from "@/engine/sensitivity";
import { indian } from "@/engine/format";
import type { SkillId } from "@/engine/types";

/** Resolve theme tokens to concrete colours for SVG, and update when the theme changes. */
export function useTokens() {
  const read = () => {
    if (typeof window === "undefined") return { accent: "#2b56cd", muted: "#5b6472", line: "#e3e6eb", ink: "#14171f", hint: "#a66200", good: "#167d48", surface: "#ffffff" };
    const cs = getComputedStyle(document.documentElement);
    const c = (n: string) => `rgb(${cs.getPropertyValue(`--${n}`).trim().split(" ").join(",")})`;
    return { accent: c("accent"), muted: c("muted"), line: c("line"), ink: c("ink"), hint: c("hint"), good: c("good"), surface: c("surface") };
  };
  const [t, setT] = useState(read);
  useEffect(() => {
    const update = () => setT(read());
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);
  return t;
}

export function Tornado({ rows, base, highlight }: { rows: SensitivityRow[]; base: number; highlight?: string | null }) {
  const t = useTokens();
  const data = rows.map((r) => {
    const lo = Math.min(r.outLow, r.outHigh);
    const hi = Math.max(r.outLow, r.outHigh);
    return { name: r.label, start: lo, span: Math.max(hi - lo, base * 0.002), id: r.varId, lo, hi };
  });
  return (
    <div style={{ width: "100%", height: Math.max(180, rows.length * 44 + 40) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 22, bottom: 8 }} barCategoryGap={10}>
          <CartesianGrid horizontal={false} stroke={t.line} />
          <XAxis type="number" tickFormatter={(v) => indian(v, 0)} stroke={t.muted} fontSize={11} domain={["dataMin", "dataMax"]} />
          <YAxis type="category" dataKey="name" width={170} stroke={t.muted} fontSize={11.5} tickLine={false} />
          <Tooltip
            cursor={{ fill: t.line, opacity: 0.3 }}
            contentStyle={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 8, color: t.ink, fontSize: 12 }}
            formatter={(_v, _n, p) => [`${indian((p.payload as { lo: number }).lo)} – ${indian((p.payload as { hi: number }).hi)}`, "Answer range"]}
          />
          <Bar dataKey="start" stackId="a" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="span" stackId="a" radius={4} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.id} fill={d.id === highlight ? t.hint : t.accent} />
            ))}
          </Bar>
          <ReferenceLine x={base} stroke={t.ink} strokeDasharray="4 3" label={{ value: "your estimate", fill: t.muted, fontSize: 10, position: "top" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const SHORT: Record<SkillId, string> = { clarifying: "Clarify", structuring: "Structure", assumptions: "Assume", math: "Math", intuition: "Intuition", communication: "Comms" };

export function SkillRadar({ scores, compare, height = 260 }: { scores: Partial<Record<SkillId, number | null>>; compare?: Partial<Record<SkillId, number | null>>; height?: number }) {
  const t = useTokens();
  const data = (Object.keys(SHORT) as SkillId[]).map((k) => ({ skill: SHORT[k], you: scores[k] ?? 0, prev: compare?.[k] ?? 0 }));
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="66%" margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
          <PolarGrid stroke={t.line} />
          <PolarAngleAxis dataKey="skill" tick={{ fill: t.muted, fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          {compare && <Radar dataKey="prev" stroke={t.muted} fill={t.muted} fillOpacity={0.08} strokeDasharray="4 3" isAnimationActive={false} />}
          <Radar dataKey="you" stroke={t.accent} fill={t.accent} fillOpacity={0.22} strokeWidth={2} isAnimationActive={false} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreLine({ points }: { points: { label: string; overall: number }[] }) {
  const t = useTokens();
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={points} margin={{ left: -16, right: 12, top: 12, bottom: 4 }}>
          <CartesianGrid stroke={t.line} vertical={false} />
          <XAxis dataKey="label" stroke={t.muted} fontSize={11} tickLine={false} />
          <YAxis domain={[0, 100]} stroke={t.muted} fontSize={11} tickLine={false} />
          <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 8, color: t.ink, fontSize: 12 }} />
          <Line dataKey="overall" stroke={t.accent} strokeWidth={2.5} dot={{ r: 3.5, fill: t.accent }} activeDot={{ r: 5 }} isAnimationActive={false} name="Overall score" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
