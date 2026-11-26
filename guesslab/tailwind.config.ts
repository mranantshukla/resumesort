import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{ts,tsx}", "./spa/**/*.{ts,tsx,html}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: v("bg"),
        surface: v("surface"),
        "surface-2": v("surface-2"),
        ink: v("ink"),
        muted: v("muted"),
        line: v("line"),
        accent: v("accent"),
        "accent-ink": v("accent-ink"),
        "accent-soft": v("accent-soft"),
        hint: v("hint"),
        "hint-soft": v("hint-soft"),
        good: v("good"),
        "good-soft": v("good-soft"),
        bad: v("bad"),
        "bad-soft": v("bad-soft"),
        warn: v("warn"),
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: { xl: "14px", lg: "10px", md: "8px" },
      boxShadow: { card: "0 1px 2px rgb(0 0 0 / 0.04), 0 1px 1px rgb(0 0 0 / 0.02)", pop: "0 8px 30px rgb(0 0 0 / 0.08)" },
    },
  },
  plugins: [],
} satisfies Config;
