import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module detail review rendering", () => {
  const source = readFileSync("src/app/modules/[code]/page.tsx", "utf8");

  it("renders optional tips block when present", () => {
    expect(source).toContain("{review.tips ? (");
    expect(source).toContain('className="review-tip"');
  });

  it("renders metric bars under each rating card", () => {
    expect(source).toContain('className="metric-bar"');
    expect(source).toContain('className="metric-bar-fill"');
  });

  it("uses editorial metric labels for content and exam fairness", () => {
    expect(source).toContain("Content Quality");
    expect(source).toContain("Exam Fairness");
  });

  it("shows helpful/reply review actions and editorial tip label", () => {
    expect(source).toContain('className="helpful-btn"');
    expect(source).toContain('className="reply-btn"');
    expect(source).toContain("Tip for future students:");
  });

  it("switches primary CTA to edit state when user already has a review", () => {
    expect(source).toContain("const currentUserReview =");
    expect(source).toContain("currentUserReview ? \"Edit your review\" : \"Write a review\"");
  });

  it("renders owner edit/delete controls beneath rating summary row", () => {
    expect(source).toContain("justifyContent: \"flex-end\"");
    expect(source).toContain("Edit");
    expect(source).toContain("Delete");
  });
});
