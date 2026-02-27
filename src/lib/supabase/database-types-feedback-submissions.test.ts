import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("supabase feedback_submissions table types", () => {
  const source = readFileSync("src/lib/supabase/database.types.ts", "utf8");

  it("includes feedback_submissions table metadata", () => {
    expect(source).toContain("feedback_submissions");
    expect(source).toContain("message: string");
    expect(source).toContain("page_path: string");
    expect(source).toContain("feedback_type: string");
    expect(source).toContain("context: Json");
    expect(source).toContain("user_id: string | null");
  });
});
