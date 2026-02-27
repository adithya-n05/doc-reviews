import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profile page editorial parity", () => {
  const source = readFileSync("src/app/profile/page.tsx", "utf8");

  it("shows member-since metadata in profile header", () => {
    expect(source).toContain("Member since");
  });

  it("uses mockup-aligned account settings and review activity headings", () => {
    expect(source).toContain("Account Settings");
    expect(source).toContain("Review Activity");
  });
});
