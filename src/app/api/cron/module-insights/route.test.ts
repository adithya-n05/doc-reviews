import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module insights cron route", () => {
  const source = readFileSync("src/app/api/cron/module-insights/route.ts", "utf8");

  it("guards execution with CRON_SECRET bearer auth", () => {
    expect(source).toContain("process.env.CRON_SECRET");
    expect(source).toContain('request.headers.get("authorization")');
    expect(source).toContain("Unauthorized");
  });

  it("regenerates insights from reviews using AI service and cache upsert", () => {
    expect(source).toContain(".from(\"reviews\")");
    expect(source).toContain(
      ".select(\"module_id,id,updated_at,teaching_rating,workload_rating,difficulty_rating,assessment_rating,comment\")",
    );
    expect(source).toContain("generateModuleReviewInsightPayload");
    expect(source).toContain("upsertModuleReviewInsightsCacheRow");
  });
});
