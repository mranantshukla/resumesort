"use client";

import { clsx } from "clsx";
import katex from "katex";
import { forwardRef, useMemo } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import type { Reliability } from "@/engine/types";

export const cn = clsx;

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "hint";
type ButtonSize = "sm" | "md";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }>(
  function Button({ variant = "secondary", size = "md", className, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-9 px-3.5 text-sm",
          variant === "primary" && "bg-accent text-accent-ink hover:bg-accent/90",
          variant === "secondary" && "border border-line bg-surface text-ink hover:bg-surface-2",
          variant === "ghost" && "text-muted hover:bg-surface-2 hover:text-ink",
          variant === "danger" && "border border-bad/40 bg-surface text-bad hover:bg-bad-soft",
          variant === "hint" && "border border-hint/40 bg-hint-soft text-hint hover:bg-hint-soft/70",
          className,
        )}
        {...props}
      />
    );
  },
);

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-line bg-surface shadow-card", className)} {...props} />;
}

export function SectionTitle({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-4 grid gap-1">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="font-serif text-2xl font-semibold tracking-tight">{title}</h2>
      {children && <p className="max-w-[70ch] text-muted">{children}</p>}
    </div>
  );
}

type Tone = "neutral" | "accent" | "good" | "bad" | "hint" | "warn";

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-semibold",
        tone === "neutral" && "bg-surface-2 text-muted",
        tone === "accent" && "bg-accent-soft text-accent",
        tone === "good" && "bg-good-soft text-good",
        tone === "bad" && "bg-bad-soft text-bad",
        tone === "hint" && "bg-hint-soft text-hint",
        tone === "warn" && "bg-hint-soft text-warn",
        className,
      )}
    >
      {children}
    </span>
  );
}

const RELIABILITY: Record<Reliability, { label: string; tone: Tone; title: string }> = {
  verified: { label: "Verified", tone: "good", title: "From an official count or a fixed conversion." },
  "official-estimate": { label: "Official estimate", tone: "accent", title: "An official projection or survey estimate." },
  secondary: { label: "Secondary source", tone: "warn", title: "From reports or news; verify before quoting." },
  illustrative: { label: "Illustrative", tone: "neutral", title: "A reasoned assumption, not a measured fact." },
};

export function ReliabilityBadge({ value }: { value: Reliability }) {
  const r = RELIABILITY[value];
  return (
    <span title={r.title}>
      <Badge tone={r.tone}>{r.label}</Badge>
    </span>
  );
}

export function ProgressBar({ value, className, tone = "accent" }: { value: number; className?: string; tone?: "accent" | "good" }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all", tone === "good" ? "bg-good" : "bg-accent")} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, size = "md", label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; size?: "sm" | "md"; label?: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-lg border border-line bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={o.id === value}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-md font-medium transition-colors",
            size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
            o.id === value ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <p className="font-medium">{title}</p>
      {children && <p className="max-w-[48ch] text-sm text-muted">{children}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-2", className)} />;
}

export function Formula({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { displayMode: display, throwOnError: false, output: "html" });
    } catch {
      return tex;
    }
  }, [tex, display]);
  return <span className={cn("overflow-x-auto", display && "block", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Callout({ tone = "neutral", title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3.5 py-2.5 text-sm",
        tone === "neutral" && "border-line bg-surface-2",
        tone === "accent" && "border-accent/30 bg-accent-soft",
        tone === "good" && "border-good/30 bg-good-soft",
        tone === "bad" && "border-bad/30 bg-bad-soft",
        (tone === "hint" || tone === "warn") && "border-hint/30 bg-hint-soft",
      )}
    >
      {title && <p className="mb-0.5 font-semibold">{title}</p>}
      <div className="text-ink/90">{children}</div>
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3.5 py-3">
      <div className="eyebrow">{label}</div>
      <div className="tabular mt-0.5 font-serif text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}

export const DIFFICULTY_TONE: Record<string, Tone> = { beginner: "good", intermediate: "accent", advanced: "hint" };
