import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
import { SiteNav } from "@/components/site-nav";

type SignupPageProps = {
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

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolved = (await searchParams) ?? {};
  const error = getParam(resolved, "error");

  return (
    <div className="site-shell">
      <SiteNav authed={false} />
      <main className="auth-wrap">
        <section className="auth-card">
          <p className="label-caps">Create Your Account</p>
          <h1 className="auth-title">Step 1 of 4 - Your Details</h1>
          <p className="auth-subtitle">
            Registration is restricted to Imperial Computing students.
          </p>

          {error ? <p className="form-banner error">{error}</p> : null}

          <form action={signupAction}>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">
                Imperial Email Address
              </label>
              <input
                id="signup-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="abc123@ic.ac.uk"
                required
                autoComplete="email"
              />
              <p className="form-note">Must end with `@ic.ac.uk` or `@imperial.ac.uk`.</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-fullname">
                Display Name
              </label>
              <input
                id="signup-fullname"
                className="form-input"
                type="text"
                name="fullName"
                placeholder="e.g., Sophie M."
                required
                autoComplete="name"
              />
              <p className="form-note">
                Your name and email are always shown on published reviews.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">
                Password
              </label>
              <input
                id="signup-password"
                className="form-input"
                type="password"
                name="password"
                placeholder="Minimum 10 characters"
                required
                autoComplete="new-password"
                minLength={10}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-confirm-password">
                Confirm Password
              </label>
              <input
                id="signup-confirm-password"
                className="form-input"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                minLength={10}
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                Continue
              </button>
            </div>
          </form>

          <p className="form-note" style={{ marginTop: "22px" }}>
            Already have an account? <Link href="/auth/login">Sign in</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}
