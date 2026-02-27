import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("supabase profiles table avatar types", () => {
  const source = readFileSync("src/lib/supabase/database.types.ts", "utf8");

  it("includes avatar_url across row/insert/update profile types", () => {
    expect(source).toContain("avatar_url: string | null");
    expect(source).toContain("avatar_url?: string | null");
  });
});
