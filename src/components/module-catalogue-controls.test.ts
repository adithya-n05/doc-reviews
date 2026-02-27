import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module catalogue controls", () => {
  const source = readFileSync("src/components/module-catalogue-controls.tsx", "utf8");

  it("updates the route when sort selection changes", () => {
    expect(source).toContain("const handleSortChange");
    expect(source).toContain("onChange={handleSortChange}");
    expect(source).toContain("router.replace(");
  });
});
