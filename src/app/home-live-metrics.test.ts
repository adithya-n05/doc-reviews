import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("home page live metrics", () => {
  const source = readFileSync("src/app/page.tsx", "utf8");

  it("fetches landing metrics from supabase on the server", () => {
    expect(source).toContain('import { createSupabaseAdminClient } from "@/lib/supabase/admin";');
    expect(source).toContain('import { fetchLandingMetrics } from "@/lib/server/landing-metrics";');
    expect(source).toContain("fetchLandingMetrics(");
  });

  it("renders ticker metrics from live values instead of static zeros", () => {
    expect(source).toContain("{metrics.reviewsCount}");
    expect(source).toContain("{metrics.modulesCount}");
    expect(source).toContain("{metrics.averageRating.toFixed(1)} / 5");
  });
});
