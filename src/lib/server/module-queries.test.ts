import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module review query shape", () => {
  const source = readFileSync("src/lib/server/module-queries.ts", "utf8");

  it("includes tips in module reviews query select list", () => {
    expect(source).toContain(
      "id,user_id,module_id,teaching_rating,workload_rating,difficulty_rating,assessment_rating,comment,tips,created_at,updated_at",
    );
  });

  it("fetches helpful vote rows for module reviews", () => {
    expect(source).toContain("fetchHelpfulVoteRowsForReviews");
    expect(source).toContain('.from("review_helpful_votes")');
    expect(source).toContain('.select("review_id,user_id")');
  });

  it("reads cached AI insights rows for modules", () => {
    expect(source).toContain("fetchModuleReviewInsightsRow");
    expect(source).toContain('.from("module_review_insights")');
    expect(source).toContain(
      '.select("module_id,reviews_fingerprint,summary,top_keywords,sentiment,source,generated_at,updated_at")',
    );
  });

  it("fetches threaded review replies for module reviews", () => {
    expect(source).toContain("fetchReviewRepliesForReviews");
    expect(source).toContain('.from("review_replies")');
    expect(source).toContain(
      '.select("id,review_id,user_id,parent_reply_id,body,created_at,updated_at")',
    );
  });

  it("keeps module detail offerings select minimal for performance", () => {
    expect(source).toContain("module_offerings(study_year)");
    expect(source).not.toContain("module_offerings(study_year,term,offering_type,degree_path,academic_year_label)");
  });

  it("exposes cached catalogue and detail helpers for shared reads", () => {
    expect(source).toContain("fetchModuleCatalogueRowsCached");
    expect(source).toContain("fetchModuleByCodeCached");
    expect(source).toContain("unstable_cache");
  });
});
