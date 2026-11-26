import { describe, expect, it } from "vitest";
import initSqlJs from "sql.js";
import path from "node:path";
import { SQL_EXERCISES, SQL_SEED, compareResults } from "@/content/sql";

describe("SQL exercises", () => {
  it("every reference query runs on the seed data and returns rows", async () => {
    const SQL = await initSqlJs({ locateFile: (f: string) => path.resolve(__dirname, "../node_modules/sql.js/dist", f) });
    const db = new SQL.Database();
    db.exec(SQL_SEED);
    for (const ex of SQL_EXERCISES) {
      const res = db.exec(ex.reference);
      expect(res.length, ex.id).toBe(1);
      expect(res[0].values.length, ex.id).toBeGreaterThan(0);
      // a reference compared with itself must pass
      expect(compareResults(res[0].values as never, res[0].values as never, ex.ordered).ok).toBe(true);
    }
    // spot-check one known answer: users who ordered in Jan but not Feb
    const jan = db.exec(SQL_EXERCISES.find((e) => e.id === "sql-jan-not-feb")!.reference)[0].values.map((r) => r[0]).sort();
    expect(jan).toEqual([4, 6]);
  });
});
