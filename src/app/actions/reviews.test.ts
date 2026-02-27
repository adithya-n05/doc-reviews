import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("review actions tips wiring", () => {
  const source = readFileSync("src/app/actions/reviews.ts", "utf8");

  it("reads tips from form data and forwards to review service input", () => {
    expect(source).toContain('tips: String(formData.get("tips") ?? ""),');
  });

  it("persists tips in the reviews upsert payload", () => {
    expect(source).toContain("tips: payload.tips,");
  });
});
