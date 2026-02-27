import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("signup action existing-account guard", () => {
  const source = readFileSync("src/app/actions/auth.ts", "utf8");

  it("checks email availability before invoking auth signup", () => {
    expect(source).toContain('import { createSupabaseAdminClient } from "@/lib/supabase/admin";');
    expect(source).toContain('import { checkSignupEmailAvailability } from "@/lib/services/signup-availability";');
    expect(source).toContain("checkSignupEmailAvailability");
  });

  it("resends verification for existing unverified accounts", () => {
    expect(source).toContain("availability.status === \"unverified\"");
    expect(source).toContain("resendSignupVerification");
    expect(source).toContain("redirect(\"/auth/verify?resent=1\")");
  });
});
