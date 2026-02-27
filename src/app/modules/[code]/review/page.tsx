import Link from "next/link";
import { notFound } from "next/navigation";
import { saveReviewAction } from "@/app/actions/reviews";
import { ReviewRatingFields } from "@/components/review-rating-fields";
import { SiteNav } from "@/components/site-nav";
import { toModuleListItem } from "@/lib/modules/presenter";
import { requireUserContext } from "@/lib/server/auth-context";
import {
  fetchModuleByCode,
  fetchUserReviewForModule,
} from "@/lib/server/module-queries";

type WriteReviewPageProps = {
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

export default async function WriteReviewPage({
  params,
  searchParams,
}: WriteReviewPageProps) {
  const { code } = await params;
  const moduleCode = code.toUpperCase();
  const resolvedSearchParams = (await searchParams) ?? {};
  const error = getParam(resolvedSearchParams, "error");

  const { client, user, profile } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const moduleRow = await fetchModuleByCode(client, moduleCode);
  if (!moduleRow) {
    notFound();
  }

  const moduleItem = toModuleListItem(moduleRow);
  const existingReview = await fetchUserReviewForModule(client, user.id, moduleItem.id);

  return (
    <div className="site-shell">
      <SiteNav
        authed
        active="none"
        displayName={profile.full_name}
        avatarUrl={profile.avatar_url}
      />
      <main className="page" style={{ paddingTop: "40px", paddingBottom: "80px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div className="detail-breadcrumb">
            <Link href="/modules" style={{ color: "var(--accent)" }}>
              Modules
            </Link>
            <span>›</span>
            <Link href={`/modules/${moduleItem.code}`} style={{ color: "var(--accent)" }}>
              {moduleItem.code} {moduleItem.title}
            </Link>
            <span>›</span>
            <span>{existingReview ? "Edit Review" : "Write Review"}</span>
          </div>

          <div
            style={{
              marginTop: "20px",
              marginBottom: "30px",
              paddingBottom: "20px",
              borderBottom: "2px solid var(--ink)",
            }}
          >
            <div className="label-caps" style={{ marginBottom: "8px" }}>
              Writing a Review For
            </div>
            <h1 className="detail-title">{moduleItem.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
              <span className="module-code" style={{ fontSize: "13px" }}>
                {moduleItem.code}
              </span>
              <span className="year-badge">Year {moduleItem.studyYears[0] ?? profile.year ?? "?"}</span>
            </div>
          </div>

          <div
            style={{
              background: "var(--cream-dark)",
              border: "1px solid var(--border)",
              padding: "14px 18px",
              marginBottom: "28px",
            }}
          >
            <p style={{ fontSize: "13px", color: "var(--ink-mid)", lineHeight: 1.6 }}>
              This review will be published with your name and Imperial email (
              <strong>
                {profile.full_name} · {profile.email}
              </strong>
              ). Anonymous reviews are not supported.
            </p>
          </div>

          {error ? <p className="form-banner error">{error}</p> : null}

          <form action={saveReviewAction}>
            <input type="hidden" name="moduleCode" value={moduleItem.code} />

            <ReviewRatingFields
              defaults={{
                teaching: existingReview?.teaching_rating ?? 4,
                workload: existingReview?.workload_rating ?? 3,
                difficulty: existingReview?.difficulty_rating ?? 3,
                assessment: existingReview?.assessment_rating ?? 3,
              }}
            />
            <div className="form-group">
              <label className="form-label" htmlFor="review-comment">
                Your Review
              </label>
              <textarea
                id="review-comment"
                className="form-input"
                name="comment"
                defaultValue={existingReview?.comment ?? ""}
                minLength={80}
                rows={8}
                required
                placeholder="Share your honest experience of this module — what worked, what didn't, what surprised you. Minimum 80 characters."
              />
              <span className="form-hint">
                Be specific and constructive. Your review helps other students make informed
                decisions.
              </span>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="review-tips">
                Tips for Future Students{" "}
                <span style={{ color: "var(--ink-light)", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="review-tips"
                className="form-input"
                name="tips"
                defaultValue={existingReview?.tips ?? ""}
                maxLength={500}
                rows={4}
                placeholder="Any practical advice — how to prepare, how to approach the exam, resources you found useful..."
              />
            </div>

            <div className="form-actions" style={{ justifyContent: "flex-end" }}>
              <Link className="btn btn-ghost" href={`/modules/${moduleItem.code}`}>
                Cancel
              </Link>
              <button className="btn btn-primary" type="submit">
                {existingReview ? "Update Review" : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
