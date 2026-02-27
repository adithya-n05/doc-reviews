import { describe, expect, it } from "vitest";
import {
  canManageReviews,
  isEmailVerified,
  needsOnboarding,
} from "@/lib/auth/user-access";

describe("isEmailVerified", () => {
  it("returns false for null user or missing confirmation timestamp", () => {
    expect(isEmailVerified(null)).toBe(false);
    expect(isEmailVerified({ email_confirmed_at: null })).toBe(false);
  });

  it("returns true when email_confirmed_at exists", () => {
    expect(isEmailVerified({ email_confirmed_at: "2026-02-27T00:00:00.000Z" })).toBe(
      true,
    );
  });
});

describe("needsOnboarding", () => {
  it("returns true when profile is missing year or degree track", () => {
    expect(needsOnboarding(null)).toBe(true);
    expect(needsOnboarding({ year: null, degree_track: "BEng" })).toBe(true);
    expect(needsOnboarding({ year: 1, degree_track: null })).toBe(true);
    expect(needsOnboarding({ year: 1, degree_track: "  " })).toBe(true);
  });

  it("returns false for complete onboarding profile", () => {
    expect(needsOnboarding({ year: 3, degree_track: "MEng AI" })).toBe(false);
  });
});

describe("canManageReviews", () => {
  it("requires verified email and complete onboarding", () => {
    expect(
      canManageReviews(
        { email_confirmed_at: "2026-02-27T00:00:00.000Z" },
        { year: 2, degree_track: "BEng" },
      ),
    ).toBe(true);

    expect(
      canManageReviews(
        { email_confirmed_at: null },
        { year: 2, degree_track: "BEng" },
      ),
    ).toBe(false);

    expect(
      canManageReviews(
        { email_confirmed_at: "2026-02-27T00:00:00.000Z" },
        { year: null, degree_track: "BEng" },
      ),
    ).toBe(false);
  });
});
