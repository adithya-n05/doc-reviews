import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("supabase module_review_insights table types", () => {
  const source = readFileSync("src/lib/supabase/database.types.ts", "utf8");

  it("includes cache fields for summary, keywords, sentiment, and source", () => {
    expect(source).toContain("module_review_insights");
    expect(source).toContain("review_count: number");
    expect(source).toContain("reviews_fingerprint: string");
    expect(source).toContain("summary: string");
    expect(source).toContain("top_keywords: Json");
    expect(source).toContain("sentiment: Json");
    expect(source).toContain("source: string");
  });
});
