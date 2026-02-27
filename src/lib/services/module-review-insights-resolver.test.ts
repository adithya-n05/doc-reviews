import { describe, expect, it, vi } from "vitest";
import { resolveModuleReviewInsights } from "./module-review-insights-resolver";

const REVIEWS = [
  {
    id: "review-1",
    updatedAt: "2026-02-27T06:00:00.000Z",
    teachingRating: 4,
    workloadRating: 3,
    difficultyRating: 4,
    assessmentRating: 4,
    comment: "Clear teaching and practical labs.",
  },
];

describe("resolveModuleReviewInsights", () => {
  it("uses cache when fingerprint matches", async () => {
    const generateInsights = vi.fn();
    const persistInsights = vi.fn();

    const result = await resolveModuleReviewInsights(
      {
        moduleId: "module-1",
        reviews: REVIEWS,
        cachedRow: {
          module_id: "module-1",
          reviews_fingerprint:
            "1e922e9399a010b76588bfbbcfd30befa4e7346563b7d374d0f72441ea0bd36b",
          summary: "Cached summary",
          top_keywords: [{ word: "practical labs", count: 1 }],
          sentiment: { positive: 1, neutral: 0, negative: 0 },
          source: "ai",
          generated_at: "2026-02-27T06:05:00.000Z",
          updated_at: "2026-02-27T06:05:00.000Z",
        },
        apiKey: "key",
        model: "gpt-4.1-mini",
      },
      { generateInsights, persistInsights },
    );

    expect(result.insights.summary).toBe("Cached summary");
    expect(result.insights.source).toBe("ai");
    expect(generateInsights).not.toHaveBeenCalled();
    expect(persistInsights).not.toHaveBeenCalled();
  });

  it("generates and persists when cache is missing", async () => {
    const generateInsights = vi.fn().mockResolvedValue({
      summary: "Generated summary",
      topKeywords: [{ word: "teaching clarity", count: 2 }],
      sentiment: { positive: 1, neutral: 0, negative: 0 },
      source: "ai",
    });
    const persistInsights = vi.fn().mockResolvedValue(undefined);

    const result = await resolveModuleReviewInsights(
      {
        moduleId: "module-1",
        reviews: REVIEWS,
        cachedRow: null,
        apiKey: "key",
        model: "gpt-4.1-mini",
        adminClient: {} as never,
      },
      { generateInsights, persistInsights },
    );

    expect(result.insights.summary).toBe("Generated summary");
    expect(generateInsights).toHaveBeenCalledOnce();
    expect(persistInsights).toHaveBeenCalledOnce();
  });

  it("returns fallback insights when cache is stale", async () => {
    const generateInsights = vi.fn().mockResolvedValue({
      summary: "Fallback summary",
      topKeywords: [{ word: "fallback", count: 1 }],
      sentiment: { positive: 0, neutral: 1, negative: 0 },
      source: "fallback",
    });
    const persistInsights = vi.fn().mockResolvedValue(undefined);

    const result = await resolveModuleReviewInsights(
      {
        moduleId: "module-1",
        reviews: REVIEWS,
        cachedRow: {
          module_id: "module-1",
          reviews_fingerprint: "outdated",
          summary: "Old summary",
          top_keywords: [{ word: "old", count: 1 }],
          sentiment: { positive: 1, neutral: 0, negative: 0 },
          source: "ai",
          generated_at: "2026-02-25T06:05:00.000Z",
          updated_at: "2026-02-25T06:05:00.000Z",
        },
        apiKey: "key",
        model: "gpt-4.1-mini",
      },
      { generateInsights, persistInsights },
    );

    expect(result.insights.summary).toBe("Fallback summary");
    expect(result.insights.source).toBe("fallback");
    expect(persistInsights).not.toHaveBeenCalled();
  });
});
