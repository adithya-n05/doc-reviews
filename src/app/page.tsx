import Link from "next/link";

export default function HomePage() {
  return (
    <div className="site-shell">
      <header className="top-nav">
        <div className="top-nav-inner">
          <Link href="/" className="nav-logo">
            DoC <span>Reviews</span>
          </Link>
          <div className="nav-links">
            <Link className="btn btn-ghost btn-sm" href="/auth/login">
              Sign In
            </Link>
            <Link className="btn btn-primary btn-sm" href="/auth/signup">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="page hero">
        <p className="label-caps">Imperial Computing Student Reviews</p>
        <h1 className="hero-title">Know your modules before you take them.</h1>
        <p className="hero-subtitle">
          DoC Reviews is where Imperial Computing students share honest, detailed
          assessments of modules: teaching quality, workload, content depth, and
          exam fairness.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/auth/signup">
            Start Reading
          </Link>
          <Link className="btn" href="/modules">
            Browse Modules
          </Link>
        </div>

        <div className="hero-grid">
          <div>
            <section className="feature-grid">
              <article className="feature-item">
                <p className="label-caps-accent">Ratings</p>
                <h3 className="feature-title">Multidimensional Scoring</h3>
                <p className="feature-desc">
                  Every module is rated across teaching, workload, difficulty,
                  and assessment quality.
                </p>
              </article>
              <article className="feature-item">
                <p className="label-caps-accent">Identity</p>
                <h3 className="feature-title">Verified Imperial Accounts</h3>
                <p className="feature-desc">
                  Signup requires Imperial email verification before accounts are
                  fully activated.
                </p>
              </article>
              <article className="feature-item">
                <p className="label-caps-accent">Insights</p>
                <h3 className="feature-title">Comment-Derived Metrics</h3>
                <p className="feature-desc">
                  Derived keywords and sentiment snapshots summarize what students
                  consistently mention.
                </p>
              </article>
            </section>
          </div>

          <aside className="pullquote">
            &quot;Finally, a place to find out whether a module is actually worth
            taking, not just what the syllabus says.&quot;
          </aside>
        </div>
      </main>
    </div>
  );
}
