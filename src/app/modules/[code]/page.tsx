import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteReviewAction } from "@/app/actions/reviews";
import { HelpfulToggleButton } from "@/components/helpful-toggle-button";
import { ReviewReplyThread } from "@/components/review-reply-thread";
import { SiteNav } from "@/components/site-nav";
import { logInfo } from "@/lib/logging";
import { deriveReviewInsights } from "@/lib/metrics/review-insights";
import { mapReviewsWithProfiles, toModuleListItem } from "@/lib/modules/presenter";
import { requireUserContext } from "@/lib/server/auth-context";
import {
  fetchModuleByCodeCached,
  fetchHelpfulVoteRowsForReviews,
  fetchModuleReviewInsightsRow,
  fetchModuleReviews,
  fetchProfilesByIds,
  fetchReviewRepliesForReviews,
} from "@/lib/server/module-queries";
import { elapsedMs, startTiming } from "@/lib/server/timing";
import { resolveModuleReviewInsights } from "@/lib/services/module-review-insights-resolver";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ModuleDetailPageProps = {
  params: Promise<{ code: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function renderStars(value: number) {
  const rounded = Math.round(value);
  const stars: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    stars.push(index < rounded ? "★" : "☆");
  }
  return stars.join("");
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function formatInsightsRefreshDate(value: string | null): string {
  if (!value) {
    return "Pending refresh";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Pending refresh";
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function metricBarWidth(value: number) {
  const clamped = Math.max(0, Math.min(5, value));
  return `${Math.round((clamped / 5) * 100)}%`;
}

function isLikelyPlaceholderStaffPhoto(photoUrl: string): boolean {
  const normalized = photoUrl.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    normalized.includes("placeholder") ||
    normalized.includes("silhouette") ||
    normalized.includes("blank-profile") ||
    normalized.includes("default-profile") ||
    normalized.includes("default-avatar") ||
    normalized.includes("no-photo")
  );
}

function normalizeAvatarUrl(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    return null;
  }
}

export default async function ModuleDetailPage({
  params,
  searchParams,
}: ModuleDetailPageProps) {
  const { code } = await params;
  const moduleCode = code.toUpperCase();
  const moduleRowPromise = fetchModuleByCodeCached(moduleCode);
  const { client, user, profile } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const resolvedSearchParams = (await searchParams) ?? {};
  const error = getParam(resolvedSearchParams, "error");
  const success = getParam(resolvedSearchParams, "success");
  const reviewsMode = getParam(resolvedSearchParams, "reviews");
  const openRepliesForReviewId = getParam(resolvedSearchParams, "openReplies");
  const showAllReviews = reviewsMode === "all";

  const moduleRow = await moduleRowPromise;
  if (!moduleRow) {
    notFound();
  }

  const moduleItem = toModuleListItem(moduleRow);
  const queryDurationsMs: Record<string, number> = {};
  const queryPipelineStart = startTiming();

  const reviewsAndCacheStart = startTiming();
  const [reviewRows, cachedInsightsRow] = await Promise.all([
    fetchModuleReviews(client, moduleItem.id, {
      limit: showAllReviews ? undefined : 24,
    }),
    fetchModuleReviewInsightsRow(client, moduleItem.id),
  ]);
  queryDurationsMs.reviewsAndInsightsCache = elapsedMs(reviewsAndCacheStart);

  const insightsResolverStart = startTiming();
  const insightsPromise = resolveModuleReviewInsights({
    moduleId: moduleItem.id,
    reviews: reviewRows.map((row) => ({
      id: row.id,
      updatedAt: row.updated_at,
      teachingRating: row.teaching_rating,
      workloadRating: row.workload_rating,
      difficultyRating: row.difficulty_rating,
      assessmentRating: row.assessment_rating,
      comment: row.comment,
    })),
    cachedRow: cachedInsightsRow,
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    adminClient: createSupabaseAdminClient(),
  }).then((result) => {
    queryDurationsMs.insightsResolver = elapsedMs(insightsResolverStart);
    return result;
  });

  const repliesAndVotesStart = startTiming();
  const [replyRows, helpfulVoteRows] = await Promise.all([
    fetchReviewRepliesForReviews(
      client,
      reviewRows.map((row) => row.id),
    ),
    fetchHelpfulVoteRowsForReviews(
      client,
      reviewRows.map((row) => row.id),
    ),
  ]);
  queryDurationsMs.repliesAndHelpfulVotes = elapsedMs(repliesAndVotesStart);

  const profileLookupStart = startTiming();
  const profileMap = await fetchProfilesByIds(
    client,
    Array.from(
      new Set([
        ...reviewRows.map((row) => row.user_id),
        ...replyRows.map((row) => row.user_id),
      ]),
    ),
  );
  queryDurationsMs.profiles = elapsedMs(profileLookupStart);

  const reviews = mapReviewsWithProfiles(reviewRows, profileMap);
  const currentUserReview = reviews.find((review) => review.userId === user.id) ?? null;
  const derivedInsights = deriveReviewInsights(
    reviewRows.map((row) => ({
      teachingRating: row.teaching_rating,
      workloadRating: row.workload_rating,
      difficultyRating: row.difficulty_rating,
      assessmentRating: row.assessment_rating,
      comment: row.comment,
    })),
  );
  const { insights, generatedAt, reviewCount: insightReviewCount } = await insightsPromise;
  const insightRefreshDate = formatInsightsRefreshDate(generatedAt);
  const sentimentTotal =
    insights.sentiment.positive + insights.sentiment.neutral + insights.sentiment.negative;
  const sentimentDenominator = Math.max(1, sentimentTotal, insightReviewCount);
  const positivePercentage = Math.round((insights.sentiment.positive / sentimentDenominator) * 100);
  const neutralPercentage = Math.round((insights.sentiment.neutral / sentimentDenominator) * 100);
  const negativePercentage = Math.round((insights.sentiment.negative / sentimentDenominator) * 100);

  queryDurationsMs.total = elapsedMs(queryPipelineStart);
  logInfo("module_detail_timing", {
    moduleCode,
    moduleId: moduleItem.id,
    reviewCount: reviewRows.length,
    replyCount: replyRows.length,
    queryDurationsMs,
  });

  const replyPresentationRows = replyRows.map((row) => {
    const profileRow = profileMap[row.user_id];
    const reviewerName = profileRow?.fullName ?? "Unknown Student";
    const reviewerInitials = reviewerName
      .split(/\s+/)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");

    return {
      id: row.id,
      userId: row.user_id,
      reviewId: row.review_id,
      parentReplyId: row.parent_reply_id,
      body: row.body,
      createdAt: row.created_at,
      authorName: reviewerName,
      authorInitials: reviewerInitials || "?",
      authorEmail: profileRow?.email ?? "",
      authorAvatarUrl: normalizeAvatarUrl(profileRow?.avatarUrl),
    };
  });
  const repliesByReviewId = new Map<string, typeof replyPresentationRows>();
  for (const reply of replyPresentationRows) {
    repliesByReviewId.set(reply.reviewId, [...(repliesByReviewId.get(reply.reviewId) ?? []), reply]);
  }
  const helpfulCountByReviewId = new Map<string, number>();
  const currentUserHelpfulReviewIds = new Set<string>();
  for (const vote of helpfulVoteRows) {
    helpfulCountByReviewId.set(
      vote.review_id,
      (helpfulCountByReviewId.get(vote.review_id) ?? 0) + 1,
    );
    if (vote.user_id === user.id) {
      currentUserHelpfulReviewIds.add(vote.review_id);
    }
  }

  const studyYear = moduleItem.studyYears[0] ?? profile.year ?? 1;
  const currentUserInitials =
    profile.full_name
      .split(/\s+/)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";
  const currentUserAvatarUrl = normalizeAvatarUrl(profile.avatar_url);
  const leaders =
    moduleItem.leaders.length > 0
      ? moduleItem.leaders
      : [{ name: "TBC", profileUrl: null, photoUrl: null }];

  return (
    <div className="site-shell">
      <SiteNav
        authed
        active="modules"
        displayName={profile.full_name}
        avatarUrl={profile.avatar_url}
      />
      <main className="page" style={{ paddingTop: 0, paddingBottom: "60px" }}>
        <div className="detail-header">
          <div className="detail-breadcrumb">
            <Link href="/modules" style={{ color: "var(--accent)" }}>
              Modules
            </Link>
            <span>›</span>
            <Link href={`/modules?year=${studyYear}`} style={{ color: "var(--ink-light)" }}>
              Year {studyYear}
            </Link>
            <span>›</span>
            <span>{moduleItem.code}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "36px" }}>
            <div style={{ flex: 1 }}>
              <span className="module-code" style={{ fontSize: "13px", display: "block" }}>
                {moduleItem.code}
              </span>
              <h1 className="detail-title">{moduleItem.title}</h1>
              <div style={{ display: "flex", gap: "12px", marginTop: "10px", alignItems: "center" }}>
                <span className="year-badge">Year {studyYear}</span>
                <span className="label-caps">{moduleItem.reviewCount} Reviews</span>
              </div>
              <p className="detail-desc" style={{ marginTop: "12px" }}>
                {moduleItem.description || "Module description not yet available."}
              </p>
            </div>
            <div style={{ textAlign: "center", minWidth: "150px" }}>
              <div className="rating-big">{moduleItem.avgOverall.toFixed(1)}</div>
              <div style={{ color: "var(--accent)" }}>{renderStars(moduleItem.avgOverall)}</div>
              <div className="label-caps" style={{ marginTop: "6px" }}>
                Overall Rating
              </div>
            </div>
          </div>
        </div>

        {error ? <p className="form-banner error">{error}</p> : null}
        {success === "review_saved" ? (
          <p className="form-banner success">Your review has been saved.</p>
        ) : null}
        {success === "review_deleted" ? (
          <p className="form-banner success">Your review has been deleted.</p>
        ) : null}

        <div className="ai-summary">
          <div className="ai-summary-header">
            <div className="ai-summary-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              AI Summary
            </div>
            <span className="ai-summary-meta">
              Generated from {insightReviewCount} reviews · Updated {insightRefreshDate}
            </span>
          </div>
          <p className="ai-summary-text">&quot;{insights.summary}&quot;</p>
          <div className="ai-sentiment">
            <div className="ai-sentiment-item">
              <div className="ai-sentiment-dot positive" />
              <span className="ai-sentiment-label">{positivePercentage}% positive</span>
            </div>
            <div className="ai-sentiment-item">
              <div className="ai-sentiment-dot neutral" />
              <span className="ai-sentiment-label">{neutralPercentage}% neutral</span>
            </div>
            <div className="ai-sentiment-item">
              <div className="ai-sentiment-dot negative" />
              <span className="ai-sentiment-label">{negativePercentage}% negative</span>
            </div>
          </div>
          <div className="ai-keywords">
            {insights.topKeywords.length > 0 ? (
              insights.topKeywords.map((keyword) => (
                <span key={keyword.word} className="ai-keyword">
                  {keyword.word}
                </span>
              ))
            ) : (
              <span className="ai-keyword">No keyword data yet</span>
            )}
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="label-caps">Overall Rating</div>
            <div className="metric-value accent">
              {derivedInsights.averages.overall.toFixed(1)}{" "}
              <span style={{ fontSize: "18px", color: "var(--ink-light)" }}>/ 5</span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-bar-fill"
                style={{ width: metricBarWidth(derivedInsights.averages.overall) }}
              />
            </div>
          </div>
          <div className="metric-card">
            <div className="label-caps">Difficulty</div>
            <div className="metric-value">
              {derivedInsights.averages.difficulty.toFixed(1)}{" "}
              <span style={{ fontSize: "18px", color: "var(--ink-light)" }}>/ 5</span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-bar-fill"
                style={{
                  width: metricBarWidth(derivedInsights.averages.difficulty),
                  background: "var(--ink-mid)",
                }}
              />
            </div>
          </div>
          <div className="metric-card">
            <div className="label-caps">Teaching Quality</div>
            <div className="metric-value">
              {derivedInsights.averages.teaching.toFixed(1)}{" "}
              <span style={{ fontSize: "18px", color: "var(--ink-light)" }}>/ 5</span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-bar-fill"
                style={{ width: metricBarWidth(derivedInsights.averages.teaching) }}
              />
            </div>
          </div>
          <div className="metric-card">
            <div className="label-caps">Workload</div>
            <div className="metric-value">
              {derivedInsights.averages.workload.toFixed(1)}{" "}
              <span style={{ fontSize: "18px", color: "var(--ink-light)" }}>/ 5</span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-bar-fill"
                style={{
                  width: metricBarWidth(derivedInsights.averages.workload),
                  background: "var(--ink-mid)",
                }}
              />
            </div>
          </div>
          <div className="metric-card">
            <div className="label-caps">Content Quality</div>
            <div className="metric-value">
              {derivedInsights.averages.overall.toFixed(1)}{" "}
              <span style={{ fontSize: "18px", color: "var(--ink-light)" }}>/ 5</span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-bar-fill"
                style={{ width: metricBarWidth(derivedInsights.averages.overall) }}
              />
            </div>
          </div>
          <div className="metric-card">
            <div className="label-caps">Exam Fairness</div>
            <div className="metric-value">
              {derivedInsights.averages.assessment.toFixed(1)}{" "}
              <span style={{ fontSize: "18px", color: "var(--ink-light)" }}>/ 5</span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-bar-fill"
                style={{ width: metricBarWidth(derivedInsights.averages.assessment) }}
              />
            </div>
          </div>
        </div>

        <h2 className="section-sub">Teaching Staff</h2>
        <div className="staff-grid">
          {leaders.map((leader) => {
            const initials = leader.name
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("");
            const normalizedPhotoUrl =
              typeof leader.photoUrl === "string" ? leader.photoUrl.trim() : "";
            const hasUsablePhoto =
              normalizedPhotoUrl.length > 0 &&
              !isLikelyPlaceholderStaffPhoto(normalizedPhotoUrl);
            const staffCardHref =
              leader.profileUrl ??
              `https://profiles.imperial.ac.uk/search?query=${encodeURIComponent(leader.name)}`;

            const cardBody = (
              <>
                {hasUsablePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="staff-photo" src={normalizedPhotoUrl} alt={`${leader.name} profile`} />
                ) : (
                  <div className="staff-initials">{initials || "?"}</div>
                )}
                <div>
                  <div className="staff-name">{leader.name}</div>
                  <div className="staff-role">Module Leader</div>
                </div>
              </>
            );

            return (
              <a
                key={leader.name}
                className="staff-card staff-card-link"
                href={staffCardHref}
                rel="noreferrer noopener"
                target="_blank"
              >
                {cardBody}
              </a>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="section-sub" id="reviews" style={{ border: "none" }}>
            Student Reviews
          </h2>
          <Link className="btn btn-primary btn-sm" href={`/modules/${moduleItem.code}/review`}>
            {currentUserReview ? "Edit your review" : "Write a review"}
          </Link>
        </div>
        <hr className="rule" />

        {reviews.map((review) => {
          const overallScore =
            (review.teachingRating +
              review.workloadRating +
              review.difficultyRating +
              review.assessmentRating) /
            4;
          const shouldOpenReplies = openRepliesForReviewId === review.id;

          return (
            <article className="review" id={`review-${review.id}`} key={review.id}>
              <div className="review-header">
                <div className="review-avatar">
                  {review.reviewerAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="review-avatar-photo"
                      src={review.reviewerAvatarUrl}
                      alt={`${review.reviewerName} avatar`}
                    />
                  ) : (
                    review.reviewerInitials
                  )}
                </div>
                <div className="review-meta">
                  <div className="review-author">{review.reviewerName}</div>
                  <div className="review-date">
                    Year {review.year ?? "?"} · {formatReviewDate(review.createdAt)}
                  </div>
                  <div className="review-email">{review.reviewerEmail}</div>
                </div>
                <div style={{ marginLeft: "auto", color: "var(--accent)" }}>
                  {renderStars(overallScore)}
                </div>
              </div>

              <p className="review-body">{review.comment}</p>
              {review.tips ? (
                <div className="review-tip">
                  <strong
                    style={{
                      fontStyle: "normal",
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                    }}
                  >
                    Tip for future students:
                  </strong>{" "}
                  {review.tips}
                </div>
              ) : null}
              <div className="review-actions">
                <HelpfulToggleButton
                  reviewId={review.id}
                  initialCount={helpfulCountByReviewId.get(review.id) ?? 0}
                  initiallyVoted={currentUserHelpfulReviewIds.has(review.id)}
                />
                <span style={{ flex: 1 }} />
                <span className="review-breakdown">
                  Overall: {overallScore.toFixed(1)} | Difficulty: {review.difficultyRating} |
                  Teaching: {review.teachingRating} | Workload: {review.workloadRating} |
                  Assessment: {review.assessmentRating}
                </span>
              </div>
              <ReviewReplyThread
                moduleCode={moduleItem.code}
                reviewId={review.id}
                currentUserId={user.id}
                currentUserName={profile.full_name}
                currentUserEmail={profile.email}
                currentUserInitials={currentUserInitials}
                currentUserAvatarUrl={currentUserAvatarUrl}
                initialReplies={repliesByReviewId.get(review.id) ?? []}
                initiallyOpen={shouldOpenReplies}
              />
              {review.userId === user.id ? (
                <div
                  className="review-actions"
                  style={{ marginTop: "12px", justifyContent: "flex-end" }}
                >
                  <Link className="btn btn-ghost btn-sm" href={`/modules/${moduleItem.code}/review`}>
                    Edit
                  </Link>
                  <form action={deleteReviewAction}>
                    <input type="hidden" name="moduleCode" value={moduleItem.code} />
                    <input type="hidden" name="reviewId" value={review.id} />
                    <button className="btn btn-ghost btn-sm" type="submit">
                      Delete
                    </button>
                  </form>
                </div>
              ) : null}
            </article>
          );
        })}

        {reviews.length === 0 ? (
          <p className="form-note" style={{ marginTop: "20px" }}>
            No reviews yet. Be the first to add one.
          </p>
        ) : null}

        {!showAllReviews && moduleItem.reviewCount > reviews.length ? (
          <div style={{ marginTop: "18px", textAlign: "center" }}>
            <Link
              className="btn btn-ghost btn-sm"
              href={`/modules/${moduleItem.code}?reviews=all#reviews`}
            >
              Load all {moduleItem.reviewCount} reviews
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}
