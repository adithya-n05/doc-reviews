import { describe, expect, it, vi } from "vitest";
import {
  createModuleReviewFingerprint,
  upsertModuleReviewInsightsCacheRow,
} from "./module-review-insights-cache-service";

describe("module review insights cache service", () => {
  it("produces stable fingerprints independent of input order", () => {
    const first = createModuleReviewFingerprint([
      { id: "b", updatedAt: "2026-02-27T00:00:01.000Z" },
      { id: "a", updatedAt: "2026-02-27T00:00:02.000Z" },
    ]);

    const second = createModuleReviewFingerprint([
      { id: "a", updatedAt: "2026-02-27T00:00:02.000Z" },
      { id: "b", updatedAt: "2026-02-27T00:00:01.000Z" },
    ]);

    expect(first).toBe(second);
  });

  it("upserts cache rows with canonical payload shape", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ upsert });
    const adminClient = { from } as unknown as Parameters<
      typeof upsertModuleReviewInsightsCacheRow
    >[0];

    await upsertModuleReviewInsightsCacheRow(adminClient, {
      moduleId: "module-1",
      reviewCount: 4,
      reviewsFingerprint: "fingerprint",
      summary: "Summary",
      topKeywords: [{ word: "labs", count: 3 }],
      sentiment: { positive: 3, neutral: 1, negative: 0 },
      source: "ai",
    });

    expect(from).toHaveBeenCalledWith("module_review_insights");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        module_id: "module-1",
        review_count: 4,
        reviews_fingerprint: "fingerprint",
        source: "ai",
      }),
      { onConflict: "module_id" },
    );
  });
});
