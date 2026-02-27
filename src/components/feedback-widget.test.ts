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
});
