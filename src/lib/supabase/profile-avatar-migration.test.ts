import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH =
  "supabase/migrations/20260227094000_add_profile_avatar_url.sql";

describe("profile avatar migration", () => {
  it("exists as an incremental migration file", () => {
    expect(existsSync(MIGRATION_PATH)).toBe(true);
  });

  it("adds avatar_url to profiles", () => {
    const sql = readFileSync(MIGRATION_PATH, "utf8");
    expect(sql).toContain("alter table public.profiles");
    expect(sql).toContain("add column if not exists avatar_url text");
  });
});
