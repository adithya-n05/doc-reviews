import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profile actions", () => {
  const source = readFileSync("src/app/actions/profile.ts", "utf8");

  it("exports update and clear avatar actions", () => {
    expect(source).toContain("export async function updateProfilePhotoAction");
    expect(source).toContain("export async function clearProfilePhotoAction");
  });

  it("validates avatar urls and updates profiles.avatar_url", () => {
    expect(source).toContain("validateProfileAvatarUrl");
    expect(source).toContain('.from("profiles")');
    expect(source).toContain("avatar_url");
    expect(source).toContain("redirect(\"/profile?photo=updated\")");
    expect(source).toContain("redirect(\"/profile?photo=removed\")");
  });
});
