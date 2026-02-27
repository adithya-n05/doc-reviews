import { describe, expect, it } from "vitest";
import { deriveReviewInsights } from "./review-insights";

describe("deriveReviewInsights", () => {
  const reviews = [
    {
      teachingRating: 5,
      workloadRating: 3,
      difficultyRating: 4,
      assessmentRating: 5,
      comment:
        "Excellent lectures and clear tutorials. Workload is heavy but fair and rewarding.",
    },
    {
      teachingRating: 4,
      workloadRating: 4,
      difficultyRating: 4,
      assessmentRating: 4,
      comment:
        "Great module content. The exam was fair, but weekly workload felt intense.",
    },
    {
      teachingRating: 2,
      workloadRating: 5,
      difficultyRating: 5,
      assessmentRating: 2,
      comment:
        "Poor pacing and confusing instructions. Very stressful during assessment week.",
    },
  ];

  it("computes averages and review count", () => {
    const result = deriveReviewInsights(reviews);

    expect(result.reviewCount).toBe(3);
    expect(result.averages.teaching).toBeCloseTo(3.67, 2);
    expect(result.averages.workload).toBeCloseTo(4, 2);
    expect(result.averages.difficulty).toBeCloseTo(4.33, 2);
    expect(result.averages.assessment).toBeCloseTo(3.67, 2);
    expect(result.averages.overall).toBeCloseTo(3.92, 2);
  });

  it("extracts most mentioned keywords excluding stop words", () => {
    const result = deriveReviewInsights(reviews);

    expect(result.topKeywords.length).toBeGreaterThan(0);
    const words = result.topKeywords.map((item) => item.word);
    expect(words).toContain("workload");
    expect(words).toContain("fair");
    expect(words).not.toContain("the");
  });

  it("extracts meaningful multi-word phrases for better insight quality", () => {
    const result = deriveReviewInsights([
      {
        teachingRating: 4,
        workloadRating: 4,
        difficultyRating: 4,
        assessmentRating: 4,
        comment:
          "Weekly workload was intense but the weekly workload prepared us well for the final exam.",
      },
      {
        teachingRating: 5,
        workloadRating: 3,
        difficultyRating: 3,
        assessmentRating: 5,
        comment:
          "The final exam felt fair and the weekly workload was still manageable overall.",
      },
    ]);

    const terms = result.topKeywords.map((item) => item.word);
    expect(terms).toContain("weekly workload");
    expect(terms).toContain("final exam");
  });

  it("provides sentiment distribution", () => {
    const result = deriveReviewInsights(reviews);

    expect(result.sentiment.positive).toBeGreaterThan(0);
    expect(result.sentiment.negative).toBeGreaterThan(0);
    expect(result.sentiment.neutral).toBeGreaterThanOrEqual(0);
    expect(
      result.sentiment.positive +
        result.sentiment.neutral +
        result.sentiment.negative,
    ).toBe(3);
  });

  it("handles empty input safely", () => {
    const result = deriveReviewInsights([]);

    expect(result.reviewCount).toBe(0);
    expect(result.averages.overall).toBe(0);
    expect(result.topKeywords).toEqual([]);
    expect(result.sentiment).toEqual({
      positive: 0,
      neutral: 0,
      negative: 0,
    });
  });
});
