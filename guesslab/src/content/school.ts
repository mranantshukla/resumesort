export type Exercise =
  | { id: string; kind: "mcq"; prompt: string; options: { text: string; correct?: boolean }[]; explain: string }
  | { id: string; kind: "numeric"; prompt: string; answer: number; tolerance: number; unit: string; explain: string }
  | { id: string; kind: "sql"; sqlId: string }
  | { id: string; kind: "link"; prompt: string; href: string; label: string };

export interface Lesson {
  id: string;
  title: string;
  body: string[];
  takeaway: string;
}

export interface SchoolModule {
  id: string;
  number: number;
  title: string;
  summary: string;
  lessons: Lesson[];
  exercises: Exercise[];
}

export const SCHOOL: SchoolModule[] = [
  {
    id: "business",
    number: 1,
    title: "Business fundamentals",
    summary: "Revenue, profit, margins, GMV, AOV, ARPU, take rate and market size.",
    lessons: [
      {
        id: "rev-profit",
        title: "Revenue, profit and margins",
        body: [
          "Revenue is what customers pay. Profit is what's left after costs. Margin is profit as a share of revenue.",
          "Costs split into variable costs (rise with each order: ingredients, delivery pay, payment fees) and fixed costs (rent, salaries, tech). Contribution margin = revenue − variable costs: the profit from one more order.",
          "A business can grow revenue fast and still lose more money if each order has negative contribution margin. Analysts check unit economics before celebrating growth.",
        ],
        takeaway: "Always ask whether a question is about revenue, contribution or profit.",
      },
      {
        id: "marketplace",
        title: "Marketplace metrics: GMV, NOV, AOV, take rate",
        body: [
          "A marketplace (food delivery, quick commerce) doesn't keep the full order value. GMV/GOV is the total customers' orders are worth; NOV subtracts discounts; take rate is the share the platform keeps.",
          "AOV = order value ÷ orders. It can fall for good reasons (a cheap small-meal option brings many new small orders) or bad ones (customers trading down). Look at total NOV and order count together.",
          "ARPU = revenue ÷ users. Define the user: monthly active users and monthly transacting users give very different ARPUs.",
        ],
        takeaway: "Ratios like AOV and ARPU must be read alongside their numerator and denominator.",
      },
      {
        id: "tam",
        title: "TAM, SAM and SOM",
        body: [
          "TAM is the total market if everyone who could buy did. SAM is the part your product and geography can serve. SOM is what you can realistically win against competition in the near term.",
          "In interviews, build SOM from the bottom (users you can reach × conversion × spend) and check it against a top-down TAM share.",
        ],
        takeaway: "Investors care about TAM; operators care about SOM.",
      },
    ],
    exercises: [
      { id: "b1", kind: "numeric", prompt: "A platform processed ₹90 lakh of orders from 20,000 orders in a day. What's the AOV in ₹?", answer: 450, tolerance: 0.01, unit: "₹", explain: "₹90,00,000 ÷ 20,000 = ₹450." },
      { id: "b2", kind: "numeric", prompt: "On a ₹500 order the platform earns ₹100 commission, ₹30 in fees and ₹20 from ads. What's the take rate in %?", answer: 30, tolerance: 0.02, unit: "%", explain: "(100 + 30 + 20) ÷ 500 = 30%." },
      { id: "b3", kind: "numeric", prompt: "Revenue per order ₹150. Variable costs per order: delivery ₹75, discount ₹40, payment ₹9, support ₹6. What's the contribution margin per order in ₹?", answer: 20, tolerance: 0.01, unit: "₹", explain: "150 − (75 + 40 + 9 + 6) = ₹20." },
      { id: "b4", kind: "mcq", prompt: "GOV grew 18% but NOV grew 12%. What's the most likely reason?", options: [{ text: "Discounts grew faster than order value", correct: true }, { text: "Fewer users ordered" }, { text: "Delivery got slower" }, { text: "Restaurants raised prices" }], explain: "NOV = GOV − discounts. A widening gap means more growth is being bought with discounts." },
    ],
  },
  {
    id: "guesstimates",
    number: 2,
    title: "Guesstimates and market sizing",
    summary: "The 8-stage method, top-down vs bottom-up, and MECE structures.",
    lessons: [
      {
        id: "method",
        title: "The method",
        body: [
          "Interviewers grade how you think, not whether you match a hidden number. A structured, explained estimate within 2–3× of reality beats a lucky exact guess.",
          "Work through eight stages: understand, clarify, structure, assume, calculate, test sensitivity, answer with a range, and reflect.",
          "Choose top-down (population → filters) when you know the big base well; bottom-up (one unit × count) when one unit is easy to picture, like a stall or a store.",
        ],
        takeaway: "Define the metric before any number.",
      },
      {
        id: "mece",
        title: "MECE structures",
        body: [
          "Segment the thing you're counting. Cups are drunk in exactly one place; a person can be a student and a part-time worker.",
          "Check for overlap (double counting) and gaps (missing segments) before calculating.",
        ],
        takeaway: "If one unit could land in two buckets, your structure double counts.",
      },
    ],
    exercises: [
      { id: "g1", kind: "mcq", prompt: "Which segmentation of daily chai cups is MECE?", options: [{ text: "Cups at home + cups outside home", correct: true }, { text: "Cups by students + cups by office workers + cups at home" }, { text: "Cups in winter + cups at offices" }], explain: "Place of consumption puts each cup in exactly one bucket. People- and season-based buckets overlap." },
      { id: "g2", kind: "mcq", prompt: "For “daily revenue of one bakery”, which approach is usually most reliable?", options: [{ text: "Bottom-up from the bakery's capacity and footfall", correct: true }, { text: "Top-down from India's bakery market size" }, { text: "Ask the interviewer for last month's revenue" }], explain: "For a single outlet, building up from capacity and footfall is far more precise than slicing a national market." },
      { id: "g3", kind: "link", prompt: "Work through a full guided guesstimate.", href: "/learn/chai-cups-india", label: "Open: cups of chai in India" },
    ],
  },
  {
    id: "metrics",
    number: 3,
    title: "Product metrics",
    summary: "DAU, WAU, MAU, stickiness, retention, churn, activation and conversion.",
    lessons: [
      {
        id: "active",
        title: "Active users and stickiness",
        body: [
          "DAU, WAU and MAU count unique users active in a day, week or month. “Active” must be defined: opened the app, or did the core action (ordered)?",
          "Stickiness = DAU ÷ MAU: the share of days the average monthly user returns. 20% means about 6 days a month.",
        ],
        takeaway: "Always define “active” before comparing numbers.",
      },
      {
        id: "retention",
        title: "Retention, churn and activation",
        body: [
          "Retention follows a cohort: of users who signed up in week 1, what share were active in week 2, 3, 4…? A curve that flattens means users found lasting value.",
          "Churn is the flip side: active last period, gone this period. For infrequent products, define churn by an inactivity window, not one quiet month.",
          "Activation is the first moment of value (first delivered order). Good activation metrics predict retention.",
        ],
        takeaway: "Compare cohorts at the same age, never a new cohort's average with an old one's.",
      },
    ],
    exercises: [
      { id: "m1", kind: "numeric", prompt: "DAU is 30 lakh and MAU is 1.5 crore. What's stickiness in %?", answer: 20, tolerance: 0.01, unit: "%", explain: "30 lakh ÷ 150 lakh = 20%." },
      { id: "m2", kind: "numeric", prompt: "10,000 users signed up in week 1. 2,800 ordered again within 7 days. What's D7 retention in %?", answer: 28, tolerance: 0.01, unit: "%", explain: "2,800 ÷ 10,000 = 28%." },
      { id: "m3", kind: "numeric", prompt: "1,00,000 users ordered in September; 72,000 of them ordered again in October. What's monthly churn in %?", answer: 28, tolerance: 0.01, unit: "%", explain: "(1,00,000 − 72,000) ÷ 1,00,000 = 28%." },
      { id: "m4", kind: "mcq", prompt: "Sessions per user went up 15% but orders stayed flat. Best first read?", options: [{ text: "Users may be struggling to find what they want", correct: true }, { text: "Engagement improved, ship more features" }, { text: "Revenue must have gone up" }], explain: "More sessions without more orders can mean friction. Check session-to-order conversion and search success." },
    ],
  },
  {
    id: "product-sense",
    number: 4,
    title: "Product sense and business cases",
    summary: "User → problem → solution → metric → test.",
    lessons: [
      {
        id: "framework",
        title: "A framework for product questions",
        body: [
          "Pick a specific user segment, name their pain with evidence you'd look for, propose one solution, define a success metric and guardrails, and say how you'd test it.",
          "For “which metric should we optimise?”, go goal → North Star → input metrics → guardrails, and defend why the North Star captures user value and business value.",
        ],
        takeaway: "Every product answer ends with a metric and a test.",
      },
    ],
    exercises: [
      { id: "p1", kind: "mcq", prompt: "A new “reorder” button is used by users who retain 2× better. Should you push it to everyone?", options: [{ text: "Not yet: heavy users self-select into reordering; run an A/B test", correct: true }, { text: "Yes, the data proves it causes retention" }, { text: "No, retention doesn't matter" }], explain: "Correlation from self-selection isn't causation. Test it." },
      { id: "p2", kind: "mcq", prompt: "Best guardrail for a test that makes free delivery easier to get?", options: [{ text: "Contribution margin per order", correct: true }, { text: "App downloads" }, { text: "Number of restaurants" }], explain: "Cheaper delivery can grow orders while losing money per order." },
    ],
  },
  {
    id: "analytics",
    number: 5,
    title: "Analytical problem solving",
    summary: "Funnels, cohorts, root cause analysis and A/B testing.",
    lessons: [
      {
        id: "rca",
        title: "Root cause analysis",
        body: [
          "When a metric drops: clarify the definition and size of the drop, rule out data issues, separate internal from external causes, decompose the metric, segment it (city, platform, app version, new vs returning), find the funnel step, then recommend and monitor.",
        ],
        takeaway: "Check the data before you check the world.",
      },
      {
        id: "ab",
        title: "A/B testing",
        body: [
          "Define one primary metric and guardrails before starting. Randomise users, not sessions. Size the test: n ≈ 16·p(1−p)/δ² users per arm at α = 0.05 and 80% power. Run full weeks.",
          "Watch for sample ratio mismatch, peeking, novelty effects and marketplace interference.",
        ],
        takeaway: "Decide the decision rule before you see results.",
      },
    ],
    exercises: [
      { id: "a1", kind: "numeric", prompt: "Baseline conversion 10%; you want to detect an absolute change of 1 point. Using n ≈ 16·p(1−p)/δ², how many users per arm?", answer: 14400, tolerance: 0.02, unit: "users", explain: "16 × 0.1 × 0.9 ÷ 0.01² = 14,400." },
      { id: "a2", kind: "mcq", prompt: "AOV fell 8% week over week, but orders and NOV both rose. Most likely?", options: [{ text: "Mix shift toward smaller orders", correct: true }, { text: "Payment failures" }, { text: "A tracking bug" }], explain: "AOV is a ratio. If totals rose, more small orders lowered the average." },
      { id: "a3", kind: "mcq", prompt: "A 50/50 test shows 52,000 vs 48,000 users. First step?", options: [{ text: "Investigate sample ratio mismatch", correct: true }, { text: "Ship if significant" }, { text: "Extend the test" }], explain: "That split is very unlikely by chance; assignment or logging is broken." },
    ],
  },
  {
    id: "sql",
    number: 6,
    title: "SQL and data interpretation",
    summary: "Write real queries against a food-delivery dataset, checked automatically.",
    lessons: [
      {
        id: "sql-basics",
        title: "The queries analysts write daily",
        body: [
          "Most interview SQL is: JOIN the right tables, filter with WHERE, aggregate with GROUP BY, filter groups with HAVING, rank with window functions, and compare periods with LAG.",
          "Logical order: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → window functions → ORDER BY → LIMIT. That's why you can't filter a window function in WHERE.",
        ],
        takeaway: "Say the output grain first: “one row per city per month”.",
      },
    ],
    exercises: [
      { id: "s1", kind: "sql", sqlId: "sql-city-revenue" },
      { id: "s2", kind: "sql", sqlId: "sql-top-restaurants" },
      { id: "s3", kind: "sql", sqlId: "sql-jan-not-feb" },
      { id: "s4", kind: "sql", sqlId: "sql-cancel-rate" },
      { id: "s5", kind: "sql", sqlId: "sql-first-order" },
      { id: "s6", kind: "sql", sqlId: "sql-repeat-rate" },
      { id: "s7", kind: "sql", sqlId: "sql-mom" },
    ],
  },
  {
    id: "interviews",
    number: 7,
    title: "Product Analyst interview simulations",
    summary: "Put it together under realistic pressure.",
    lessons: [
      {
        id: "loop",
        title: "What the loop looks like",
        body: [
          "A typical product analyst loop: an online test (aptitude and SQL), a technical round (live SQL, statistics, a guesstimate), a case round (root cause or business case plus a resume deep-dive), and a hiring-manager or HR round.",
          "In every round: think out loud, state assumptions, and end with a decision.",
        ],
        takeaway: "Name the user, the metric and the decision in every answer.",
      },
    ],
    exercises: [
      { id: "i1", kind: "link", prompt: "Run a full guesstimate interview with follow-ups and a scorecard.", href: "/interview", label: "Open the AI Interviewer" },
      { id: "i2", kind: "link", prompt: "Solve a problem on your own, timed.", href: "/practice", label: "Open the Practice Arena" },
    ],
  },
];
