const ALLOWED_DOMAINS = new Set(["ic.ac.uk", "imperial.ac.uk"]);

export function isImperialEmail(email: string): boolean {
  if (typeof email !== "string") return false;

  const normalized = email.trim().toLowerCase();
  const parts = normalized.split("@");

  if (parts.length !== 2) return false;

  const [localPart, domain] = parts;
  if (!localPart || !domain) return false;

  return ALLOWED_DOMAINS.has(domain);
}
