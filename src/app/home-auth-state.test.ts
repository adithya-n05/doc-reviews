import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("home page auth state chrome", () => {
  const source = readFileSync("src/app/page.tsx", "utf8");

  it("reads signed-in user from server supabase client", () => {
    expect(source).toContain('import { createSupabaseServerClient } from "@/lib/supabase/server";');
    expect(source).toContain("authClient.auth.getUser()");
  });

  it("shows signed-in indicator in the top-right masthead area", () => {
    expect(source).toContain("Signed in as");
    expect(source).toContain("Go to Modules");
  });
});
