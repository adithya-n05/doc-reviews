import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("supabase reply_helpful_votes table types", () => {
  const source = readFileSync("src/lib/supabase/database.types.ts", "utf8");

  it("includes reply helpful vote row and relation columns", () => {
    expect(source).toContain("reply_helpful_votes");
    expect(source).toContain("reply_id: string");
    expect(source).toContain("user_id: string");
    expect(source).toContain("reply_helpful_votes_reply_id_fkey");
  });
});
