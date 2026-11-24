# Projects: Deep-Dive Study Plan

Owner: Anant Shukla
Part of: [masterplan.md](../masterplan.md)

## Purpose

Four projects carry most of the interview weight. For each one you need: the problem, your exact contribution, the data, the method, the metric, the result, the limitation, and what you would do next. This plan turns each project into a 2-minute story and a set of follow-up answers.

## JD alignment ([JD.md](../JD.md))

| Project | JD lines it proves | Lead with |
|---|---|---|
| Appetizer | #5 ownership end to end, #6 automation and reporting, #7 Eng + Ops collaboration | Best answer for "tell me about something you owned." Problem, build, automated reports, measured impact. |
| Decoding Customer Value | #3 retention and growth, #4 ambiguity (no churn label), #8 Python/SQL/Power BI | Best answer for "ambiguous problem" and "retention analysis." |
| Swiggy Sense | #1 user behavior and journeys, #2 customer experience, #4 structured thinking | Best answer for "product sense" and "how would you improve our app?" |
| Life Cycle Assessment | #1 business problems, #4 structured thinking, #7 Business stakeholders | Best answer for unit economics and pricing. |

Priority order for prep time: Appetizer, Decoding Customer Value, Swiggy Sense, Life Cycle Assessment.

## Common template (fill in for every project)

1. **Problem**: who had the problem and why it mattered
2. **Your role**: what you built, what you owned, what others owned
3. **Data**: sources, size, time range, quality issues
4. **Method**: tools, models, analysis steps
5. **Metrics**: primary, secondary, guardrail
6. **Result**: the number, baseline, and how you know it is real
7. **Limitation**: one honest weakness
8. **Next step**: what you would do with another two weeks

---

## Project 1: Appetizer (January 2026 to Present), Hostel Council, IIT Roorkee

### Resume claims
- Built a FastAPI and SQL meal-tracking system with biometric verification for 8,000+ hostel residents.
- Implemented meal opt-outs, automatic rebates, and inter-messing through REST APIs across 15+ messes.
- Automated monthly AI reports for every mess using Python jobs and the OpenAI API to minimize manual reporting effort.

### Analyst-facing questions to prepare
- What did you measure before and after launch? (Manual reporting time, rebate accuracy, meal-count error, opt-out rate.)
- How do you define "adoption" for biometric verification? Daily active residents? Verified meals as a share of expected meals?
- How did you handle wrong meal counts and disputes? What data quality checks did you add?
- Opt-outs and rebates: what is the financial impact per month? How is food waste measured?
- AI monthly reports: how did you check that the LLM summaries were accurate? What did you do about hallucinated numbers? (Answer: generate numbers in SQL or Python, let the LLM write only the narrative, and validate totals.)
- Who were the users? Students, mess managers, the council. How did you collect feedback?

### Depth to build
- Write the SQL for: meals served per mess per day, opt-out rate per week, rebate amount per student per month.
- Write a data check: totals in the report equal the sum of underlying records.
- Draft a funnel for the biometric verification flow: enrolled, verified at least once, verified in the last 7 days.

---

## Project 2: Life Cycle Assessment of Products Enabling SHG Upliftment (September 2024 to October 2024), Unnat Bharat Abhiyan, IIT Roorkee

### Resume claims
- Conducted market analysis on product demand, competitors, and pricing, driving a 25% rise in customer engagement.
- Led candle-making workshops for 50+ SHG women, boosting production efficiency and empowering rural entrepreneurs.
- Managed financials, achieving 1 lakh+ revenue and a 20% reduction in operational costs while meeting all profit targets.

### Analyst-facing questions to prepare
- What is "customer engagement" and how was it measured? Orders, repeat purchases, or footfall? What was the baseline?
- Is the 25% rise causal? What else changed during the period (festival season, new channel)?
- How was competitor pricing collected? What is the sample size and the comparison logic?
- Cost reduction of 20%: which costs? Compared with what baseline? Was it one-off or sustained?
- Unit economics: contribution margin per candle, break-even volume, and pricing decision.

### Depth to build
- Build a simple unit economics table: price, material cost, labor, overhead, contribution margin, break-even units.
- Write a one-slide competitor price comparison and state the pricing recommendation with a trade-off.
- Prepare a 60-second answer on how you would test a price change for these products (A/B by market, or staged rollout).

---

## Project 3: Decoding Customer Value (May 2026 to June 2026), Consulting and Analytics Club, IIT Guwahati

### Resume claims
- Built an end-to-end customer-intelligence pipeline (Python, SQL, Power BI) for a D2C brand's 3,900 customers.
- Validated two loyalty frameworks with no churn label; delivered a promo sunset plan and ideal customer profile.

### Analyst-facing questions to prepare
- Walk through the pipeline: data ingestion, cleaning, feature engineering, segmentation, dashboard. Where did most of the time go?
- With no churn label, how did you define churn or disengagement? (Recency threshold, expected purchase cycle, or a proxy like no purchase in N times the average inter-purchase gap.)
- Why RFM vs clustering vs a rule-based loyalty framework? How did you compare the two frameworks?
- How did you validate that the segments were meaningful? (Stability across time, differing behavior, business sense.)
- Promo sunset plan: what does "sunset" mean? When do you stop a promotion and what happens to the customers who relied on it?
- What would you test to confirm the ideal customer profile? (Holdout group, targeted campaign with a control.)

### Depth to build
- Recreate the RFM segmentation in Python: compute R, F, M, score quintiles, assign segments.
- Write the SQL for last purchase date, order count, and monetary value per customer.
- Build a one-page Power BI-style layout in your head (or in Excel): KPI tiles, segment bar chart, retention trend, a filter by channel.
- Prepare a 2-minute answer on the loyalty frameworks: definition, pros, cons, and which one you recommended and why.

### Stretch exercise
Take any open e-commerce transaction dataset. Define churn three different ways. Show how the churn rate and the segment sizes change. This is a strong answer to "how do you handle ambiguity?"

---

## Project 4: Redefining the Mobile Experience Through Generative AI (May 2026 to June 2026), SocBiz, IIT Roorkee

### Resume claims
- Designed Swiggy Sense, a GenAI food agent to address decision fatigue that traditional recommenders cannot solve.
- Built an 8-stage agent pipeline (perceive, plan, guardrail, act, learn), cutting user decision time down to 30 seconds.
- Modeled a tiered revenue case (Rs 746 cr to 2,385 cr) with 6 risk mitigations, projecting a 7.6x ROI at scale.

### Important
This project is about a food-delivery company that is a direct competitor of Eternal. Expect the interviewer to ask you about it, and expect them to compare your idea with what Zomato already does. Frame it as a learning exercise and a product idea, not as insider knowledge.

### Analyst-facing questions to prepare
- What is decision time? How did you measure 30 seconds? In a prototype, a user study, or a simulation?
- What is the 8-stage pipeline? Name each stage and what it does. Which stage had the most failures?
- Guardrails: what could go wrong (wrong recommendations, unsafe dietary advice, ordering errors)? How did you test them?
- The revenue case: list the assumptions for users, conversion, average order value, take rate, and cost per session. Which assumption is the most sensitive? Show the sensitivity table.
- 7.6x ROI: over what period? Is it gross or net of cost? What is the payback?
- How would you A/B test Swiggy Sense against the existing recommender? Primary metric: time to first order. Guardrails: cancellation rate, support contacts, and repeat rate at 30 days.

### Depth to build
- Rebuild the revenue case in a spreadsheet with inputs and outputs. Run a sensitivity table on the top 3 assumptions.
- Write a one-page product brief: problem, user, solution, metrics, risks, test plan.
- Prepare a 2-minute answer on "how would you improve Zomato's recommendations?" using this project as the basis. Keep it specific: one problem, one idea, one metric, one test.

---

## Cross-project study tasks

| Task | Time | Done |
|---|---|---|
| Write the STAR version of each project (one per page) | 2 hrs | [ ] |
| Compute one number per project that you can defend with a formula | 2 hrs | [ ] |
| Python: RFM from scratch with pandas | 2 hrs | [ ] |
| SQL: meal counts, cohorts, and opt-out rates (Appetizer) | 2 hrs | [ ] |
| Excel: sensitivity table for the revenue case | 1.5 hrs | [ ] |
| Power BI or Excel dashboard for one project (KPI tiles + one trend + one segment chart) | 3 hrs | [ ] |
| Mock: answer "tell me about your most impactful project" in 2 minutes, recorded | 1 hr | [ ] |

## Python and Power BI refresher (applies to Project 3 and others)

- **pandas**: `read_csv`, `groupby().agg()`, `merge` (how = left/inner/outer), `pivot_table`, `to_datetime`, `qcut` for quintiles, handling NaN with `isna()` and `fillna()`.
- **numpy and scipy**: percentile, mean and median with outliers, `scipy.stats.ttest_ind`, `proportions_ztest` (statsmodels).
- **Power BI**: star schema (fact table + dimension tables), relationships, measures vs calculated columns, DAX basics (`CALCULATE`, `FILTER`, `DIVIDE`, `SAMEPERIODLASTYEAR` for time intelligence), slicers, and a clean KPI layout.
- **Excel**: `XLOOKUP` or `INDEX/MATCH`, `SUMIFS`, `COUNTIFS`, PivotTables, a basic data table for sensitivity analysis.

## Verification list

- [ ] Every number has a source file or a formula
- [ ] Each project has one honest limitation written down
- [ ] "Customer engagement," "adoption," and "ROI" are defined before you quote them
- [ ] Swiggy Sense: decide how much of the design you will discuss, and prepare a neutral explanation of why it is a student project
