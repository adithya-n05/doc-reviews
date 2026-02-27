import Link from "next/link";
import type { LandingMetrics } from "@/lib/metrics/landing-metrics";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchLandingMetrics } from "@/lib/server/landing-metrics";

const ZERO_METRICS: LandingMetrics = {
  modulesCount: 0,
  reviewsCount: 0,
  averageRating: 0,
  topModuleRating: 0,
  averageWorkload: 0,
  recommendPercentage: 0,
  modulesWithReviews: 0,
};

function workloadHoursEstimate(rating: number): number {
  if (rating <= 0) return 0;
  return Math.round(rating * 4);
}

export default async function HomePage() {
  let metrics = ZERO_METRICS;
  let signedInDisplayName: string | null = null;
  try {
    const adminClient = createSupabaseAdminClient();
    metrics = await fetchLandingMetrics(adminClient);
  } catch {
    metrics = ZERO_METRICS;
  }

  try {
    const authClient = await createSupabaseServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (user) {
      const { data: profile } = await authClient
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      signedInDisplayName =
        profile?.full_name?.trim() || user.email?.trim() || "Imperial Student";
    }
  } catch {
    signedInDisplayName = null;
  }

  const primaryHeroCtaLabel = signedInDisplayName ? "Browse Modules" : "Start Reading";
  const primaryHeroCtaHref = signedInDisplayName ? "/modules" : "/auth/signup";

  return (
    <div className="site-shell">
      <div className="landing-masthead">
        <div className="masthead-inner">
          <div>
            <div className="masthead-logo">
              DoC <span>Reviews</span>
            </div>
            <div className="masthead-tagline">
              The student voice on Computing at Imperial
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="masthead-date">
              Imperial College London · Department of Computing
            </div>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {signedInDisplayName ? (
                <>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--ink-light)",
                      marginRight: "4px",
                    }}
                  >
                    Signed in as <strong style={{ color: "var(--ink-mid)" }}>{signedInDisplayName}</strong>
                  </span>
                  <Link className="btn btn-ghost btn-sm" href="/profile">
                    Profile
                  </Link>
                  <Link className="btn btn-primary btn-sm" href="/modules">
                    Go to Modules
                  </Link>
                </>
              ) : (
                <>
                  <Link className="btn btn-ghost btn-sm" href="/auth/login">
                    Sign In
                  </Link>
                  <Link className="btn btn-primary btn-sm" href="/auth/signup">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="landing-ticker">
        <div className="ticker-inner">
          <span className="ticker-label">Live Stats</span>
          <span className="ticker-stat">
            <strong>{metrics.reviewsCount}</strong> reviews published
          </span>
          <span className="ticker-stat" style={{ color: "rgba(255,255,255,0.3)" }}>
            ·
          </span>
          <span className="ticker-stat">
            <strong>{metrics.modulesCount}</strong> modules covered
          </span>
          <span className="ticker-stat" style={{ color: "rgba(255,255,255,0.3)" }}>
            ·
          </span>
          <span className="ticker-stat">
            Average rating <strong>{metrics.averageRating.toFixed(1)} / 5</strong>
          </span>
        </div>
      </div>

      <hr className="rule" />

      <div className="hero-section">
        <div>
          <div className="hero-kicker">A Publication of the Computing Community</div>
          <h1 className="hero-title">Know your modules before you take them.</h1>
          <p className="hero-sub">
            DoC Reviews is where Imperial Computing students share honest, detailed
            assessments of every module covering teaching quality, workload, content,
            and exam fairness.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href={primaryHeroCtaHref}>
              {primaryHeroCtaLabel}
            </Link>
            {signedInDisplayName ? (
              <Link className="btn" href="/profile">
                Profile
              </Link>
            ) : (
              <Link className="btn" href="/modules">
                Browse Modules
              </Link>
            )}
          </div>
        </div>
        <div>
          <div className="hero-pullquote">
            <div className="pullquote-text">
              &quot;Finally, a place to find out whether a module is actually worth
              taking, not just what the syllabus says.&quot;
            </div>
            <div className="pullquote-source">
              Third-year student · Department of Computing
            </div>
          </div>
          <div
            style={{
              marginTop: "1px",
              background: "var(--cream-dark)",
              border: "1px solid var(--border)",
              borderTop: "none",
              padding: "16px 28px",
            }}
          >
            <div style={{ display: "flex", gap: "32px" }}>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "28px",
                    fontWeight: 500,
                    color: "var(--accent)",
                  }}
                >
                  {metrics.topModuleRating.toFixed(1)}
                </div>
                <div className="label-caps" style={{ marginTop: "2px" }}>
                  Avg. top module
                </div>
              </div>
              <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "32px" }}>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "28px",
                    fontWeight: 500,
                  }}
                >
                  {metrics.recommendPercentage}%
                </div>
                <div className="label-caps" style={{ marginTop: "2px" }}>
                  Would recommend
                </div>
              </div>
              <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "32px" }}>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "28px",
                    fontWeight: 500,
                  }}
                >
                  {workloadHoursEstimate(metrics.averageWorkload)}h
                </div>
                <div className="label-caps" style={{ marginTop: "2px" }}>
                  Avg. weekly workload
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="rule" />

      <div className="features-strip">
        <div className="features-strip-inner">
          <div className="feature-item">
            <div className="feature-number">{metrics.reviewsCount}</div>
            <div className="feature-label">Reviews Published</div>
            <div className="feature-desc">
              Detailed, attributed reviews from verified Computing students.
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-number">6</div>
            <div className="feature-label">Quality Dimensions</div>
            <div className="feature-desc">
              Ratings across teaching, content, workload, difficulty, and fairness.
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-number">{metrics.modulesCount}</div>
            <div className="feature-label">Modules Covered</div>
            <div className="feature-desc">
              Coverage from first-year fundamentals to MEng specialisms.
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-logo">
              DoC <span>Reviews</span>
            </div>
            <div className="footer-attribution">Made by Adithya</div>
          </div>
          <div className="footer-copy">
            Unofficial student-run platform · Not affiliated with Imperial College
            London · 2025-2026
          </div>
        </div>
      </footer>
    </div>
  );
}
