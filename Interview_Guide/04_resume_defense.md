# 04. Resume Defense: Line by Line

How interviewers use a resume: they pick a line, ask "how?", then "why?", then "what if?", until you run out of depth. Candidates report being asked to explain every method on their resume (e.g., Granger causality, ADF test) and then apply it to a Zomato problem on the spot (e.g., "use your Monte Carlo method to estimate change in delivery rates").

**Your rule: never put on the resume what you can't defend three levels deep.** Fill every `[ ]` below with your real facts. Don't invent numbers. If you can't fill a blank, soften the resume line before the interview.

## The 3-level drill (apply to every line)

1. **What**: what exactly did you do? (Your part, not the team's.)
2. **How**: data, method, tools, steps, the number and its definition.
3. **What if / why**: why this method over alternatives? What would you do differently? How would it work at Zomato?

## Danger-zone ranking (prepare in this order)

| Rank | Line | Why it's dangerous |
|---|---|---|
| 1 | Swiggy Sense revenue case (₹746 cr → ₹2,385 cr, 7.6x ROI) | Big numbers, built on assumptions, about a direct competitor |
| 2 | VK Global "increased sales by 18%" + A/B testing | Causal claim; A/B details will be probed by stats-minded interviewers |
| 3 | AI Velocity 3.94% / 5.21% / 0.91% | Absolute vs relative; benchmark meaning |
| 4 | Year inconsistency (header "IV Year" vs table "3rd Year") | Looks careless; fix before applying |
| 5 | Appetizer 8,000+ residents | "Built for" vs "used by" |
| 6 | Decoding Customer Value "no churn label" | Great story if you can explain; weak if vague |
| 7 | LCA "25% rise in engagement" | Undefined metric |
| 8 | PORs numbers (8,000+, ₹5 lakh, 1,000+ volunteers) | Reach vs impact |
| 9 | CGPA 7.405 | May be asked "why not higher?" |

---

## Header and education

**Fix first**: the header says "UG (IV Year I Semester)"; the education table says "2026 | B.Tech. 3rd Year." Make them consistent.

**"Your CGPA is 7.4; why?"**
Don't apologize at length. Skeleton: "My CGPA reflects that I spent a lot of time building real things: [Appetizer, the internships, the research paper]. I'd point you to [the strongest proof] as evidence of how I work. In [specific analytics/stats courses], I scored [ ]." Only use the last part if true.

---

## Internship 1: Summer Intern, VK Global Publications (May–July 2025)

**Line**: "Analyzed Amazon sales metrics via SQL, identifying impact segments & deploying strategies that increased sales by 18%."

| Attack | Trap | Answer skeleton |
|---|---|---|
| "Increased sales by 18%: compared with what?" | Vague baseline | "Compared with [period/baseline], measured as [revenue/units] for [segments/all], over [window]." |
| "How do you know your strategy caused it?" | Claiming causation without a control | "[If you had a control:] We compared with [control group]. [If not:] Honestly, it's a before/after number. Seasonality could contribute: [festival period?]. If I redid it, I'd keep a holdout." Admitting this earns credibility. |
| "What were the impact segments?" | Generic answer | "We segmented by [category / price band / region / RFM]. The top segment was [ ], which drove [ ]% of revenue." |
| "Write the SQL you used." | Can't recall | Rehearse the core query: revenue by segment by month with MoM growth (see [02](02_process_and_OA.md)). |

**Line**: "Performed cohort analysis & A/B testing on marketing campaigns for sales forecasting."

| Attack | Answer skeleton |
|---|---|
| "Define your cohort." | "Customers grouped by [first purchase month]; tracked [repeat purchase rate / revenue] in months 1–N." |
| "What did the A/B test compare? Sample size? Duration? Significance?" | "[Campaign A vs B], randomized by [ ], [n] per arm, [duration], primary metric [ ], result [lift, p-value or CI]." If it wasn't a strict randomized test, say so: "It was a split test across [ ] rather than a fully randomized experiment." |
| "How did A/B testing help forecasting?" | Connect clearly: "The measured lift per campaign gave us response rates to feed the forecast and the budget split." |
| Stretch: "Design that test properly now." | Use the A/B template in [03](03_round_playbooks.md#ab-test-design-the-full-worked-answer). |

---

## Internship 2: Gen AI Intern, AI Velocity (May–July 2026)

**Lines**: Fine-tuned 7B LLMs across 3 post-training stages for a Next Edit Suggestion (NES) model; +3.94% CCEval; +5.21% Zeta Eval with −0.91% CCEval regression.

| Attack | Answer skeleton |
|---|---|
| "Is 3.94% absolute or relative? What's the baseline?" | "It's [absolute percentage points / relative]: from [x]% to [y]%." **Know this cold.** |
| "What do CCEval and Zeta Eval measure?" | "CCEval measures [ ]; Zeta Eval measures [ ]. We used [one] for general code completion quality and [the other] for the new edit-prediction task." |
| "Why accept a 0.91% regression?" | "NES was the new task we were enabling; +5.21% on it was the goal. We set a guardrail that existing completion quality couldn't drop by more than [threshold]; 0.91% was within it." This is **exactly** the primary metric + guardrail logic the JD wants. |
| "What were the three stages?" | "[SFT / preference tuning / task-specific stage]; I did [ ]." Don't claim more than you did. |
| "How would you know users like NES?" | Online metrics: suggestion acceptance rate, edits kept after N minutes, keystrokes saved; guardrail: latency, rejection rate. Offline gains don't always translate online. |
| "Is any of this confidential?" | Describe method and metrics, not code or proprietary data. |

**Bridge to Zomato**: "The lesson I'd bring is that a model's offline score is not the user outcome. At Zomato, a better recommendation model must prove itself on conversion and repeat orders in an A/B test, with guardrails."

---

## Project: Appetizer (Jan 2026–present)

**Lines**: FastAPI + SQL meal tracking with biometric verification for 8,000+ residents; opt-outs, rebates, inter-messing via REST APIs across 15+ messes; monthly AI reports with Python jobs + OpenAI API.

This is your **best ownership story (JD #5, #6)**. Use it for "end to end," "automation," and "work with engineering."

| Attack | Answer skeleton |
|---|---|
| "8,000+: available to, or actually using it?" | "[N] residents enrolled; [M] verified meals per day / [k]% weekly active." Use the honest one. |
| "What did it change? Impact?" | Before/after: reporting time from [x hours] to [y]; rebate processing [x days → y]; meal-count accuracy [ ]; food waste [ ]. |
| "How did you ensure the AI reports had no wrong numbers?" | "All numbers are computed in SQL/Python; the LLM only writes narrative around them; I validate totals before sending." |
| "What would you monitor?" | Daily meals served vs expected per mess; alert if deviation > [x]%; opt-out spikes; API error rates. |
| "What did you personally build?" | Be precise about your role vs the team's. |
| "What went wrong?" | Have one real issue (biometric failures at rush hour? data mismatches?) and the fix. |

---

## Project: Life Cycle Assessment of Products for SHG (Sep–Oct 2024)

| Attack | Answer skeleton |
|---|---|
| "25% rise in customer engagement: what metric?" | "[Repeat buyers / orders / stall visits] went from [x] to [y] over [period]." If loosely measured, say "roughly," and explain how it was observed. |
| "How did market analysis drive it?" | "Competitor pricing showed [ ]; we repositioned price/product to [ ]." |
| "₹1 lakh+ revenue, 20% cost reduction: how?" | Name the cost lines cut (raw material sourcing, batch production). Show unit economics: price, cost per unit, margin. |

---

## Project: Decoding Customer Value (May–June 2026, IIT Guwahati)

| Attack | Answer skeleton |
|---|---|
| "No churn label: so how did you define churn?" | "Customers with no purchase for more than [k]× their own average inter-purchase gap, or > [N] days since last purchase. I checked sensitivity: churn rate at 60/90/120 days was [ ]." Strong answer for JD #4 (ambiguity). |
| "What are the two loyalty frameworks?" | "[RFM segmentation] and [ ]. Validated by [stability over time / differing future behavior / business sense]." |
| "What's a promo sunset plan?" | "Phasing out a promotion for segments that would buy anyway, to recover margin, while keeping it for price-sensitive segments; monitor retention as a guardrail." |
| "Apply this to Zomato." | "Segment Zomato users by recency/frequency; target win-back offers only at users at risk, and hold out a control to measure true incremental orders." |

---

## Project: Redefining the Mobile Experience Through GenAI ("Swiggy Sense") (May–June 2026)

**The biggest risk on your resume.** It's about a direct competitor and contains large financial projections.

**How to frame it**: "This was a product-strategy case competition / club project. The brief used Swiggy as the case. The product question (decision fatigue in food ordering) is category-wide, and I'd love to think about how it applies to Zomato."

| Attack | Answer skeleton |
|---|---|
| "Why Swiggy? Do you prefer them?" | "The case brief named them. The problem is category-level; my interest is in the problem." Light, no defensiveness. |
| "How did you measure 30 seconds decision time?" | "[Prototype test with N users / simulated flow / assumption]." If it was a design target, say it was a target. |
| "Walk me through the ₹746 cr → ₹2,385 cr." | Have the tree ready: adopting users × orders per user × AOV × take rate (or incremental orders × margin) per tier. Name the 3 most sensitive assumptions and show a range. |
| "7.6x ROI on what cost, over what period?" | "Incremental [contribution / revenue] of [ ] vs cost of [LLM inference + build] of [ ] over [ ]." Know whether it's revenue or profit-based. |
| "What are the 6 risks?" | List them (e.g., hallucinated recommendations, dietary/allergen safety, LLM cost per session, latency, privacy, restaurant fairness/concentration) with one mitigation each. |
| "Isn't Zomato already doing this?" | "Zomato has AI features in this space; I'd be curious how they're measured. My approach would be [one specific idea + metric + test]." Don't claim knowledge you don't have; check the Zomato app before the interview. |
| "Recommenders already reduce choice. Why an agent?" | "Recommenders rank options; an agent can take a constraint ('high-protein, under ₹300, in 25 min') and converge in one turn. Whether that beats a good filter is an empirical question I'd A/B test on time-to-order and conversion." |

---

## Achievements

| Line | Likely question | Prep |
|---|---|---|
| Top 3, BYOP 2026 (Consulting & Analytics) | "Which project? What set it apart?" | Name it; one metric. |
| 1st Rank, Policy Challenge '24 (OMI Hack-a-thon) | "What was the policy problem and your solution?" | 60-second structured answer. |
| IITR Heritage Excellence Award '24 | "What's it for?" | One line. |
| Guest Speaker, Udaan 5.0 (7,500+ students) | "What did you speak about?" | Topic + one key message. |
| 1533 Chess.com Rapid | "Does chess help your work?" | One line: structured search of candidate moves under time pressure; don't oversell. |

## PORs
Full prep in [PORs/plan.md](../PORs/plan.md). Key defense: separate **reach** (8,000 residents, 2,700 villagers) from **impact** (what changed, measured how).

## Research paper (WCTR 2026)
Full prep in [Research/plan.md](../Research/plan.md). Key defense: your contribution vs your professor's; validation metric; one limitation; and the bridge: "measuring behavior accurately before making decisions on it."

---

## Universal recovery lines

- **Don't know**: "I haven't worked with that directly. Here's how I'd reason about it: …" Then reason.
- **Caught on a weak number**: "That's fair. That number is [before/after, not causal / an estimate]. If I redid it, I'd [holdout / proper baseline]." Owning it scores better than defending it.
- **Blanking in SQL**: "Let me write the steps in plain English first," then translate.
- **Interviewer pushes back on your case answer**: "That's a good point. If [their constraint], I'd change my recommendation to …" Adapting is the skill being tested.
