# Interview Guide: Eternal (Zomato) Product Analyst

The research layer of this repo. [masterplan.md](../masterplan.md) is the schedule; this folder is the content you study and rehearse.

| File | What's in it |
|---|---|
| [01_company_and_role.md](01_company_and_role.md) | Eternal's businesses, latest numbers (Q2 FY27), what a Product Analyst there actually does, the JD decoded |
| [02_process_and_OA.md](02_process_and_OA.md) | The rounds, OA format, past OA patterns, OA strategy, mock OA |
| [03_round_playbooks.md](03_round_playbooks.md) | How to excel in each round: SQL, stats, guesstimate, RCA case, product sense, HR. Worked examples |
| [04_resume_defense.md](04_resume_defense.md) | Line-by-line resume defense: the attack question, the trap, the answer skeleton |
| [05_question_bank.md](05_question_bank.md) | 120+ practice questions grouped by round, with priority |
| [06_resources.md](06_resources.md) | Videos, blogs, free PDFs, books and practice sites, mapped to each day of the 5-day plan |

## The research in one page

**What the process looks like** (pieced together from candidate reports; varies by year and by campus vs off-campus):

```
Resume shortlist
   ↓
Online Assessment  ── 90–120 min, proctored (HackerRank-style)
   │                  aptitude/logic (some say CAT-level) + SQL written from scratch (medium–hard)
   │                  + sometimes stats MCQs / data interpretation
   ↓
Round 1 (technical) ─ SQL live (joins, window functions, ranking, LAG/LEAD, pivot)
   │                  + stats basics (p-value, distributions, central tendency, box plots, t-test)
   │                  + often a guesstimate
   ↓
Round 2 (case)  ───── RCA case ("orders/AOV dropped, find why") or business case
   │                  ("open 1,100 Blinkit stores", "which metric should Zomato optimize")
   │                  + resume/project deep-dive
   ↓
Round 3 (HM / HR) ─── motivation, ownership, behavioral, culture fit
```

**Five consistent signals across every report:**
1. **SQL is the highest-weight skill.** Window functions, ranking, joins (incl. self-join), and query-order-of-execution show up in nearly every account.
2. **Guesstimates and RCA cases are standard.** They grade structure, not the final number.
3. **Stats is asked "out of the blue."** p-value, Gaussian distribution, random sampling, t-test, central tendency, box plots.
4. **Your projects get used against you.** Interviewers take a method from your resume (one candidate: Monte Carlo) and make you apply it to a Zomato problem on the spot.
5. **Product context matters.** Candidates who tied answers to Blinkit's 10-minute model, delivery latency, or restaurant-side context were rated well.

**What this means for you (Anant):**
- Your strongest resume match to the JD is **Appetizer** (ownership + automation, JD #5, #6) and **VK Global** (A/B, cohorts, SQL, JD #2, #3).
- Your highest-risk items are the **Swiggy Sense** project (competitor; revenue-model numbers will be attacked), the **AI Velocity** percentages (absolute vs relative), and the **year inconsistency** on the resume.
- Your gap to close fastest is **live SQL speed** and **guesstimate fluency**.

## Confidence and sources

Process details come from candidate reports (Glassdoor, Medium, campus placement blogs) and prep sites. They are anecdotal and vary by year; confirm the format from your invite email or the placement cell. Company numbers come from news coverage of Eternal's Q2 FY27 results (October 2026); check the official shareholder letter before quoting any number in an interview.

The full pages (Glassdoor, Medium, Dataford, PlacementPapers) could not be opened from this environment; the findings above are from search-result summaries of those pages. Read them yourself for exact question wording.

Sources:
- [Glassdoor: Zomato Product Analyst interview questions](https://www.glassdoor.co.in/Interview/Zomato-Product-Analyst-Interview-Questions-EI_IE515676.0,6_KO7,22.htm)
- [Glassdoor: "4 SQL questions… 1 case study on how to open 1,100 Blinkit stores"](https://www.glassdoor.com/Interview/4-sql-questions-majorly-on-joins-and-window-function-Gustimate-1-case-study-on-how-to-1100-open-blinkit-store-in-india-QTN_8846675.htm)
- [Glassdoor: guesstimate + central tendency + joins + box plot](https://www.glassdoor.com/Interview/In-the-interview-they-asked-about-1-guesstimate-1-statistics-question-based-on-the-finding-central-tendency-measures-and-QTN_8669451.htm)
- [Medium: Zomato Product Analyst interview experience](https://medium.com/@bhavya.learncode/zomato-product-analyst-interview-experience-6e79958b1b3f)
- [Medium: Foresight 2025, placement at Zomato (IIT Kharagpur)](https://medium.com/@swgiitkgp/foresight-2025-placement-at-zomato-md-zaid-alam-e3a47a1fe9f4)
- [Dataford: Zomato Product Analyst guide](https://dataford.io/interview-guides/zomato/product-analyst)
- [Dataford: Zomato Business Analyst guide](https://dataford.io/interview-guides/zomato/business-analyst)
- [PlacementPapers: Zomato (Eternal) OA questions](https://placementpapers.app/zomato/online-assessment/)
- [Skillsetmaster: Zomato Product Analyst questions](https://skillsetmaster.com/data-analyst-interview/zomato/product-analyst)
- [Glassdoor: Blinkit Business Analyst interviews](https://www.glassdoor.com/Interview/Blinkit-Business-Analyst-Interview-Questions-EI_IE1007293.0,7_KO8,24.htm)
- [Eternal: Q2 FY26 shareholders' letter (blog)](https://www.eternal.com/blog/q2fy26-dbaadd03/)
- [Eternal Q2 FY26 shareholders' letter (PDF)](https://b.zmtcdn.com/investor-relations/Eternal_Shareholders_Letter_Q2FY26_Results.pdf)
- [Business Standard: Eternal Q2 FY27 results](https://www.business-standard.com/amp/companies/quarterly-results/eternal-q2fy27-net-profit-jumps-92-to-125-crore-revenue-rises-78-126102101130_1.html)
- [Entrackr: Eternal Q2 FY27](https://entrackr.com/fintrackr/eternal-reports-rs-24138-cr-revenue-and-rs-125-cr-profit-in-q2-fy27-12695688)
- [Investywise: Eternal Q2 FY27 segment results](https://www.investywise.com/eternal-limited-shareholder-letter-and-q2fy27-results)
- [Afaqs: Eternal ad spend Q2 FY27](https://www.afaqs.com/news/mktg/eternals-ad-and-sales-promotion-expenses-rise-41-to-rs-1138-crore-in-q2fy27-12696230)
- [Multibagg: Eternal Q2 FY27 (Hyperpure, store expansion)](https://www.multibagg.ai/market-pulse/articles/eternal-q2fy27-f940c7d5-5973-48a2-ba13-73cfc845335e)
