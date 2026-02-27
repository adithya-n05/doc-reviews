import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("review actions tips wiring", () => {
  const source = readFileSync("src/app/actions/reviews.ts", "utf8");

  it("reads tips from form data and forwards to review service input", () => {
    expect(source).toContain('tips: String(formData.get("tips") ?? ""),');
  });

  it("persists tips in the reviews upsert payload", () => {
    expect(source).toContain("tips: payload.tips,");
  });

  it("provides helpful-vote toggle action for module detail reviews", () => {
    expect(source).toContain("toggleHelpfulReviewAction");
    expect(source).toContain("toggleHelpfulVoteForReview");
    expect(source).toContain('formData.get("reviewId")');
  });

  it("provides threaded reply action for module detail reviews", () => {
    expect(source).toContain("postReviewReplyAction");
    expect(source).toContain("updateReviewReplyAction");
    expect(source).toContain("deleteReviewReplyAction");
    expect(source).toContain("createReviewReplyForUser");
    expect(source).toContain("updateReviewReplyForUser");
    expect(source).toContain("deleteReviewReplyForUser");
    expect(source).toContain('formData.get("parentReplyId")');
    expect(source).toContain('formData.get("replyId")');
    expect(source).toContain(".from(\"review_replies\")");
    expect(source).toContain(".update({");
    expect(source).toContain(".delete()");
  });
});
