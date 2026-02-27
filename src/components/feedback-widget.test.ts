import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("feedback widget component", () => {
  const source = readFileSync("src/components/feedback-widget.tsx", "utf8");

  it("captures route context and posts to feedback api", () => {
    expect(source).toContain("usePathname");
    expect(source).toContain('fetch("/api/feedback"');
    expect(source).toContain("pagePath");
  });

  it("exposes a small non-intrusive trigger button", () => {
    expect(source).toContain("feedback-widget-trigger");
    expect(source).toContain("Feedback");
  });
});
