import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site nav editorial chrome", () => {
  const source = readFileSync("src/components/site-nav.tsx", "utf8");

  it("uses editorial nav class names", () => {
    expect(source).toContain('className="nav"');
    expect(source).toContain('className="nav-inner"');
  });

  it("does not use unstyled top-nav class names", () => {
    expect(source).not.toContain("top-nav");
    expect(source).not.toContain("top-nav-inner");
  });

  it("supports optional avatar photos with initials fallback", () => {
    expect(source).toContain("avatarUrl?: string | null");
    expect(source).toContain("props.avatarUrl ? (");
    expect(source).toContain("className=\"nav-avatar-photo\"");
    expect(source).toContain("toPublicReviewerInitials(props.displayName)");
  });
});
