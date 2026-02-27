import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "@/lib/supabase/database.types";
import type { ModuleReviewInsightPayload } from "./module-review-insights-service";

type FingerprintInput = {
  id: string;
  updatedAt: string;
};

type UpsertInput = {
  moduleId: string;
  reviewsFingerprint: string;
  summary: string;
  topKeywords: Array<{ word: string; count: number }>;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  source: "ai" | "fallback";
};

type ModuleReviewInsightsRow = Pick<
  Tables<"module_review_insights">,
  "summary" | "top_keywords" | "sentiment" | "source"
>;

export function createModuleReviewFingerprint(rows: FingerprintInput[]): string {
  const canonical = rows
    .map((row) => `${row.id}:${row.updatedAt}`)
    .sort()
    .join("|");

  return createHash("sha256").update(canonical).digest("hex");
}

function normalizeKeywords(value: unknown): Array<{ word: string; count: number }> {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const record = entry as Record<string, unknown>;
      const word = typeof record.word === "string" ? record.word.trim() : "";
      if (!word) {
        return null;
      }
      const countRaw = Number(record.count);
      return {
        word,
        count:
          Number.isFinite(countRaw) && countRaw > 0 ? Math.round(countRaw) : 1,
      };
    })
    .filter((entry): entry is { word: string; count: number } => Boolean(entry));
}

function normalizeSentiment(value: unknown): {
  positive: number;
  neutral: number;
  negative: number;
} {
  if (!value || typeof value !== "object") {
    return { positive: 0, neutral: 0, negative: 0 };
  }
  const record = value as Record<string, unknown>;
  return {
    positive: Math.max(0, Math.round(Number(record.positive) || 0)),
    neutral: Math.max(0, Math.round(Number(record.neutral) || 0)),
    negative: Math.max(0, Math.round(Number(record.negative) || 0)),
  };
}

export function toModuleInsightPayloadFromCacheRow(
  row: ModuleReviewInsightsRow,
): ModuleReviewInsightPayload {
  return {
    summary: row.summary,
    topKeywords: normalizeKeywords(row.top_keywords),
    sentiment: normalizeSentiment(row.sentiment),
    source: row.source === "ai" ? "ai" : "fallback",
  };
}

export async function upsertModuleReviewInsightsCacheRow(
  adminClient: SupabaseClient,
  input: UpsertInput,
): Promise<void> {
  const { error } = await adminClient.from("module_review_insights").upsert(
    {
      module_id: input.moduleId,
      reviews_fingerprint: input.reviewsFingerprint,
      summary: input.summary,
      top_keywords: input.topKeywords,
      sentiment: input.sentiment,
      source: input.source,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "module_id" },
  );

  if (error) {
    throw new Error(error.message || "Failed to upsert module review insights");
  }
}
