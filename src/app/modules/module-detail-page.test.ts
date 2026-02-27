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
    expect(source).toContain('import { HelpfulToggleButton } from "@/components/helpful-toggle-button";');
    expect(source).toContain("<HelpfulToggleButton");
    expect(source).toContain("initialCount={helpfulCountByReviewId.get(review.id) ?? 0}");
    expect(source).toContain("initiallyVoted={currentUserHelpfulReviewIds.has(review.id)}");
    expect(source).toContain('className="reply-details"');
    expect(source).toContain('className="reply-btn"');
    expect(source).toContain("postReviewReplyAction");
    expect(source).toContain('name="parentReplyId"');
    expect(source).toContain('className="reply-form"');
    expect(source).toContain("Tip for future students:");
  });

  it("renders collapsible reply threads with explicit expand controls", () => {
    expect(source).toContain('className="review-thread"');
    expect(source).toContain('className="reply-thread-btn"');
    expect(source).toContain("View replies");
    expect(source).toContain("Hide replies");
  });

  it("opens reply thread automatically after reply mutations", () => {
    expect(source).toContain("const openRepliesForReviewId =");
    expect(source).toContain("const shouldOpenReplies = openRepliesForReviewId === review.id");
    expect(source).toContain("<details className=\"review-thread\" open={shouldOpenReplies}>");
  });

  it("renders owner controls for editing and deleting replies", () => {
    expect(source).toContain("updateReviewReplyAction");
    expect(source).toContain("deleteReviewReplyAction");
    expect(source).toContain('className="reply-actions"');
    expect(source).toContain("Edit Reply");
    expect(source).toContain("Delete Reply");
    expect(source).toContain("reply.userId === user.id");
    expect(source).toContain('id={`reply-${reply.id}`}');
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

  it("renders reviewer avatar photos with initials fallback", () => {
    expect(source).toContain("review.reviewerAvatarUrl ? (");
    expect(source).toContain("className=\"review-avatar-photo\"");
    expect(source).toContain("review.reviewerInitials");
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
