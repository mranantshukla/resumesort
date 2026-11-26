// A small food-delivery dataset and SQL exercises, run in the browser with sql.js (SQLite).
// Learner results are compared with a hidden reference query on the same data.

export const SQL_SCHEMA = `
CREATE TABLE users (user_id INTEGER PRIMARY KEY, city TEXT, signup_date TEXT, channel TEXT);
CREATE TABLE restaurants (restaurant_id INTEGER PRIMARY KEY, name TEXT, city TEXT, cuisine TEXT);
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, user_id INTEGER, restaurant_id INTEGER, order_date TEXT, amount REAL, status TEXT);
`;

const users: [number, string, string, string][] = [
  [1, "Bengaluru", "2026-01-03", "referral"], [2, "Bengaluru", "2026-01-05", "paid"], [3, "Delhi", "2026-01-07", "organic"],
  [4, "Delhi", "2026-01-11", "paid"], [5, "Mumbai", "2026-01-15", "organic"], [6, "Mumbai", "2026-01-20", "referral"],
  [7, "Bengaluru", "2026-02-02", "paid"], [8, "Delhi", "2026-02-09", "organic"], [9, "Mumbai", "2026-02-14", "paid"],
  [10, "Bengaluru", "2026-02-21", "organic"], [11, "Delhi", "2026-03-01", "referral"], [12, "Mumbai", "2026-03-05", "paid"],
];

const restaurants: [number, string, string, string][] = [
  [1, "Biryani Bros", "Bengaluru", "Biryani"], [2, "Dosa Point", "Bengaluru", "South Indian"], [3, "Delhi Rolls", "Delhi", "Rolls"],
  [4, "Chole Corner", "Delhi", "North Indian"], [5, "Bombay Pav", "Mumbai", "Street food"], [6, "Sea Spice", "Mumbai", "Seafood"],
];

// [order_id, user_id, restaurant_id, date, amount, status]
const orders: [number, number, number, string, number, string][] = [
  [1, 1, 1, "2026-01-04", 420, "delivered"], [2, 1, 2, "2026-01-10", 260, "delivered"], [3, 2, 1, "2026-01-06", 380, "cancelled"],
  [4, 2, 1, "2026-01-18", 450, "delivered"], [5, 3, 3, "2026-01-08", 220, "delivered"], [6, 3, 4, "2026-01-21", 310, "delivered"],
  [7, 4, 4, "2026-01-12", 290, "delivered"], [8, 5, 5, "2026-01-16", 180, "delivered"], [9, 5, 6, "2026-01-25", 640, "delivered"],
  [10, 6, 5, "2026-01-22", 150, "cancelled"], [11, 1, 1, "2026-02-03", 410, "delivered"], [12, 2, 2, "2026-02-07", 240, "delivered"],
  [13, 3, 3, "2026-02-11", 230, "cancelled"], [14, 5, 6, "2026-02-12", 700, "delivered"], [15, 7, 1, "2026-02-03", 390, "delivered"],
  [16, 7, 2, "2026-02-17", 270, "delivered"], [17, 8, 4, "2026-02-10", 330, "delivered"], [18, 9, 5, "2026-02-15", 200, "delivered"],
  [19, 9, 6, "2026-02-27", 560, "delivered"], [20, 10, 2, "2026-02-22", 250, "delivered"], [21, 1, 2, "2026-03-02", 280, "delivered"],
  [22, 2, 1, "2026-03-04", 470, "delivered"], [23, 4, 3, "2026-03-06", 210, "delivered"], [24, 6, 6, "2026-03-08", 610, "delivered"],
  [25, 7, 1, "2026-03-09", 400, "cancelled"], [26, 8, 3, "2026-03-12", 240, "delivered"], [27, 11, 4, "2026-03-03", 300, "delivered"],
  [28, 11, 3, "2026-03-15", 220, "delivered"], [29, 12, 5, "2026-03-07", 190, "delivered"], [30, 12, 6, "2026-03-19", 680, "delivered"],
  [31, 10, 2, "2026-03-20", 260, "delivered"], [32, 5, 5, "2026-03-21", 170, "delivered"], [33, 3, 4, "2026-03-23", 320, "delivered"],
  [34, 9, 6, "2026-03-25", 590, "cancelled"], [35, 1, 1, "2026-03-27", 430, "delivered"],
];

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

export const SQL_SEED =
  SQL_SCHEMA +
  users.map((u) => `INSERT INTO users VALUES (${u[0]}, ${q(u[1])}, ${q(u[2])}, ${q(u[3])});`).join("\n") +
  restaurants.map((r) => `INSERT INTO restaurants VALUES (${r[0]}, ${q(r[1])}, ${q(r[2])}, ${q(r[3])});`).join("\n") +
  orders.map((o) => `INSERT INTO orders VALUES (${o[0]}, ${o[1]}, ${o[2]}, ${q(o[3])}, ${o[4]}, ${q(o[5])});`).join("\n");

export interface SqlExercise {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  reference: string;
  /** If true, row order must match the reference (the prompt asks for a sort). */
  ordered: boolean;
  concept: string;
}

export const SQL_EXERCISES: SqlExercise[] = [
  {
    id: "sql-city-revenue",
    title: "Delivered revenue by city",
    prompt: "For each restaurant city, return the city, the number of delivered orders and the total delivered amount. Sort by total amount, highest first.",
    hint: "JOIN orders to restaurants, filter status = 'delivered', GROUP BY city, ORDER BY the sum DESC.",
    reference: "SELECT r.city, COUNT(*) AS orders, SUM(o.amount) AS revenue FROM orders o JOIN restaurants r ON r.restaurant_id = o.restaurant_id WHERE o.status = 'delivered' GROUP BY r.city ORDER BY revenue DESC;",
    ordered: true,
    concept: "JOIN, WHERE, GROUP BY, ORDER BY",
  },
  {
    id: "sql-top-restaurants",
    title: "Top two restaurants by delivered revenue",
    prompt: "Return the name and total delivered amount of the two restaurants with the highest delivered revenue, highest first.",
    hint: "GROUP BY restaurant, ORDER BY SUM(amount) DESC, LIMIT 2.",
    reference: "SELECT r.name, SUM(o.amount) AS revenue FROM orders o JOIN restaurants r ON r.restaurant_id = o.restaurant_id WHERE o.status = 'delivered' GROUP BY r.restaurant_id, r.name ORDER BY revenue DESC LIMIT 2;",
    ordered: true,
    concept: "Aggregation with LIMIT",
  },
  {
    id: "sql-jan-not-feb",
    title: "Ordered in January but not February",
    prompt: "Return the user_id of users who placed at least one order (any status) in January 2026 but no order in February 2026.",
    hint: "Use NOT EXISTS (or NOT IN) with a February subquery. Dates are text like '2026-01-04'.",
    reference: "SELECT DISTINCT o.user_id FROM orders o WHERE o.order_date BETWEEN '2026-01-01' AND '2026-01-31' AND NOT EXISTS (SELECT 1 FROM orders f WHERE f.user_id = o.user_id AND f.order_date BETWEEN '2026-02-01' AND '2026-02-28');",
    ordered: false,
    concept: "Anti-join (NOT EXISTS)",
  },
  {
    id: "sql-cancel-rate",
    title: "Cancellation rate by restaurant",
    prompt: "For each restaurant name, return the total number of orders and the cancellation rate as a percentage rounded to 1 decimal (e.g. 25.0).",
    hint: "AVG(CASE WHEN status = 'cancelled' THEN 1.0 ELSE 0 END) * 100, then ROUND(…, 1).",
    reference: "SELECT r.name, COUNT(*) AS orders, ROUND(100.0 * AVG(CASE WHEN o.status = 'cancelled' THEN 1.0 ELSE 0 END), 1) AS cancel_pct FROM orders o JOIN restaurants r ON r.restaurant_id = o.restaurant_id GROUP BY r.restaurant_id, r.name;",
    ordered: false,
    concept: "Conditional aggregation",
  },
  {
    id: "sql-first-order",
    title: "Each user's first order",
    prompt: "Return user_id, order_id and order_date of each user's first order (any status). Use a window function.",
    hint: "ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date) in a CTE, then keep row 1.",
    reference: "WITH r AS (SELECT user_id, order_id, order_date, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date, order_id) AS rn FROM orders) SELECT user_id, order_id, order_date FROM r WHERE rn = 1;",
    ordered: false,
    concept: "Window functions: ROW_NUMBER",
  },
  {
    id: "sql-repeat-rate",
    title: "Repeat customer rate",
    prompt: "Return one number: the percentage of users with at least one delivered order who have two or more delivered orders, rounded to 1 decimal.",
    hint: "Count delivered orders per user in a subquery, then AVG(CASE WHEN n >= 2 THEN 1.0 ELSE 0 END) * 100.",
    reference: "SELECT ROUND(100.0 * AVG(CASE WHEN n >= 2 THEN 1.0 ELSE 0 END), 1) AS repeat_pct FROM (SELECT user_id, COUNT(*) AS n FROM orders WHERE status = 'delivered' GROUP BY user_id);",
    ordered: false,
    concept: "Subqueries and rates",
  },
  {
    id: "sql-mom",
    title: "Month-over-month delivered revenue",
    prompt: "Return month (YYYY-MM), delivered revenue, and the change from the previous month (NULL for the first month), sorted by month.",
    hint: "strftime('%Y-%m', order_date) for the month; LAG(revenue) OVER (ORDER BY month).",
    reference: "WITH m AS (SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue FROM orders WHERE status = 'delivered' GROUP BY month) SELECT month, revenue, revenue - LAG(revenue) OVER (ORDER BY month) AS change FROM m ORDER BY month;",
    ordered: true,
    concept: "Window functions: LAG",
  },
];

export type SqlRow = (string | number | null)[];

function norm(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return (Math.round(v * 100) / 100).toString();
  const n = Number(v);
  if (typeof v === "string" && v.trim() !== "" && isFinite(n)) return (Math.round(n * 100) / 100).toString();
  return String(v).trim();
}

/** Compare learner rows with reference rows. Column names are ignored; values and (optionally) order matter. */
export function compareResults(learner: SqlRow[], reference: SqlRow[], ordered: boolean): { ok: boolean; reason: string } {
  if (!learner.length && reference.length) return { ok: false, reason: "Your query returned no rows." };
  const lCols = learner[0]?.length ?? 0;
  const rCols = reference[0]?.length ?? 0;
  if (lCols !== rCols) return { ok: false, reason: `Expected ${rCols} column${rCols > 1 ? "s" : ""}, got ${lCols}.` };
  if (learner.length !== reference.length) return { ok: false, reason: `Expected ${reference.length} row${reference.length > 1 ? "s" : ""}, got ${learner.length}.` };
  const key = (r: SqlRow) => r.map(norm).join("|");
  const a = learner.map(key);
  const b = reference.map(key);
  if (ordered) {
    const i = a.findIndex((x, k) => x !== b[k]);
    if (i === -1) return { ok: true, reason: "Correct." };
    const sameSet = [...a].sort().join("§") === [...b].sort().join("§");
    return { ok: false, reason: sameSet ? "Right rows, wrong order. Check your ORDER BY." : `Row ${i + 1} doesn't match.` };
  }
  const ok = [...a].sort().join("§") === [...b].sort().join("§");
  return { ok, reason: ok ? "Correct." : "Some values don't match. Check filters, joins and rounding." };
}
