import { describe, expect, it } from "vitest";
import { validateProfileAvatarFile } from "./profile-avatar-file";

function createFile(type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], "avatar", { type });
}

describe("validateProfileAvatarFile", () => {
  it("accepts jpeg/png/webp images up to 5MB", () => {
    const result = validateProfileAvatarFile(createFile("image/png", 1024));
    expect(result.ok).toBe(true);
  });

  it("rejects non-image file types", () => {
    const result = validateProfileAvatarFile(createFile("application/pdf", 1024));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("image");
    }
  });

  it("rejects oversized files", () => {
    const result = validateProfileAvatarFile(createFile("image/jpeg", 5 * 1024 * 1024 + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("5MB");
    }
  });
});
