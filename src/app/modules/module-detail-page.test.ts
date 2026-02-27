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

  it("renders AI summary section above keyword tags", () => {
    expect(source).toContain("AI Summary");
    expect(source).toContain("{insights.summary}");
    expect(source).toContain('className="insight-summary"');
  });

  it("shows helpful/reply review actions and editorial tip label", () => {
    expect(source).toContain('className={`helpful-btn ${');
    expect(source).toContain('className="reply-details"');
    expect(source).toContain('className="reply-btn"');
    expect(source).toContain("postReviewReplyAction");
    expect(source).toContain('name="parentReplyId"');
    expect(source).toContain('className="reply-form"');
    expect(source).toContain("Tip for future students:");
    expect(source).toContain("toggleHelpfulReviewAction");
    expect(source).toContain('name="reviewId"');
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

  it("makes the year breadcrumb clickable back to filtered catalogue", () => {
    expect(source).toContain('href={`/modules?year=${studyYear}`}');
  });

  it("renders leader photos when available with initials fallback", () => {
    expect(source).toContain("const hasUsablePhoto =");
    expect(source).toContain("className=\"staff-photo\"");
    expect(source).toContain("className=\"staff-initials\"");
  });

  it("makes the entire staff card clickable when a profile url exists", () => {
    expect(source).toContain("className=\"staff-card staff-card-link\"");
    expect(source).toContain("href={staffCardHref}");
  });

  it("keeps staff cards clickable with a profile-search fallback link", () => {
    expect(source).toContain("const staffCardHref =");
    expect(source).toContain("https://profiles.imperial.ac.uk/search?query=");
  });
});
