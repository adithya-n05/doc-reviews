import { describe, expect, it } from "vitest";
import { validateReviewInput } from "./review";

describe("validateReviewInput", () => {
  const valid = {
    moduleCode: "40008",
    teachingRating: 5,
    workloadRating: 3,
    difficultyRating: 4,
    assessmentRating: 4,
    comment:
      "This module was intense but clear. Weekly problems aligned with lectures, and the final exam reflected the tutorials very well.",
  };

  it("accepts valid review input", () => {
    const result = validateReviewInput(valid);
    expect(result.ok).toBe(true);
  });

  it("rejects missing module code", () => {
    const result = validateReviewInput({ ...valid, moduleCode: "   " });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.moduleCode).toMatch(/required/i);
    }
  });

  it("rejects out-of-range teaching rating", () => {
    const result = validateReviewInput({ ...valid, teachingRating: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.teachingRating).toMatch(/between 1 and 5/i);
    }
  });

  it("rejects out-of-range workload rating", () => {
    const result = validateReviewInput({ ...valid, workloadRating: 9 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.workloadRating).toMatch(/between 1 and 5/i);
    }
  });

  it("rejects out-of-range difficulty rating", () => {
    const result = validateReviewInput({ ...valid, difficultyRating: -1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.difficultyRating).toMatch(/between 1 and 5/i);
    }
  });

  it("rejects out-of-range assessment rating", () => {
    const result = validateReviewInput({ ...valid, assessmentRating: 6 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.assessmentRating).toMatch(/between 1 and 5/i);
    }
  });

  it("rejects short comments", () => {
    const result = validateReviewInput({ ...valid, comment: "Too short." });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.comment).toMatch(/at least 80/i);
    }
  });

  it("normalizes whitespace in comments", () => {
    const result = validateReviewInput({
      ...valid,
      comment:
        "   This module was intense but clear. Weekly problems aligned with lectures, and the final exam reflected the tutorials very well.   ",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.comment.startsWith("This module")).toBe(true);
      expect(result.value.comment.endsWith("well.")).toBe(true);
    }
  });
});
