import { describe, expect, it, vi } from "vitest";
import { generateModuleReviewInsightPayload } from "./module-review-insights-service";

const SAMPLE_REVIEWS = [
  {
    teachingRating: 5,
    workloadRating: 3,
    difficultyRating: 4,
    assessmentRating: 4,
    comment: "Lectures were clear and the labs were practical. Workload was manageable.",
  },
  {
    teachingRating: 4,
    workloadRating: 4,
    difficultyRating: 4,
    assessmentRating: 4,
    comment:
      "Helpful lecturer and fair assessment. Coursework workload spikes near deadlines.",
  },
];

describe("generateModuleReviewInsightPayload", () => {
  it("uses AI output when key is configured and response is valid", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary:
                  "Students consistently praise teaching clarity and practical labs, while noting deadline-week workload spikes.",
                keywords: [
                  { word: "teaching clarity", count: 2 },
                  { word: "deadline workload", count: 2 },
                ],
                sentiment: { positive: 2, neutral: 0, negative: 0 },
              }),
            },
          },
        ],
      }),
    });

    const result = await generateModuleReviewInsightPayload(SAMPLE_REVIEWS, {
      apiKey: "test-key",
      model: "gpt-4.1-mini",
      fetchImpl,
    });

    expect(result.source).toBe("ai");
    expect(result.summary).toContain("teaching clarity");
    expect(result.topKeywords).toEqual([
      { word: "teaching clarity", count: 2 },
      { word: "deadline workload", count: 2 },
    ]);
    expect(result.sentiment).toEqual({ positive: 2, neutral: 0, negative: 0 });
  });

  it("falls back when key is not configured", async () => {
    const result = await generateModuleReviewInsightPayload(SAMPLE_REVIEWS, {
      apiKey: "",
      model: "gpt-4.1-mini",
      fetchImpl: vi.fn(),
    });

    expect(result.source).toBe("fallback");
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.topKeywords.length).toBeGreaterThan(0);
  });

  it("derives semantic fallback keywords instead of literal filler tokens", async () => {
    const result = await generateModuleReviewInsightPayload(
      [
        {
          teachingRating: 5,
          workloadRating: 3,
          difficultyRating: 4,
          assessmentRating: 3,
          comment:
            "The module is challenging but fair, and tutorials line up well with lectures. Practicing weekly problem sheets made revision much easier before the final exam.",
        },
      ],
      {
        apiKey: "",
        model: "gpt-4.1-mini",
        fetchImpl: vi.fn(),
      },
    );

    const words = result.topKeywords.map((item) => item.word);
    expect(result.source).toBe("fallback");
    expect(words).toContain("module difficulty");
    expect(words).toContain("assessment fairness");
    expect(words).toContain("tutorial support");
    expect(words).not.toContain("before");
    expect(words).not.toContain("line");
    expect(words).not.toContain("final");
  });

  it("falls back when AI returns malformed content", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "not-json" } }],
      }),
    });

    const result = await generateModuleReviewInsightPayload(SAMPLE_REVIEWS, {
      apiKey: "test-key",
      model: "gpt-4.1-mini",
      fetchImpl,
    });

    expect(result.source).toBe("fallback");
    expect(result.topKeywords.length).toBeGreaterThan(0);
  });

  it("clamps AI keyword output to eight entries", async () => {
    const keywords = Array.from({ length: 12 }, (_, index) => ({
      word: `theme-${index}`,
      count: index + 1,
    }));
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "Summary",
                keywords,
                sentiment: { positive: 1, neutral: 1, negative: 0 },
              }),
            },
          },
        ],
      }),
    });

    const result = await generateModuleReviewInsightPayload(SAMPLE_REVIEWS, {
      apiKey: "test-key",
      model: "gpt-4.1-mini",
      fetchImpl,
    });

    expect(result.source).toBe("ai");
    expect(result.topKeywords).toHaveLength(8);
  });

  it("falls back to semantic keyword themes when AI returns low-signal literal tokens", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "Students mention a fair but challenging module with strong tutorial support.",
                keywords: [
                  { word: "before", count: 1 },
                  { word: "line", count: 1 },
                  { word: "final", count: 1 },
                ],
                sentiment: { positive: 1, neutral: 0, negative: 0 },
              }),
            },
          },
        ],
      }),
    });

    const result = await generateModuleReviewInsightPayload(
      [
        {
          teachingRating: 5,
          workloadRating: 3,
          difficultyRating: 4,
          assessmentRating: 4,
          comment:
            "The module is challenging but fair, and tutorials line up well with lectures. Practicing weekly problem sheets made revision much easier before the final exam.",
        },
      ],
      {
        apiKey: "test-key",
        model: "gpt-4.1-mini",
        fetchImpl,
      },
    );

    const words = result.topKeywords.map((entry) => entry.word);
    expect(result.source).toBe("ai");
    expect(words).toContain("module difficulty");
    expect(words).toContain("assessment fairness");
    expect(words).toContain("tutorial support");
    expect(words).not.toContain("before");
    expect(words).not.toContain("line");
    expect(words).not.toContain("final");
  });
});
