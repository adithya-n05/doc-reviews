import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("signup callback URL origin resolution", () => {
  const source = readFileSync("src/app/actions/auth.ts", "utf8");

  it("resolves callback URL from request headers before env fallback", () => {
    expect(source).toContain('import { headers } from "next/headers";');
    expect(source).toContain("x-forwarded-host");
    expect(source).toContain("x-forwarded-proto");
    expect(source).toContain("resolveSignupCallbackUrl");
  });
});
