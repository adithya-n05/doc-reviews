import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module detail review rendering", () => {
  const source = readFileSync("src/app/modules/[code]/page.tsx", "utf8");

  it("renders optional tips block when present", () => {
    expect(source).toContain('review.tips ? <div className="review-tip">');
    expect(source).toContain('className="review-tip"');
  });

  it("renders metric bars under each rating card", () => {
    expect(source).toContain('className="metric-bar"');
    expect(source).toContain('className="metric-bar-fill"');
  });

  it("uses editorial metric labels for content and exam fairness", () => {
    expect(source).toContain("Content Quality");
    expect(source).toContain("Exam Fairness");
  });
});
