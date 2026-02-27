import { describe, expect, it } from "vitest";
import { buildLandingMetrics } from "@/lib/metrics/landing-metrics";

describe("buildLandingMetrics", () => {
  it("computes weighted averages and recommendation rate", () => {
    const result = buildLandingMetrics({
      modulesCount: 81,
      aggregates: [
        { reviewCount: 2, avgOverall: 4, avgWorkload: 3 },
        { reviewCount: 1, avgOverall: 2, avgWorkload: 5 },
      ],
      reviews: [
        { teachingRating: 5, assessmentRating: 4 },
        { teachingRating: 2, assessmentRating: 3 },
        { teachingRating: 4, assessmentRating: 5 },
      ],
    });

    expect(result.modulesCount).toBe(81);
    expect(result.reviewsCount).toBe(3);
    expect(result.averageRating).toBeCloseTo(3.33, 2);
    expect(result.topModuleRating).toBe(4);
    expect(result.averageWorkload).toBeCloseTo(3.67, 2);
    expect(result.recommendPercentage).toBe(67);
    expect(result.modulesWithReviews).toBe(2);
  });

  it("handles empty input without NaN", () => {
    const result = buildLandingMetrics({
      modulesCount: 0,
      aggregates: [],
      reviews: [],
    });

    expect(result).toEqual({
      modulesCount: 0,
      reviewsCount: 0,
      averageRating: 0,
      topModuleRating: 0,
      averageWorkload: 0,
      recommendPercentage: 0,
      modulesWithReviews: 0,
    });
  });
});
