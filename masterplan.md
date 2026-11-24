# Masterplan: Product Analyst Interview at Eternal (Zomato)

Candidate: Anant Shukla
Role: Product Analyst, Eternal (Zomato, Blinkit, District, Hyperpure)
Location: Gurugram
Resume: [Anant_Shukla_Resume.pdf](Anant_Shukla_Resume.pdf)
Job description: [JD.md](JD.md) (original: [JD.png](JD.png))
Interview date: TBD (confirm with the recruiter)

This file is the index and the master schedule. Each folder has its own `plan.md` that goes deep on that area.

## 0. What the JD is actually testing

The JD has 8 lines. They collapse into 5 skills. The whole plan is weighted by these.

| Skill | JD lines | Weight in this plan |
|---|---|---|
| **Product metrics, funnels, retention, feature impact** | #1, #2, #3 | 30% |
| **Experimentation and A/B testing** | #2 | 20% |
| **Structured problem solving on ambiguous problems** | #4 | 20% |
| **Ownership + automation + reporting/monitoring** | #5, #6 | 15% |
| **SQL / Excel / Python / viz + cross-functional communication** | #7, #8 | 15% |

Rule for every answer in the interview: name the user, name the metric, name the decision. The JD's tagline is "turn data into insights that shape products," so an answer that ends in a number but no decision is incomplete.

Full JD-to-resume mapping: [JD.md](JD.md#jd-to-resume-mapping).

> **Update: OA cleared. Interview in 5 days. Follow [5_DAY_PLAN.md](5_DAY_PLAN.md).** The 4-week schedule in section 3 is kept for reference only.

**Start here:** [Interview_Guide/](Interview_Guide/README.md) has the research: rounds and OA format from past candidates, round-by-round playbooks with worked examples, line-by-line resume defense, Eternal's latest numbers, and a 120-question bank.

| Folder | What it covers | Plan |
|---|---|---|
| `Interview_Guide/` | Process, OA, round playbooks, resume defense, question bank | [Interview_Guide/README.md](Interview_Guide/README.md) |
| `Intern/` | VK Global Publications (Summer Intern), AI Velocity (Gen AI Intern) | [Intern/plan.md](Intern/plan.md) |
| `projects/` | Appetizer, Life Cycle Assessment, Decoding Customer Value, Swiggy Sense | [projects/plan.md](projects/plan.md) |
| `achievements/` | Top 3 BYOP, Policy Challenge 1st Rank, Heritage Award, Udaan speaker, Chess | [achievements/plan.md](achievements/plan.md) |
| `PORs/` | Hostel Affairs, Finance Coordinator (CSR), NSS Joint Secretary | [PORs/plan.md](PORs/plan.md) |
| `Research/` | WCTR 2026 paper on cyclist lateral position detection | [Research/plan.md](Research/plan.md) |

---

## 1. What the loop will probably look like

Past Zomato/Eternal candidates report: OA (90–120 min, aptitude + SQL written from scratch, medium–hard) → 2–3 rounds (live SQL + stats + guesstimate; RCA/business case + resume deep-dive; HR). Details and sources: [Interview_Guide/02_process_and_OA.md](Interview_Guide/02_process_and_OA.md). The general shape is below. Confirm with the recruiter or placement cell.

1. **Recruiter screen**: background, motivation, notice period, compensation.
2. **Online assessment (OA)**: SQL, Excel or stats MCQs, sometimes a short Python task.
3. **Technical round**: live SQL, statistics, A/B testing, metric definitions.
4. **Product / case round**: "DAU dropped 8% week over week, investigate." "Design success metrics for a new feature." "Should we launch X?"
5. **Hiring manager / behavioral**: STAR stories drawn from the resume.

Questions to ask the recruiter now:
- Which SQL dialect (MySQL, PostgreSQL, BigQuery)? Is there a live coding editor?
- Is there a take-home analysis? If yes, what is the time limit?
- Which business (food delivery, Blinkit, District) is the team on?

---

## 2. Resume audit: what the interviewer will probe

Interviewers pick two or three lines and drill down until they hit the limit of what you know. Prepare the "why, how, what-if" answer for each one.

| Resume line | Likely follow-up |
|---|---|
| Summer Intern (VK): Amazon sales via SQL, "increased sales by 18%" | How did you measure the 18%? What was the baseline? Was it causal or correlational? |
| Summer Intern (VK): cohort analysis and A/B testing | Sample size? Duration? Which metric was primary? Guardrails? Any novelty effect? |
| Gen AI Intern (AI Velocity): "CCEval accuracy by 3.94%" | Is that 3.94 percentage points or a relative 3.94%? What is CCEval? |
| Gen AI Intern: "Zeta Eval gain 5.21%, CCEval regression 0.91%" | What trade-off did you make? Why was a small regression acceptable? |
| Appetizer: "8,000+ hostel residents," "REST APIs across 15+ messes" | Your product, your metrics, your adoption numbers. How did you know residents used it? |
| Life Cycle Assessment: "25% rise," "1 lakh+ revenue," "20% reduction" | Which 25%? Compared with what? Who attributed it to you? |
| Decoding Customer Value: "3,900 customers," "two loyalty frameworks with no churn label" | How did you define churn without a label? Why RFM vs clustering? |
| Redefining the Mobile Experience: "7.6x ROI," "Rs 746 cr to 2,385 cr" | Assumptions behind the revenue case. What are the 6 risks? Is this a Zomato competitor? Expect a "how would you improve Zomato's recommendations?" question. |
| Overall Coordinator: "8000+ residents," "18+ hostels" | How do you measure "efficient administration"? |
| Finance Coordinator: "Rs 5+ lakh CSR budget," "2,700+ residents" | Budget allocation logic. How was ROI on village projects measured? |
| WCTR 2026 paper | Explain the method at a high level, the metric, and one limitation. |

### Resume issues to fix before the interview

1. **Year inconsistency.** The header says "IV Year I Semester" but the education table says "B.Tech. 3rd Year." Pick one and correct the resume.
2. **Metric wording.** Replace vague claims with exact definitions. "Increased sales by 18%" needs a time window and a baseline.
3. **Percent vs percentage points.** Check every "%" in the resume. Interviewers ask this.
4. **Overstated attribution.** Use "contributed to," "led," or "designed" unless you can prove sole causation.
5. **Revenue projections.** The "Rs 746 cr to 2,385 cr" and "7.6x ROI" numbers come from assumptions. Be ready to list them one by one.

---

## 3. Master schedule (4 weeks)

Assumes 2 to 3 hours per day. Shorten it if the interview is sooner, and keep the order: SQL and metrics first, then stats, then case practice.

| Week | Focus | JD lines | Output by end of week |
|---|---|---|---|
| 1 | Product metrics, user journeys (use the Zomato, Blinkit, District apps yourself and map each journey), funnel and retention SQL, company study | #1, #3, #8 | 3 journey maps with a funnel metric per step. 40 SQL problems. One-page Eternal note. |
| 2 | Experimentation and A/B testing: design, power, pitfalls, readouts; feature-impact analysis | #2, #3 | 10 A/B test designs written. One full experiment readout in Python. |
| 3 | Ambiguous cases and root-cause analysis; automation and monitoring (dashboards, alerts, anomaly detection); Excel and Python refresh | #4, #5, #6, #8 | 6 timed cases. One automated report or monitoring prototype. |
| 4 | Resume stories mapped to JD lines, cross-functional stories, mocks, revision | #5, #7 | 8 STAR stories, each tagged to a JD line. 3 full mocks. |

### Daily routine (suggested)
- 45 min: SQL problem (one medium, one hard every other day)
- 45 min: concept study from the current week's plan
- 30 min: write one answer out loud or in writing (case, metric, or STAR)
- 15 min: review yesterday's mistakes

---

## 4. Topic map and priority

| Priority | Topic | JD line | Depth needed | Where to study |
|---|---|---|---|---|
| P0 | Product metrics, user journeys, funnels, retention, growth | #1, #3 | Define, decompose, and prioritize | This file, section 6 |
| P0 | A/B testing and experimentation frameworks | #2 | Design, power, interpret, and explain to a PM | This file, section 8 |
| P0 | Ambiguous case / root-cause analysis | #4 | Structured answer in 10 minutes | This file, section 7 |
| P0 | SQL (joins, window functions, cohorts, funnels) | #8 | Write it live without help | This file, section 5 |
| P1 | Automation, reporting and monitoring | #5, #6 | Design a dashboard + alert for a metric | This file, section 9 |
| P1 | Resume deep-dive and STAR stories (ownership, impact) | #5 | 2-minute answer per project | [Intern/plan.md](Intern/plan.md), [projects/plan.md](projects/plan.md) |
| P1 | Cross-functional collaboration stories | #7 | 3 stories (Ops, Business, Eng/Design) | [PORs/plan.md](PORs/plan.md) |
| P1 | Python, Excel, Power BI | #8 | Clean, explore, test, visualize | [projects/plan.md](projects/plan.md) |
| P2 | GenAI evaluation (not training) | #2 | Explain NES eval metrics and trade-offs | [Intern/plan.md](Intern/plan.md) |
| P2 | Research methods | #4 | Explain the paper in 2 minutes | [Research/plan.md](Research/plan.md) |
| P2 | Achievements | #4 | One-line story each | [achievements/plan.md](achievements/plan.md) |

---

## 5. SQL drill sheet

Practice in a real engine (PostgreSQL or MySQL). Solve each problem without autocomplete.

**Core**
- INNER, LEFT, RIGHT, FULL and anti-joins (`LEFT JOIN ... WHERE right.id IS NULL`)
- GROUP BY with HAVING; COUNT(DISTINCT) vs COUNT(*); NULL handling in aggregates
- CASE WHEN for conditional aggregation (pivot-style)
- CTEs and subqueries; when each is clearer

**Window functions (most asked)**
- ROW_NUMBER, RANK, DENSE_RANK: top-N per group, deduplication
- LAG / LEAD: day-over-day change, time between orders
- Running sums and moving averages: `SUM() OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`
- NTILE and PERCENTILE_CONT: quartiles and medians

**Product analytics patterns**
- **Retention / cohort table**: first-activity date per user, then days since first activity
- **Funnel conversion**: step 1 to step 2 to step 3, counted per user, with time limits
- **Sessionization**: gap-based session IDs (LAG on timestamp, then cumulative sum of a "new session" flag)
- **Gaps and islands**: consecutive active days, streaks
- **Self-join**: users who did action A then action B within 7 days
- **Repeat purchase rate**: share of customers with 2+ orders in 30 days
- **Top-N per city / category**: ROW_NUMBER partitioned by city
- **Growth rate**: week-over-week % change with LAG

**Practice set (write each one)**
1. Monthly GOV and order count per city, with MoM % change.
2. Percentage of new users who order again within 7 days, by acquisition channel.
3. Median delivery time per restaurant category, last 30 days.
4. Users who ordered in Jan but not in Feb (anti-join).
5. Top 3 restaurants by revenue per city for each month.
6. Funnel: app open, restaurant view, add to cart, checkout, payment success. Conversion between each step.
7. Longest streak of consecutive daily orders per user.
8. Sessions with a 30-minute inactivity gap; average session length.
9. Customers whose AOV grew more than 20% quarter over quarter.
10. Rider on-time rate by hour of day, flagging hours below 80%.

---

## 6. Product metrics, user journeys and metric trees (JD #1, #2, #3)

**User journeys (JD #1, #3).** Use each app for a week and write the journey down. For every step, name the metric and the most likely drop-off reason.

| Journey | Steps | Metric per step |
|---|---|---|
| Zomato food order | Open app, search/browse, restaurant page, add to cart, checkout, payment, tracking, delivery, rating | Search-to-menu CTR, add-to-cart rate, checkout conversion, payment success, ETA accuracy, rating rate |
| Blinkit order | Open, search, add item, cart, slot/ETA shown, pay, deliver | Search success (null-search rate), basket size, out-of-stock rate, minutes to deliver |
| District booking | Discover event/movie, select show, select seats, pay, ticket | Browse-to-select, seat-select drop-off, payment success |
| New-user activation | Install, sign-up, location, first order, second order | Sign-up rate, first-order rate, D7 second-order rate |

**Feature impact (JD #3).** For any feature, answer: who uses it (adoption), does it change behavior (engagement), does it change the business metric (conversion, frequency, AOV), and at what cost (guardrails). Prefer an A/B test; if not possible, use pre/post with a control group (difference-in-differences).

**Customer experience metrics (JD #2).** Delivery time and ETA accuracy, order accuracy (wrong/missing items), cancellation rate, support contacts per 100 orders, refund rate, rating distribution, NPS/CSAT.

**Know these definitions cold (food delivery and quick commerce)**
- **GOV** (gross order value), **AOV** (average order value), **orders**, **MTU** (monthly transacting users)
- **Take rate** (commission as a share of GOV), **contribution margin per order**, **ad revenue per order**
- **Delivery time / ETA accuracy**, **rider utilization**, **cancellation rate**, **on-time %**
- **Retention**: D1, D7, D30 retention; DAU/MAU stickiness
- **Subscriptions** (Zomato Gold, One membership, Blinkit plus-type programs): trial conversion, churn, renewal rate
- **Ads**: CTR, CPC, ROAS, advertiser count, fill rate of ad slots

**Frameworks**
- **North Star metric** and input metrics (e.g., North Star = monthly orders per active customer)
- **AARRR** (acquisition, activation, retention, referral, revenue)
- **HEART** (happiness, engagement, adoption, retention, task success) for feature impact
- **Metric tree**: break revenue into users x frequency x AOV x take rate. Break each into drivers.
- **Two-sided marketplace**: customers, restaurants, riders. Balance demand and supply. Watch fill rate and wait time.

**Metric design rules**
- A good metric is measurable, sensitive, hard to game, and tied to a user outcome.
- Always pair a primary metric with guardrails (e.g., order frequency up but cancellations or support tickets also up).
- Define the denominator explicitly. "Conversion" means nothing until you say per user, per session, or per visit.

---

## 7. Case and root-cause framework

Use this structure for every case. Say it out loud.

1. **Clarify** the goal, the product, the user, and the time window. Ask one or two focused questions.
2. **Metric definition**: what is the metric, how is it calculated, and what changed?
3. **Decompose** with a tree (e.g., orders = active users x orders per user; active users = new + returning - churned).
4. **Hypotheses**: internal (app release, pricing, outage, campaign) vs external (weather, festival, competitor, holiday, supply shortage).
5. **Data**: which cut would confirm or reject each hypothesis? (Platform, city, cohort, restaurant category, new vs returning, app version.)
6. **Prioritize** hypotheses by impact times likelihood.
7. **Recommend** an action, with trade-offs and what you would monitor.

**Sample cases to practice**
- "Food orders in Bengaluru dropped 10% on Tuesday. What happened?"
- "Design the success metrics for a new group-ordering feature."
- "Should Blinkit launch a Rs 49 delivery fee for orders under Rs 300?" (Think about elasticity, margin, and cannibalization.)
- "Average delivery time went up 4 minutes. Diagnose it."
- "Which restaurant onboarding KPI would you track for the next quarter?"
- "Propose three improvements to the recommendation carousel and how you'd test each."

---

## 8. Statistics and experimentation

**Foundations**
- Distributions: Bernoulli, binomial, normal, Poisson. When skew matters (order values are right-skewed; use medians or trimmed means alongside means).
- Central limit theorem, standard error, confidence intervals.
- Hypothesis testing: null, alternative, p-value (what it is and is not), one- vs two-sided tests.
- Type I error (alpha), Type II error (beta), power (1 - beta), minimum detectable effect (MDE).

**A/B test design**
1. Hypothesis and primary metric (one), secondary metrics, guardrails.
2. Unit of randomization (user, session, order, city). Explain why.
3. Sample size from baseline rate, MDE, alpha = 0.05, power = 0.8.
4. Duration: cover at least one full weekly cycle; avoid holidays unless the test is about them.
5. Run checks: sample ratio mismatch (SRM), balance on pre-experiment covariates.
6. Analysis: difference in means or proportions, CI, p-value, practical significance.

**Common traps (be able to name and fix each)**
- **Peeking** inflates false positives. Use a fixed horizon or sequential methods.
- **Multiple comparisons**: Bonferroni or Benjamini-Hochberg.
- **Novelty and primacy effects**: effects that fade or grow with time.
- **Network effects / interference**: in a marketplace, treatment users affect control users (riders are shared).
- **Ratio metrics** (e.g., revenue per session): use the delta method or per-user aggregation.
- **Simpson's paradox**: a trend reverses when you split by segment.
- **Selection bias** in observational data.

**Variance reduction**: CUPED (adjust using pre-period metric). Explain it as "using each user's history as their own control."

**Causal inference basics (know what each does and when)**
- Difference-in-differences: treatment vs control before and after a rollout.
- Propensity score matching: when you cannot randomize.
- Regression discontinuity: when a rule creates a threshold (e.g., free delivery above Rs X).
- Instrumental variables: briefly; know the idea.

**Regression basics**
- Linear regression: coefficient interpretation, R-squared, multicollinearity.
- Logistic regression: predicting conversion or churn; odds ratios.

**Practice questions**
1. Baseline conversion is 4%. You want to detect a 0.5 percentage point lift at 80% power. Roughly how many users per arm? (Compute it; do not guess.)
2. Your A/B test has p = 0.03 but the CI is [0.1%, 0.2%]. Is it significant? Is it useful?
3. Treatment has more users than control (52% vs 48%). What do you check?
4. An experiment is positive for 3 weeks, then flat. What might be happening?
5. Explain p-value to a non-technical PM in two sentences.

---

## 9. Automation, reporting and monitoring (JD #5, #6)

The JD asks you to "drive automation and build scalable reporting/monitoring solutions." Your Appetizer monthly AI reports are direct evidence. Build depth around it.

**Concepts**
- **Reporting layers**: raw tables, cleaned/modelled tables, metric definitions (single source of truth), dashboard.
- **Scheduled jobs**: cron or an orchestrator (Airflow-style DAGs) that refresh tables and send reports.
- **Dashboard design**: one question per dashboard, KPI tiles on top, trend in the middle, breakdown (city, platform, cohort) at the bottom, filters on the side. Every number has a definition tooltip.
- **Monitoring and alerting**: compare today's metric with the same weekday last 4 weeks; alert if outside a band (e.g., mean ± 3 standard deviations, or a percentage threshold). Watch for false alarms on festivals and sale days.
- **Anomaly detection basics**: rolling z-score, seasonal baselines (weekday and hour of day), and when to escalate.
- **Data quality checks**: row counts, null rates, duplicate keys, totals that reconcile with finance.

**Exercise (build one, push it to this repo)**
Write a Python script that reads a daily orders CSV, computes orders, GOV, AOV and cancellation rate by city, compares each with the trailing 4-same-weekday average, and prints an alert list. This becomes a talking point for JD #6.

**Interview question to prepare**: "Design a monitoring system for delivery time across 800 cities." Answer: metric definition, granularity (city x hour), baseline, threshold, alert routing (who gets paged), and how to avoid alert fatigue.

---

## 10. Behavioral and "about you" questions (JD #5, #7)

Prepare 8 STAR stories. Each under 2 minutes. Each one is tagged to a JD line.

| Theme | JD line | Story source |
|---|---|---|
| Data-driven decision with messy data | #3, #4 | VK Global Publications / Decoding Customer Value |
| End-to-end ownership: problem to automation to impact | #5, #6 | Appetizer |
| Worked with Operations | #7 | Overall Coordinator, Hostel Affairs (18+ hostels, vendors) |
| Worked with Business / finance stakeholders | #7 | Finance Coordinator (CSR budget, NGOs, government) |
| Worked with Engineering / Design | #7 | Appetizer (APIs, biometric flow) or AI Velocity |
| Ambiguous problem, no clear definition | #4 | Churn with no label (Decoding Customer Value) |
| Experiment or measurement trade-off | #2 | AI Velocity (gain on Zeta, small CCEval regression) |
| Why this company / why analytics | #1 | Civil engineering to analytics: have a clear, honest answer |

**Answer prompts**
- "Walk me through your resume." Keep it to 90 seconds: where you started, what you built, why you want this role.
- "Why Zomato?" Mention a specific product and a metric you would move. Avoid generic praise.
- "Why analytics, coming from civil engineering?" Describe the problem-solving through-line (modeling, measuring, optimizing systems) and what concrete work proves it.

---

## 11. Eternal study sheet (1 page)

Latest numbers (Q2 FY27) and vocabulary (NOV vs GOV, inventory model, dark stores) are already compiled in [Interview_Guide/01_company_and_role.md](Interview_Guide/01_company_and_role.md). Condense them into your own one page.

Build a one-page note before the interview. Write it from the company's latest public materials (shareholder letters and results).

- The four businesses and what each does for the user, the restaurant or merchant, and the rider.
- Latest reported figures: GOV, orders, revenue, adjusted EBITDA, and the direction of each. Verify numbers in the most recent public results before quoting them.
- Two strategic bets the company has described (for example, quick commerce expansion and ads) and one risk for each.
- One product idea for each business, framed as a hypothesis with a metric and a test.

---

## 12. Mock interview plan

- **Mock 1 (end of week 2)**: SQL + stats only. Time limit 45 minutes.
- **Mock 2 (week 3)**: one case + metrics. Time limit 30 minutes.
- **Mock 3 (week 4)**: full loop simulation: 10-minute intro, 20-minute SQL, 20-minute case, 15-minute behavioral.

Record yourself. Review for: clear structure, numbers stated with units, no filler, and honest answers when you do not know something ("I would check X first").

---

## 13. Interview-day checklist

- [ ] Every one of the 8 JD lines has at least one rehearsed story or answer ([JD.md](JD.md))
- [ ] Resume PDF corrected (year inconsistency fixed, every number verifiable)
- [ ] Eternal study sheet printed or open
- [ ] 8 STAR stories rehearsed
- [ ] SQL editor tested; common syntax memorized (window functions, date functions)
- [ ] Two questions prepared for the interviewer (about the team's metrics and the biggest current problem)
- [ ] Stable internet, camera, and quiet room if remote

---

## 14. Progress tracker

| Week | Status | Notes |
|---|---|---|
| 1 | Not started | |
| 2 | Not started | |
| 3 | Not started | |
| 4 | Not started | |
