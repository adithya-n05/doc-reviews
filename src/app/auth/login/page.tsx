import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { SiteNav } from "@/components/site-nav";

type LoginPageProps = {
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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolved = (await searchParams) ?? {};
  const error = getParam(resolved, "error");

  return (
    <div className="site-shell">
      <SiteNav authed={false} />
      <main className="auth-wrap">
        <section className="auth-card">
          <p className="label-caps">Sign In</p>
          <h1 className="auth-title">Sign in to your account</h1>
          <p className="auth-subtitle">Use your Imperial College email address.</p>

          {error ? <p className="form-banner error">{error}</p> : null}

          <form action={loginAction}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Imperial Email Address
              </label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="abc123@ic.ac.uk"
                required
                autoComplete="email"
              />
              <p className="form-note">Accepts `@ic.ac.uk` and `@imperial.ac.uk`.</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                className="form-input"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                Sign In
              </button>
            </div>
          </form>

          <p className="form-note" style={{ marginTop: "22px" }}>
            New to DoC Reviews? <Link href="/auth/signup">Create an account</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}
