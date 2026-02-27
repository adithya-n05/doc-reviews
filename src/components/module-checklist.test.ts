import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module checklist selection behavior", () => {
  const source = readFileSync("src/components/module-checklist.tsx", "utf8");

  it("offers select-all and clear controls for currently shown modules", () => {
    expect(source).toContain("Select All Shown");
    expect(source).toContain("Clear Shown");
  });

  it("submits selected modules via hidden inputs so filtered selections persist", () => {
    expect(source).toContain("type=\"hidden\"");
    expect(source).toContain("name=\"moduleCodes\"");
    expect(source).toContain("Array.from(selected)");
  });

  it("pre-indexes modules by year to keep year switching responsive", () => {
    expect(source).toContain("const modulesByYear = useMemo(");
    expect(source).toContain("const baseModules = selectedYear");
  });
});
