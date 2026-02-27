type ReviewLike = {
  teachingRating: number;
  workloadRating: number;
  difficultyRating: number;
  assessmentRating: number;
  comment: string;
};

type KeywordCount = {
  word: string;
  count: number;
};

type ReviewInsights = {
  reviewCount: number;
  averages: {
    teaching: number;
    workload: number;
    difficulty: number;
    assessment: number;
    overall: number;
  };
  topKeywords: KeywordCount[];
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "had",
  "has",
  "have",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "very",
  "was",
  "week",
  "weekly",
  "with",
]);

const POSITIVE_WORDS = new Set([
  "excellent",
  "clear",
  "great",
  "fair",
  "rewarding",
  "helpful",
  "solid",
  "good",
  "fantastic",
]);

const NEGATIVE_WORDS = new Set([
  "poor",
  "confusing",
  "stressful",
  "bad",
  "unclear",
  "unfair",
  "intense",
  "overwhelming",
]);

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function scoreSentiment(comment: string): "positive" | "neutral" | "negative" {
  const words = comment.toLowerCase().match(/[a-z]+/g) ?? [];
  let score = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.has(word)) score += 1;
    if (NEGATIVE_WORDS.has(word)) score -= 1;
  }

  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

export function deriveReviewInsights(reviews: ReviewLike[]): ReviewInsights {
  if (reviews.length === 0) {
    return {
      reviewCount: 0,
      averages: {
        teaching: 0,
        workload: 0,
        difficulty: 0,
        assessment: 0,
        overall: 0,
      },
      topKeywords: [],
      sentiment: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
    };
  }

  const totals = {
    teaching: 0,
    workload: 0,
    difficulty: 0,
    assessment: 0,
  };

  const keywords = new Map<string, number>();
  const sentiment = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  for (const review of reviews) {
    totals.teaching += review.teachingRating;
    totals.workload += review.workloadRating;
    totals.difficulty += review.difficultyRating;
    totals.assessment += review.assessmentRating;

    sentiment[scoreSentiment(review.comment)] += 1;

    const words = review.comment.toLowerCase().match(/[a-z]{3,}/g) ?? [];
    for (const word of words) {
      if (STOP_WORDS.has(word)) continue;
      keywords.set(word, (keywords.get(word) ?? 0) + 1);
    }
  }

  const count = reviews.length;
  const averageTeaching = totals.teaching / count;
  const averageWorkload = totals.workload / count;
  const averageDifficulty = totals.difficulty / count;
  const averageAssessment = totals.assessment / count;

  const topKeywords = Array.from(keywords.entries())
    .map(([word, keywordCount]) => ({ word, count: keywordCount }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 8);

  return {
    reviewCount: count,
    averages: {
      teaching: round2(averageTeaching),
      workload: round2(averageWorkload),
      difficulty: round2(averageDifficulty),
      assessment: round2(averageAssessment),
      overall: round2(
        (averageTeaching + averageWorkload + averageDifficulty + averageAssessment) /
          4,
      ),
    },
    topKeywords,
    sentiment,
  };
}
