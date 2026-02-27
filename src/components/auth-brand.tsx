import Link from "next/link";

export function AuthBrand() {
  return (
    <div className="auth-brand">
      <Link href="/" className="auth-brand-title">
        DoC <span>Reviews</span>
      </Link>
      <hr className="rule" style={{ marginTop: "14px" }} />
    </div>
  );
}
