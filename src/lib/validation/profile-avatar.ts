import type { ValidationResult } from "./types";

type ProfileAvatarError = {
  avatarUrl?: string;
};

export function validateProfileAvatarUrl(
  value: string,
): ValidationResult<string, ProfileAvatarError> {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      ok: false,
      errors: {
        avatarUrl: "Profile photo URL is required.",
      },
    };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") {
      return {
        ok: false,
        errors: {
          avatarUrl: "Profile photo URL must use HTTPS.",
        },
      };
    }

    return {
      ok: true,
      value: parsed.toString(),
    };
  } catch {
    return {
      ok: false,
      errors: {
        avatarUrl: "Profile photo URL must be a valid URL.",
      },
    };
  }
}
