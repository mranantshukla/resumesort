"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, BookOpen, Compass, GraduationCap, LayoutDashboard, Library, Menu, MessagesSquare, Moon, Sun, Target, X, Monitor } from "lucide-react";
import { cn } from "@/components/ui";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/library", label: "Guesstimate library", icon: Library },
  { href: "/practice", label: "Practice arena", icon: Target },
  { href: "/interview", label: "AI interviewer", icon: MessagesSquare },
  { href: "/school", label: "Product Analyst School", icon: GraduationCap },
  { href: "/knowledge", label: "Knowledge hub", icon: BookOpen },
  { href: "/performance", label: "My performance", icon: BarChart3 },
];

type ThemeChoice = "system" | "light" | "dark";

function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeChoice>("system");
  useEffect(() => {
    try {
      const t = (localStorage.getItem("guesslab:theme") as ThemeChoice) || "system";
      setTheme(t);
    } catch {
      /* ignore */
    }
  }, []);
  const apply = (t: ThemeChoice) => {
    setTheme(t);
    try {
      localStorage.setItem("guesslab:theme", t);
    } catch {
      /* ignore */
    }
    if (t === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
  };
  const opts: { id: ThemeChoice; icon: typeof Sun; label: string }[] = [
    { id: "light", icon: Sun, label: "Light theme" },
    { id: "system", icon: Monitor, label: "System theme" },
    { id: "dark", icon: Moon, label: "Dark theme" },
  ];
  return (
    <div className="inline-flex rounded-md border border-line p-0.5" role="group" aria-label="Theme">
      {opts.map((o) => (
        <button key={o.id} onClick={() => apply(o.id)} aria-pressed={theme === o.id} title={o.label} className={cn("grid h-7 w-7 place-items-center rounded", theme === o.id ? "bg-surface-2 text-ink" : "text-muted hover:text-ink")}>
          <o.icon size={14} />
          <span className="sr-only">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-ink">
        <Compass size={17} />
      </span>
      <span className="leading-tight">
        <span className="block font-serif text-[1.15rem] font-semibold tracking-tight">GuessLab</span>
        <span className="block text-[10.5px] text-muted">Think. Structure. Estimate. Defend.</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const nav = (
    <nav className="grid gap-0.5" aria-label="Main">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} className={cn("flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm", active(n.href) ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-surface-2 hover:text-ink")}>
          <n.icon size={16} />
          {n.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r border-line bg-surface px-3 py-4 lg:flex">
        <div className="px-1.5">
          <Brand />
        </div>
        {nav}
        <div className="mt-auto grid gap-3 px-1.5">
          <ThemeToggle />
          <p className="text-[11px] leading-snug text-muted">Progress is saved in this browser.</p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface px-4 py-2.5 lg:hidden" style={{ paddingTop: "max(10px, env(safe-area-inset-top))" }}>
        <Brand />
        <button onClick={() => setOpen((o) => !o)} className="grid h-9 w-9 place-items-center rounded-md border border-line" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>
      {open && (
        <div className="border-b border-line bg-surface px-4 pb-4 lg:hidden">
          {nav}
          <div className="mt-3">
            <ThemeToggle />
          </div>
        </div>
      )}

      <main className="min-w-0">{children}</main>
    </div>
  );
}

export function Page({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return <div className={cn("mx-auto px-4 py-6 sm:px-6 lg:py-8", wide ? "max-w-[1500px]" : "max-w-[1120px]")}>{children}</div>;
}
