import { describe, expect, it, vi } from "vitest";
import { upsertReviewForUser } from "@/lib/services/review-service";

describe("upsertReviewForUser", () => {
  it("returns validation errors without calling persistence", async () => {
    const persistence = {
      upsertReview: vi.fn(async () => ({ error: null })),
    };

    const result = await upsertReviewForUser(
      persistence,
      {
        userId: "user-1",
        moduleId: "module-1",
        moduleCode: "40008",
      },
      {
        teachingRating: 0,
        workloadRating: 2,
        difficultyRating: 3,
        assessmentRating: 4,
        comment: "too short",
      },
    );

    expect(result).toEqual({
      ok: false,
      type: "validation",
      errors: {
        teachingRating: "Teaching rating must be between 1 and 5.",
        comment: "Comment must be at least 80 characters.",
      },
    });
    expect(persistence.upsertReview).not.toHaveBeenCalled();
  });

  it("passes normalized validated data to persistence", async () => {
    const persistence = {
      upsertReview: vi.fn(async () => ({ error: null })),
    };

    const result = await upsertReviewForUser(
      persistence,
      {
        userId: "user-1",
        moduleId: "module-1",
        moduleCode: " 40008 ",
      },
      {
        teachingRating: 5,
        workloadRating: 4,
        difficultyRating: 3,
        assessmentRating: 2,
        comment:
          "  This module had clear lectures and useful assessments. The weekly sheets took time but consistently reinforced key ideas.  ",
      },
    );

    expect(result).toEqual({ ok: true });
    expect(persistence.upsertReview).toHaveBeenCalledWith({
      userId: "user-1",
      moduleId: "module-1",
      teachingRating: 5,
      workloadRating: 4,
      difficultyRating: 3,
      assessmentRating: 2,
      comment:
        "This module had clear lectures and useful assessments. The weekly sheets took time but consistently reinforced key ideas.",
    });
  });

  it("returns database failures from persistence", async () => {
    const persistence = {
      upsertReview: vi.fn(async () => ({ error: "duplicate review" })),
    };

    const result = await upsertReviewForUser(
      persistence,
      {
        userId: "user-1",
        moduleId: "module-1",
        moduleCode: "40008",
      },
      {
        teachingRating: 5,
        workloadRating: 4,
        difficultyRating: 3,
        assessmentRating: 2,
        comment:
          "This module had clear lectures and useful assessments. The weekly sheets took time but consistently reinforced key ideas.",
      },
    );

    expect(result).toEqual({
      ok: false,
      type: "db",
      message: "duplicate review",
    });
  });
});
