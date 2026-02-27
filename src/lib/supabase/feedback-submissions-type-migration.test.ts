import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH =
  "supabase/migrations/20260227203000_add_feedback_type_and_context_to_feedback_submissions.sql";

describe("feedback submissions type/context migration", () => {
  it("exists as an incremental migration file", () => {
    expect(existsSync(MIGRATION_PATH)).toBe(true);
  });

  it("adds feedback_type and context columns", () => {
    const sql = readFileSync(MIGRATION_PATH, "utf8");

    expect(sql).toContain("add column if not exists feedback_type text");
    expect(sql).toContain("add column if not exists context jsonb");
    expect(sql).toContain("check (feedback_type in");
  });
});
