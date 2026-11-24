# 02. Process and Online Assessment

## The process (what to expect)

Assembled from candidate reports across several years. Campus drives (like IIT Roorkee's) compress this into 1–2 days.

| Stage | Duration | Content reported | Elimination risk |
|---|---|---|---|
| Resume shortlist | — | CGPA, analytics projects, internships | Medium |
| Online Assessment | 90–120 min, proctored | Aptitude/logical reasoning (one report: CAT-like), SQL written from scratch (medium–hard; "4 SQL questions" in one report), some stats/data interpretation | **Highest**: most candidates are cut here |
| Technical round | 30–60 min | Live SQL (joins incl. self join, window functions, RANK, LAG/LEAD, pivoting, grouping sets, order of execution), stats (p-value, Gaussian, sampling, t-test, central tendency, box plot), guesstimate | High |
| Case round | 30–60 min | RCA (order/AOV/cancellation drop), business case (e.g., "open 1,100 Blinkit stores," "which metric should Zomato optimize"), resume deep-dive | High |
| HM / HR | 20–40 min | Why Eternal, why analytics, ownership, conflict, failure | Low–medium |

Some years report only 2 interview rounds after the OA; some combine technical and case. Prepare for all content in every round.

## OA deep-dive

### Section A: Aptitude and logic
Reported difficulty ranges from "basic" to "CAT-level, medium–hard." Expect:
- Percentages, ratios, profit/loss, time-speed-distance, time-work, averages, mixtures
- Probability and permutations/combinations (basic)
- Data interpretation: tables/charts with 3–5 questions each
- Logical reasoning: arrangements, syllogisms, series, puzzles

**Prep**: 30 minutes a day for 10 days. Use any CAT-level quant/DI book or free online sets. Time yourself: target ~1 minute per question.

### Section B: SQL (the one that decides)
Reported: SQL written from scratch, no MCQ crutch; medium to hard; window functions and ranking are central. Sample prompt from prep sites: "Top 5 customers by revenue in the last 30 days."

**Rules for the OA SQL section**
1. Read the schema first. Note primary keys, nullable columns, date types.
2. Before writing, say the output grain to yourself: "one row per city per month."
3. Build with CTEs, one step per CTE. Easier to debug under pressure.
4. Handle ties (RANK vs DENSE_RANK vs ROW_NUMBER: pick deliberately) and NULLs (COALESCE, LEFT JOIN).
5. Run on the sample data; check row counts make sense.
6. If stuck, submit a partial query that passes some test cases; move on and come back.

**Dialect**: HackerRank usually lets you choose MySQL / MS SQL / Oracle / DB2. Practice in **MySQL 8** (has window functions and CTEs). Know MySQL date functions: `DATE_SUB`, `DATEDIFF`, `DATE_FORMAT`, `CURDATE()`, `INTERVAL`.

### Section C: Stats / data interpretation (sometimes)
Mean vs median vs mode on skewed data, standard deviation, reading box plots (median, IQR, outliers), basic probability, interpreting a p-value, correlation vs causation.

## OA-style SQL problems (practice set with solutions)

Schema used below:
```
users(user_id, signup_date, city)
orders(order_id, user_id, restaurant_id, order_ts, amount, status)   -- status: delivered / cancelled
restaurants(restaurant_id, name, city, cuisine)
```

**1. Top 5 customers by delivered revenue in the last 30 days**
```sql
SELECT user_id, SUM(amount) AS revenue
FROM orders
WHERE status = 'delivered'
  AND order_ts >= CURDATE() - INTERVAL 30 DAY
GROUP BY user_id
ORDER BY revenue DESC
LIMIT 5;
```
Follow-up they may ask: "What if two users tie at rank 5?" Use `DENSE_RANK()` in a CTE and filter `rnk <= 5`.

**2. Second-highest order value in each city**
```sql
WITH ranked AS (
  SELECT r.city, o.order_id, o.amount,
         DENSE_RANK() OVER (PARTITION BY r.city ORDER BY o.amount DESC) AS rnk
  FROM orders o
  JOIN restaurants r ON r.restaurant_id = o.restaurant_id
)
SELECT city, order_id, amount FROM ranked WHERE rnk = 2;
```

**3. Users who ordered in January 2026 but not in February 2026**
```sql
SELECT DISTINCT o.user_id
FROM orders o
WHERE o.order_ts >= '2026-01-01' AND o.order_ts < '2026-02-01'
  AND NOT EXISTS (
    SELECT 1 FROM orders o2
    WHERE o2.user_id = o.user_id
      AND o2.order_ts >= '2026-02-01' AND o2.order_ts < '2026-03-01');
```
Why `NOT EXISTS` over `NOT IN`: `NOT IN` returns nothing if the subquery contains a NULL.

**4. D7 retention by signup week** (did the user order between day 1 and day 7 after signup?)
```sql
WITH base AS (
  SELECT u.user_id,
         DATE_SUB(u.signup_date, INTERVAL WEEKDAY(u.signup_date) DAY) AS signup_week,
         MAX(CASE WHEN o.order_ts >= u.signup_date + INTERVAL 1 DAY
                   AND o.order_ts <  u.signup_date + INTERVAL 8 DAY THEN 1 ELSE 0 END) AS retained
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.user_id AND o.status = 'delivered'
  GROUP BY u.user_id, signup_week
)
SELECT signup_week, COUNT(*) AS users, ROUND(AVG(retained) * 100, 1) AS d7_retention_pct
FROM base GROUP BY signup_week ORDER BY signup_week;
```

**5. Days between consecutive orders per user, and average gap**
```sql
WITH g AS (
  SELECT user_id, order_ts,
         DATEDIFF(order_ts, LAG(order_ts) OVER (PARTITION BY user_id ORDER BY order_ts)) AS gap_days
  FROM orders WHERE status = 'delivered'
)
SELECT user_id, AVG(gap_days) AS avg_gap FROM g WHERE gap_days IS NOT NULL GROUP BY user_id;
```

**6. Longest streak of consecutive order days per user (gaps and islands)**
```sql
WITH d AS (
  SELECT DISTINCT user_id, DATE(order_ts) AS dt FROM orders
), numbered AS (
  SELECT user_id, dt, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY dt) AS rn
  FROM d
), grp AS (
  -- consecutive dates minus a consecutive counter give the same "island" date
  SELECT user_id, dt, DATE_SUB(dt, INTERVAL rn DAY) AS island FROM numbered
)
SELECT user_id, MAX(streak) AS longest_streak
FROM (SELECT user_id, island, COUNT(*) AS streak FROM grp GROUP BY user_id, island) s
GROUP BY user_id;
```

**7. Month-over-month NOV growth per city**
```sql
WITH m AS (
  SELECT r.city, DATE_FORMAT(o.order_ts, '%Y-%m') AS mon, SUM(o.amount) AS nov
  FROM orders o JOIN restaurants r USING (restaurant_id)
  WHERE o.status = 'delivered'
  GROUP BY r.city, mon
)
SELECT city, mon, nov,
       ROUND(100 * (nov - LAG(nov) OVER (PARTITION BY city ORDER BY mon))
             / LAG(nov) OVER (PARTITION BY city ORDER BY mon), 1) AS mom_pct
FROM m;
```

**8. Cancellation rate by restaurant, only restaurants with ≥ 50 orders, worst 10**
```sql
SELECT restaurant_id,
       COUNT(*) AS orders,
       ROUND(100 * AVG(status = 'cancelled'), 2) AS cancel_pct
FROM orders
GROUP BY restaurant_id
HAVING COUNT(*) >= 50
ORDER BY cancel_pct DESC
LIMIT 10;
```
(`AVG(status = 'cancelled')` works in MySQL because a boolean is 0/1. In other dialects use `AVG(CASE WHEN ... THEN 1.0 ELSE 0 END)`.)

**9. Pivot: orders per cuisine as columns, per city as rows**
```sql
SELECT r.city,
       SUM(r.cuisine = 'North Indian') AS north_indian,
       SUM(r.cuisine = 'Chinese')      AS chinese,
       SUM(r.cuisine = 'Pizza')        AS pizza
FROM orders o JOIN restaurants r USING (restaurant_id)
GROUP BY r.city;
```

**10. Self-join: users who ordered from the same restaurant on two different days within 7 days**
```sql
SELECT DISTINCT a.user_id, a.restaurant_id
FROM orders a
JOIN orders b
  ON a.user_id = b.user_id
 AND a.restaurant_id = b.restaurant_id
 AND DATE(b.order_ts) > DATE(a.order_ts)
 AND DATE(b.order_ts) <= DATE(a.order_ts) + INTERVAL 7 DAY;
```

### SQL theory they ask verbally
- **Logical order of execution**: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → window functions → DISTINCT → ORDER BY → LIMIT. (So you can't use a SELECT alias in WHERE, and you can't filter on a window function without a CTE/subquery.)
- **WHERE vs HAVING**; **UNION vs UNION ALL** (dedupe vs keep all; UNION ALL is faster).
- **RANK vs DENSE_RANK vs ROW_NUMBER** on ties: 1,1,3 / 1,1,2 / 1,2,3.
- **Join row counts**: a LEFT JOIN can return *more* rows than the left table if the right side has duplicate keys.
- **COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col)**.
- **GROUPING SETS / ROLLUP**: subtotals in one query (ROLLUP in MySQL: `GROUP BY city, cuisine WITH ROLLUP`).
- **Indexes** at a basic level: speed up lookups/joins; slow down writes.

## 10-day OA sprint

| Day | SQL (60–90 min) | Aptitude (30 min) |
|---|---|---|
| 1 | Joins, GROUP BY, HAVING: 10 easy | Percentages, ratios |
| 2 | Subqueries, CTEs, NOT EXISTS: 8 easy-medium | Profit/loss, averages |
| 3 | ROW_NUMBER / RANK / DENSE_RANK top-N: 8 medium | Time-speed-distance |
| 4 | LAG/LEAD, running totals: 8 medium | Time-work, mixtures |
| 5 | Date functions, retention, cohorts: 6 medium | DI sets (2) |
| 6 | Gaps and islands, streaks, sessionization: 5 hard | Probability, P&C |
| 7 | Pivot, ROLLUP, self-joins: 6 medium | Logical reasoning |
| 8 | Timed mock: 4 SQL in 60 min | DI sets (2) |
| 9 | Review mistakes; redo the 5 hardest | Puzzles |
| 10 | Timed full mock OA (problems 1–10 above, cold) | Full timed aptitude set |

Practice platforms candidates recommend: LeetCode (SQL 50 + Advanced SQL 50), HackerRank SQL, InterviewBit, StrataScratch.
