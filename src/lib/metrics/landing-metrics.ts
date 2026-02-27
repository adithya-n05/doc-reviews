type LandingAggregateRow = {
  reviewCount: number;
  avgOverall: number;
  avgWorkload: number;
};

type LandingReviewRow = {
  teachingRating: number;
  assessmentRating: number;
};

export type LandingMetrics = {
  modulesCount: number;
  reviewsCount: number;
  averageRating: number;
  topModuleRating: number;
  averageWorkload: number;
  recommendPercentage: number;
  modulesWithReviews: number;
};

export function buildLandingMetrics(input: {
  modulesCount: number;
  aggregates: LandingAggregateRow[];
  reviews: LandingReviewRow[];
}): LandingMetrics {
  const reviewsCount = input.aggregates.reduce((sum, row) => sum + row.reviewCount, 0);
  const weightedOverall =
    reviewsCount > 0
      ? input.aggregates.reduce(
          (sum, row) => sum + row.avgOverall * row.reviewCount,
          0,
        ) / reviewsCount
      : 0;

  const weightedWorkload =
    reviewsCount > 0
      ? input.aggregates.reduce(
          (sum, row) => sum + row.avgWorkload * row.reviewCount,
          0,
        ) / reviewsCount
      : 0;

  const topModuleRating =
    input.aggregates.length > 0
      ? Math.max(...input.aggregates.map((row) => row.avgOverall))
      : 0;

  const recommendCount = input.reviews.filter(
    (review) => review.teachingRating >= 4 && review.assessmentRating >= 4,
  ).length;
  const recommendPercentage =
    input.reviews.length > 0
      ? Math.round((recommendCount / input.reviews.length) * 100)
      : 0;

  return {
    modulesCount: input.modulesCount,
    reviewsCount,
    averageRating: Number(weightedOverall.toFixed(2)),
    topModuleRating: Number(topModuleRating.toFixed(2)),
    averageWorkload: Number(weightedWorkload.toFixed(2)),
    recommendPercentage,
    modulesWithReviews: input.aggregates.filter((row) => row.reviewCount > 0).length,
  };
}
