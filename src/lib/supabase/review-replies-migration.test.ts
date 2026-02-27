import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = "supabase/migrations/20260227082000_add_review_replies.sql";

describe("review replies migration", () => {
  it("exists as an incremental migration file", () => {
    expect(existsSync(MIGRATION_PATH)).toBe(true);
  });

  it("creates threaded review replies table with rls policies", () => {
    const sql = readFileSync(MIGRATION_PATH, "utf8");

    expect(sql).toContain("create table if not exists public.review_replies");
    expect(sql).toContain("parent_reply_id uuid");
    expect(sql).toContain("references public.review_replies(id) on delete cascade");
    expect(sql).toContain("create policy \"review_replies_select_authenticated\"");
    expect(sql).toContain("create policy \"review_replies_insert_owner\"");
    expect(sql).toContain("create policy \"review_replies_delete_owner\"");
  });
});
