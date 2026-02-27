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
    expect(source).toContain('className="ai-summary"');
    expect(source).toContain('className="ai-summary-badge"');
    expect(source).toContain('className="ai-summary-meta"');
    expect(source).toContain('className="ai-summary-text"');
    expect(source).toContain('className="ai-sentiment"');
    expect(source).toContain('className="ai-keywords"');
  });

  it("shows AI summary refresh metadata and source label", () => {
    expect(source).toContain("Generated from");
    expect(source).toContain("generatedAt");
    expect(source).toContain("insightReviewCount");
    expect(source).toContain("positivePercentage");
    expect(source).toContain("neutralPercentage");
    expect(source).toContain("negativePercentage");
  });

  it("shows helpful/reply review actions and editorial tip label", () => {
    expect(source).toContain('import { HelpfulToggleButton } from "@/components/helpful-toggle-button";');
    expect(source).toContain('import { ReviewReplyThread } from "@/components/review-reply-thread";');
    expect(source).toContain("<HelpfulToggleButton");
    expect(source).toContain("initialCount={helpfulCountByReviewId.get(review.id) ?? 0}");
    expect(source).toContain("initiallyVoted={currentUserHelpfulReviewIds.has(review.id)}");
    expect(source).toContain("<ReviewReplyThread");
    expect(source).toContain("Tip for future students:");
  });

  it("renders collapsible reply threads with explicit expand controls", () => {
    expect(source).toContain("<ReviewReplyThread");
    expect(source).toContain("initialReplies={repliesByReviewId.get(review.id) ?? []}");
    expect(source).toContain("reviewId={review.id}");
  });

  it("opens reply thread automatically after reply mutations", () => {
    expect(source).toContain("const openRepliesForReviewId =");
    expect(source).toContain("const shouldOpenReplies = openRepliesForReviewId === review.id");
    expect(source).toContain("initiallyOpen={shouldOpenReplies}");
  });

  it("passes current user identity props to optimistic reply thread", () => {
    expect(source).toContain("currentUserId={user.id}");
    expect(source).toContain("currentUserName={profile.full_name}");
    expect(source).toContain("currentUserEmail={profile.email}");
    expect(source).toContain("currentUserInitials={currentUserInitials}");
    expect(source).toContain("currentUserAvatarUrl={currentUserAvatarUrl}");
  });

  it("switches primary CTA to edit state when user already has a review", () => {
    expect(source).toContain("const currentUserReview =");
    expect(source).toContain("currentUserReview ? \"Edit your review\" : \"Write a review\"");
  });

  it("renders owner edit/delete controls beneath rating summary row", () => {
    expect(source).toContain("justifyContent: \"flex-end\"");
    expect(source).toContain("Edit");
    expect(source).toContain("Delete");
    expect(source).toContain('className="review-breakdown"');
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
