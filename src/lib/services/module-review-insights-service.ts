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
type SemanticKeywordRule = {
  label: string;
  patterns: RegExp[];
};

const SEMANTIC_KEYWORD_RULES: SemanticKeywordRule[] = [
  {
    label: "teaching clarity",
    patterns: [/\blecture(?:s)?\b/i, /\bteaching\b/i, /\bclear(?:ly)?\b/i, /\bexplain(?:ed|s|ing)?\b/i],
  },
  {
    label: "tutorial support",
    patterns: [/\btutorial(?:s)?\b/i, /\bproblem sheet(?:s)?\b/i, /\boffice hour(?:s)?\b/i, /\bsupport\b/i],
  },
  {
    label: "assessment fairness",
    patterns: [/\bassessment(?:s)?\b/i, /\bexam(?:s)?\b/i, /\bcoursework\b/i, /\bfair(?:ness)?\b/i],
  },
  {
    label: "workload management",
    patterns: [/\bworkload\b/i, /\bdeadline(?:s)?\b/i, /\bweekly\b/i, /\bmanageable\b/i, /\btime\b/i],
  },
  {
    label: "module difficulty",
    patterns: [/\bchallenging\b/i, /\bdifficult(?:y)?\b/i, /\bhard\b/i, /\beasy\b/i, /\bcomplex\b/i],
  },
  {
    label: "revision readiness",
    patterns: [/\brevision\b/i, /\bpractic(?:e|ed|es|ing)\b/i, /\bprepar(?:e|ed|ing|ation)\b/i, /\bfinal exam\b/i],
  },
  {
    label: "practical application",
    patterns: [/\blab(?:s)?\b/i, /\bpractical\b/i, /\bhands[- ]on\b/i, /\bproject(?:s)?\b/i],
  },
];

const LOW_SIGNAL_KEYWORDS = new Set([
  "before",
  "after",
  "line",
  "final",
  "module",
  "course",
  "review",
  "thing",
  "stuff",
  "good",
  "bad",
  "nice",
]);

function deriveSemanticKeywords(reviews: ReviewInsightInput[]): Array<{ word: string; count: number }> {
  const counts = new Map<string, number>();

  for (const review of reviews) {
    const comment = review.comment.trim();
    if (!comment) {
      continue;
    }

    for (const rule of SEMANTIC_KEYWORD_RULES) {
      const matched = rule.patterns.some((pattern) => pattern.test(comment));
      if (!matched) {
        continue;
      }
      counts.set(rule.label, (counts.get(rule.label) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 8);
}

function isLowSignalAiKeyword(word: string): boolean {
  const normalized = word.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  if (normalized.includes(" ")) {
    return false;
  }

  if (!/[a-z]/.test(normalized)) {
    return true;
  }

  if (LOW_SIGNAL_KEYWORDS.has(normalized)) {
    return true;
  }

  return normalized.length < 5;
}

function selectHighSignalKeywords(
  aiKeywords: Array<{ word: string; count: number }>,
  fallbackKeywords: Array<{ word: string; count: number }>,
): Array<{ word: string; count: number }> {
  if (aiKeywords.length === 0) {
    return fallbackKeywords;
  }

  const deduped = new Map<string, { word: string; count: number }>();
  for (const keyword of aiKeywords) {
    const normalized = keyword.word.trim().toLowerCase();
    if (!normalized) {
      continue;
    }
    if (!deduped.has(normalized)) {
      deduped.set(normalized, {
        word: keyword.word.trim(),
        count: Math.max(1, Math.round(keyword.count)),
      });
    }
  }

  const cleanedKeywords = Array.from(deduped.values()).slice(0, 8);
  if (cleanedKeywords.length === 0) {
    return fallbackKeywords;
  }

  const lowSignalCount = cleanedKeywords.filter((keyword) =>
    isLowSignalAiKeyword(keyword.word),
  ).length;
  const lowSignalRatio = lowSignalCount / cleanedKeywords.length;

  if (lowSignalRatio >= 0.5) {
    return fallbackKeywords;
  }

  return cleanedKeywords;
}

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
  const semanticKeywords = deriveSemanticKeywords(reviews);
  const keywords =
    semanticKeywords.length > 0
      ? semanticKeywords
      : fallback.topKeywords.slice(0, 8);

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

  const commonThemes = keywords.slice(0, 3).map((item) => item.word);
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
    topKeywords: keywords,
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
      topKeywords: selectHighSignalKeywords(
        aiPayload.topKeywords,
        fallback.topKeywords,
      ),
      sentiment: aiPayload.sentiment,
      source: "ai",
    };
  } catch {
    return fallback;
  }
}
