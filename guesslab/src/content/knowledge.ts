import type { Reliability } from "@/engine/types";

export interface Formula {
  name: string;
  tex: string;
  meaning: string;
  example: string;
}

export const FORMULAS: { group: string; items: Formula[] }[] = [
  {
    group: "Business fundamentals",
    items: [
      { name: "Revenue", tex: "\\text{Revenue} = \\text{Volume} \\times \\text{Price}", meaning: "What customers pay.", example: "200 plates × ₹80 = ₹16,000 a day." },
      { name: "Gross margin", tex: "\\text{Gross margin} = \\dfrac{\\text{Revenue} - \\text{COGS}}{\\text{Revenue}}", meaning: "Share of revenue left after the direct cost of what you sold.", example: "₹16,000 revenue, ₹7,000 ingredients → 56%." },
      { name: "Average order value", tex: "\\text{AOV} = \\dfrac{\\text{Order value}}{\\text{Orders}}", meaning: "Basket size per order. Say whether it's before or after discounts.", example: "₹45 lakh ÷ 10,000 orders = ₹450." },
      { name: "GOV vs NOV", tex: "\\text{NOV} = \\text{GOV} - \\text{Discounts}", meaning: "Gross vs net order value. NOV can't be inflated by buying growth with discounts.", example: "GOV ₹100, discount ₹12 → NOV ₹88." },
      { name: "Take rate", tex: "\\text{Take rate} = \\dfrac{\\text{Platform revenue}}{\\text{Order value}}", meaning: "How much of each order the platform keeps (commission + fees + ads).", example: "₹135 kept on a ₹450 order = 30%." },
      { name: "ARPU", tex: "\\text{ARPU} = \\dfrac{\\text{Revenue}}{\\text{Users}}", meaning: "Revenue per user. Define which users (monthly active vs transacting).", example: "₹180 crore ÷ 2.25 crore users = ₹80." },
      { name: "Contribution margin per order", tex: "\\text{CM} = \\text{Revenue per order} - \\text{Variable cost per order}", meaning: "Profit from one more order, before fixed costs.", example: "₹135 kept − ₹119 delivery, discount, payment costs = ₹16." },
      { name: "Lifetime value", tex: "\\text{LTV} = \\text{CM per order} \\times \\text{Orders per month} \\times \\text{Lifetime (months)}", meaning: "Value of a customer over their life. Build it on margin, not revenue.", example: "₹16 × 4 × 18 ≈ ₹1,150." },
      { name: "CAC payback", tex: "\\text{Payback} = \\dfrac{\\text{CAC}}{\\text{CM per order} \\times \\text{Orders per month}}", meaning: "Months to earn back acquisition cost.", example: "₹150 ÷ (₹16 × 4) ≈ 2.3 months." },
      { name: "TAM, SAM, SOM", tex: "\\text{SOM} \\subseteq \\text{SAM} \\subseteq \\text{TAM}", meaning: "Total market, the part you can serve, and the part you can realistically win.", example: "TAM: all urban food spend; SAM: delivery in your cities; SOM: your likely share." },
    ],
  },
  {
    group: "Product metrics",
    items: [
      { name: "Stickiness", tex: "\\text{Stickiness} = \\dfrac{\\text{DAU}}{\\text{MAU}}", meaning: "How many days a month the average monthly user shows up.", example: "30 lakh ÷ 1.5 crore = 20% ≈ 6 days a month." },
      { name: "Day-N retention", tex: "R_N = \\dfrac{\\text{Users from cohort active on day } N}{\\text{Cohort size}}", meaning: "Early product value and habit.", example: "2,800 of 10,000 ordered again within 7 days → 28%." },
      { name: "Churn rate", tex: "\\text{Churn} = \\dfrac{\\text{Active last period, not this period}}{\\text{Active last period}}", meaning: "How fast users stop.", example: "30,000 of 1 lakh September users didn't return in October → 30%." },
      { name: "Conversion", tex: "\\text{Conversion} = \\dfrac{\\text{Users completing step } k+1}{\\text{Users reaching step } k}", meaning: "Where users drop in a funnel.", example: "Cart → checkout: 7,000 ÷ 10,000 = 70%." },
    ],
  },
  {
    group: "Estimation and operations",
    items: [
      { name: "Top-down estimate", tex: "\\text{Answer} = \\text{Base} \\times f_1 \\times f_2 \\times \\cdots", meaning: "Start from a large base and apply filters.", example: "Population × tea drinkers × cups per drinker." },
      { name: "Capacity", tex: "\\text{Output} = \\min(\\text{Demand},\\ \\text{Capacity}_1,\\ \\text{Capacity}_2, \\ldots)", meaning: "A system delivers the smallest of its limits.", example: "min(120 demanded, 140 picked, 70 delivered) = 70." },
      { name: "Little's law", tex: "L = \\lambda \\times W", meaning: "Items in a system = arrival rate × time each spends in it. Great for riders, queues, tables.", example: "300 orders/hour × 0.4 h per delivery = 120 riders busy." },
      { name: "Per-capita sanity check", tex: "\\dfrac{\\text{Your answer}}{\\text{Population}}", meaning: "Does the answer make sense per person?", example: "2 billion cups ÷ 1.4 billion people ≈ 1.5 cups each." },
    ],
  },
  {
    group: "Experimentation",
    items: [
      { name: "Sample size (rule of thumb)", tex: "n \\approx \\dfrac{16\\,p(1-p)}{\\delta^2}", meaning: "Users per arm to detect an absolute change δ at α = 0.05, power 80%.", example: "p = 10%, δ = 1 point → 16 × 0.09 ÷ 0.0001 = 14,400." },
      { name: "Relative lift", tex: "\\text{Lift} = \\dfrac{p_B - p_A}{p_A}", meaning: "Always say relative vs absolute.", example: "10% → 11% is +1 point, +10% relative." },
    ],
  },
];

export interface IndiaStat {
  label: string;
  value: string;
  source: string;
  geography: string;
  date: string;
  unit: string;
  reliability: Reliability;
  note?: string;
}

/** Reference statistics. Anything not from an official release is labelled; verify before quoting in an interview. */
export const INDIA_STATS: IndiaStat[] = [
  { label: "Population (census count)", value: "121.1 crore", source: "Census of India 2011", geography: "India", date: "2011", unit: "people", reliability: "verified" },
  { label: "Population (current estimate)", value: "~142.9 crore", source: "UN World Population Prospects 2022", geography: "India", date: "2023 estimate", unit: "people", reliability: "official-estimate", note: "Use 140–145 crore in interviews." },
  { label: "Urban share of population", value: "31.1%", source: "Census of India 2011", geography: "India", date: "2011", unit: "% of population", reliability: "verified", note: "Higher today; 35–37% is a common working assumption (illustrative)." },
  { label: "Literacy rate", value: "74.0%", source: "Census of India 2011", geography: "India", date: "2011", unit: "% of people aged 7+", reliability: "verified" },
  { label: "Sex ratio", value: "943 females per 1,000 males", source: "Census of India 2011", geography: "India", date: "2011", unit: "females per 1,000 males", reliability: "verified", note: "So the population is roughly 51.5% male, 48.5% female." },
  { label: "Population of Delhi (NCT)", value: "1.68 crore", source: "Census of India 2011", geography: "Delhi NCT", date: "2011", unit: "people", reliability: "verified", note: "Grown since; ~2.2 crore is a common current estimate (secondary)." },
  { label: "Population of Greater Mumbai", value: "1.24 crore", source: "Census of India 2011", geography: "Greater Mumbai", date: "2011", unit: "people", reliability: "verified" },
  { label: "Population of Bengaluru (city)", value: "84 lakh", source: "Census of India 2011", geography: "Bengaluru city", date: "2011", unit: "people", reliability: "verified", note: "The metro area is commonly estimated at 1.3–1.4 crore today (secondary)." },
  { label: "Area of Delhi", value: "1,484 sq km", source: "Census of India 2011", geography: "Delhi NCT", date: "2011", unit: "sq km", reliability: "verified" },
  { label: "Average household size", value: "~4.4 people", source: "National Family Health Survey (NFHS-5)", geography: "India", date: "2019–21", unit: "people per household", reliability: "official-estimate", note: "Urban households are smaller (~4), rural larger. Verify the exact figure." },
  { label: "Cinema screens", value: "~9,000–10,000", source: "Industry reports", geography: "India", date: "2023–2025", unit: "screens", reliability: "secondary", note: "Figures vary by source." },
  { label: "Domestic tea consumption", value: "~1.1–1.2 billion kg a year", source: "Tea Board of India estimates", geography: "India", date: "recent years", unit: "kg per year", reliability: "secondary", note: "Verify the latest year." },
  { label: "Food delivery NOV, one large platform", value: "~₹11,445 crore a quarter", source: "Eternal Ltd Q2 FY27 results (news reports)", geography: "India", date: "Jul–Sep 2026", unit: "₹ per quarter", reliability: "secondary", note: "Check the official shareholder letter before quoting." },
  { label: "UPI transaction volume", value: "Tens of billions a month", source: "NPCI monthly statistics", geography: "India", date: "2025–26", unit: "transactions per month", reliability: "secondary", note: "Look up the latest month on NPCI's site before quoting a figure." },
];

export const COMMON_ASSUMPTIONS: { label: string; value: string; why: string }[] = [
  { label: "Share of India under 15", value: "~25%", why: "A young country; use it to exclude children from adult behaviours." },
  { label: "Working-age share (15–64)", value: "~65–68%", why: "Base for jobs, commuting, office consumption." },
  { label: "Urban household size", value: "~4", why: "Converts people to households in cities." },
  { label: "Rural household size", value: "~4.5–5", why: "Converts people to households in villages." },
  { label: "Weeks per month", value: "4.3", why: "30 ÷ 7. Use for weekly ↔ monthly conversions." },
  { label: "Working days per year", value: "~250", why: "Office-based estimates." },
  { label: "Peak-hour share of daily orders (food/quick commerce)", value: "~12–16%", why: "An even spread over 16 hours is ~6%; peaks are 2–3× that." },
  { label: "Smartphone users", value: "~65–75 crore", why: "Base for any digital product question. Illustrative; verify a current source." },
];

export const GLOSSARY: { term: string; meaning: string }[] = [
  { term: "Guesstimate", meaning: "A structured estimate of an unknown number using logic and reasonable assumptions. The reasoning is graded, not just the number." },
  { term: "MECE", meaning: "Mutually exclusive, collectively exhaustive: every unit lands in exactly one bucket and no unit is left out." },
  { term: "Top-down", meaning: "Start from a big base (population) and narrow it with filters." },
  { term: "Bottom-up", meaning: "Start from one unit (a stall, a store) and multiply up." },
  { term: "Demand side", meaning: "Estimate from customers: how many people and how often they buy." },
  { term: "Supply side", meaning: "Estimate from sellers or infrastructure: outlets, capacity, screens." },
  { term: "Triangulation", meaning: "Estimate the same number two different ways; agreement builds confidence." },
  { term: "Sensitivity analysis", meaning: "Change one assumption at a time to see which moves the answer most." },
  { term: "Proxy", meaning: "A number you can estimate that stands in for one you can't (e.g., tea leaves sold as a proxy for cups)." },
  { term: "GMV / GOV", meaning: "Gross merchandise / order value: total value of orders including fees, before discounts." },
  { term: "NOV", meaning: "Net order value: GOV minus discounts." },
  { term: "AOV", meaning: "Average order value." },
  { term: "ARPU", meaning: "Average revenue per user." },
  { term: "Take rate", meaning: "Share of order value a marketplace keeps." },
  { term: "Contribution margin", meaning: "Revenue minus variable costs; profit per extra unit before fixed costs." },
  { term: "CAC", meaning: "Customer acquisition cost." },
  { term: "LTV", meaning: "Lifetime value of a customer, ideally on a margin basis." },
  { term: "TAM / SAM / SOM", meaning: "Total, serviceable and obtainable market." },
  { term: "DAU / WAU / MAU", meaning: "Daily, weekly and monthly active users. Define “active”." },
  { term: "MTU", meaning: "Monthly transacting users: users who actually paid in the month." },
  { term: "Retention", meaning: "Share of a cohort still active after N days/weeks/months." },
  { term: "Churn", meaning: "Share of active users who stop being active." },
  { term: "Activation", meaning: "Share of new users who reach the first moment of value (e.g., first order)." },
  { term: "Cohort", meaning: "A group of users who started in the same period, tracked over time." },
  { term: "Funnel", meaning: "Sequence of steps to a goal; conversion is measured between steps." },
  { term: "Guardrail metric", meaning: "A metric that must not get worse when you optimise another." },
  { term: "Bottleneck", meaning: "The tightest constraint in a system; it sets throughput." },
];

export const FRAMEWORKS: { name: string; steps: string[]; when: string }[] = [
  { name: "The 8-stage guesstimate method", steps: ["Understand the problem", "Ask clarifying questions", "Structure (MECE)", "State assumptions", "Calculate", "Test sensitivity", "Give the final answer with a range", "Evaluate and improve"], when: "Every guesstimate." },
  { name: "Choosing an approach", steps: ["Is the unit countable from customers? → demand side", "Is it countable from sellers or infrastructure? → supply side", "Is one physical limit obvious? → capacity / bottleneck", "Do both and compare when time allows"], when: "At the structuring stage." },
  { name: "Sanity checks", steps: ["Per-capita check", "Order of magnitude vs a known number", "A second method (supply vs demand)", "Extreme-case check (could it be 10× more?)"], when: "Before giving the final answer." },
  { name: "The 60-second final answer", steps: ["Number with unit and range", "Scope in one line", "Structure in one line", "Top 2–3 assumptions", "Cross-check result", "Biggest driver and what you'd validate"], when: "Closing every guesstimate." },
  { name: "Root cause analysis (metric dropped)", steps: ["Clarify the metric and the drop", "Rule out data issues", "Internal vs external causes", "Decompose the metric", "Segment (platform, city, cohort)", "Find the funnel step", "Recommend and monitor"], when: "Product analyst case rounds." },
];

export const CHEAT_SHEETS: { title: string; lines: string[] }[] = [
  { title: "Indian number system", lines: ["1 lakh = 100,000 = 10^5", "1 crore = 100 lakh = 10^7", "100 crore = 1 billion", "10 lakh = 1 million", "142 crore = 1.42 billion"] },
  { title: "Time conversions", lines: ["365 days a year, ~250 working days", "4.3 weeks a month", "~30 days a month", "8,760 hours a year"] },
  { title: "Clarifying-question checklist", lines: ["What exactly is the unit?", "Which geography?", "Which time window (typical day, peak hour, year)?", "What's included and excluded?", "Never ask for data you're expected to assume"] },
  { title: "Answer template", lines: ["“About X (range A to B) [unit].”", "“I scoped it as … and split it by …, so nothing is double counted.”", "“Key assumptions: …”", "“A second method gives Y, which is close.”", "“The biggest driver is …; I'd validate that first.”"] },
];

export const COMMON_MISTAKES: { mistake: string; why: string; fix: string }[] = [
  { mistake: "Double counting", why: "Segmenting by people (students, office workers) when one person belongs to several groups.", fix: "Segment the unit you're counting (cups, orders) or use categories each person fits exactly once." },
  { mistake: "Unit mismatch", why: "Adding per-day and per-month numbers, or people and households.", fix: "Write the unit next to every number and check the final unit." },
  { mistake: "False precision", why: "“2,14,61,25,000 cups” suggests certainty you don't have.", fix: "Round to two significant figures and give a range." },
  { mistake: "Per-household vs per-person confusion", why: "Multiplying households by a per-person rate.", fix: "Convert explicitly with household size." },
  { mistake: "Forgetting time conversion", why: "A monthly frequency applied to a daily question.", fix: "Divide monthly by ~30 (or weekly by 7) once, at a clear step." },
  { mistake: "Averaging away peaks", why: "One average rate hides when capacity binds.", fix: "Split into peak and off-peak bands." },
  { mistake: "Assuming 100% adoption", why: "Everyone doesn't use the product.", fix: "Apply realistic awareness, access and usage filters." },
  { mistake: "Ignoring capacity", why: "Demand can exceed what a store, stall or fleet can serve.", fix: "Take min(demand, capacity)." },
  { mistake: "Asking for data you should assume", why: "Interviewers want you to state assumptions.", fix: "Say “I'll assume X because …” instead of asking." },
  { mistake: "No sanity check", why: "Off-by-10× errors go unnoticed.", fix: "Do a per-capita check or a second method." },
];
