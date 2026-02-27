import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profile actions", () => {
  const source = readFileSync("src/app/actions/profile.ts", "utf8");

  it("exports update and clear avatar actions", () => {
    expect(source).toContain("export async function updateProfilePhotoAction");
    expect(source).toContain("export async function clearProfilePhotoAction");
  });

  it("validates avatar file uploads and updates profiles.avatar_url", () => {
    expect(source).toContain("validateProfileAvatarFile");
    expect(source).toContain('formData.get("avatarFile")');
    expect(source).toContain('.storage.from("profile-avatars")');
    expect(source).toContain(".upload(");
    expect(source).toContain('.from("profiles")');
    expect(source).toContain("avatar_url");
    expect(source).toContain("redirect(\"/profile?photo=updated\")");
    expect(source).toContain("redirect(\"/profile?photo=removed\")");
  });
});
