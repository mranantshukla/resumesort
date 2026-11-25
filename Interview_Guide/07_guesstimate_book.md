# 07. Guesstimate Book: Study Guide

Book: *Guesstimate Book 2022–23*, Ramjas Consulting Society (Ramjas College, University of Delhi), 1st edition, March 2023. 50 solved guesstimates, 137 pages.

These are study notes. The book itself is copyrighted ("not to be reproduced"), so keep your PDF private and don't commit it to this repo.

**How this fits your plan:** use it on **Day 3** (guesstimate block, 2 hours) and as a **10-minute warm-up every other day**. Don't read it cover to cover. 17 of the 50 are worth your time for a Zomato interview; the rest are skippable.

---

## 1. The book's method (the part to memorize)

### Two directions
- **Top-down**: start from a big population and apply filters until you reach the answer. Example: India → urban → income group → % who eat out → frequency.
- **Bottom-up**: start from one unit's economics and multiply up. Example: plates per hour at one stall × hours × number of stalls.

### Three starting points
- **Demand side**: start from consumers (population, users, frequency).
- **Supply side**: start from sellers (outlets, capacity, throughput).
- **Unconventional**: area, volume or time based (how many tennis balls fit in a plane, how many ambulances cover India).

Most good answers mix both: build from supply, then cap it with demand ("the stall can make 30 plates an hour, but at 4 pm only 30% of that is demanded").

### The 7-step interview flow (book, p.10)
1. **Clarify** the prompt. Ask what every ambiguous word means.
2. **State assumptions** and get the interviewer's OK before calculating.
3. **Break it down** into parts first. This is your structure.
4. **Say the formula** for each part out loud as you go.
5. **Check key numbers** with the interviewer (population, % splits).
6. **Ballpark** if you run short of time: round everything.
7. **Sanity check** with a real-life reference or a second method.

### Rules from the book worth keeping
- Take 2 minutes at the start to build the structure. Ask for it if needed.
- The approach matters more than the number, but the number must not be absurd.
- Say "brownie point" ideas out loud (extra segments, edge cases); they score.
- Split your page into three areas: **assumptions | structure and calculation | side ideas**.
- Keep segments MECE: mutually exclusive, collectively exhaustive.

### What to add for a Product Analyst interview (not in the book)
The book is written for consulting. Analyst interviewers also want:
1. **Segment by time of day and day of week.** Food demand has lunch and dinner peaks and weekend spikes. The book does this for stalls and theatres; do it for every food question.
2. **Two methods, then compare.** Do demand side, then a quick supply-side or top-down check. If they're within ~2×, say so; if not, find which assumption is wrong. (See the Bengaluru orders example in [03_round_playbooks.md](03_round_playbooks.md#worked-example-daily-zomato-food-orders-in-bengaluru).)
3. **Name the most sensitive assumption.** "If order frequency is 3 instead of 4, the answer drops 25%." That's analyst thinking.
4. **Round hard.** The book shows answers like "127.2 plates" and "₹6,519". In an interview say "about 125 plates, roughly ₹6,500 a day".
5. **End with a decision.** "So one stall makes ~₹6.5k/day; a cloud kitchen on Zomato would need X orders to match." Numbers without a "so what" are half an answer.

---

## 2. The datasheet: use with corrections

The book's datasheet (p.5–6) has useful round numbers but several errors. Use the corrected column; still state each as an assumption in the interview.

| Item | Book says | Use instead (approx.) | Note |
|---|---|---|---|
| India population | 140 crore | 140–145 crore | Fine. (Guesstimate #4 typos it as "1.4 cr".) |
| Urban / rural | 40 / 60 | ~35–40 / 60–65 | The book itself uses 30/70 in #13. Pick one and stay consistent. |
| Gender split | 60 / 40 male/female | ~51.5 / 48.5 | Book number is wrong. |
| Household size | 4 urban, 5 rural | 4 urban, 4.5–5 rural | OK. |
| Smartphone users | 55% (70% urban, 30% rural) | OK as round numbers | |
| Internet users | 60% | OK as round numbers | |
| Income split | 50 / 40 / 10 low/mid/high | OK as a rough split | Say "for food delivery, the top ~10–15% drives most orders." |
| Delhi population | 3 crore | ~2.2–2.3 crore (NCT); ~3 crore+ with NCR | State which one you mean. |
| Mumbai population | 2 crore | ~1.3 crore city; ~2+ crore metro region | |
| Chennai population | 5–7 crore | ~1.1–1.2 crore metro | Book number is wrong. |
| Bangalore population | 10–12 crore | ~1.3–1.4 crore | Book number is wrong (off by 10×). |
| Delhi area | 1,500 sq km | ~1,480 sq km | Fine. |

Before the interview, memorize: India 140 crore, ~30–35 crore households, urban ~38%, Delhi ~2.2 crore, Bengaluru ~1.4 crore, Mumbai ~1.3 crore city, smartphone users ~70–75 crore.

---

## 3. Which guesstimates to study (priority for Zomato / Blinkit / District)

### Tier A: do these (10), with the Zomato version
| # | Book prompt | Why it matters for you | Practice the Zomato version |
|---|---|---|---|
| 3 | Revenue of a chhole bhature stall | Bottom-up capacity × demand by hour. The core restaurant model | Daily orders and NOV of one cloud kitchen on Zomato |
| 14 | Cheese burst pizzas sold in India per day | Outlets × hours × occupancy; dine-in vs delivery split. The book's brownie point literally mentions Zomato | Pizza orders on Zomato in Bengaluru on a Friday |
| 13 | People eating pav bhaji at lunch | Top-down with income filters and state popularity tiers | Biryani orders on Zomato in Hyderabad at lunch |
| 26 | Golgappas sold in Delhi per day | Supply side: vendors × capacity | Number of active restaurants on Zomato in Delhi |
| 2 | Weekly revenue of a multiplex | Multiple revenue streams (tickets, F&B, ads), weekday vs weekend occupancy | District: movie tickets sold in Gurugram on a weekend |
| 1 | Theatre revenue from one film's run | Week-by-week decay of demand | District: ticket sales of a big release over 6 weeks |
| 12 | Delhi Metro daily riders | Capacity × frequency × peak/non-peak load | Blinkit: orders one dark store can handle in its peak hour |
| 49 | Will you get a giant-wheel ride? (full dialogue) | Queue and throughput reasoning, and the only one written as a real interview conversation. Read it fully | Riders needed in Gurugram at Friday 8 pm |
| 19 | Indians on Twitter | User funnel: population → internet → smartphone → social media → app | Monthly transacting users of a food delivery app in India |
| 28 | Monthly mobile data usage | Users × usage by segment | Monthly Blinkit orders from tier-2 cities |

### Tier B: if time (7)
| # | Prompt | Use it for |
|---|---|---|
| 21 | Roses sold on 14 Feb in Delhi | Event-day spikes: Blinkit Valentine's Day demand |
| 40 | Indians awake at midnight | Late-night ordering window |
| 20 | Rakhis sold online | Online penetration filter on a festival purchase |
| 7 | Chewing gum market size | Market sizing by product type |
| 8 | Maternity clothes market | Life-stage funnel (births → buyers) |
| 36 | Total smartphone storage in Delhi | Ownership × distribution of variants |
| 35 | Indians airborne at any moment | "At any instant" style: daily volume × duration ÷ 24h |

### Tier C: skip for this interview
Diyas oil (#4), water in a bungalow (#5), popcorn on the floor (#6), scrap glass (#9), tyres (#10), white shirts (#11), red Swifts (#15), emojis (#16), cycles (#17), phone talkers (#18), Uno cards (#22), crows (#23), WhatsApp DPs (#24), tennis balls in a 747 (#25), band-aids (#27), missed trains (#29), fire extinguishers (#30), ATMs (#31), light bulbs (#32), mirrors (#33), CCTV (#34), AC hours (#37), 29 Feb birthdays (#38), lost keys (#39), video games (#41), Rubik's cubes (#42), books read (#43), lakes (#44), APAC aircraft (#45), brokerage (#46), ambulances (#47), chairs (#48), wheels and doors (#50).

---

## 4. Tier A walkthroughs

For each: try it yourself first (timed, 5 minutes), then compare with the book's structure below, then do the Zomato version.

### #3 Chhole bhature stall revenue (bottom-up, supply capped by demand)
**Book's structure:** split the 9-hour day into peak (3h), mid (4h) and non-peak (2h) → time to make one plate (2 min base, slower at peak) → plates possible per hour (20 / 23 / 30) → multiply by demand % in each band (90% / 60% / 30%) → plates sold (~127) → split eat-in 75% at ₹50, takeaway 25% at ₹55 → **about ₹6,500 per day**.
**What's good:** capacity is limited by kitchen speed, and demand fills it differently by hour. That's exactly how a restaurant on a delivery app works.
**Critique:** the stall is assumed to be capacity-bound only at peak; check that demand never exceeds capacity. Also round: "~125 plates, ~₹6.5k".
**Zomato version:** *"Estimate daily delivery orders and NOV for one mid-size cloud kitchen in Bengaluru."* Kitchen throughput per hour × lunch and dinner windows × demand % → orders → × AOV → NOV; then commission % → what the platform earns from it.

### #14 Cheese burst pizzas sold in India per day (outlets × throughput)
**Book's structure:** number of outlets by city tier (about 1,900 total) → per outlet: dine-in tables × occupancy × table turns, plus delivery orders per hour, split peak (7 pm–12 am) and non-peak → % ordering cheese burst → about 150 per store → scale by outlet type → **about 1.5 lakh per day**.
**What's good:** separates dine-in and delivery, and peak and non-peak.
**Critique:** it models only one pizza chain; the prompt says all of India. Say that scope choice out loud ("I'll size it for the largest chain, then add ~X% for others").
**Zomato version:** *"How many pizza orders does Zomato deliver in Bengaluru on a Friday?"* Demand side: users × % ordering that day × % choosing pizza. Supply check: pizza outlets × delivery orders per hour × hours.

### #13 Pav bhaji at lunch (top-down with segmentation)
**Book's structure:** India → urban/rural → five income bands → % who eat lunch (minus 2% skipping) → states grouped by how popular pav bhaji is (40% of population where popular: 1 in 50; 50% moderate: 1 in 1,000; 10% rare: 0) → **about 72 lakh people**.
**What's good:** the "popularity tier by state" filter is a smart way to handle regional food habits.
**Critique:** uses 30% urban here but 40% in its own datasheet; be consistent.
**Zomato version:** *"How many biryani orders does Zomato get in Hyderabad at lunch?"* Hyderabad population → online-ordering households → % ordering lunch today → % choosing biryani (high, regional dish) → orders.

### #26 Golgappas sold in Delhi per day (supply side)
**Book's structure:** how many golgappas one stall's container holds (volume ÷ size, minus breakage) × number of stalls and shops in Delhi → total.
**Zomato version:** *"How many restaurants are active on Zomato in Delhi?"* Supply side: restaurants per 1,000 people by area type × population × % listed online. Sanity-check against demand: orders per day ÷ average orders per restaurant.

### #2 Weekly multiplex revenue (multi-stream revenue)
**Book's structure:** seats (5 screens × 300) × shows × occupancy (weekday vs weekend; hit vs flop films) × ticket price, plus F&B (60% buy food, meals shared between 2 people), plus ads (10 per show) → weekly revenue.
**District version:** *"How many movie tickets does District sell in Gurugram on a weekend?"* Screens in the city × shows × seats × occupancy × % of tickets booked online × District's share.

### #1 One film's theatre revenue (decay over time)
**Book's structure:** shows per day per hall × capacity × occupancy that falls in weeks 1–2, 3–4, 5–6 (the film moves to non-peak slots by the end) × ₹450 ticket.
**Brownie points the book gives:** a ₹75 "National Cinema Day" fell during the run; add F&B revenue.
**District version:** *"Ticket sales of a big release on District over 6 weeks."* Same decay curve. This is a cohort-decay idea; link it to retention curves in the [Metrics Lab](../Metrics_Lab/index.html).

### #12 Delhi Metro daily riders (capacity × frequency)
**Book's structure:** lines × trips per hour per direction (busy vs quiet hours) × coaches × seats plus standing capacity × load factor.
**Blinkit version:** *"How many orders can one dark store handle in its peak hour?"* Pickers × picks per minute × items per order → orders per hour; then cap by riders available × deliveries per rider per hour. The bottleneck is the smaller of the two.

### #49 Giant wheel queue (read the full dialogue)
The only guesstimate written as a live interview conversation. Read it for **how to talk**: restate the problem, ask what data exists, propose assumptions and ask "does this sound fair?", then compute. It also models throughput (20 cabins × 5 people per 20-minute cycle = 100 riders per cycle) and peak-hour queues.
**Zomato version:** *"How many delivery riders does Zomato need in Gurugram at Friday 8 pm?"* Peak-hour orders ÷ deliveries per rider per hour (round trip time) + buffer for rain or surge.

### #19 Indians on Twitter (user funnel)
**Book's structure:** population → urban/rural → income → age → internet → smartphone → social media → Twitter users → minus inactive accounts.
**Zomato version:** *"How many monthly transacting users does a food delivery app have in India?"* Population → urban → income able to order → smartphone + digital payments → ordered in the last month → app share. Compare to any number you remember from public filings as a sanity check.

### #28 Monthly mobile data usage (usage by segment)
**Book's structure:** internet users by urban/rural and income → network type (4G/5G) → average monthly GB per segment → total.
**Blinkit version:** *"Monthly Blinkit orders from tier-2 cities."* Households in tier-2 cities served by dark stores × adoption % × orders per month by income segment.

---

## 5. Errors in the book to learn from

Spotting these is good practice for the "sanity check" step.
- **Inconsistent base numbers:** urban share is 40% in the datasheet and 30% in #13.
- **Typos with big effects:** #4 says India's population is "1.4 cr" (should be 140 crore). A 100× error.
- **Wrong city populations:** Bangalore "10–12 crore", Chennai "5–7 crore" (both about 10× too high).
- **False precision:** "127.2 plates", "₹6,519". In an interview, round.
- **Scope drift:** #14 asks about "India" but models one chain. Fine if stated, wrong if not.

---

## 6. Practice schedule

| When | What | Time |
|---|---|---|
| Day 3, block 5 | Tier A #3, #14, #13, #12, #49 (read dialogue), #19: try each for 5 min, compare, then do the Zomato version | 2 h |
| Day 4 evening | Tier A #2, #1, #26, #28: Zomato/District versions only | 45 min |
| Day 5 morning | 2 random Tier B prompts, cold, timed | 15 min |
| Interview morning | One Tier A Zomato version as a warm-up | 5 min |
| Anytime | Send `mock guesstimate` to Claude for a live round | 15 min |

## 7. Answer template (copy onto paper)

```
PROMPT: ______________________   Clarify: what / where / when / unit
ASSUMPTIONS (agree first)        | STRUCTURE (formula tree)        | SIDE IDEAS
- population / segment           | A × B × C                        | - brownie points
- time window (peak/off-peak)    | segment 1: ...                   | - edge cases
- key rates                      | segment 2: ...                   |
CALCULATION (round!)             -> ANSWER: ~X (range X/2 to 2X)
SANITY CHECK: second method or known reference -> within ~2x?
MOST SENSITIVE ASSUMPTION: ___   SO WHAT: ___
```
