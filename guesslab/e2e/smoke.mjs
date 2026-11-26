// End-to-end smoke test: drives the real app through every major flow.
// Usage: start the app (npm run build && npm start -- -p 3123), then:
//   BASE_URL=http://localhost:3123 SHOTS=./e2e/shots node e2e/smoke.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// Uses the project's Playwright if installed, otherwise a globally available one.
const { chromium } = require("playwright");
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3123";
const SHOTS = process.env.SHOTS;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && !/fonts\.g|ERR_|Failed to load resource/.test(m.text()) && errors.push(`console: ${m.text()}`));

const step = (name) => console.log(`✓ ${name}`);
const shot = async (name) => SHOTS && (await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false }));
const complete = async () => {
  await page.getByRole("button", { name: /Complete stage/ }).click();
  await page.waitForTimeout(150);
};
const expectText = async (t) => {
  await page.getByText(t).first().waitFor({ timeout: 5000 });
};

// ---- Guided: chai, all 8 stages ----
await page.goto(`${BASE}/learn/chai-cups-india`);
await page.getByRole("heading", { name: "Problem understanding" }).waitFor();
await shot("01-understanding");
for (const t of ["Cups per day", "Counting the same cup twice", "All cups drunk, at home and outside", "All of India, urban and rural", "A typical day (annual average)"]) {
  await page.getByRole("button", { name: new RegExp(t.replace(/[()]/g, "\\$&")) }).first().click();
}
await complete();
step("Stage 1: understanding");

for (const t of ["Should I count all cups drunk", "Does chai include all hot tea", "Is this a typical day"]) await page.getByRole("button", { name: new RegExp(t) }).click();
await page.getByRole("button", { name: /Ask the interviewer/ }).click();
await expectText("Interviewer:");
await complete();
step("Stage 2: clarifying");

await page.getByRole("button", { name: "Cups drunk at home" }).click();
await page.getByRole("button", { name: "Cups drunk by office workers" }).click();
await page.getByRole("button", { name: "Check my structure" }).click();
await expectText("Double counting:");
step("Double counting detected");
await page.getByRole("button", { name: "Cups drunk by office workers" }).click();
await page.getByRole("button", { name: "All cups drunk outside home" }).click();
await page.getByRole("button", { name: "Check my structure" }).click();
await expectText("MECE: every unit lands in exactly one segment.");
await page.locator(".react-flow__node").first().waitFor();
await shot("02-structuring-tree");
await complete();
step("Stage 3: structuring (tree rendered)");

const confirms = page.getByRole("button", { name: "Confirm", exact: true });
while ((await confirms.count()) > 0) await confirms.first().click();
await complete();
step("Stage 4: assumptions");

await page.locator("#calc-drinkers").fill("9.23 crore");
await page.getByRole("button", { name: "Check", exact: true }).first().click();
await expectText("factor of 10");
step("Power-of-ten slip caught");
await page.locator("#calc-drinkers").fill("92.3 crore");
await page.getByRole("button", { name: "Check", exact: true }).first().click();
await page.locator("#calc-ooh").fill("0.525");
await page.getByRole("button", { name: "Check", exact: true }).first().click();
await page.locator("#calc-perDrinker").fill("2.325");
await page.getByRole("button", { name: "Check", exact: true }).first().click();
await page.locator("#calc-total").fill("214.6 crore");
await page.getByRole("button", { name: "Check", exact: true }).first().click();
await shot("03-calculation");
await complete();
step("Stage 5: calculation");

await page.getByRole("button", { name: "Cups at home per drinker per day" }).click();
await page.getByText(/Tornado chart/).waitFor();
await shot("04-sensitivity");
await complete();
step("Stage 6: sensitivity");

await page.getByRole("button", { name: "Run the cross-check" }).click();
await page.getByRole("button", { name: /Draft it from my work/ }).click();
const draft = await page.locator("#final-answer").inputValue();
if (draft.length < 200) throw new Error("final answer draft too short");
await shot("05-final");
await complete();
step("Stage 7: final answer");

await expectText("Overall");
await page.getByText(/What you did well|Factual errors|Differences in method/).first().waitFor();
await shot("06-evaluation");
step("Stage 8: evaluation scored");

// ---- Save & resume ----
await page.reload();
await page.getByRole("heading", { name: "Evaluation" }).waitFor();
step("Session resumes after reload");

// ---- Dashboard reflects progress ----
await page.goto(BASE + "/");
await expectText("Recently attempted");
await page.getByText("Cups of chai sold in India every day").first().waitFor();
await shot("07-dashboard");
step("Dashboard shows the attempt");

// ---- Practice arena ----
await page.goto(`${BASE}/practice/smartphone-users`);
await page.getByRole("button", { name: "Start" }).click();
await page.locator("#clar-0").fill("Users, not devices? Assume active users.");
await page.locator("#seg-0").fill("Smartphone users");
await page.locator("#f-0-0-l").fill("Population of India");
await page.locator("#f-0-0-v").fill("142 crore");
await page.locator("#f-0-0-u").fill("person");
await page.getByRole("button", { name: /Add factor/ }).click();
await page.locator("#f-0-1-l").fill("Penetration share");
await page.locator("#f-0-1-v").fill("50");
await page.locator("#f-0-1-u").fill("%");
await page.getByRole("button", { name: "Use my structure's result" }).click();
await page.locator("#statement").fill("About 71 crore, range 60 to 80 crore. I assumed 50% penetration because many rural adults and children don't own one; sanity check per household gives a similar number.");
await page.getByRole("button", { name: "Submit for evaluation" }).first().click();
await expectText("Reference range (shown only after you submit)");
await shot("08-practice-result");
step("Practice arena evaluated");

// ---- Interviewer ----
await page.goto(`${BASE}/interview?problem=bengaluru-food-orders`);
await page.getByRole("button", { name: /Start interview/ }).click();
const say = async (t) => {
  await page.locator("#candidate-input").fill(t);
  await page.getByRole("button", { name: "Send" }).click();
  await page.waitForTimeout(120);
};
await say("Is this across all apps and a typical day?");
await say("I'll split it as population × share online with a smartphone × share who order × frequency per month, divided by 30.");
await say("Population 1.4 crore because it's a large metro, 60% online, 40% order, 4.4 orders per month.");
await say("That gives about 4.9 lakh orders per day.");
await say("Sanity check from the supply side: 25,000 restaurants × 18 orders is 4.5 lakh, close.");
await say("Final answer: about 4.9 lakh orders a day, range between 3 and 7 lakh, from a user funnel and cross-checked with supply.");
await expectText("Interview score");
await shot("09-interview");
step("Interviewer scored the conversation");

// ---- School SQL (sql.js in the browser) ----
await page.goto(`${BASE}/school/sql`);
const box = page.locator("#sql-sql-city-revenue");
await box.fill("SELECT r.city, COUNT(*), SUM(o.amount) AS rev FROM orders o JOIN restaurants r ON r.restaurant_id = o.restaurant_id WHERE o.status='delivered' GROUP BY r.city ORDER BY rev DESC;");
await page.getByRole("button", { name: /Check answer/ }).first().click();
await page.getByText("Correct").first().waitFor({ timeout: 15000 });
step("SQL exercise checked with sql.js");

// ---- Knowledge + performance render ----
await page.goto(`${BASE}/knowledge`);
await expectText("India-specific reference data");
await page.locator(".katex").first().waitFor();
step("Knowledge hub renders formulas");
await page.goto(`${BASE}/performance`);
await expectText("Skill radar");
await shot("10-performance");
step("Performance page renders");

// ---- Dark theme + mobile ----
await page.goto(`${BASE}/learn/momo-stall-revenue`);
await page.getByRole("button", { name: "Dark theme" }).first().click();
await page.getByRole("heading", { name: "Problem understanding" }).waitFor();
await shot("11-dark-workspace");
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const mp = await mobile.newPage();
await mp.goto(`${BASE}/learn/chai-cups-india`);
await mp.getByRole("tab", { name: "Workspace" }).waitFor();
const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
if (overflow > 2) throw new Error(`mobile horizontal overflow: ${overflow}px`);
if (SHOTS) await mp.screenshot({ path: `${SHOTS}/12-mobile.png` });
step("Mobile layout has no horizontal scroll");

await browser.close();
if (errors.length) {
  console.log("Browser errors:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("All flows passed with no browser errors.");
