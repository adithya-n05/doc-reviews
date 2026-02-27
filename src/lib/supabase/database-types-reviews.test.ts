import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("supabase reviews table types", () => {
  const source = readFileSync("src/lib/supabase/database.types.ts", "utf8");

  it("includes optional tips column in reviews Row/Insert/Update", () => {
    expect(source).toContain("tips: string | null");
    expect(source).toContain("tips?: string | null");
  });
});
