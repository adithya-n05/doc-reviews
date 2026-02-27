import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("signup page editorial layout parity", () => {
  const source = readFileSync("src/app/auth/signup/page.tsx", "utf8");

  it("uses plain auth chrome instead of boxed card styling", () => {
    expect(source).toContain('className="auth-card auth-card-plain"');
  });

  it("shows access restriction note under the signup form", () => {
    expect(source).toContain("Access restricted to Imperial College Computing students");
  });
});
