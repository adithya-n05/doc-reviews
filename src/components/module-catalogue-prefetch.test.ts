import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module catalogue detail prefetch", () => {
  const source = readFileSync("src/components/module-catalogue-browser.tsx", "utf8");

  it("prefetches module detail route on hover and focus", () => {
    expect(source).toContain("router.prefetch");
    expect(source).toContain("onMouseEnter");
    expect(source).toContain("onFocus");
  });
});
