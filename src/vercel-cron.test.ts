import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("vercel cron configuration", () => {
  it("schedules daily morning module insight regeneration", () => {
    const source = readFileSync("vercel.json", "utf8");

    expect(source).toContain("\"/api/cron/module-insights\"");
    expect(source).toContain("\"0 7 * * *\"");
  });
});
