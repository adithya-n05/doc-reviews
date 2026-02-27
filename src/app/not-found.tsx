import Link from "next/link";
import { AuthBrand } from "@/components/auth-brand";

export default function NotFoundPage() {
  return (
    <div className="site-shell">
      <main className="auth-wrap">
        <section className="auth-card">
          <AuthBrand />
          <p className="label-caps">404</p>
          <h1 className="auth-title">Page Not Found</h1>
          <p className="auth-subtitle">
            The page you requested does not exist or may have moved.
          </p>
          <div className="form-actions">
            <Link className="btn btn-primary" href="/">
              Return Home
            </Link>
            <Link className="btn btn-ghost" href="/modules">
              Browse Modules
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
