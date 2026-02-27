import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module catalogue layout parity", () => {
  const source = readFileSync("src/app/modules/page.tsx", "utf8");
  const browser = readFileSync("src/components/module-catalogue-browser.tsx", "utf8");

  it("does not render landing ticker on the catalogue page", () => {
    expect(source).not.toContain("landing-ticker");
  });

  it("uses editorial search-bar chrome with icon in the header controls", () => {
    expect(source).toContain("ModuleCatalogueBrowser");
    expect(browser).toContain("className=\"search-bar\"");
    expect(browser).toContain("className=\"search-icon\"");
  });
});
