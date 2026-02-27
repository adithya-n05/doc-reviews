import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("landing metrics data fetcher", () => {
  const source = readFileSync("src/lib/server/landing-metrics.ts", "utf8");

  it("queries modules count, review aggregates, and review ratings", () => {
    expect(source).toContain('.from("modules")');
    expect(source).toContain('.from("module_review_aggregates")');
    expect(source).toContain('.from("reviews")');
    expect(source).toContain("review_count,avg_overall,avg_workload");
    expect(source).toContain("teaching_rating,assessment_rating");
  });

  it("uses buildLandingMetrics to compute output", () => {
    expect(source).toContain('import { buildLandingMetrics }');
    expect(source).toContain("return buildLandingMetrics({");
  });
});
