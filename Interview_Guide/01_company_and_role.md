# 01. Company and Role

## Eternal in one paragraph

Eternal Ltd is the listed parent (renamed from Zomato Ltd in 2025). It runs four businesses: **Zomato** (food delivery + dining), **Blinkit** (quick commerce, 10-minute delivery from dark stores), **District** (going out: movies, events, dining reservations), and **Hyperpure** (B2B supplies to restaurants). Blinkit is now the largest business by order value and the main growth engine; food delivery is the mature, profitable cash engine.

## Latest numbers: Q2 FY27 (quarter ended September 2026, reported 21 October 2026)

Verify each against the official shareholder letter before quoting. Figures below are from news coverage.

| Metric | Value | Note |
|---|---|---|
| Consolidated revenue | ₹24,138 cr, +78% YoY | Revenue jump is partly accounting: Blinkit moved to an inventory-owned model, so revenue now includes the goods' value |
| Net profit | ₹125 cr, +92% YoY | Small margin on large revenue; market saw it as a miss vs expectations |
| Adjusted EBITDA (consolidated) | ~₹666 cr | Reported +197% YoY |
| Blinkit NOV | ~₹20,940 cr, ~+79% YoY | Bigger than food delivery |
| Blinkit adjusted EBITDA | +₹184 cr (profit) | vs a loss of ₹156 cr in Q2 FY26: **quick commerce turned profitable** |
| Blinkit dark stores | 2,751 (308 net added in the quarter) | |
| Food delivery NOV | ₹11,445 cr, +21.5% YoY | Fifth straight quarter of accelerating growth (it bottomed at 14% in Q2 FY26) |
| Food delivery adjusted EBITDA | ₹627 cr, 5.5% of NOV | |
| District (going-out) NOV | ₹3,259 cr, +58% YoY | Adjusted EBITDA loss ₹64 cr (−2.0% of NOV) |
| Hyperpure adjusted EBITDA | ~₹10 cr | |
| Ad and sales promotion spend | ₹1,138 cr, +41% YoY | |

### Vocabulary they use (use it correctly)

- **GOV** (Gross Order Value): total value of orders including discounts, delivery fee, taxes, tips.
- **NOV** (Net Order Value): GOV minus discounts. Eternal now leads with NOV because heavy discounting can inflate GOV. In Q2 FY26, food delivery GOV grew 18% while NOV grew 14%: the gap was discounts. **Expect a question on why NOV is the better metric.** Answer: it reflects what customers actually pay, so it can't be inflated by buying growth with discounts.
- **Adjusted EBITDA as % of NOV**: the profitability yardstick per business.
- **Inventory-led vs marketplace model**: in marketplace, Blinkit takes a commission; in inventory, Blinkit owns and sells the goods. Revenue looks bigger in inventory model; compare businesses on NOV, not revenue.
- **Dark store**: small warehouse that serves a 2–3 km radius for 10-minute delivery.

### Strategic picture (talking points)
1. **Quick commerce is the growth story**; it just turned profitable. Key levers: store density, throughput per store, average order value, assortment breadth, ads income.
2. **Food delivery re-accelerated**: watch frequency, affordability (smaller-basket offerings), membership, and delivery time.
3. **Going-out is the investment bet**: growing fast, still loss-making.
4. **Competition**: Swiggy (Instamart + food), Zepto, Flipkart Minutes, Amazon Now, BigBasket in quick commerce. Don't trash competitors; frame as "the category is contested, so efficiency and customer experience decide share."

## What a Product Analyst at Eternal actually does

From the JD and reports, the day-to-day is:
- Define and own metrics for a product area (e.g., search, cart, checkout, delivery tracking, membership).
- Build dashboards and automated monitoring; investigate when a metric moves ("why did conversion drop in Pune yesterday?").
- Design and read out A/B tests with PMs; measure the impact of launched features.
- Answer ad hoc business questions with SQL fast.
- Work with Product, Engineering, Design, Business and Ops (city teams, fleet, restaurant partnerships).

## JD decoded (what each line will be tested with)

| JD line | How it gets tested |
|---|---|
| 1. Curiosity about user behavior, business problems, product journeys | "Walk me through the Zomato order journey; where would you look for drop-off?" "Which product of ours do you use; what would you change?" |
| 2. Customer experience, product metrics, experimentation, A/B testing | "Design an A/B test for X." "p-value means what?" "What metric would you pick?" |
| 3. Journeys, funnels, retention, growth, feature impact | Funnel/retention SQL; "how would you measure impact of feature X?" |
| 4. Ambiguous problems, structured thinking | RCA case; guesstimate; business case (Blinkit stores) |
| 5. Ownership: identification → execution → automation → impact | Resume deep-dive: "What did YOU do? How did you measure impact?" |
| 6. Automation, scalable reporting/monitoring | "How would you monitor X?" "Have you automated anything?" (Appetizer reports) |
| 7. Cross-functional collaboration | HR: "conflict with a stakeholder," "convince a team without authority" |
| 8. SQL, Excel, Python, viz | OA + technical round |

## Products to use before the interview (homework)

Use each for real, take screenshots, and write 3 observations each in `Interview_Guide/` notes:
1. **Zomato**: search → restaurant → cart → checkout → tracking → rating. Note membership offers, fee breakdown, ETA promise.
2. **Blinkit**: search, out-of-stock behavior, cart nudges, ETA, delivery fees/thresholds.
3. **District**: movie/event booking and dining reservation flow.

For each: one friction point, the metric that would show it, one fix, and how you'd A/B test it. This is your "product sense" ammunition and shows JD #1 curiosity.

## Questions to ask your interviewers (pick 2)
- "Which metric does your team own, and what moved it most in the last quarter?"
- "How are experiments run here: an internal platform, and what's a typical test duration?"
- "What does a strong first 90 days look like for an analyst on this team?"
- "What's one analysis your team wishes it had automated already?"
