import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module detail performance wiring", () => {
  const source = readFileSync("src/app/modules/[code]/page.tsx", "utf8");

  it("parallelizes independent fetches in the module detail pipeline", () => {
    expect(source).toContain("const [reviewRows, cachedInsightsRow] = await Promise.all([");
    expect(source).toContain("const [replyRows, helpfulVoteRows] = await Promise.all([");
  });

  it("logs server-side timing checkpoints for module detail rendering", () => {
    expect(source).toContain('logInfo("module_detail_timing"');
    expect(source).toContain("queryDurationsMs");
  });
});
