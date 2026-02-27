import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH =
  "supabase/migrations/20260227073000_add_module_review_insights.sql";

describe("module review insights migration", () => {
  it("exists as an incremental migration file", () => {
    expect(existsSync(MIGRATION_PATH)).toBe(true);
  });

  it("creates cache table with fingerprint and ai/fallback source metadata", () => {
    const sql = readFileSync(MIGRATION_PATH, "utf8");

    expect(sql).toContain("create table if not exists public.module_review_insights");
    expect(sql).toContain("module_id uuid primary key");
    expect(sql).toContain("reviews_fingerprint text not null");
    expect(sql).toContain("summary text not null");
    expect(sql).toContain("top_keywords jsonb not null");
    expect(sql).toContain("sentiment jsonb not null");
    expect(sql).toContain("source text not null");
    expect(sql).toContain("check (source in ('ai', 'fallback'))");
    expect(sql).toContain("create policy \"module_review_insights_select_authenticated\"");
  });
});
