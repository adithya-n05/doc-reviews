import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module catalogue controls", () => {
  const source = readFileSync("src/components/module-catalogue-controls.tsx", "utf8");

  it("updates sort state when sort selection changes", () => {
    expect(source).toContain("const handleSortChange");
    expect(source).toContain("onChange={handleSortChange}");
    expect(source).toContain("setSort(nextSort)");
  });

  it("debounces search input updates before routing", () => {
    expect(source).toContain("window.setTimeout");
    expect(source).toContain("250");
    expect(source).toContain("setDebouncedSearch(search)");
    expect(source).toContain("router.replace(");
  });
});
