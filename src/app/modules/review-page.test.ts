import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("write review page fields", () => {
  const source = readFileSync("src/app/modules/[code]/review/page.tsx", "utf8");

  it("includes optional tips textarea field", () => {
    expect(source).toContain("name=\"tips\"");
    expect(source).toContain("Tips for Future Students");
  });

  it("uses editorial textarea styling and guidance copy", () => {
    expect(source).toContain('className="form-input"');
    expect(source).toContain("Be specific and constructive.");
    expect(source).toContain("Minimum 80 characters.");
    expect(source).not.toContain("className=\"form-textarea\"");
  });

  it("does not keep modules nav tab pinned active on write-review route", () => {
    expect(source).toContain('active="none"');
  });
});
