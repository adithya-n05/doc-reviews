import Link from "next/link";
import { AuthBrand } from "@/components/auth-brand";
import { SignupProgress } from "@/components/signup-progress";

type VerifyPageProps = {
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

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const resolved = (await searchParams) ?? {};
  const sent = getParam(resolved, "sent");
  const pending = getParam(resolved, "pending");
  const error = getParam(resolved, "error");

  return (
    <div className="site-shell">
      <main className="auth-wrap">
        <section className="auth-card">
          <AuthBrand />
          <p className="label-caps">Create Your Account</p>
          <h1 className="auth-title">Step 2 of 4 - Verify Email</h1>
          <p className="auth-subtitle">
            Confirm your Imperial address before you can review modules.
          </p>
          <SignupProgress step={2} />

          {sent ? (
            <p className="form-banner success">
              Verification email sent. Open your inbox and click the confirmation link.
            </p>
          ) : null}
          {pending ? (
            <p className="form-banner">
              Your account is waiting for email confirmation.
            </p>
          ) : null}
          {error ? <p className="form-banner error">{error}</p> : null}

          <div className="form-actions">
            <Link href="/auth/login" className="btn btn-primary">
              I have verified, continue to sign in
            </Link>
            <Link href="/auth/signup" className="btn btn-ghost">
              Back to signup
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
