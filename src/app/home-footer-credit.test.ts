import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("home page footer credit", () => {
  const source = readFileSync("src/app/page.tsx", "utf8");
  const css = readFileSync("src/app/globals.css", "utf8");

  it("shows the requested maker credit under the DoC Reviews mark", () => {
    expect(source).toContain("Made by Adithya");
  });

  it("styles the maker credit as normal capitalization (not forced uppercase)", () => {
    const attributionBlock = css.match(/\.footer-attribution\s*\{[^}]*\}/)?.[0] ?? "";
    expect(attributionBlock).not.toContain("text-transform: uppercase;");
  });
});
