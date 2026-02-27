import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module catalogue year filter behavior", () => {
  const source = readFileSync("src/app/modules/page.tsx", "utf8");

  it("treats selected `all` year as all modules, not profile year", () => {
    expect(source).toContain("const activeYear = parsed.year;");
    expect(source).not.toContain(
      "const activeYear = parsed.year === \"all\" ? defaultYear : parsed.year;",
    );
  });
});
