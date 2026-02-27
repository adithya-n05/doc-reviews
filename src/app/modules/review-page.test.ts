import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("write review page fields", () => {
  const source = readFileSync("src/app/modules/[code]/review/page.tsx", "utf8");

  it("includes optional tips textarea field", () => {
    expect(source).toContain("name=\"tips\"");
    expect(source).toContain("Tips for Future Students");
  });
});
