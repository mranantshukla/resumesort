# 05. Question Bank

Priority: **P0** = reported in actual Zomato/Blinkit analyst interviews or near-certain; **P1** = likely; **P2** = good practice.
Mark each `[x]` once you can answer it cold, out loud, in the time limit.

## SQL (verbal + written), 15–20 min each

- [ ] P0 Top N customers/restaurants by revenue in last 30 days; handle ties
- [ ] P0 Second / Nth highest value per group (DENSE_RANK)
- [ ] P0 Explain RANK vs DENSE_RANK vs ROW_NUMBER with an example
- [ ] P0 Inner vs left vs right vs full vs self join; row counts with duplicate keys
- [ ] P0 Logical order of SQL execution
- [ ] P0 LAG/LEAD: days between orders; WoW change
- [ ] P0 Users who ordered in month A but not month B
- [ ] P0 D1/D7/D30 retention by signup cohort
- [ ] P0 Funnel conversion: app open → menu → cart → checkout → payment
- [ ] P1 Pivot: rows to columns with CASE WHEN
- [ ] P1 GROUPING SETS / ROLLUP subtotals
- [ ] P1 UNION vs UNION ALL
- [ ] P1 Running total and 7-day moving average
- [ ] P1 Longest streak of consecutive order days
- [ ] P1 Sessionize events with a 30-minute gap
- [ ] P1 Find duplicate rows and delete all but one
- [ ] P1 Employees who are not managers (self join / anti join) (reported at Blinkit)
- [ ] P1 Median without a MEDIAN function
- [ ] P2 Percentage of orders above each city's average order value
- [ ] P2 Restaurants whose rating dropped 3 months in a row

## Statistics and experimentation

- [ ] P0 Explain p-value to a PM (2 sentences)
- [ ] P0 Gaussian distribution and why it matters (CLT)
- [ ] P0 Random sampling: what and why
- [ ] P0 Mean vs median vs mode; which for delivery time and why
- [ ] P0 Read and explain a box plot
- [ ] P0 Hypothesis testing steps; t-test vs z-test vs chi-square
- [ ] P0 Design an A/B test for [new checkout / ETA display / recommendation carousel]
- [ ] P0 Type I vs Type II error; power; MDE
- [ ] P1 Sample size for 10% → 11% conversion at 80% power (≈14,400/arm)
- [ ] P1 The test is significant but the lift is tiny: ship it?
- [ ] P1 SRM: 52/48 split. What do you check?
- [ ] P1 Novelty effect: lift fades after week 1
- [ ] P1 Peeking at results daily: why it's a problem
- [ ] P1 Network effects in a marketplace test; switchback/city-level designs
- [ ] P1 Correlation vs causation with a Zomato example (Gold members order more)
- [ ] P1 Simpson's paradox example
- [ ] P1 Confidence interval interpretation
- [ ] P2 CUPED / variance reduction in one paragraph
- [ ] P2 Difference-in-differences: measure a feature launched only in Pune
- [ ] P2 Monte Carlo: simulate % of orders under 30 minutes if prep time drops 2 minutes
- [ ] P2 Multiple testing: 20 metrics, one is significant

## Guesstimates (5 min each)

- [ ] P0 Daily Zomato food orders in Bengaluru (worked in [03](03_round_playbooks.md))
- [ ] P0 Daily orders from one Blinkit dark store
- [ ] P1 Riders needed in Gurugram at Friday 8 pm peak
- [ ] P1 Monthly platform-fee revenue for Zomato
- [ ] P1 Number of restaurants on Zomato in Delhi NCR
- [ ] P1 Number of pizzas ordered in India on a Saturday
- [ ] P2 District movie tickets in Mumbai on a weekend
- [ ] P2 Number of dark stores needed to cover Hyderabad

## RCA cases (10 min each)

- [ ] P0 Orders dropped 15% in one zone yesterday
- [ ] P0 AOV dropped 8% WoW in a tier-1 city, traffic steady
- [ ] P0 Cancellations up 20% in Lucknow this week
- [ ] P1 Average delivery time up 4 minutes nationwide
- [ ] P1 Blinkit search-to-cart conversion dropped on Android only
- [ ] P1 Restaurant ratings dropped on average in one city
- [ ] P1 New-user D7 retention dropped for the March cohort
- [ ] P2 Payment success rate fell 3 pp at 9 pm
- [ ] P2 Zomato Gold renewals dipped this month

## Business / product cases (15–20 min)

- [ ] P0 How would you open 1,100 Blinkit stores in India? (reported)
- [ ] P0 Which one metric should Zomato optimize, and how? (reported)
- [ ] P1 Should Zomato raise the platform fee by ₹2? How would you decide?
- [ ] P1 Should Blinkit lower the free-delivery threshold?
- [ ] P1 How would you measure the success of a group-ordering feature?
- [ ] P1 Improve Zomato's search/recommendations; define metric and test
- [ ] P1 District dining reservations are growing but loss-making: what would you analyze?
- [ ] P1 Design a monitoring dashboard + alerting for delivery time across cities
- [ ] P2 How would you detect fraudulent refund claims?
- [ ] P2 Should Zomato launch in a new tier-3 city? Build the decision.
- [ ] P2 Evaluate a 10-minute food delivery offering

## Product sense

- [ ] P0 What do you like/dislike in the Zomato app? (Use it first)
- [ ] P0 Walk me through the Zomato ordering journey and the metric at each step
- [ ] P1 Which Blinkit feature would you build next and how would you measure it?
- [ ] P1 Why does Eternal report NOV instead of GOV?
- [ ] P1 How does Blinkit make money? (Margin on goods, delivery/handling fees, ads)
- [ ] P2 Compare Blinkit's model with a marketplace model

## Resume (see [04](04_resume_defense.md))

- [ ] P0 Walk me through your resume (90 s)
- [ ] P0 VK: how was 18% measured; was it causal?
- [ ] P0 VK: A/B test details
- [ ] P0 AI Velocity: absolute vs relative; why accept the regression
- [ ] P0 Appetizer: impact numbers; your role; how AI reports stay accurate
- [ ] P0 Swiggy Sense: why Swiggy; revenue tree; 7.6x ROI basis; 6 risks
- [ ] P1 Decoding Customer Value: churn definition with no label
- [ ] P1 LCA: define the 25% engagement metric
- [ ] P1 Research paper: method, validation metric, your contribution, limitation
- [ ] P1 Apply a method from your resume to a Zomato problem

## HR / behavioral

- [ ] P0 Why Eternal? Why Product Analyst?
- [ ] P0 Why analytics after civil engineering?
- [ ] P0 Tell me about a time you owned something end to end
- [ ] P1 Conflict with a stakeholder
- [ ] P1 A failure and what you learned
- [ ] P1 Leading without authority
- [ ] P1 Prioritizing many tasks with a deadline
- [ ] P1 A time data changed your mind
- [ ] P2 Where do you see yourself in 3 years?
- [ ] P2 Comfortable relocating to Gurugram?
- [ ] P2 Questions for us?
