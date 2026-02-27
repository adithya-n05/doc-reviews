import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH =
  "supabase/migrations/20260227195000_add_module_review_insights_review_count.sql";

describe("module review insights review_count migration", () => {
  it("exists as an incremental migration file", () => {
    expect(existsSync(MIGRATION_PATH)).toBe(true);
  });

  it("adds review_count column with a safe default", () => {
    const sql = readFileSync(MIGRATION_PATH, "utf8");

    expect(sql).toContain("alter table public.module_review_insights");
    expect(sql).toContain("add column if not exists review_count integer not null default 0");
  });
});
