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

function tokenizeComment(comment: string): string[] {
  return (
    comment
      .toLowerCase()
      .match(/[a-z]{3,}/g)
      ?.filter((token) => !STOP_WORDS.has(token)) ?? []
  );
}

function incrementCount(map: Map<string, number>, token: string) {
  map.set(token, (map.get(token) ?? 0) + 1);
}

function extractKeywordScores(comments: string[]): Map<string, number> {
  const unigramCounts = new Map<string, number>();
  const bigramCounts = new Map<string, number>();
  const trigramCounts = new Map<string, number>();

  for (const comment of comments) {
    const tokens = tokenizeComment(comment);

    for (let index = 0; index < tokens.length; index += 1) {
      incrementCount(unigramCounts, tokens[index]);

      const bigram = tokens[index + 1]
        ? `${tokens[index]} ${tokens[index + 1]}`
        : null;
      if (bigram) {
        incrementCount(bigramCounts, bigram);
      }

      const trigram =
        tokens[index + 1] && tokens[index + 2]
          ? `${tokens[index]} ${tokens[index + 1]} ${tokens[index + 2]}`
          : null;
      if (trigram) {
        incrementCount(trigramCounts, trigram);
      }
    }
  }

  const keywordScores = new Map<string, number>();
  const accumulateKeywordScores = (phrase: string, score: number) => {
    keywordScores.set(phrase, (keywordScores.get(phrase) ?? 0) + score);
  };

  for (const [token, count] of unigramCounts.entries()) {
    if (count >= 2) {
      accumulateKeywordScores(token, count * 2.2);
    }
  }

  for (const [token, count] of bigramCounts.entries()) {
    if (count >= 2) {
      accumulateKeywordScores(token, count * 2.8);
    }
  }

  for (const [token, count] of trigramCounts.entries()) {
    if (count >= 2) {
      accumulateKeywordScores(token, count * 3.4);
    }
  }

  if (keywordScores.size === 0) {
    for (const [token, count] of unigramCounts.entries()) {
      if (token.length >= 4) {
        accumulateKeywordScores(token, count * 1.4);
      }
    }
  }

  return keywordScores;
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

  const keywordScores = extractKeywordScores(reviews.map((review) => review.comment));
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

  }

  const count = reviews.length;
  const averageTeaching = totals.teaching / count;
  const averageWorkload = totals.workload / count;
  const averageDifficulty = totals.difficulty / count;
  const averageAssessment = totals.assessment / count;

  const topKeywords = Array.from(keywordScores.entries())
    .map(([word, score]) => ({ word, count: Math.max(1, Math.round(score)) }))
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
