import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profile page editorial parity", () => {
  const source = readFileSync("src/app/profile/page.tsx", "utf8");

  it("shows member-since metadata in profile header", () => {
    expect(source).toContain("Member since");
  });

  it("uses mockup-aligned account settings and review activity headings", () => {
    expect(source).toContain("Account Settings");
    expect(source).toContain("Review Activity");
  });

  it("renders your modules heading and helpful-votes top stat", () => {
    expect(source).toContain("Your Modules");
    expect(source).toContain("Helpful votes");
  });

  it("renders editorial account settings rows", () => {
    expect(source).toContain("Email Notifications");
    expect(source).toContain("Profile Photo");
    expect(source).toContain("Display Name");
    expect(source).toContain("Change Password");
  });

  it("omits weekly digest controls per current product scope", () => {
    expect(source).not.toContain("Weekly Digest");
  });

  it("renders review activity summary rows in settings column", () => {
    expect(source).toContain("Reviews written");
    expect(source).toContain("Average rating given");
    expect(source).toContain("Helpful votes received");
  });

  it("includes an affordance to edit enrolled modules", () => {
    expect(source).toContain("Edit Modules");
    expect(source).toContain("href=\"/onboarding\"");
  });

  it("uses client profile photo uploader with initial avatar props", () => {
    expect(source).toContain('import { ProfilePhotoUploader } from "@/components/profile-photo-uploader";');
    expect(source).toContain("<ProfilePhotoUploader");
    expect(source).toContain("initialAvatarUrl={profile.avatar_url}");
    expect(source).toContain("avatarAlt={`${profile.full_name} avatar`}");
    expect(source).not.toContain("updateProfilePhotoAction");
    expect(source).not.toContain("clearProfilePhotoAction");
  });

  it("wires display name editing form with profile action", () => {
    expect(source).toContain("updateDisplayNameAction");
    expect(source).toContain('name="fullName"');
    expect(source).toContain("Save Name");
  });

  it("wires password update form with confirmation fields", () => {
    expect(source).toContain("updatePasswordAction");
    expect(source).toContain('name="newPassword"');
    expect(source).toContain('name="confirmPassword"');
    expect(source).toContain("Save Password");
  });
});
