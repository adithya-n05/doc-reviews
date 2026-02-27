import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("helpful reply API route", () => {
  const source = readFileSync("src/app/api/replies/helpful/route.ts", "utf8");

  it("uses server supabase client and reply helpful toggle service", () => {
    expect(source).toContain("createSupabaseServerClient");
    expect(source).toContain("toggleHelpfulVoteForReply");
  });

  it("returns updated helpful vote count after toggle", () => {
    expect(source).toContain('.from("reply_helpful_votes")');
    expect(source).toContain('select("reply_id", { count: "exact", head: true })');
  });
});
