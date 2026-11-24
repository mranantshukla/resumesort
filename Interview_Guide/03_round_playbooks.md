# 03. Round Playbooks: How to Excel in Each Round

Every round is graded on the same three things: **structure** (did you organize the problem before solving it?), **rigor** (are numbers, definitions and assumptions explicit?), and **business judgment** (did you land on a decision?). The playbooks below are built around those.

---

## Round A: Live SQL

### How it runs
Interviewer shares a schema (often verbally or in a doc), asks 2–4 questions that build on each other, and watches you write. They interrupt with "what if there are ties / NULLs / duplicates?"

### How to excel
1. **Restate the output**: "So you want one row per city per month with the second-highest order value; ties count as the same rank?"
2. **Ask about edge cases before writing**: cancelled orders included? Time zone? Duplicate rows?
3. **Think out loud in CTE steps**: "First I'll get monthly totals, then rank, then filter."
4. **Write clean**: one clause per line, meaningful aliases.
5. **Dry-run on 3 rows** of imaginary data out loud. This catches most bugs and impresses.
6. **State complexity/alternatives briefly**: "I could also do this with a correlated subquery, but a window function is a single pass."

### Common traps
- Filtering on a window function in WHERE (not allowed; wrap in CTE).
- LEFT JOIN + a WHERE condition on the right table silently turns it into an INNER JOIN. Put the condition in ON.
- Integer division (`5/2 = 2` in some dialects): multiply by `1.0`.
- `NOT IN` with NULLs.
- Counting users when you meant orders (grain mistakes).

Practice problems with solutions: [02_process_and_OA.md](02_process_and_OA.md#oa-style-sql-problems-practice-set-with-solutions).

---

## Round B: Statistics (asked "out of the blue")

Reported questions: explain p-value, Gaussian distribution, random sampling; hypothesis testing; t-test; central tendency; box plots. Answer each in **definition → intuition → Zomato example → caveat**.

| Question | Strong answer |
|---|---|
| What is a p-value? | The probability of seeing a result at least this extreme **if the null hypothesis were true**. Small p → data is unlikely under "no effect." It is **not** the probability that the null is true, and not the size of the effect. Example: p = 0.02 on a checkout test means a lift this big would happen ~2% of the time by chance alone if the change did nothing. |
| Gaussian (normal) distribution | Symmetric bell curve defined by mean and SD; 68/95/99.7% within 1/2/3 SD. Matters because of the CLT: averages of many samples are ~normal even if the data isn't, which is why t-tests work on order values. Caveat: order values themselves are right-skewed. |
| Random sampling | Every unit has a known, equal chance of selection, so the sample represents the population and bias is avoided. In A/B tests, random assignment makes groups comparable, so differences can be attributed to the treatment. |
| Mean vs median vs mode | Mean is pulled by outliers; median is robust. Delivery times and order values are right-skewed (a few huge party orders), so report median (and P90) alongside mean. Skew direction: mean > median → right-skewed. |
| Read a box plot | Box = Q1 to Q3 (IQR), line = median, whiskers ≈ 1.5×IQR, dots = outliers. Use: compare delivery-time distributions across cities at a glance. |
| t-test | Compares means of two groups relative to the noise. Two-sample t-test for A vs B on AOV. Assumes roughly normal sampling distribution (fine with large n) and independent samples. For proportions (conversion) use a z-test for proportions or chi-square. |
| Type I vs Type II error | Type I: false positive (ship a change that does nothing), controlled by α. Type II: false negative (miss a real improvement), controlled by power. |
| Confidence interval | Range of plausible values for the true effect. 95% CI of [+0.2%, +1.1%] says the lift is positive and gives its likely size. More useful than a p-value alone. |
| Correlation vs causation | Users with Gold membership order more. Membership may not cause it: heavy users self-select into membership. Need an experiment or quasi-experiment. |
| Simpson's paradox | Overall conversion fell, but rose in every city: the mix shifted toward low-converting cities. Always segment before concluding. |
| Central limit theorem | Sample means approach a normal distribution as n grows, regardless of the data's shape. |
| Monte Carlo (asked as "apply your project method to us") | Simulate many random scenarios from assumed distributions to estimate an outcome distribution. Example: simulate delivery time = prep time + rider assignment wait + travel time, each drawn from its distribution, 10,000 times; estimate % of orders delivered under 30 min, and how that changes if prep time falls by 2 min. |

### A/B test design: the full worked answer
**Prompt**: "We want to show estimated delivery time more prominently on restaurant cards. How would you test it?"
1. **Hypothesis**: Clearer ETA reduces uncertainty, increasing restaurant-card → menu clicks and order conversion.
2. **Primary metric**: Session-to-order conversion. **Secondary**: card CTR, orders per user. **Guardrails**: ETA accuracy complaints, cancellation rate, average delivery time (users might shift toward closer restaurants, which is fine, or overload a few restaurants, which isn't).
3. **Unit**: user (not session) to avoid one person seeing both variants.
4. **Sample size**: baseline conversion, MDE (e.g., 2% relative), α = 0.05, power 0.8 → compute n per arm. Rough formula for proportions: n ≈ 16·p(1−p)/δ² per arm, where δ is the absolute difference.
5. **Duration**: at least 1–2 full weeks to cover weekday/weekend cycles; avoid IPL finals / festival days unless it's the target.
6. **Checks**: sample ratio mismatch, pre-period balance, novelty effect (plot daily lift).
7. **Decision rule** set before launch: ship if primary is significantly positive and no guardrail breaches.
8. **Marketplace caveat**: if the treatment shifts demand to certain restaurants or riders, control is affected too (interference). Consider city-level or time-sliced (switchback) designs for supply-side changes.

**Worked sample-size example**: baseline 10%, want to detect 10% → 11% (δ = 0.01): n ≈ 16 × 0.1 × 0.9 / 0.0001 = **14,400 users per arm**.

---

## Round C: Guesstimates

They grade the **tree**, not the number. Spend 1 minute structuring, 3 minutes computing, 1 minute sanity-checking.

### Method
1. **Clarify**: what exactly (orders? GOV? per day?), where, which period.
2. **Choose an approach**: demand side (population → users → frequency) or supply side (restaurants × orders/restaurant), or both.
3. **Segment** where it matters (income, age, city tier, weekday vs weekend).
4. **Compute** with round numbers; say each assumption out loud.
5. **Sanity-check** against a second method or a known number.

### Worked example: daily Zomato food orders in Bengaluru
Demand side (all assumptions; state them as such):
- Population ≈ 1.4 crore
- Online-capable (smartphone + digital payment) ≈ 70% → ~98 lakh
- Of those, use food delivery at all ≈ 35% → ~34 lakh
- Average frequency ≈ 4 orders/month → 34 lakh × 4 / 30 ≈ 4.5 lakh orders/day (whole market)
- Zomato share ≈ 55% → **~2.5 lakh orders/day**

Sanity check (top-down from reported numbers): food delivery NOV ≈ ₹11,445 cr/quarter ≈ ₹127 cr/day nationally. If an average order is ~₹400 (assumption), that's ~32 lakh orders/day nationally. Bengaluru as ~8–10% of national demand → ~2.5–3.2 lakh. **The two methods agree**, so the answer is defensible.

### Other guesstimates to practice
- Number of riders Zomato needs in Gurugram at Friday 8 pm peak.
- Daily Blinkit orders from one dark store.
- Revenue from Zomato's platform fee in a month.
- Number of restaurants listed in Delhi NCR.
- Number of movie tickets District sells on a weekend.

---

## Round D: RCA (Root Cause Analysis) case

Reported prompts: sudden 15% drop in orders in one zone; AOV down 8% WoW in a tier-1 city despite steady traffic; cancellations up 20% in Lucknow this week.

### Framework (say it out loud in this order)
1. **Clarify the metric**: definition, how it's computed, time window, how big the drop is, sudden vs gradual.
2. **Rule out data issues first**: tracking/logging change, app release, pipeline delay, definition change, a bot/fraud spike. ("Before anything else, I'd verify the drop is real.")
3. **Internal vs external**:
   - Internal: app release, pricing/fee change, offer ended, payment gateway failure, restaurant delistings, rider shortage, outage, experiment running.
   - External: weather (rain), festival/religious fasting period (Navratri, Ramadan), cricket match, competitor offer, local event, regulation/strike.
4. **Decompose the metric** (metric tree) and **segment**: city/zone, platform (Android/iOS/web), app version, new vs returning users, cuisine/restaurant, time of day, payment method.
5. **Funnel**: where in the journey is the drop? (Traffic → menu → cart → checkout → payment → delivered.)
6. **Hypothesize → test → conclude**: rank hypotheses by likelihood, state the data cut that confirms each.
7. **Recommend and monitor**: fix + guardrail + an alert so it's caught faster next time (ties to JD #6).

### Worked example: "AOV down 8% WoW in Bengaluru, traffic steady"
- AOV = NOV / orders. Traffic steady, so check whether **orders went up** (smaller orders added, e.g., a small-basket offering or new-user campaign pulling in cheaper orders) or **NOV went down**.
- AOV = items per order × price per item − discount per order. Which component moved?
- Mix shift: more single-person orders (weekday, office lunch) vs fewer group/party orders (weekend after an event last week = high base).
- Offers: a new discount increases discount per order (NOV-based AOV falls) or a free-delivery threshold was lowered (people stop padding baskets).
- Restaurant side: big high-AOV restaurants delisted or offline (kitchen closure).
- Segment by user cohort: if the drop is only in new users, it's acquisition mix, not a problem.
- Conclusion structure: "If it's mix from new small-basket users and orders and NOV rose, AOV falling is fine. If NOV fell, it's a problem and I'd look at offers and restaurant availability first."

### "Which metric should Zomato optimize?" (reported question)
Don't give a single metric without logic. Structure: business goal → North Star → inputs → guardrails.
- Candidate answer: **monthly orders per transacting user (frequency)** for food delivery as the growth North Star, because users and frequency compound and it captures retention. Inputs: delivery time, selection, affordability, ETA reliability. Guardrails: contribution margin per order, rider earnings per hour, cancellation rate.
- For Blinkit: **orders per store per day** with **delivery time under 10 minutes** and **in-stock rate** as inputs, because store throughput drives unit economics.
- One candidate was praised for linking to **latency** and Blinkit's 10-minute promise. Speed is the product.

---

## Round E: Business case (e.g., "How would you open 1,100 Blinkit stores?")

### Framework
1. **Objective**: growth (new cities) or density (more stores in existing cities)? Profitability timeline?
2. **Where (site selection)**: demand density (orders per sq km from existing app-open/search data, including searches with "not serviceable" results), income levels, smartphone penetration, competitor presence, rent, rider availability.
3. **How many per city**: catchment radius ~2–3 km for 10-minute delivery; stores needed = serviceable area / catchment area, adjusted by demand.
4. **Unit economics per store**: orders/day × AOV × contribution margin per order − fixed costs (rent, staff, utilities) → breakeven orders/day and months to breakeven.
5. **Execution**: phasing (pilot 50 stores, learn, scale), supply chain (mother warehouses feeding dark stores), assortment per store (local demand), hiring.
6. **Metrics to monitor**: orders/store/day, % orders delivered in ≤ 10 min, fill/in-stock rate, contribution margin per order, cannibalization of nearby stores.
7. **Risks**: cannibalization, rider supply, regulation, competition.

Context: Blinkit added 308 net stores in Q2 FY27 alone and is at 2,751 stores, so this question is real for them.

---

## Round F: Product sense / feature impact

### Prompts
- "What would you improve in the Zomato app?"
- "How would you measure the success of feature X?"
- "We launched X and metric Y went down. Is X bad?"

### Framework: user → problem → solution → metric → test
1. **User segment**: e.g., office workers ordering lunch.
2. **Pain point** (with evidence you'd look for): decision fatigue browsing 200 restaurants at 1 pm.
3. **Solution**: a "lunch in 20 min" filtered shelf.
4. **Metric**: time-to-order, session conversion at lunch hours; guardrails: AOV, restaurant concentration.
5. **Test**: A/B at user level; watch novelty effect.

Use your Swiggy Sense thinking here, but apply it to Zomato's journey, not Swiggy's (see [04_resume_defense.md](04_resume_defense.md)).

---

## Round G: HM / HR

### Questions reported and expected
- Tell me about yourself / walk me through your resume.
- Why Eternal? Why Product Analyst? Why not civil engineering / core?
- Your biggest project: what did *you* do?
- A time you took ownership end to end. (Appetizer)
- A conflict with a stakeholder. (POR stories)
- A failure. (Pick a real one; show the learning.)
- Where do you see yourself in 3 years?
- Are you comfortable with Gurugram / long hours / high pace?

### "Tell me about yourself" (90 seconds, structure)
1. **Now**: Final-year Civil Engineering at IIT Roorkee; I've spent the last two years doing product and analytics work.
2. **Proof 1 (analytics)**: At VK Global I used SQL, cohorts and A/B tests on Amazon sales data to reallocate marketing budget.
3. **Proof 2 (ownership + automation)**: I built Appetizer, a meal-tracking platform used by 8,000+ residents, and automated monthly reporting.
4. **Proof 3 (product thinking + AI)**: At AI Velocity I measured a new model feature on two benchmarks and made a ship trade-off.
5. **Why here**: Eternal's products are high-frequency and every decision is measurable; I want to be where a small metric change matters at scale.

### "Why analytics, coming from civil engineering?"
Civil engineering is about modeling systems, measuring them, and optimizing under constraints (traffic flow, capacity). My research paper measured cyclist behavior in traffic using computer vision. Delivery logistics and marketplaces are the same kind of system problem with much faster feedback. I chose analytics because I enjoy the measure → decide loop, and my internships and projects show I've been doing it for two years.

### Behavioral principles
- Use STAR; spend 60% of the time on **Action** and your specific decisions.
- End each story with a **number** and a **learning**.
- Say "I" for your work and "we" for team work. Don't inflate.
- For a failure story: real mistake, you owned it, concrete change after.
