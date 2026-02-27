const FALLBACK_SITE_ORIGIN = "https://doc-reviews-eight.vercel.app";

export const SITE_NAME = "DoC Reviews";
export const SITE_DESCRIPTION =
  "Student-run platform for Imperial Computing students to discover modules and share structured reviews on teaching quality, workload, and assessment fairness.";

function normalizeSiteUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured || configured.trim().length === 0) {
    return new URL(FALLBACK_SITE_ORIGIN);
  }

  try {
    return new URL(normalizeSiteUrl(configured));
  } catch {
    return new URL(FALLBACK_SITE_ORIGIN);
  }
}

export function getSiteOrigin(): string {
  const url = getSiteUrl();
  return `${url.protocol}//${url.host}`;
}
