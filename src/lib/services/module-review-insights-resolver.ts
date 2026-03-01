import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "@/lib/supabase/database.types";
import {
  createModuleReviewFingerprint,
  toModuleInsightPayloadFromCacheRow,
  upsertModuleReviewInsightsCacheRow,
} from "./module-review-insights-cache-service";
import {
  generateModuleReviewInsightPayload,
  type ModuleReviewInsightPayload,
} from "./module-review-insights-service";

type ResolveReviewInput = {
  id: string;
  updatedAt: string;
  teachingRating: number;
  workloadRating: number;
  difficultyRating: number;
  assessmentRating: number;
  comment: string;
};

type ResolveParams = {
  moduleId: string;
  reviews: ResolveReviewInput[];
  cachedRow: Pick<
    Tables<"module_review_insights">,
    | "module_id"
    | "review_count"
    | "reviews_fingerprint"
    | "summary"
    | "top_keywords"
    | "sentiment"
    | "source"
    | "generated_at"
    | "updated_at"
  > | null;
  apiKey: string | undefined;
  model: string;
  adminClient?: SupabaseClient | null;
  fetchImpl?: typeof fetch;
};

type ResolveDeps = {
  generateInsights?: typeof generateModuleReviewInsightPayload;
  persistInsights?: typeof upsertModuleReviewInsightsCacheRow;
};

async function persistInsightsSafely(
  adminClient: SupabaseClient,
  persistInsights: typeof upsertModuleReviewInsightsCacheRow,
  input: {
    moduleId: string;
    reviewCount: number;
    reviewsFingerprint: string;
    summary: string;
    topKeywords: Array<{ word: string; count: number }>;
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    source: "ai" | "fallback";
  },
): Promise<void> {
  try {
    await persistInsights(adminClient, input);
  } catch {
    // Cache persistence is best-effort and must not break module detail rendering.
  }
}

export async function resolveModuleReviewInsights(
  params: ResolveParams,
  deps: ResolveDeps = {},
): Promise<{
  insights: ModuleReviewInsightPayload;
  reviewsFingerprint: string;
  generatedAt: string | null;
  reviewCount: number;
}> {
  const generateInsights = deps.generateInsights ?? generateModuleReviewInsightPayload;
  const persistInsights = deps.persistInsights ?? upsertModuleReviewInsightsCacheRow;

  const reviewsFingerprint = createModuleReviewFingerprint(
    params.reviews.map((review) => ({
      id: review.id,
      updatedAt: review.updatedAt,
    })),
  );

  const reviewCorpus = params.reviews.map((review) => ({
    teachingRating: review.teachingRating,
    workloadRating: review.workloadRating,
    difficultyRating: review.difficultyRating,
    assessmentRating: review.assessmentRating,
    comment: review.comment,
  }));

  if (
    params.cachedRow &&
    params.cachedRow.reviews_fingerprint === reviewsFingerprint
  ) {
    const cachedInsights = toModuleInsightPayloadFromCacheRow(params.cachedRow);
    if (
      cachedInsights.topKeywords.length > 0 ||
      reviewCorpus.length === 0
    ) {
      return {
        insights: cachedInsights,
        reviewsFingerprint,
        generatedAt: params.cachedRow.generated_at,
        reviewCount: params.cachedRow.review_count,
      };
    }

    const fallbackInsights = await generateInsights(reviewCorpus, {
      apiKey: "",
      model: params.model,
      fetchImpl: params.fetchImpl,
    });

    if (params.adminClient) {
      await persistInsightsSafely(params.adminClient, persistInsights, {
        moduleId: params.moduleId,
        reviewCount: reviewCorpus.length,
        reviewsFingerprint,
        summary: fallbackInsights.summary,
        topKeywords: fallbackInsights.topKeywords,
        sentiment: fallbackInsights.sentiment,
        source: fallbackInsights.source,
      });
    }

    return {
      insights: fallbackInsights,
      reviewsFingerprint,
      generatedAt: new Date().toISOString(),
      reviewCount: reviewCorpus.length,
    };
  }

  if (params.cachedRow) {
    const fallbackInsights = await generateInsights(reviewCorpus, {
      apiKey: "",
      model: params.model,
      fetchImpl: params.fetchImpl,
    });

    if (params.adminClient) {
      await persistInsightsSafely(params.adminClient, persistInsights, {
        moduleId: params.moduleId,
        reviewCount: reviewCorpus.length,
        reviewsFingerprint,
        summary: fallbackInsights.summary,
        topKeywords: fallbackInsights.topKeywords,
        sentiment: fallbackInsights.sentiment,
        source: fallbackInsights.source,
      });
    }

    return {
      insights: fallbackInsights,
      reviewsFingerprint,
      generatedAt: new Date().toISOString(),
      reviewCount: reviewCorpus.length,
    };
  }

  const fallbackInsights = await generateInsights(reviewCorpus, {
    apiKey: "",
    model: params.model,
    fetchImpl: params.fetchImpl,
  });

  if (params.adminClient) {
    await persistInsightsSafely(params.adminClient, persistInsights, {
      moduleId: params.moduleId,
      reviewCount: reviewCorpus.length,
      reviewsFingerprint,
      summary: fallbackInsights.summary,
      topKeywords: fallbackInsights.topKeywords,
      sentiment: fallbackInsights.sentiment,
      source: fallbackInsights.source,
    });
  }

  return {
    insights: fallbackInsights,
    reviewsFingerprint,
    generatedAt: new Date().toISOString(),
    reviewCount: reviewCorpus.length,
  };
}
