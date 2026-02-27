import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("supabase review_replies table types", () => {
  const source = readFileSync("src/lib/supabase/database.types.ts", "utf8");

  it("includes threaded reply columns", () => {
    expect(source).toContain("review_replies");
    expect(source).toContain("review_id: string");
    expect(source).toContain("parent_reply_id: string | null");
    expect(source).toContain("body: string");
  });
});
