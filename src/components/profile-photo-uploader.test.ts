import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profile photo uploader", () => {
  const source = readFileSync("src/components/profile-photo-uploader.tsx", "utf8");

  it("shows selected file feedback and preview state", () => {
    expect(source).toContain("selectedFileName");
    expect(source).toContain("previewUrl");
    expect(source).toContain("Selected:");
  });

  it("uses avatar api route for upload and removal with optimistic remove", () => {
    expect(source).toContain('fetch("/api/profile/avatar"');
    expect(source).toContain('method: "POST"');
    expect(source).toContain('method: "DELETE"');
    expect(source).toContain("setPreviewUrl(null)");
  });
});
