import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const FIX_MIGRATION_PATH =
  "supabase/migrations/20260227071500_fix_review_helpful_votes_insert_policy.sql";

describe("review helpful votes insert policy migration", () => {
  it("exists as an incremental migration file", () => {
    expect(existsSync(FIX_MIGRATION_PATH)).toBe(true);
  });

  it("uses owner check without querying auth.users", () => {
    const migration = readFileSync(FIX_MIGRATION_PATH, "utf8");

    expect(migration).toContain(
      'drop policy if exists "review_helpful_votes_insert_owner_verified"',
    );
    expect(migration).toContain(
      'create policy "review_helpful_votes_insert_owner_verified"',
    );
    expect(migration).toContain("with check (auth.uid() = user_id);");
    expect(migration).not.toContain("from auth.users");
  });
});
