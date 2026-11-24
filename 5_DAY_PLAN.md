# 5-Day Plan: Eternal Product Analyst Interview

**Status:** OA cleared ✅. Interview in 5 days.
**Budget:** ~7 focused hours/day = 35 hours. Sleep 7+ hours every night; it matters more than one extra hour of study.
**Rule:** Everything is practised **out loud**. Reading is not preparation. Speaking is.

**Interactive metrics guide (use on Days 2–4):** [Metrics_Lab/index.html](Metrics_Lab/index.html).

**Videos, blogs, PDFs and practice sites for each day:** [Interview_Guide/06_resources.md](Interview_Guide/06_resources.md).

This plan replaces the 4-week schedule in [masterplan.md](masterplan.md). Everything it points to is already in this repo.

| Day | Theme | Hours |
|---|---|---|
| 1 | Resume defense + your story | 7 |
| 2 | Cases: RCA, business, "which metric" | 7 |
| 3 | Stats, A/B testing, guesstimates | 7 |
| 4 | Live SQL out loud + product sense (use the apps) | 7 |
| 5 | Full mocks, fix weak spots, light evening | 6 |
| Interview day | Warm-up only | 1 |

---

## Day 1: Own your resume (the thing they ask in every round)

| Block | Time | Do this | Output |
|---|---|---|---|
| 1 | 1.5 h | Open [04_resume_defense.md](Interview_Guide/04_resume_defense.md). Fill **every `[ ]`** for VK Global and AI Velocity with real facts. Dig out old files, emails, sheets. If a number can't be backed, write the softer wording you'll use. | Filled VK + AI Velocity sections |
| 2 | 1.5 h | Same for Appetizer, Decoding Customer Value, LCA. For Appetizer, write before → after numbers (reporting time, rebate processing, accuracy). | Filled project sections |
| 3 | 1.5 h | **Swiggy Sense**: rebuild the ₹746 cr → ₹2,385 cr tree on paper: users × adoption × orders × AOV × take rate (or whatever you used). Mark the 3 most sensitive assumptions. Write the 6 risks + one mitigation each. Write your 1-line framing ("it was a case brief; the problem is category-wide"). | One-page revenue tree + risks |
| 4 | 1 h | Write and time "Tell me about yourself" (90 s) and "Why analytics after civil?" (45 s) from [03_round_playbooks.md](Interview_Guide/03_round_playbooks.md#round-g-hm--hr). Say each 5 times. Record once on your phone. | Two scripts, recorded |
| 5 | 1 h | **3-level drill** on your top 4 lines (VK 18%, AI Velocity %, Appetizer, Swiggy Sense): say What → How → Why/What-if out loud for each. | 4 lines defended aloud |
| 6 | 0.5 h | **Fix the resume**: header "IV Year" vs table "3rd Year". Soften any line you couldn't defend today. Print 3 copies. | Corrected resume |

**End-of-day check:** Can you answer "Is 3.94% absolute or relative?" and "How do you know the 18% was because of you?" in under 30 seconds each, without hesitation?

---

## Day 2: Cases (the deciding round)

Framework to memorize first (15 min): **Clarify → Is the data real? → Internal vs external → Decompose the metric → Segment → Funnel → Hypotheses ranked → Recommend + monitor.** ([03 Round D](Interview_Guide/03_round_playbooks.md#round-d-rca-root-cause-analysis-case))

| Block | Time | Do this |
|---|---|---|
| 1 | 1.5 h | **RCA × 3**, timed 10 min each, out loud, then compare with the worked example and fix gaps: (a) orders −15% in one zone yesterday, (b) AOV −8% WoW in Bengaluru with steady traffic, (c) cancellations +20% in Lucknow this week. |
| 2 | 1 h | **RCA × 3 more**: delivery time +4 min nationwide; Blinkit search-to-cart down on Android only; new-user D7 retention down for one cohort. |
| 3 | 1.5 h | **Business case**: "Open 1,100 Blinkit stores" (reported question). 20 min out loud, then refine using [03 Round E](Interview_Guide/03_round_playbooks.md#round-e-business-case-eg-how-would-you-open-1100-blinkit-stores). Do it again cleanly. |
| 4 | 1 h | **"Which one metric should Zomato optimize?"** (reported). Prepare one answer for food delivery and one for Blinkit: North Star → inputs → guardrails. |
| 5 | 1 h | **Company context**: read [01_company_and_role.md](Interview_Guide/01_company_and_role.md). Memorize: Blinkit turned profitable, Blinkit order value > food delivery, food delivery re-accelerated (+21.5%), why NOV not GOV, 2,751 dark stores. |
| 6 | 1 h | Two decision cases: "Raise platform fee by ₹2?" and "Lower Blinkit free-delivery threshold?" Structure: goal, who's affected, metrics, how to test, decision rule. |

**End-of-day check:** Can you start any RCA with a clear first 60 seconds (clarify + rule out data issues + state your structure)?

---

## Day 3: Stats, A/B testing, guesstimates

| Block | Time | Do this |
|---|---|---|
| 1 | 1.5 h | Stats table in [03 Round B](Interview_Guide/03_round_playbooks.md#round-b-statistics-asked-out-of-the-blue). For each concept, explain it out loud in 4 parts: **definition → intuition → Zomato example → caveat**. Priority: p-value, normal distribution + CLT, random sampling, mean vs median (skew), box plot, t-test vs z-test vs chi-square, Type I/II, CI. |
| 2 | 1.5 h | **A/B test design × 3**, out loud, 8 steps each: (a) bigger ETA on restaurant cards, (b) new recommendation carousel, (c) cheaper delivery fee for small orders. Include primary metric, guardrails, unit, sample size, duration, checks, decision rule, marketplace interference. |
| 3 | 0.5 h | Do the sample-size math by hand: 10% → 11% conversion ≈ 14,400 users/arm (n ≈ 16·p(1−p)/δ²). Then 5% → 5.5%. |
| 4 | 0.5 h | Pitfalls, 1 line each: peeking, SRM, novelty effect, Simpson's paradox, multiple testing, correlation ≠ causation (Gold members order more). |
| 5 | 2 h | **Guesstimates × 6**, 5 min each, out loud, with a sanity check: daily Zomato orders in Bengaluru (compare with worked example), daily orders from one Blinkit dark store, riders needed in Gurugram at Friday 8 pm, Zomato monthly platform-fee revenue, restaurants on Zomato in Delhi NCR, pizzas ordered in India on a Saturday. |
| 6 | 1 h | **Resume methods applied to Zomato** (they do this): Monte Carlo for delivery time, RFM/churn-without-label for Zomato users, offline-vs-online metric gap (AI Velocity) for a Zomato recommender. 2 min each. |

**End-of-day check:** Explain a p-value to a non-technical PM in 2 sentences, correctly. (It is *not* "probability the null is true.")

---

## Day 4: Live SQL out loud + product sense

| Block | Time | Do this |
|---|---|---|
| 1 | 2 h | **Live SQL rehearsal.** Take the 10 problems in [02_process_and_OA.md](Interview_Guide/02_process_and_OA.md#oa-style-sql-problems-practice-set-with-solutions). On paper or a plain editor, **narrate while writing**: restate output grain → ask edge cases (ties, NULLs, cancelled orders) → CTE steps → dry-run on 3 rows. |
| 2 | 1 h | SQL verbal theory, 1 min each aloud: order of execution, WHERE vs HAVING, UNION vs UNION ALL, RANK vs DENSE_RANK vs ROW_NUMBER, LEFT JOIN + WHERE trap, NOT IN with NULLs, COUNT variants, ROLLUP. |
| 3 | 1.5 h | **Use the apps.** Place or simulate an order on Zomato, Blinkit, District. Screenshot each step. For each app write: 1 friction point, the metric that shows it, 1 fix, how to A/B test it. |
| 4 | 1 h | **Product sense answers**: "What would you improve in Zomato?" (pick one from block 3, use user → problem → solution → metric → test), "Walk me through the order journey and the metric at each step." |
| 5 | 1 h | **Monitoring / automation (JD #6)**: "Design monitoring for delivery time across cities." Then link to your Appetizer reports as proof you've done it. |
| 6 | 0.5 h | Prepare 2 questions to ask interviewers ([01](Interview_Guide/01_company_and_role.md#questions-to-ask-your-interviewers-pick-2)). |

**End-of-day check:** Can you write a D7 retention query and a top-N-per-group query, talking the whole time, in under 8 minutes each?

---

## Day 5: Mocks and polish

| Block | Time | Do this |
|---|---|---|
| 1 | 1.5 h | **Mock 1 (technical)**: 20 min SQL + 15 min stats + 1 guesstimate. Ask a friend, or use me (see below). |
| 2 | 1.5 h | **Mock 2 (case + resume)**: 1 RCA + 1 business case + resume deep-dive on 2 random lines. |
| 3 | 1 h | **Mock 3 (HR)**: tell me about yourself, why Eternal, why analytics, ownership, conflict, failure. Use POR stories ([PORs/plan.md](PORs/plan.md)). |
| 4 | 1.5 h | **Fix the 3 weakest answers** from the mocks. Redo each once. |
| 5 | 0.5 h | Logistics: confirm time, venue/link, dress, resume copies, ID, water, pen and paper. |
| Evening | — | Stop by 9 pm. Light review of your one-page notes only. Sleep. |

---

## Interview day

- 45 min warm-up: say "tell me about yourself" once, explain p-value once, write one window-function query, do one 3-minute guesstimate.
- Carry: corrected resume ×3, pen, paper, your one-page notes.
- In every answer: **name the user, name the metric, name the decision.**
- Think out loud. Ask clarifying questions. If stuck: "Let me structure this first."
- Between rounds: note the questions asked, then reset. Don't replay a bad round.

---

## Mock interviews with Claude

Send any of these messages in this session and I'll run the round and grade you afterwards on structure, rigor and judgment:
- `mock SQL`: live SQL round, follow-up edge cases
- `mock stats`: rapid stats and A/B questions
- `mock guesstimate`
- `mock RCA` or `mock case`
- `mock resume`: I play a skeptical interviewer on your resume lines
- `mock HR`
- `full mock`: all of the above in sequence

## Daily tracker

| Day | Done | Weakest area found | Fixed? |
|---|---|---|---|
| 1 | [ ] | | |
| 2 | [ ] | | |
| 3 | [ ] | | |
| 4 | [ ] | | |
| 5 | [ ] | | |
