# Intern Experience: Study and Interview Plan

Owner: Anant Shukla
Part of: [masterplan.md](../masterplan.md)

## Purpose

Two internships are the strongest evidence of analyst work on the resume. This plan makes each one a clean 2-minute story, backed by SQL, stats, and metric depth. It also covers GenAI knowledge that is required because of the second internship.

## JD alignment ([JD.md](../JD.md))

| Internship | JD lines it proves | Angle to lead with |
|---|---|---|
| VK Global Publications | #2 A/B testing, #3 retention/cohorts/growth, #8 SQL | "I segmented users, tested campaigns, and changed budget decisions." |
| AI Velocity | #2 experimentation frameworks, #3 feature impact, #4 trade-offs | "I measured a feature on two metrics and made a ship trade-off." Not training mechanics: the JD does not ask for ML. |

Spend about 70% of internship prep time on VK (it is the closest match to the JD) and 30% on AI Velocity.

---

## A. Summer Intern, VK Global Publications (May 2025 to July 2025)

### Resume claims
1. Analyzed Amazon sales metrics via SQL, identified impact segments, and deployed strategies that increased sales by 18%.
2. Performed cohort analysis and A/B testing on marketing for sales forecasting, enabling data-driven budget decisions.

### Story structure (STAR)
- **Situation**: What was the business question? Who asked it? What was the sales picture before you started?
- **Task**: Your specific responsibility. Separate what you owned from what the team owned.
- **Action**: Data sources, SQL approach, segmentation logic, test design, tools.
- **Result**: The number, the baseline, the time window, and how you attributed it.
- **Learning**: What you would do differently (e.g., define the control group earlier, track a guardrail metric).

### Questions you must answer
- What exactly is the 18%? Monthly, quarterly, or vs previous year? Overall or in the segments you targeted?
- How did you select "impact segments"? (Recency, frequency, monetary value, product category, geography, or a Pareto cut?)
- What did the cohort analysis show? Define the cohort and the retention or revenue metric.
- A/B test: what was randomized (customer, campaign, or geography)? Sample size? Duration? Primary metric? Result?
- Did you check for seasonality (festival or sale periods) before crediting your strategy?
- Would any metric have moved without your work? How would you know?

### Depth to build
- Rewrite your main SQL query from memory. Explain each CTE and join.
- Recompute the 18% with a clear formula and baseline. If the original number was loose, say so and correct it in the interview.
- Prepare a 2-slide summary: the business problem and the segment chart.
- Drill: cohort retention table, A/B test power calculation, RFM segmentation. (See [masterplan.md](../masterplan.md) sections 5 and 8.)

### Stretch exercises
1. Rebuild the segmentation with a window function (NTILE for deciles) and compare the results with your original cut.
2. Simulate a 2-arm test with a 4% baseline conversion. Compute how many users you need to detect a 10% relative lift. Then check if your VK test had enough power.

---

## B. Gen AI Intern, AI Velocity (May 2026 to July 2026)

### Resume claims
1. Fine-tuned 7B LLMs across all 3 post-training stages on the proprietary codebase to build a Next Edit Suggestion (NES) model for the in-house IDE. Improved CCEval accuracy by 3.94%, and internalized org-specific coding patterns.
2. Enabled the new NES task with a 5.21% gain on Zeta Eval while limiting CCEval accuracy regression to 0.91%.

### What you must be able to explain simply
- **What a 7B LLM is**: a language model with about 7 billion parameters; "7B" describes model size.
- **Post-training stages**: typically supervised fine-tuning (SFT), preference optimization (e.g., DPO or RLHF-style training), and a further stage for the task or domain. Confirm which 3 stages you actually ran and what each one did. Be precise.
- **Next Edit Suggestion**: the model predicts the next edit a developer is likely to make, given recent changes. Explain it in one sentence a PM would understand.
- **CCEval and Zeta Eval**: explain what each measures. If you are unsure, say so and describe what you did to verify the metric.
- **The 3.94% and 5.21%**: say whether these are absolute percentage points or relative gains. Know the baseline score. This is the most likely question.
- **The 0.91% regression**: explain the trade-off. Why accept a small loss on one benchmark for a large gain on another?

### Product analyst angle (how to talk about it)
This is the part that matters most for a Product Analyst role, more than the training details.
- How would you decide whether NES is good enough to ship? Define offline metrics (accuracy, exact match, edit distance) and online metrics (acceptance rate of suggestions, keystrokes saved, time to completion).
- Guardrails: latency (suggestion must appear fast), false suggestions that developers reject, and developer trust.
- Offline vs online gap: a benchmark gain may not translate to user acceptance.
- How would you design an A/B test for NES in the IDE? Unit: developer or session. Primary metric: accepted suggestion rate. Guardrail: rejected-suggestion rate and latency.

### Depth to build
- Read one introductory piece on fine-tuning (SFT vs preference tuning) and one on LLM evaluation (offline vs human vs online).
- Write a one-page note: problem, data, method, metrics, results, limitations, next steps.
- Prepare 5 likely questions with answers:
  1. Why fine-tune a 7B model instead of using a larger API model?
  2. How did you prevent overfitting to the proprietary codebase?
  3. What was your evaluation set, and how was it split from training?
  4. What would you measure in production after launch?
  5. What is the cost or latency trade-off of a 7B model in an IDE?

### Stretch exercise
Take a small public text dataset. Compute accuracy on a held-out split. Then add a simple guardrail metric (response length or latency) and show the trade-off in a table. This prepares you to talk about trade-offs in your own language.

---

## C. Cross-cutting: How to present both internships together

Build one 60-second intro that connects the two:
- Analytics foundation (VK): measured sales, ran tests, changed budget decisions.
- Applied AI (AI Velocity): built and evaluated a model and cared about the metric that users feel.
- Through-line: "I like turning a messy system into a measurable decision."

---

## D. Study timeline (fit into the master schedule)

| When | Task | Done |
|---|---|---|
| Week 1 | Rewrite VK SQL from memory; recompute the 18% | [ ] |
| Week 1 | Write one-page note for AI Velocity project | [ ] |
| Week 2 | VK A/B test power check (stretch 2) | [ ] |
| Week 2 | Read SFT and eval basics; answer the 5 questions aloud | [ ] |
| Week 3 | Practice NES online-metric design as a case answer | [ ] |
| Week 4 | Record two 2-minute internship stories; review | [ ] |

---

## E. Verification list (do not skip)

- [ ] Every number has a baseline, time window, and definition written down
- [ ] Percentage vs percentage points resolved for CCEval and Zeta Eval
- [ ] Attribution wording: "contributed to" vs "caused," decided per claim
- [ ] Confirm the 3 post-training stages and your role in each
- [ ] Confirm whether any internship work is confidential; if so, describe it without the proprietary details
