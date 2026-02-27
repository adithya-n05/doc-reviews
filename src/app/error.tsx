"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AuthBrand } from "@/components/auth-brand";
import { logError } from "@/lib/logging";

type AppErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppErrorPage({ error, reset }: AppErrorPageProps) {
  useEffect(() => {
    logError("app_route_error_boundary", {
      message: error.message,
      digest: error.digest ?? null,
    });
  }, [error]);

  return (
    <div className="site-shell">
      <main className="auth-wrap">
        <section className="auth-card">
          <AuthBrand />
          <p className="label-caps">Unexpected Error</p>
          <h1 className="auth-title">Something went wrong</h1>
          <p className="auth-subtitle">
            The request could not be completed right now. Try again or return home.
          </p>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={reset} type="button">
              Retry
            </button>
            <Link className="btn btn-ghost" href="/">
              Return Home
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
