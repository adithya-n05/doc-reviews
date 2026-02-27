import Link from "next/link";
import { toPublicReviewerInitials } from "@/lib/modules/presenter";

type PublicNavProps = {
  authed: false;
};

type PrivateNavProps = {
  authed: true;
  active: "modules" | "profile";
  displayName: string;
};

type SiteNavProps = PublicNavProps | PrivateNavProps;

export function SiteNav(props: SiteNavProps) {
  if (!props.authed) {
    return (
      <header className="nav">
        <div className="nav-inner">
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
    );
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          DoC <span>Reviews</span>
        </Link>
        <div className="nav-links">
          <Link
            href="/modules"
            className={`nav-link ${props.active === "modules" ? "active" : ""}`}
          >
            Modules
          </Link>
          <Link
            href="/profile"
            className={`nav-link ${props.active === "profile" ? "active" : ""}`}
          >
            Profile
          </Link>
          <Link href="/profile" className="nav-avatar" title={props.displayName}>
            {toPublicReviewerInitials(props.displayName)}
          </Link>
        </div>
      </div>
    </header>
  );
}
