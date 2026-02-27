import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("helpful toggle button client behavior", () => {
  const source = readFileSync("src/components/helpful-toggle-button.tsx", "utf8");

  it("posts helpful toggles to API for non-blocking interaction", () => {
    expect(source).toContain('fetch("/api/reviews/helpful"');
    expect(source).toContain("JSON.stringify({ reviewId })");
    expect(source).toContain("method: \"POST\"");
  });

  it("optimistically updates voted state and helpful count", () => {
    expect(source).toContain("const nextVoted = !voted;");
    expect(source).toContain("setVoted(nextVoted);");
    expect(source).toContain("setCount((value) => Math.max(0, value + (nextVoted ? 1 : -1)));");
  });

  it("renders editorial helpful button with icon and separated count label", () => {
    expect(source).toContain('className={`helpful-btn ${voted ? "voted" : ""}`}');
    expect(source).toContain('className="helpful-count"');
    expect(source).toContain("<svg");
    expect(source).toContain("Helpful");
  });
});
