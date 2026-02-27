import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("feedback widget component", () => {
  const source = readFileSync("src/components/feedback-widget.tsx", "utf8");

  it("captures route context and submits via resilient feedback service", () => {
    expect(source).toContain("usePathname");
    expect(source).toContain('import { submitFeedback } from "@/lib/services/feedback-submit";');
    expect(source).toContain("await submitFeedback");
    expect(source).toContain("pagePath");
  });

  it("exposes a small non-intrusive trigger button", () => {
    expect(source).toContain("feedback-widget-trigger");
    expect(source).toContain("Feedback");
  });

  it("reuses editorial form/button classes for visual parity", () => {
    expect(source).toContain("className=\"card-box feedback-widget-panel\"");
    expect(source).toContain("className=\"form-input feedback-widget-textarea\"");
    expect(source).toContain("className=\"btn btn-ghost btn-sm feedback-widget-secondary\"");
    expect(source).toContain("className=\"btn btn-primary btn-sm feedback-widget-submit\"");
    expect(source).toContain("className=\"btn btn-ghost btn-sm feedback-widget-trigger\"");
  });
});
