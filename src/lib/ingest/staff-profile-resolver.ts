export type StaffDirectoryEntry = {
  name: string;
  normalizedName: string;
  profileUrl: string | null;
  photoUrl: string | null;
};

const STAFF_PHOTO_OVERRIDES_BY_NORMALIZED_NAME: Record<string, string> = {
  "jamie willis": "https://fp.doc.ic.ac.uk/img/jwillis.jpg",
};

const PLACEHOLDER_STAFF_PHOTO_MARKERS = [
  "placeholder",
  "silhouette",
  "blank-profile",
  "default-profile",
  "default-avatar",
  "no-photo",
  "19351700--tojpeg_1427379998905_x2.jpg",
] as const;

function stripTags(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveAbsoluteUrl(rawUrl: string, baseUrl: string): string | null {
  const value = rawUrl.trim();
  if (!value) return null;

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

export function normalizeStaffName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  const tokens = cleaned.split(" ").filter(Boolean);
  const withoutHonorifics = [...tokens];
  while (
    withoutHonorifics.length > 0 &&
    ["dr", "professor", "prof", "mr", "mrs", "ms", "miss"].includes(
      withoutHonorifics[0],
    )
  ) {
    withoutHonorifics.shift();
  }

  return withoutHonorifics.join(" ");
}

export function isLikelyPlaceholderStaffPhotoUrl(photoUrl: string): boolean {
  const normalized = photoUrl.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return PLACEHOLDER_STAFF_PHOTO_MARKERS.some((marker) =>
    normalized.includes(marker),
  );
}

export function resolveStaffPhotoUrl(
  leaderName: string,
  photoUrl: string | null,
): string | null {
  const normalizedLeaderName = normalizeStaffName(leaderName);
  const manualOverride = STAFF_PHOTO_OVERRIDES_BY_NORMALIZED_NAME[normalizedLeaderName];
  if (manualOverride) {
    return manualOverride;
  }

  if (!photoUrl) {
    return null;
  }

  const normalizedPhotoUrl = photoUrl.trim();
  if (!normalizedPhotoUrl || isLikelyPlaceholderStaffPhotoUrl(normalizedPhotoUrl)) {
    return null;
  }

  return normalizedPhotoUrl;
}

function extractImageSource(htmlBlock: string, sourceUrl: string): string | null {
  const imageTagMatch = htmlBlock.match(
    /<img[^>]*class=["'][^"']*thumbnail[^"']*["'][^>]*>/i,
  );
  if (!imageTagMatch) {
    return null;
  }

  const srcMatch = imageTagMatch[0].match(/src=["']([^"']+)["']/i);
  if (!srcMatch?.[1]) {
    return null;
  }

  return resolveAbsoluteUrl(srcMatch[1], sourceUrl);
}

function pickPreferredEntry(
  current: StaffDirectoryEntry | undefined,
  next: StaffDirectoryEntry,
): StaffDirectoryEntry {
  if (!current) {
    return next;
  }

  const currentScore =
    (current.profileUrl ? 2 : 0) + (current.photoUrl ? 1 : 0);
  const nextScore = (next.profileUrl ? 2 : 0) + (next.photoUrl ? 1 : 0);
  return nextScore > currentScore ? next : current;
}

export function parseStaffDirectoryHtml(
  html: string,
  sourceUrl: string,
): StaffDirectoryEntry[] {
  const entries: StaffDirectoryEntry[] = [];
  const liBlocks = html.match(/<li\b[\s\S]*?<\/li>/gi) ?? [];

  for (const block of liBlocks) {
    const nameLinkMatch = block.match(
      /<a[^>]*class=["'][^"']*name-link[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<span[^>]*class=["'][^"']*person-name[^"']*["'][^>]*>([^<]+)<\/span>/i,
    );
    const personNameMatch = block.match(
      /<span[^>]*class=["'][^"']*person-name[^"']*["'][^>]*>([^<]+)<\/span>/i,
    );
    const fallbackHeadingMatch = block.match(
      /<h3[^>]*class=["'][^"']*sr-only[^"']*["'][^>]*>([^<]+)<\/h3>/i,
    );

    const name = stripTags(
      personNameMatch?.[1] ?? fallbackHeadingMatch?.[1] ?? "",
    );
    if (!name) {
      continue;
    }

    const normalizedName = normalizeStaffName(name);
    if (!normalizedName) {
      continue;
    }

    const profileUrl = resolveAbsoluteUrl(nameLinkMatch?.[1] ?? "", sourceUrl);
    const photoUrl = extractImageSource(block, sourceUrl);

    entries.push({
      name,
      normalizedName,
      profileUrl,
      photoUrl,
    });
  }

  return entries;
}

export function buildStaffDirectoryIndex(
  entries: StaffDirectoryEntry[],
): Map<string, StaffDirectoryEntry> {
  const index = new Map<string, StaffDirectoryEntry>();
  for (const entry of entries) {
    const existing = index.get(entry.normalizedName);
    index.set(entry.normalizedName, pickPreferredEntry(existing, entry));
  }
  return index;
}

export function matchLeaderProfile(
  leaderName: string,
  directoryIndex: Map<string, StaffDirectoryEntry>,
): {
  canonicalName: string;
  profileUrl: string | null;
  photoUrl: string | null;
} | null {
  const normalizedLeader = normalizeStaffName(leaderName);
  if (!normalizedLeader) {
    return null;
  }

  const matched = directoryIndex.get(normalizedLeader);
  if (!matched) {
    return null;
  }

  return {
    canonicalName: matched.name,
    profileUrl: matched.profileUrl,
    photoUrl: resolveStaffPhotoUrl(matched.name, matched.photoUrl),
  };
}
