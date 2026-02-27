import { deriveReviewInsights } from "@/lib/metrics/review-insights";

export type ReviewInsightInput = {
  teachingRating: number;
  workloadRating: number;
  difficultyRating: number;
  assessmentRating: number;
  comment: string;
};

export type ModuleReviewInsightPayload = {
  summary: string;
  topKeywords: Array<{ word: string; count: number }>;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  source: "ai" | "fallback";
};

type GenerateOptions = {
  apiKey: string | undefined;
  model: string;
  fetchImpl?: typeof fetch;
};

type ParsedAiResponse = Omit<ModuleReviewInsightPayload, "source">;

function normalizeKeywordList(value: unknown): Array<{ word: string; count: number }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const record = item as Record<string, unknown>;
      const word =
        typeof record.word === "string"
          ? record.word.trim()
          : typeof record.keyword === "string"
            ? record.keyword.trim()
            : "";
      const countRaw = record.count;
      const count =
        typeof countRaw === "number" && Number.isFinite(countRaw)
          ? Math.max(1, Math.round(countRaw))
          : 1;

      if (!word) {
        return null;
      }

      return { word, count };
    })
    .filter((item): item is { word: string; count: number } => Boolean(item))
    .slice(0, 8);
}

function normalizeSentiment(
  value: unknown,
): { positive: number; neutral: number; negative: number } | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const positive = Number(record.positive);
  const neutral = Number(record.neutral);
  const negative = Number(record.negative);

  if (
    !Number.isFinite(positive) ||
    !Number.isFinite(neutral) ||
    !Number.isFinite(negative)
  ) {
    return null;
  }

  return {
    positive: Math.max(0, Math.round(positive)),
    neutral: Math.max(0, Math.round(neutral)),
    negative: Math.max(0, Math.round(negative)),
  };
}

function toFallbackPayload(reviews: ReviewInsightInput[]): ModuleReviewInsightPayload {
  const fallback = deriveReviewInsights(reviews);
  if (fallback.reviewCount === 0) {
    return {
      summary: "No student reviews have been submitted yet.",
      topKeywords: [],
      sentiment: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
      source: "fallback",
    };
  }

  const commonThemes = fallback.topKeywords.slice(0, 3).map((item) => item.word);
  const summary =
    commonThemes.length > 0
      ? `Based on ${fallback.reviewCount} student reviews, this module scores ${fallback.averages.overall.toFixed(
          1,
        )}/5 overall. Common themes include ${commonThemes.join(", ")}.`
      : `Based on ${fallback.reviewCount} student reviews, this module scores ${fallback.averages.overall.toFixed(
          1,
        )}/5 overall.`;

  return {
    summary,
    topKeywords: fallback.topKeywords.slice(0, 8),
    sentiment: fallback.sentiment,
    source: "fallback",
  };
}

function parseAiPayload(rawContent: string): ParsedAiResponse | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  const summary =
    typeof record.summary === "string" ? record.summary.trim() : "";
  const topKeywords = normalizeKeywordList(record.keywords ?? record.topKeywords);
  const sentiment = normalizeSentiment(record.sentiment);

  if (!summary || !sentiment) {
    return null;
  }

  return {
    summary,
    topKeywords,
    sentiment,
  };
}

async function requestAiPayload(
  reviews: ReviewInsightInput[],
  options: Required<Pick<GenerateOptions, "apiKey" | "model">> & {
    fetchImpl: typeof fetch;
  },
): Promise<ParsedAiResponse | null> {
  const corpus = reviews
    .map((review, index) => `${index + 1}. ${review.comment.trim()}`)
    .join("\n");

  const response = await options.fetchImpl("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      temperature: 0.2,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You analyze student module reviews. Return strict JSON only with keys: summary, keywords, sentiment. summary must be 2-4 sentences. keywords must be an array (max 8) of {word,count}. sentiment must include positive, neutral, negative integer counts.",
        },
        {
          role: "user",
          content: `Analyze the following module reviews:\n${corpus}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    return null;
  }

  return parseAiPayload(content);
}

export async function generateModuleReviewInsightPayload(
  reviews: ReviewInsightInput[],
  options: GenerateOptions,
): Promise<ModuleReviewInsightPayload> {
  const fallback = toFallbackPayload(reviews);
  const apiKey = options.apiKey?.trim() ?? "";
  if (!apiKey || reviews.length === 0) {
    return fallback;
  }

  const fetchImpl = options.fetchImpl ?? fetch;

  try {
    const aiPayload = await requestAiPayload(reviews, {
      apiKey,
      model: options.model,
      fetchImpl,
    });

    if (!aiPayload) {
      return fallback;
    }

    return {
      summary: aiPayload.summary,
      topKeywords:
        aiPayload.topKeywords.length > 0
          ? aiPayload.topKeywords
          : fallback.topKeywords,
      sentiment: aiPayload.sentiment,
      source: "ai",
    };
  } catch {
    return fallback;
  }
}
