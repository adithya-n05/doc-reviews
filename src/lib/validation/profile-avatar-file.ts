const MAX_AVATAR_FILE_BYTES = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type AvatarFileValidationResult =
  | {
      ok: true;
      file: File;
      contentType: string;
      extension: string;
    }
  | {
      ok: false;
      error: string;
    };

export function validateProfileAvatarFile(value: FormDataEntryValue | null): AvatarFileValidationResult {
  if (!(value instanceof File) || value.size <= 0) {
    return {
      ok: false,
      error: "Profile photo file is required.",
    };
  }

  const contentType = value.type.toLowerCase();
  const extension = ALLOWED_FILE_TYPES[contentType];
  if (!extension) {
    return {
      ok: false,
      error: "Profile photo must be a PNG, JPG, or WEBP image.",
    };
  }

  if (value.size > MAX_AVATAR_FILE_BYTES) {
    return {
      ok: false,
      error: "Profile photo must be 5MB or smaller.",
    };
  }

  return {
    ok: true,
    file: value,
    contentType,
    extension,
  };
}
