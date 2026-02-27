import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = "supabase/migrations/20260227041000_add_review_tips.sql";

describe("reviews tips migration", () => {
  it("exists as an incremental migration file", () => {
    expect(existsSync(MIGRATION_PATH)).toBe(true);
  });

  it("adds nullable tips column to reviews", () => {
    const sql = readFileSync(MIGRATION_PATH, "utf8");
    expect(sql).toContain("alter table public.reviews");
    expect(sql).toContain("add column if not exists tips text;");
  });
});
