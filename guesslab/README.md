# GuessLab

**Think. Structure. Estimate. Defend.**

An interactive learning platform that takes a beginner from zero to interview-ready on guesstimates and product-analyst problem solving. Learners don't read solutions: they work through each problem one layer at a time, and the app checks their reasoning.

## Run it

```bash
cd guesslab
npm install
npm run dev        # http://localhost:3000
```

Production: `npm run build && npm start`. Deploys to Vercel as-is (set the project root to `guesslab/`).

### Static build (no server)

`npm run build:static` produces `dist-spa/`: the same pages and components bundled by Vite into plain files with hash routes (e.g. `#learn--chai-cups-india`), via shims for `next/link` and `next/navigation` in `spa/`. It runs on any static host. The OpenAI route isn't available there, so the built-in coach and interviewer are used. `e2e/static-smoke.cjs` tests it served from a subfolder.

Nothing else is required. Progress is saved in the browser, and the built-in coach and interviewer work without any API key.

### Optional: OpenAI for the tutor and interviewer

Copy `.env.example` to `.env.local` and set:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_AI_PROVIDER=openai
```

The key stays on the server (`src/app/api/ai/route.ts`). The model then phrases tutor replies and interviewer follow-ups; GuessLab's own engine still decides interview phases and computes every score, so grading stays consistent. If the API call fails, the app falls back to the built-in engine.

## What's in it

| Area | Route | What works |
|---|---|---|
| Dashboard | `/` | Learning path with progress, daily guesstimate, focus areas, recent attempts, completion stats, recommended next |
| Guesstimate library | `/library` | 24 problems across 10 estimation types; search, category, difficulty and mode filters; progress and prerequisites |
| Guided workspace | `/learn/[id]` | The 8-stage engine on 5 fully built problems (see below); three-panel layout, tabs on mobile |
| Practice arena | `/practice/[id]` | Solo solving, timed or untimed; your own segments, factors and units; live unit and double-counting checks; evaluation; reference range shown only after submitting |
| AI interviewer | `/interview` | Turn-based interview that waits for your approach, asks follow-ups, challenges numbers, catches factual errors, and scores the transcript |
| Product Analyst School | `/school` | 7 modules, 12 lessons, 22 checked exercises plus practice links: MCQ, numeric with tolerance, and 7 SQL exercises run in the browser (SQLite via sql.js) and checked against a reference query |
| Knowledge hub | `/knowledge` | Formula library (KaTeX), frameworks, India reference data (each with source, geography, date, unit and reliability), common assumptions (labelled illustrative), glossary, cheat sheets, common mistakes |
| My performance | `/performance` | Skill radar (recent vs earlier), score over time, repeated mistakes, attempts table, time, personalised revision |

### The eight-stage guided engine

Each guided problem runs: **Problem understanding → Clarifying questions → Problem structuring → Assumptions → Calculation → Sensitivity analysis → Final answer → Evaluation.**

- **Never shows the solution up front.** Stages unlock in order; tree values stay hidden ("?") until you've computed them; each stage's full reasoning is revealed only after you complete it.
- **Every stage carries a guide:** what to do, what to ask, why it matters, what information you need, how to derive it, the formula, common mistakes, 3 progressive hints, Socratic questions, and the explanation.
- **Estimation tree** (React Flow) built from structured data. Click any node for its formula; switch segments off; add your own segment with a value and unit.
- **Automatic unit checks** via dimensional analysis (`cup/person/day × person = cup/day`); adding mismatched units is flagged on the exact node.
- **Double-counting detection:** MECE checker for segment choices (overlaps and gaps), share-sum constraints (heavy + light users must equal 100%), and keyword-based overlap prompts for learner-written segments.
- **Assumption validation:** each assumption has a plausible range, reliability label (verified / official estimate / secondary / illustrative), source, and "how to derive it".
- **Calculation** is graded against *your own* assumptions (±5%), not a fixed answer; power-of-ten slips get a specific message.
- **Sensitivity:** tornado chart, ±10% elasticities and what-if sliders; you must identify the key driver.
- **Final answer generator** drafts an interview answer only from your own scope, structure, assumptions, cross-check and sensitivity; a checklist scores communication.
- **Evaluation** on six skills (clarifying, structuring, assumptions, math, business intuition, communication). Feedback is labelled as *factual error*, *reasonable alternative assumption* or *difference in method*, and a defensible answer outside the reference range still scores well.
- **Learning assistant** with five modes: Tutor, Socratic, Interviewer, Evaluator, Revision. Live checks surface overlaps, unit errors and implausible values as you work.
- **Save and resume:** every action persists; reload and you're where you left off.

### The five complete guided problems

| Problem | Type | Teaches |
|---|---|---|
| Cups of chai sold in India every day | Consumption, demand side | Defining "sold", segmenting cups by place (home vs outside) to avoid double counting, supply-side cross-check from tea leaves |
| Daily revenue of a momo stall | Revenue, capacity | Capacity × utilisation × price by time band; footfall cross-check |
| Daily food delivery orders in Bengaluru | Marketplace, digital | User funnel, heavy vs light frequency split (with share constraint), monthly→daily, restaurant-supply cross-check |
| Movie tickets booked online in India on a weekend | Infrastructure, digital | Screens × shows × seats × occupancy; demand-side triangulation |
| Peak-hour orders a dark store can fulfil | Capacity, operations | `min(demand, picking, riders)` bottleneck reasoning |

## Architecture

```
src/
  engine/        Pure, tested logic. No React.
    types.ts       Data model: Guesstimate, Variable, TreeNode, stages, rubric, session
    units.ts       Dimensional analysis
    tree.ts        Tree evaluation, unit issues, formulas (text + KaTeX)
    mece.ts        MECE / double-counting checks
    validation.ts  Assumption ranges and share constraints
    sensitivity.ts Tornado data and answer range
    session.ts     Session lifecycle, stage blockers, calculation checks
    finalAnswer.ts Answer generator + communication checklist
    evaluation.ts  Six-skill rubric scoring with typed feedback
    coach.ts       Built-in assistant (5 modes) and live alerts
    interviewer.ts Interview state machine and scoring
    practiceEval.ts Practice-arena scoring
    insights.ts    Skill averages, mistakes, recommendations, daily problem
  content/       Learning content as data (kept separate from presentation)
    guesstimates/  The 5 guided problems
    practice.ts    24-problem bank with drivers and reference ranges
    school.ts, sql.ts, knowledge.ts
  components/    UI (workspace, charts, school, practice, interview)
  app/           Next.js App Router pages + /api/ai
  lib/           Local-first store (StorageAdapter) and AI client
supabase/schema.sql  Tables + row-level security for cross-device sync
tests/               Vitest: engine, content integrity, flows, SQL
e2e/smoke.mjs        Playwright script that drives every major flow
```

### Adding a guided guesstimate

Create `src/content/guesstimates/<name>.ts` exporting a `Guesstimate` and add it to `index.ts`. `tests/content.test.ts` then checks it automatically: every approach must evaluate with consistent units, the default answer must sit inside the reference range, approaches must agree within 3×, defaults must be plausible, calculation steps must point at real nodes, and the segment picker needs one MECE answer and at least one trap.

## Tests

```bash
npm test             # 79 unit and integration tests (engine, content integrity, flows, SQL)
npm run typecheck
# End-to-end (needs Playwright + Chromium installed):
npm run build && npm start -- -p 3123 &
BASE_URL=http://localhost:3123 node e2e/smoke.mjs
```

The e2e script completes the chai problem through all 8 stages (including a deliberate double-counting mistake and a power-of-ten slip), checks save-and-resume, the dashboard, a practice submission, a full interview, a SQL exercise, the knowledge hub, performance, dark theme and mobile width.

## Content and sources

Problem topics were organised using the RCS Guesstimate Book (Ramjas Consulting Society, 2022–23) as a reference. No chapters or solutions are reproduced: every question, number, explanation and exercise in GuessLab is original. Statistics in the Knowledge Hub carry source, geography, date, unit and reliability; illustrative assumptions are labelled. Verify secondary figures before quoting them.

## Status against the build plan

| Phase | Status |
|---|---|
| 1. Foundation, dashboard, library, 5 guesstimates, 8-stage engine, tree, calculator, hints, evaluation | Done |
| 2. AI tutor, AI interviewer, practice arena, performance tracking | Done (built-in engine; OpenAI optional) |
| 3. Product Analyst curriculum, metrics exercises, business cases, SQL practice | Done (first version: 7 modules) |
| 4. Personalised paths, daily challenges, revision engine, advanced simulations | Partly: daily guesstimate, recommendations and Revision mode exist; adaptive paths and spaced repetition are next |
| Accounts and cross-device sync (Supabase Auth) | Schema ready in `supabase/schema.sql`; adapter and sign-in not built yet. Progress is per-browser today |
