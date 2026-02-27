import { describe, expect, it } from "vitest";
import { validateFeedbackInput } from "./feedback";

describe("validateFeedbackInput", () => {
  it("accepts valid feedback payload", () => {
    const result = validateFeedbackInput({
      message: "Add a module-level compare view for year 3 electives.",
      pagePath: "/modules?year=3",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.pagePath).toBe("/modules?year=3");
    }
  });

  it("rejects empty message", () => {
    const result = validateFeedbackInput({
      message: "   ",
      pagePath: "/profile",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.message).toMatch(/between 1 and 4000/i);
    }
  });

  it("rejects messages over 4000 characters", () => {
    const result = validateFeedbackInput({
      message: "a".repeat(4001),
      pagePath: "/",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.message).toMatch(/between 1 and 4000/i);
    }
  });

  it("normalizes invalid page paths to root", () => {
    const result = validateFeedbackInput({
      message: "Looks great.",
      pagePath: "https://example.com/not-local",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.pagePath).toBe("/");
    }
  });
});
