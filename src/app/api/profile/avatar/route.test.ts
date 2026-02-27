import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profile avatar api route", () => {
  const source = readFileSync("src/app/api/profile/avatar/route.ts", "utf8");

  it("supports upload and removal handlers", () => {
    expect(source).toContain("export async function POST");
    expect(source).toContain("export async function DELETE");
  });

  it("uses auth-aware supabase client and avatar file validation", () => {
    expect(source).toContain("createSupabaseServerClient");
    expect(source).toContain("validateProfileAvatarFile");
    expect(source).toContain('.storage.from("profile-avatars")');
    expect(source).toContain('.from("profiles")');
  });
});
