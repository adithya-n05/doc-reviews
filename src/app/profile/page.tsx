import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { SiteNav } from "@/components/site-nav";
import { requireUserContext } from "@/lib/server/auth-context";

type UserModuleRow = {
  module_id: string;
  modules: Array<{
    id: string;
    code: string;
    title: string;
  }> | null;
};

type ReviewRow = {
  id: string;
  module_id: string;
  teaching_rating: number;
  workload_rating: number;
  difficulty_rating: number;
  assessment_rating: number;
  comment: string;
};

export default async function ProfilePage() {
  const { client, user, profile } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const { data: modulesRows } = await client
    .from("user_modules")
    .select("module_id,modules(id,code,title)")
    .eq("user_id", user.id);

  const { data: reviewRows } = await client
    .from("reviews")
    .select(
      "id,module_id,teaching_rating,workload_rating,difficulty_rating,assessment_rating,comment",
    )
    .eq("user_id", user.id);

  const modules = (modulesRows ?? []) as UserModuleRow[];
  const reviews = (reviewRows ?? []) as ReviewRow[];

  const reviewByModuleId = new Map(reviews.map((review) => [review.module_id, review]));
  const helpfulVotesReceived = 0;
  const averageGiven =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => {
            return (
              sum +
              (review.teaching_rating +
                review.workload_rating +
                review.difficulty_rating +
                review.assessment_rating) /
                4
            );
          }, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : "Unknown";

  return (
    <div className="site-shell">
      <SiteNav authed active="profile" displayName={profile.full_name} />
      <main className="page" style={{ paddingTop: 0, paddingBottom: "60px" }}>
        <section className="profile-header">
          <div className="profile-avatar-large">
            {profile.full_name
              .split(/\s+/)
              .slice(0, 2)
              .map((part: string) => part[0]?.toUpperCase() ?? "")
              .join("")}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: 700 }}>
              {profile.full_name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
              <span className="year-badge">Year {profile.year}</span>
              <span style={{ fontSize: "13px", color: "var(--ink-light)" }}>{profile.email}</span>
            </div>
            <p className="form-note" style={{ marginTop: "8px" }}>
              Member since {joinedDate}
            </p>
          </div>
          <div style={{ display: "flex", border: "1px solid var(--border)" }}>
            <div className="profile-stat">
              <div className="profile-stat-value">{reviews.length}</div>
              <div className="label-caps">Reviews</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{modules.length}</div>
              <div className="label-caps">Modules</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{helpfulVotesReceived}</div>
              <div className="label-caps">Helpful votes</div>
            </div>
          </div>
        </section>

        <div className="two-col" style={{ alignItems: "start" }}>
          <div>
            <div className="section-header" style={{ paddingTop: 0, marginBottom: 0 }}>
              <h2 className="section-title" style={{ fontSize: "20px" }}>
                Your Modules
              </h2>
              <span style={{ fontSize: "12px", color: "var(--ink-light)" }}>
                {modules.length} enrolled
              </span>
            </div>

            {modules.map((row) => {
              const moduleInfo = row.modules?.[0];
              if (!moduleInfo) {
                return null;
              }
              const review = reviewByModuleId.get(row.module_id);
              return (
                <div key={row.module_id} className="module-review-item">
                  <div style={{ flex: 1 }}>
                    <span className="module-code" style={{ fontSize: "11px", display: "block" }}>
                      {moduleInfo.code}
                    </span>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{moduleInfo.title}</div>
                  </div>
                  {review ? (
                    <>
                      <span className="reviewed-badge">Reviewed</span>
                      <Link className="btn btn-ghost btn-sm" href={`/modules/${moduleInfo.code}`}>
                        View
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="pending-badge">Not Reviewed</span>
                      <Link
                        className="btn btn-primary btn-sm"
                        href={`/modules/${moduleInfo.code}/review`}
                      >
                        Write Review
                      </Link>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <div className="section-header" style={{ paddingTop: 0, marginBottom: 0 }}>
              <h2 className="section-title" style={{ fontSize: "20px" }}>
                Account Settings
              </h2>
            </div>

            <div className="setting-row" style={{ borderTop: "1px solid var(--border)" }}>
              <div>
                <div className="setting-label">Email Notifications</div>
                <div className="setting-desc">
                  Receive an email when someone finds your review helpful or replies.
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Weekly Digest</div>
                <div className="setting-desc">A curated summary of new reviews for your modules.</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Display Name</div>
                <div className="setting-desc">{profile.full_name}</div>
              </div>
              <button className="btn btn-ghost btn-sm" type="button">
                Edit
              </button>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Change Password</div>
                <div className="setting-desc">Use your account recovery flow to update credentials.</div>
              </div>
              <button className="btn btn-ghost btn-sm" type="button">
                Update
              </button>
            </div>
            <div className="setting-row" style={{ borderBottom: "none" }}>
              <div>
                <div className="setting-label" style={{ color: "#c0392b" }}>
                  Sign Out
                </div>
                <div className="setting-desc">Sign out of your DoC Reviews account.</div>
              </div>
              <form action={signOutAction}>
                <button
                  className="btn btn-ghost btn-sm"
                  type="submit"
                  style={{ borderColor: "#e0b0b0", color: "#9a2b2b" }}
                >
                  Sign Out
                </button>
              </form>
            </div>

            <hr className="rule" style={{ marginTop: "30px" }} />
            <div style={{ marginTop: "20px" }}>
              <div className="label-caps" style={{ marginBottom: "10px" }}>
                Review Activity
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--ink-mid)" }}>Reviews written</span>
                  <span style={{ fontWeight: 600 }}>{reviews.length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--ink-mid)" }}>Average rating given</span>
                  <span style={{ fontWeight: 600 }}>{averageGiven} / 5</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--ink-mid)" }}>Helpful votes received</span>
                  <span style={{ fontWeight: 600 }}>{helpfulVotesReceived}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--ink-mid)" }}>Member since</span>
                  <span style={{ fontWeight: 600 }}>{joinedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
