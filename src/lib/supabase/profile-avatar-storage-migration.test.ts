import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH =
  "supabase/migrations/20260227133000_add_profile_avatar_storage.sql";

describe("profile avatar storage migration", () => {
  it("exists as an incremental migration file", () => {
    expect(existsSync(MIGRATION_PATH)).toBe(true);
  });

  it("creates profile avatar bucket and scoped storage policies", () => {
    const sql = readFileSync(MIGRATION_PATH, "utf8").toLowerCase();
    expect(sql).toContain("insert into storage.buckets");
    expect(sql).toContain("profile-avatars");
    expect(sql).toContain("storage.objects");
    expect(sql).toContain("storage.foldername(name)");
  });
});
