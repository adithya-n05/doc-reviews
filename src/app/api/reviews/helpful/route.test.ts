import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("helpful review API route", () => {
  const source = readFileSync("src/app/api/reviews/helpful/route.ts", "utf8");

  it("uses server supabase client and review helpful toggle service", () => {
    expect(source).toContain("createSupabaseServerClient");
    expect(source).toContain("toggleHelpfulVoteForReview");
  });

  it("returns updated helpful vote count after toggle", () => {
    expect(source).toContain('.from("review_helpful_votes")');
    expect(source).toContain('select("review_id", { count: "exact", head: true })');
  });
});
