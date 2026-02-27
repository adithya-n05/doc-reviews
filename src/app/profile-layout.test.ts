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

  it("renders your modules heading and helpful-votes top stat", () => {
    expect(source).toContain("Your Modules");
    expect(source).toContain("Helpful votes");
  });

  it("renders editorial account settings rows", () => {
    expect(source).toContain("Email Notifications");
    expect(source).toContain("Weekly Digest");
    expect(source).toContain("Display Name");
    expect(source).toContain("Change Password");
  });

  it("renders review activity summary rows in settings column", () => {
    expect(source).toContain("Reviews written");
    expect(source).toContain("Average rating given");
    expect(source).toContain("Helpful votes received");
  });

  it("includes an affordance to edit enrolled modules", () => {
    expect(source).toContain("Edit Modules");
    expect(source).toContain("href=\"/onboarding\"");
  });
});
