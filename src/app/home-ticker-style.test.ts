import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("landing ticker readability", () => {
  const css = readFileSync("src/app/globals.css", "utf8");

  it("uses higher-contrast ticker label and stat text colors", () => {
    const labelBlock = css.match(/\.ticker-label\s*\{[^}]*\}/)?.[0] ?? "";
    const statBlock = css.match(/\.ticker-stat\s*\{[^}]*\}/)?.[0] ?? "";

    expect(labelBlock).toContain("color: #7fb9ff;");
    expect(statBlock).toContain("color: rgba(250,250,247,0.92);");
  });
});
