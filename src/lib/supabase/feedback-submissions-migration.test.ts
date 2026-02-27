import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH =
  "supabase/migrations/20260227090000_add_feedback_submissions.sql";

describe("feedback submissions migration", () => {
  it("exists as an incremental migration file", () => {
    expect(existsSync(MIGRATION_PATH)).toBe(true);
  });

  it("creates feedback_submissions table and indexes", () => {
    const sql = readFileSync(MIGRATION_PATH, "utf8");

    expect(sql).toContain("create table if not exists public.feedback_submissions");
    expect(sql).toContain("message text not null");
    expect(sql).toContain("page_path text not null");
    expect(sql).toContain("user_id uuid");
    expect(sql).toContain("create index if not exists feedback_submissions_created_at_idx");
  });
});
