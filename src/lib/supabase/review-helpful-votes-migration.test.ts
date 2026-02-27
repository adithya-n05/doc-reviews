import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = "supabase/migrations/20260227070000_add_review_helpful_votes.sql";

describe("review helpful votes migration", () => {
  it("exists as an incremental migration file", () => {
    expect(existsSync(MIGRATION_PATH)).toBe(true);
  });

  it("creates helpful votes table and RLS policies", () => {
    const sql = readFileSync(MIGRATION_PATH, "utf8");
    expect(sql).toContain("create table if not exists public.review_helpful_votes");
    expect(sql).toContain("unique (review_id, user_id)");
    expect(sql).toContain("review_helpful_votes_insert_owner_verified");
    expect(sql).toContain("review_helpful_votes_delete_owner");
  });
});
