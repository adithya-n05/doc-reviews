import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module catalogue layout parity", () => {
  const source = readFileSync("src/app/modules/page.tsx", "utf8");
  const controls = readFileSync("src/components/module-catalogue-controls.tsx", "utf8");

  it("does not render landing ticker on the catalogue page", () => {
    expect(source).not.toContain("landing-ticker");
  });

  it("uses editorial search-bar chrome with icon in the header controls", () => {
    expect(source).toContain("ModuleCatalogueControls");
    expect(controls).toContain("className=\"search-bar\"");
    expect(controls).toContain("className=\"search-icon\"");
  });
});
