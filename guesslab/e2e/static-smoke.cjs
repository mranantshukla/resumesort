// Smoke test for the static (hash-routed) build served from a subpath.
// Usage: serve guesslab/ on port 4173, then: node e2e/static-smoke.cjs
const { chromium } = require("playwright");

(async () => {
  const B = process.env.STATIC_URL ?? "http://127.0.0.1:4173/dist-spa/index.html";
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  p.on("console", (m) => m.type() === "error" && !/fonts\.g/.test(m.text()) && errs.push(m.text()));
  const ok = (s) => console.log("✓ " + s);

  await p.goto(B);
  await p.getByText("Think. Structure. Estimate. Defend.").first().waitFor();
  ok("dashboard");
  await p.getByRole("link", { name: /Guesstimate library/ }).first().click();
  await p.getByText(/problems across ten estimation types/).waitFor();
  ok("library via nav link, hash = " + (await p.evaluate(() => location.hash)));
  await p.goto(B + "#learn--chai-cups-india");
  await p.getByRole("heading", { name: "Problem understanding" }).waitFor();
  await p.getByRole("button", { name: /Cups per day/ }).click();
  await p.getByText("Right. The question counts cups").waitFor();
  ok("guided workspace");
  await p.goto(B + "#school--sql");
  await p.locator("#sql-sql-city-revenue").fill("SELECT r.city, COUNT(*), SUM(o.amount) AS rev FROM orders o JOIN restaurants r ON r.restaurant_id=o.restaurant_id WHERE o.status='delivered' GROUP BY r.city ORDER BY rev DESC;");
  await p.getByRole("button", { name: /Check answer/ }).first().click();
  await p.getByText("Correct").first().waitFor({ timeout: 15000 });
  ok("SQL exercise (wasm loaded from relative path)");
  await p.goto(B + "#stats");
  await p.getByText("India-specific reference data").waitFor();
  await p.locator(".katex").first().waitFor();
  ok("knowledge section anchor");
  await p.goto(B + "#interview--dark-store-peak");
  await p.getByRole("button", { name: /Start interview/ }).click();
  await p.getByText(/fulfil in its busiest hour/).first().waitFor();
  ok("interviewer with problem from hash");
  await p.goto(B + "#practice--weddings-india");
  await p.getByRole("button", { name: "Start" }).click();
  await p.getByText("1. Clarifications and scope").waitFor();
  ok("practice arena");
  await b.close();
  if (errs.length) {
    console.log("Browser errors:\n" + errs.join("\n"));
    process.exit(1);
  }
  console.log("Static build OK");
})();
