import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteReviewAction } from "@/app/actions/reviews";
import { SiteNav } from "@/components/site-nav";
import { deriveReviewInsights } from "@/lib/metrics/review-insights";
import { mapReviewsWithProfiles, toModuleListItem } from "@/lib/modules/presenter";
import { requireUserContext } from "@/lib/server/auth-context";
import {
  fetchModuleByCode,
  fetchModuleReviews,
  fetchProfilesByIds,
} from "@/lib/server/module-queries";

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

export default async function ModuleDetailPage({
  params,
  searchParams,
}: ModuleDetailPageProps) {
  const { code } = await params;
  const moduleCode = code.toUpperCase();
  const { client, user, profile } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const resolvedSearchParams = (await searchParams) ?? {};
  const error = getParam(resolvedSearchParams, "error");
  const success = getParam(resolvedSearchParams, "success");

  const moduleRow = await fetchModuleByCode(client, moduleCode);
  if (!moduleRow) {
    notFound();
  }

  const moduleItem = toModuleListItem(moduleRow);
  const reviewRows = await fetchModuleReviews(client, moduleItem.id);
  const profileMap = await fetchProfilesByIds(
    client,
    Array.from(new Set(reviewRows.map((row) => row.user_id))),
  );
  const reviews = mapReviewsWithProfiles(reviewRows, profileMap);
  const insights = deriveReviewInsights(
    reviewRows.map((row) => ({
      teachingRating: row.teaching_rating,
      workloadRating: row.workload_rating,
      difficultyRating: row.difficulty_rating,
      assessmentRating: row.assessment_rating,
      comment: row.comment,
    })),
  );

  const studyYear = moduleItem.studyYears[0] ?? profile.year ?? 1;
  const leaders = moduleItem.leaders.length > 0 ? moduleItem.leaders : ["TBC"];

  return (
    <div className="site-shell">
      <SiteNav authed active="modules" displayName={profile.full_name} />
      <main className="page" style={{ paddingTop: 0, paddingBottom: "60px" }}>
        <div className="detail-header">
          <div className="detail-breadcrumb">
            <Link href="/modules" style={{ color: "var(--accent)" }}>
              Modules
            </Link>
            <span>›</span>
            <span>Year {studyYear}</span>
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

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="label-caps">Overall Rating</div>
            <div className="metric-value accent">
              {insights.averages.overall.toFixed(1)}{" "}
              <span style={{ fontSize: "18px", color: "var(--ink-light)" }}>/ 5</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="label-caps">Difficulty</div>
            <div className="metric-value">
              {insights.averages.difficulty.toFixed(1)}{" "}
              <span style={{ fontSize: "18px", color: "var(--ink-light)" }}>/ 5</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="label-caps">Teaching Quality</div>
            <div className="metric-value">
              {insights.averages.teaching.toFixed(1)}{" "}
              <span style={{ fontSize: "18px", color: "var(--ink-light)" }}>/ 5</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="label-caps">Workload</div>
            <div className="metric-value">
              {insights.averages.workload.toFixed(1)}{" "}
              <span style={{ fontSize: "18px", color: "var(--ink-light)" }}>/ 5</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="label-caps">Assessment Fairness</div>
            <div className="metric-value">
              {insights.averages.assessment.toFixed(1)}{" "}
              <span style={{ fontSize: "18px", color: "var(--ink-light)" }}>/ 5</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="label-caps">Sentiment</div>
            <div className="metric-value">
              {insights.sentiment.positive}/{insights.reviewCount}{" "}
              <span style={{ fontSize: "16px", color: "var(--ink-light)" }}>positive</span>
            </div>
          </div>
        </div>

        <h2 className="section-sub">Teaching Staff</h2>
        <div className="staff-grid">
          {leaders.map((leader) => {
            const initials = leader
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("");
            return (
              <div key={leader} className="staff-card">
                <div className="staff-initials">{initials || "?"}</div>
                <div>
                  <div className="staff-name">{leader}</div>
                  <div className="staff-role">Module Leader</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "26px" }}>
          <div className="label-caps" style={{ marginBottom: "10px" }}>
            Student Sentiment
          </div>
          <div className="tag-cloud">
            {insights.topKeywords.length > 0 ? (
              insights.topKeywords.map((keyword) => (
                <span key={keyword.word} className="tag tag-positive">
                  {keyword.word} ({keyword.count})
                </span>
              ))
            ) : (
              <span className="tag tag-neutral">No keyword data yet</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="section-sub" style={{ border: "none" }}>
            Student Reviews
          </h2>
          <Link className="btn btn-primary btn-sm" href={`/modules/${moduleItem.code}/review`}>
            Write a Review
          </Link>
        </div>
        <hr className="rule" />

        {reviews.map((review) => (
          <article className="review" key={review.id}>
            <div className="review-header">
              <div className="review-avatar">{review.reviewerInitials}</div>
              <div className="review-meta">
                <div className="review-author">{review.reviewerName}</div>
                <div className="review-date">
                  Year {review.year ?? "?"} · {formatReviewDate(review.createdAt)}
                </div>
                <div className="review-email">{review.reviewerEmail}</div>
              </div>
              <div style={{ marginLeft: "auto", color: "var(--accent)" }}>
                {renderStars(
                  (review.teachingRating +
                    review.workloadRating +
                    review.difficultyRating +
                    review.assessmentRating) /
                    4,
                )}
              </div>
            </div>

            <p className="review-body">{review.comment}</p>
            {review.tips ? <div className="review-tip">Tip: {review.tips}</div> : null}
            <div className="review-actions">
              <span style={{ fontSize: "12px", color: "var(--ink-light)" }}>
                Teaching: {review.teachingRating} · Workload: {review.workloadRating} · Difficulty:{" "}
                {review.difficultyRating} · Assessment: {review.assessmentRating}
              </span>
              {review.userId === user.id ? (
                <>
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
                </>
              ) : null}
            </div>
          </article>
        ))}

        {reviews.length === 0 ? (
          <p className="form-note" style={{ marginTop: "20px" }}>
            No reviews yet. Be the first to add one.
          </p>
        ) : null}
      </main>
    </div>
  );
}
