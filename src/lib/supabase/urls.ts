let cachedOrigin: string | null = null;

function normalizeOrigin(origin: string): string {
  const trimmed = origin.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/$/, "");
  }

  return `https://${trimmed.replace(/\/$/, "")}`;
}

export function getSiteOrigin(): string {
  if (cachedOrigin) {
    return cachedOrigin;
  }

  const fromPublicEnv = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  if (fromPublicEnv) {
    cachedOrigin = fromPublicEnv;
    return cachedOrigin;
  }

  const fromVercel = normalizeOrigin(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? "",
  );
  if (fromVercel) {
    cachedOrigin = fromVercel;
    return cachedOrigin;
  }

  cachedOrigin = "http://localhost:3000";
  return cachedOrigin;
}

export function buildAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteOrigin()}${path}`;
}

export function resetSiteOriginCacheForTests(): void {
  cachedOrigin = null;
}
